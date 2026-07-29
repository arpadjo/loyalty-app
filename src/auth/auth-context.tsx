import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { apiClient } from '@/src/api/client';
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
  sessionExpired: boolean;
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
  const [sessionExpired, setSessionExpired] = useState(false);
  const sessionClearPromiseRef = useRef<Promise<void> | null>(null);

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
      if (sessionClearPromiseRef.current) {
        await sessionClearPromiseRef.current.catch(() => undefined);
      }

      const response = await authService.login(credentials);

      await queryClient.cancelQueries();
      queryClient.clear();
      await tokenStorage.setToken(response.token);

      setRestorationError(null);
      setSessionExpired(false);
      setAuthState({ status: 'authenticated', token: response.token });
    },
    [queryClient],
  );

  const clearSession = useCallback(async () => {
    if (sessionClearPromiseRef.current) {
      await sessionClearPromiseRef.current;
      return;
    }

    setRestorationError(null);
    setAuthState({ status: 'unauthenticated', token: null });

    const operation = (async () => {
      try {
        await queryClient.cancelQueries();
      } finally {
        queryClient.clear();
        await tokenStorage.clearToken();
      }
    })();

    sessionClearPromiseRef.current = operation;

    try {
      await operation;
    } finally {
      if (sessionClearPromiseRef.current === operation) {
        sessionClearPromiseRef.current = null;
      }
    }
  }, [queryClient]);

  const logout = useCallback(async () => {
    setSessionExpired(false);
    await clearSession();
  }, [clearSession]);

  useEffect(
    () =>
      apiClient.subscribeToUnauthorized((rejectedToken) => {
        if (authState.token !== rejectedToken) {
          return;
        }

        setSessionExpired(true);
        void clearSession().catch((error) => {
          setRestorationError(toError(error));
        });
      }),
    [authState.token, clearSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: authState.status === 'authenticated',
      isRestoring: authState.status === 'restoring',
      login,
      logout,
      restorationError,
      sessionExpired,
      status: authState.status,
      token: authState.token,
    }),
    [authState, login, logout, restorationError, sessionExpired],
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
