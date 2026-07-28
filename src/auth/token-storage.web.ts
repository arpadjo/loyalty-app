import { assertValidToken } from '@/src/auth/token-storage.shared';
import type { TokenStorage } from '@/src/auth/token-storage.types';

let memoryToken: string | null = null;

export const tokenStorage: TokenStorage = {
  async getToken() {
    return memoryToken;
  },

  async setToken(token) {
    assertValidToken(token);
    memoryToken = token;
  },

  async clearToken() {
    memoryToken = null;
  },
};
