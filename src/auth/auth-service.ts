import { apiClient } from '@/src/api/client';
import type { ApiClient } from '@/src/api/client';
import { loginRequestSchema, loginResponseSchema } from '@/src/api/schemas';
import type { LoginRequest, LoginResponse } from '@/src/api/types';
import { appConfig } from '@/src/config/app-config';

type LoginOptions = {
  signal?: AbortSignal;
};

export class AuthService {
  constructor(
    private readonly client: ApiClient,
    private readonly clientId: string,
  ) {}

  async login(input: LoginRequest, options: LoginOptions = {}): Promise<LoginResponse> {
    const credentials = loginRequestSchema.parse(input);
    const clientId = encodeURIComponent(this.clientId);

    return this.client.request({
      body: credentials,
      method: 'POST',
      path: `/api/v1/users/token/?client_id=${clientId}`,
      responseSchema: loginResponseSchema,
      signal: options.signal,
    });
  }
}

export const authService = new AuthService(apiClient, appConfig.clientId);
