import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  CouponRedemptionRequest,
  CustomerRelationship,
  RewardRedemptionRequest,
} from '@/src/api/types';
import { useAuth } from '@/src/auth';
import { loyaltyQueryKeys } from '@/src/loyalty/loyalty-queries';
import { loyaltyService } from '@/src/loyalty/loyalty-service';

export const loyaltyMutationKeys = {
  all: ['loyalty-mutation'] as const,
  couponRedemption: () =>
    [...loyaltyMutationKeys.all, 'coupon-redemption'] as const,
  rewardRedemption: () =>
    [...loyaltyMutationKeys.all, 'reward-redemption'] as const,
};

export function useCouponRedemptionMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: loyaltyMutationKeys.couponRedemption(),
    mutationFn: (input: CouponRedemptionRequest) => {
      if (!token) {
        throw new Error('You must be signed in to redeem a coupon.');
      }

      return loyaltyService.redeemCoupon(token, input);
    },
    onSuccess: async (response) => {
      queryClient.setQueryData<CustomerRelationship>(
        loyaltyQueryKeys.customerRelationship(),
        (customerRelationship) =>
          customerRelationship
            ? { ...customerRelationship, points: response.cr_points }
            : customerRelationship,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: loyaltyQueryKeys.customerRelationship(),
        }),
        queryClient.invalidateQueries({
          queryKey: loyaltyQueryKeys.rewards(),
        }),
      ]);
    },
  });
}

export function useRewardRedemptionMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: loyaltyMutationKeys.rewardRedemption(),
    mutationFn: (input: RewardRedemptionRequest) => {
      if (!token) {
        throw new Error('You must be signed in to redeem a reward.');
      }

      return loyaltyService.redeemReward(token, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: loyaltyQueryKeys.customerRelationship(),
        }),
        queryClient.invalidateQueries({
          queryKey: loyaltyQueryKeys.rewards(),
        }),
      ]);
    },
  });
}
