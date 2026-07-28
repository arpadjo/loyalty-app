export const AUTH_TOKEN_KEY = 'loyalty.auth-token.v1';

export function assertValidToken(token: string): void {
  if (!token.trim()) {
    throw new TypeError('Authentication token cannot be empty.');
  }
}
