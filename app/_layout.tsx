import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { QueryProvider } from '@/src/query';
import { AppThemeProvider, useAppTheme } from '@/src/theme/theme-provider';

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppThemeProvider>
        <QueryProvider>
          <AppNavigation />
        </QueryProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

function AppNavigation() {
  const { isDark } = useAppTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
