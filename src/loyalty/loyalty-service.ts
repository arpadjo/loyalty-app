import { apiClient } from '@/src/api/client';
import type { ApiClient } from '@/src/api/client';
import { customerRelationshipSchema } from '@/src/api/schemas';
import type { CustomerRelationship } from '@/src/api/types';
import { appConfig } from '@/src/config/app-config';

type RequestOptions = {
  signal?: AbortSignal;
};

export class LoyaltyService {
  constructor(
    private readonly client: ApiClient,
    private readonly clientId: string,
  ) {}

  async getCustomerRelationship(
    token: string,
    options: RequestOptions = {},
  ): Promise<CustomerRelationship> {
    const clientId = encodeURIComponent(this.clientId);

    return this.client.request({
      path: `/api/v1/customer-relationships/client/${clientId}/`,
      responseSchema: customerRelationshipSchema,
      signal: options.signal,
      token,
    });
  }
}

export const loyaltyService = new LoyaltyService(apiClient, appConfig.clientId);
