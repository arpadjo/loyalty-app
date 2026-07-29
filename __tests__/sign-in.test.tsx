import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SignInScreen from '@/app/sign-in';
import { useAuth } from '@/src/auth';
import { AppThemeProvider } from '@/src/theme/theme-provider';

jest.mock('@/src/auth', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);

describe('sign-in interaction', () => {
  it('submits validated credentials', async () => {
    const login = jest.fn(async () => undefined);
    const user = userEvent.setup();

    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isRestoring: false,
      login,
      logout: jest.fn(async () => undefined),
      restorationError: null,
      sessionExpired: false,
      status: 'unauthenticated',
      token: null,
    });

    await render(<SignInScreen />, { wrapper: TestProviders });

    await user.type(
      screen.getByLabelText('Email'),
      'testUser@dev.null',
    );
    await user.type(
      screen.getByLabelText('Password'),
      'challenge-2026',
    );
    await user.press(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'testUser@dev.null',
        password: 'challenge-2026',
      });
    });
  });
});

function TestProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}>
      <AppThemeProvider>{children}</AppThemeProvider>
    </SafeAreaProvider>
  );
}
