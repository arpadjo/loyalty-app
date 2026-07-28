import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/src/auth';
import { LoadingState, Screen } from '@/src/components/ui';
import { QueryProvider } from '@/src/query';
import { AppThemeProvider, useAppTheme } from '@/src/theme/theme-provider';

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <AppNavigation />
          </AuthProvider>
        </QueryProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

function AppNavigation() {
  const { isDark } = useAppTheme();
  const { isAuthenticated, isRestoring } = useAuth();

  return (
    <>
      {isRestoring ? (
        <Screen>
          <LoadingState label="Restoring your session…" />
        </Screen>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>

          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="sign-in" />
          </Stack.Protected>
        </Stack>
      )}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
