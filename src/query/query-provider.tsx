import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { ApiHttpError, ApiResponseValidationError } from '@/src/api/client';

const STALE_TIME_MS = 30_000;
const MAX_QUERY_RETRIES = 1;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        refetchOnWindowFocus: true,
        retry: shouldRetryQuery,
        retryDelay,
        staleTime: STALE_TIME_MS,
      },
    },
  });
}

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);

  useNativeAppFocus();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function useNativeAppFocus(): void {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    focusManager.setFocused(AppState.currentState === 'active');

    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });

    return () => {
      subscription.remove();
      focusManager.setFocused(undefined);
    };
  }, []);
}

function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (failureCount >= MAX_QUERY_RETRIES || error instanceof ApiResponseValidationError) {
    return false;
  }

  if (error instanceof ApiHttpError) {
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }

  return true;
}

function retryDelay(attemptIndex: number): number {
  return Math.min(1_000 * 2 ** attemptIndex, 5_000);
}
