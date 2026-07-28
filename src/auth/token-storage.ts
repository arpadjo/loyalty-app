import * as SecureStore from 'expo-secure-store';

import { AUTH_TOKEN_KEY, assertValidToken } from '@/src/auth/token-storage.shared';
import type { TokenStorage } from '@/src/auth/token-storage.types';

const secureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
} satisfies SecureStore.SecureStoreOptions;

export const tokenStorage: TokenStorage = {
  async getToken() {
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY, secureStoreOptions);
  },

  async setToken(token) {
    assertValidToken(token);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, secureStoreOptions);
  },

  async clearToken() {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY, secureStoreOptions);
  },
};
