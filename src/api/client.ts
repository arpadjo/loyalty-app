import { z } from 'zod';

import { appConfig } from '@/src/config/app-config';

type Fetcher = typeof globalThis.fetch;
type HttpMethod = 'GET' | 'POST';
type UnauthorizedHandler = (rejectedToken: string) => void;

type ApiRequestOptions<TSchema extends z.ZodType, TBody = never> = {
  body?: TBody;
  method?: HttpMethod;
  path: `/${string}`;
  responseSchema: TSchema;
  signal?: AbortSignal;
  token?: string;
};

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiHttpError extends ApiError {
  constructor(
    message: string,
    readonly status: number,
    readonly responseBody: unknown,
  ) {
    super(message);
    this.name = 'ApiHttpError';
  }
}

export class ApiNetworkError extends ApiError {
  constructor() {
    super('Unable to reach the server. Check your connection and try again.');
    this.name = 'ApiNetworkError';
  }
}

export class ApiResponseValidationError extends ApiError {
  constructor(readonly issues: z.ZodError['issues']) {
    super('The server returned an unexpected response.');
    this.name = 'ApiResponseValidationError';
  }
}

export class ApiClient {
  private readonly unauthorizedHandlers = new Set<UnauthorizedHandler>();

  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: Fetcher = globalThis.fetch,
  ) {}

  subscribeToUnauthorized(handler: UnauthorizedHandler): () => void {
    this.unauthorizedHandlers.add(handler);

    return () => {
      this.unauthorizedHandlers.delete(handler);
    };
  }

  async request<TSchema extends z.ZodType, TBody = never>({
    body,
    method = 'GET',
    path,
    responseSchema,
    signal,
    token,
  }: ApiRequestOptions<TSchema, TBody>): Promise<z.output<TSchema>> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    let response: Response;

    try {
      response = await this.fetcher(`${this.baseUrl}${path}`, {
        body: body === undefined ? undefined : JSON.stringify(body),
        headers,
        method,
        signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      throw new ApiNetworkError();
    }

    const responseBody = await readResponseBody(response);

    if (response.status === 401 && token) {
      this.notifyUnauthorized(token);
    }

    if (!response.ok) {
      throw new ApiHttpError(
        getHttpErrorMessage(response.status, response.statusText, responseBody),
        response.status,
        responseBody,
      );
    }

    const result = responseSchema.safeParse(responseBody);

    if (!result.success) {
      throw new ApiResponseValidationError(result.error.issues);
    }

    return result.data;
  }

  private notifyUnauthorized(rejectedToken: string): void {
    for (const handler of this.unauthorizedHandlers) {
      try {
        handler(rejectedToken);
      } catch {
        // A session observer must not replace the original HTTP error.
      }
    }
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getHttpErrorMessage(status: number, statusText: string, body: unknown): string {
  const serverMessage = getServerMessage(body);

  if (serverMessage) {
    return serverMessage;
  }

  const statusDescription = statusText ? ` ${statusText}` : '';
  return `Request failed with status ${status}${statusDescription}.`;
}

function getServerMessage(body: unknown): string | undefined {
  if (typeof body === 'string') {
    return isSafeDisplayMessage(body) ? body.trim() : undefined;
  }

  if (!body || typeof body !== 'object') {
    return undefined;
  }

  for (const key of ['detail', 'message', 'error']) {
    const value = Reflect.get(body, key);

    if (typeof value === 'string' && isSafeDisplayMessage(value)) {
      return value.trim();
    }
  }

  return undefined;
}

function isSafeDisplayMessage(value: string): boolean {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 && trimmedValue.length <= 200 && !trimmedValue.startsWith('<');
}

export const apiClient = new ApiClient(appConfig.apiBaseUrl);
