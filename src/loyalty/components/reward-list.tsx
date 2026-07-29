import { View } from 'react-native';

import type { Reward } from '@/src/api/types';
import { AppText, Card } from '@/src/components/ui';
import { RewardCard } from '@/src/loyalty/components/reward-card';
import { useAppTheme } from '@/src/theme/theme-provider';

type RewardListProps = {
  onRedeem?: (reward: Reward) => void;
  redeemingRewardId?: Reward['id'];
  rewards: Reward[];
};

export function RewardList({
  onRedeem,
  redeemingRewardId,
  rewards,
}: RewardListProps) {
  const { spacing } = useAppTheme();

  if (rewards.length === 0) {
    return (
      <Card style={{ gap: spacing.xs }}>
        <AppText variant="heading">No rewards yet</AppText>
        <AppText color="muted">
          New rewards will appear here when they become available.
        </AppText>
      </Card>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      {rewards.map((reward) => (
        <RewardCard
          isRedeeming={redeemingRewardId === reward.id}
          key={reward.id}
          onRedeem={onRedeem}
          reward={reward}
        />
      ))}
    </View>
  );
}
