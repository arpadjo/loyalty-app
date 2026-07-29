import { apiClient } from '@/src/api/client';
import type { ApiClient } from '@/src/api/client';
import {
  couponRedemptionRequestSchema,
  couponRedemptionResponseSchema,
  customerRelationshipSchema,
  rewardRedemptionRequestSchema,
  rewardRedemptionResponseSchema,
  rewardsResponseSchema,
  userProfileSchema,
} from '@/src/api/schemas';
import type {
  CouponRedemptionRequest,
  CouponRedemptionResponse,
  CustomerRelationship,
  RewardRedemptionRequest,
  RewardRedemptionResponse,
  RewardsResponse,
  UserProfile,
} from '@/src/api/types';
import { appConfig } from '@/src/config/app-config';

type RequestOptions = {
  signal?: AbortSignal;
};

export class LoyaltyService {
  private readonly couponRedemptions = new Map<
    string,
    Promise<CouponRedemptionResponse>
  >();
  private readonly rewardRedemptions = new Map<
    string,
    Promise<RewardRedemptionResponse>
  >();

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

  async getProfile(token: string, options: RequestOptions = {}): Promise<UserProfile> {
    const clientId = encodeURIComponent(this.clientId);

    return this.client.request({
      path: `/api/v1/users/profile/?client_id=${clientId}`,
      responseSchema: userProfileSchema,
      signal: options.signal,
      token,
    });
  }

  async getRewards(token: string, options: RequestOptions = {}): Promise<RewardsResponse> {
    const clientId = encodeURIComponent(this.clientId);

    return this.client.request({
      path: `/api/v1/clients/${clientId}/bounties/`,
      responseSchema: rewardsResponseSchema,
      signal: options.signal,
      token,
    });
  }

  async redeemCoupon(
    token: string,
    input: CouponRedemptionRequest,
    options: RequestOptions = {},
  ): Promise<CouponRedemptionResponse> {
    const coupon = couponRedemptionRequestSchema.parse(input);
    const clientId = encodeURIComponent(this.clientId);
    const requestKey = createRedemptionKey(token, coupon.code);

    return runSingleFlight(this.couponRedemptions, requestKey, () =>
      this.client.request({
        body: coupon,
        method: 'POST',
        path: `/api/v1/clients/${clientId}/redeem/`,
        responseSchema: couponRedemptionResponseSchema,
        signal: options.signal,
        token,
      }),
    );
  }

  async redeemReward(
    token: string,
    input: RewardRedemptionRequest,
    options: RequestOptions = {},
  ): Promise<RewardRedemptionResponse> {
    const reward = rewardRedemptionRequestSchema.parse(input);
    const clientId = encodeURIComponent(this.clientId);
    const requestKey = createRedemptionKey(token, reward.bounty_id);

    return runSingleFlight(this.rewardRedemptions, requestKey, () =>
      this.client.request({
        body: reward,
        method: 'POST',
        path: `/api/v1/clients/${clientId}/bounties/redeem/`,
        responseSchema: rewardRedemptionResponseSchema,
        signal: options.signal,
        token,
      }),
    );
  }
}

function createRedemptionKey(token: string, resourceId: string): string {
  return JSON.stringify([token, resourceId]);
}

function runSingleFlight<T>(
  requests: Map<string, Promise<T>>,
  key: string,
  operation: () => Promise<T>,
): Promise<T> {
  const existingRequest = requests.get(key);

  if (existingRequest) {
    return existingRequest;
  }

  const request = Promise.resolve()
    .then(operation)
    .finally(() => {
      if (requests.get(key) === request) {
        requests.delete(key);
      }
    });

  requests.set(key, request);
  return request;
}

export const loyaltyService = new LoyaltyService(apiClient, appConfig.clientId);
