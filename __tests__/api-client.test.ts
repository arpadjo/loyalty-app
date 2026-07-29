import { z } from 'zod';

import {
  ApiClient,
  ApiHttpError,
  ApiNetworkError,
} from '@/src/api/client';

const responseSchema = z.object({ success: z.boolean() });

describe('ApiClient errors', () => {
  it('throws a typed HTTP error and notifies authenticated 401 observers', async () => {
    const responseBody = { detail: 'Token has expired.' };
    const fetcher = jest.fn() as jest.MockedFunction<typeof fetch>;
    const onUnauthorized = jest.fn();
    const client = new ApiClient('https://api.test.invalid', fetcher);

    fetcher.mockResolvedValue(createResponse(401, responseBody, 'Unauthorized'));
    client.subscribeToUnauthorized(onUnauthorized);

    const request = client.request({
      path: '/protected/',
      responseSchema,
      token: 'expired-token',
    });

    await expect(request).rejects.toEqual(
      expect.objectContaining<ApiHttpError>({
        message: 'Token has expired.',
        name: 'ApiHttpError',
        responseBody,
        status: 401,
      }),
    );
    expect(onUnauthorized).toHaveBeenCalledWith('expired-token');
  });

  it('does not mark a tokenless login 401 as an expired session', async () => {
    const fetcher = jest.fn() as jest.MockedFunction<typeof fetch>;
    const onUnauthorized = jest.fn();
    const client = new ApiClient('https://api.test.invalid', fetcher);

    fetcher.mockResolvedValue(createResponse(401, { detail: 'Invalid credentials.' }));
    client.subscribeToUnauthorized(onUnauthorized);

    await expect(
      client.request({
        path: '/login/',
        responseSchema,
      }),
    ).rejects.toBeInstanceOf(ApiHttpError);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('converts fetch failures into a safe network error', async () => {
    const fetcher = jest.fn() as jest.MockedFunction<typeof fetch>;
    const client = new ApiClient('https://api.test.invalid', fetcher);

    fetcher.mockRejectedValue(new TypeError('Host-specific network details'));

    await expect(
      client.request({
        path: '/profile/',
        responseSchema,
      }),
    ).rejects.toEqual(
      expect.objectContaining<ApiNetworkError>({
        message: 'Unable to reach the server. Check your connection and try again.',
        name: 'ApiNetworkError',
      }),
    );
  });
});

function createResponse(status: number, body: unknown, statusText = ''): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}
