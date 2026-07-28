import { z } from 'zod';

const configSchema = z.object({
  apiBaseUrl: z
    .string()
    .url()
    .refine((value) => new URL(value).protocol === 'https:', {
      message: 'API base URL must use HTTPS',
    })
    .transform((value) => value.replace(/\/+$/, '')),
  clientId: z.string().uuid(),
});

export const appConfig = Object.freeze(
  configSchema.parse({
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    clientId: process.env.EXPO_PUBLIC_CLIENT_ID,
  }),
);
