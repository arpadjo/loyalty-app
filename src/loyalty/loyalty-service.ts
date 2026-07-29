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

    return this.client.request({
      body: coupon,
      method: 'POST',
      path: `/api/v1/clients/${clientId}/redeem/`,
      responseSchema: couponRedemptionResponseSchema,
      signal: options.signal,
      token,
    });
  }

  async redeemReward(
    token: string,
    input: RewardRedemptionRequest,
    options: RequestOptions = {},
  ): Promise<RewardRedemptionResponse> {
    const reward = rewardRedemptionRequestSchema.parse(input);
    const clientId = encodeURIComponent(this.clientId);

    return this.client.request({
      body: reward,
      method: 'POST',
      path: `/api/v1/clients/${clientId}/bounties/redeem/`,
      responseSchema: rewardRedemptionResponseSchema,
      signal: options.signal,
      token,
    });
  }
}

export const loyaltyService = new LoyaltyService(apiClient, appConfig.clientId);
