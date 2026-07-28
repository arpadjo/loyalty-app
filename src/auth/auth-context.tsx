import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { LoginRequest } from '@/src/api/types';
import { authService } from '@/src/auth/auth-service';
import { tokenStorage } from '@/src/auth/token-storage';

export type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated';

type AuthState =
  | { status: 'restoring'; token: null }
  | { status: 'authenticated'; token: string }
  | { status: 'unauthenticated'; token: null };

type AuthContextValue = {
  isAuthenticated: boolean;
  isRestoring: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  restorationError: Error | null;
  status: AuthStatus;
  token: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    status: 'restoring',
    token: null,
  });
  const [restorationError, setRestorationError] = useState<Error | null>(null);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      try {
        const token = await tokenStorage.getToken();

        if (!isActive) {
          return;
        }

        setAuthState(
          token?.trim()
            ? { status: 'authenticated', token }
            : { status: 'unauthenticated', token: null },
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        setRestorationError(toError(error));
        setAuthState({ status: 'unauthenticated', token: null });
      }
    }

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await authService.login(credentials);

      await queryClient.cancelQueries();
      queryClient.clear();
      await tokenStorage.setToken(response.token);

      setRestorationError(null);
      setAuthState({ status: 'authenticated', token: response.token });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    setRestorationError(null);
    setAuthState({ status: 'unauthenticated', token: null });

    try {
      await queryClient.cancelQueries();
    } finally {
      queryClient.clear();
      await tokenStorage.clearToken();
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: authState.status === 'authenticated',
      isRestoring: authState.status === 'restoring',
      login,
      logout,
      restorationError,
      status: authState.status,
      token: authState.token,
    }),
    [authState, login, logout, restorationError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unable to restore the saved session.');
}
