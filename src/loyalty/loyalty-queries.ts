import { skipToken, useQuery } from '@tanstack/react-query';

import { useAuth } from '@/src/auth';
import { loyaltyService } from '@/src/loyalty/loyalty-service';

export const loyaltyQueryKeys = {
  all: ['loyalty'] as const,
  customerRelationship: () =>
    [...loyaltyQueryKeys.all, 'customer-relationship'] as const,
  profile: () => [...loyaltyQueryKeys.all, 'profile'] as const,
  rewards: () => [...loyaltyQueryKeys.all, 'rewards'] as const,
};

export function useCustomerRelationshipQuery() {
  const { token } = useAuth();

  return useQuery({
    queryKey: loyaltyQueryKeys.customerRelationship(),
    queryFn: token
      ? ({ signal }) => loyaltyService.getCustomerRelationship(token, { signal })
      : skipToken,
  });
}

export function useProfileQuery() {
  const { token } = useAuth();

  return useQuery({
    queryKey: loyaltyQueryKeys.profile(),
    queryFn: token
      ? ({ signal }) => loyaltyService.getProfile(token, { signal })
      : skipToken,
  });
}

export function useRewardsQuery() {
  const { token } = useAuth();

  return useQuery({
    queryKey: loyaltyQueryKeys.rewards(),
    queryFn: token
      ? ({ signal }) => loyaltyService.getRewards(token, { signal })
      : skipToken,
  });
}
