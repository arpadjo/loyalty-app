import { skipToken, useQuery } from '@tanstack/react-query';

import { useAuth } from '@/src/auth';
import { loyaltyService } from '@/src/loyalty/loyalty-service';

export const loyaltyQueryKeys = {
  all: ['loyalty'] as const,
  customerRelationship: () =>
    [...loyaltyQueryKeys.all, 'customer-relationship'] as const,
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
