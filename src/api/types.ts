import { z } from 'zod';

import {
  appUserSchema,
  couponRedemptionRequestSchema,
  couponRedemptionResponseSchema,
  customerRelationshipSchema,
  loginRequestSchema,
  loginResponseSchema,
  rewardRedemptionRequestSchema,
  rewardRedemptionResponseSchema,
  rewardSchema,
  rewardsResponseSchema,
  userProfileSchema,
} from '@/src/api/schemas';

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export type AppUser = z.infer<typeof appUserSchema>;
export type CustomerRelationship = z.infer<typeof customerRelationshipSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

export type Reward = z.infer<typeof rewardSchema>;
export type RewardsResponse = z.infer<typeof rewardsResponseSchema>;

export type CouponRedemptionRequest = z.infer<typeof couponRedemptionRequestSchema>;
export type CouponRedemptionResponse = z.infer<typeof couponRedemptionResponseSchema>;

export type RewardRedemptionRequest = z.infer<typeof rewardRedemptionRequestSchema>;
export type RewardRedemptionResponse = z.infer<typeof rewardRedemptionResponseSchema>;
