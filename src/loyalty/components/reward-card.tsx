import { StyleSheet, View } from 'react-native';

import type { Reward } from '@/src/api/types';
import { AppText, Button, Card } from '@/src/components/ui';
import { useAppTheme } from '@/src/theme/theme-provider';

type RewardCardProps = {
  isRedeeming?: boolean;
  onRedeem?: (reward: Reward) => void;
  reward: Reward;
};

export function RewardCard({
  isRedeeming = false,
  onRedeem,
  reward,
}: RewardCardProps) {
  const { colors, radius, spacing } = useAppTheme();
  const pointsLabel = `${reward.needed_points} ${
    reward.needed_points === 1 ? 'point' : 'points'
  }`;

  return (
    <Card style={{ gap: spacing.lg }}>
      <View style={[styles.header, { gap: spacing.md }]}>
        <View style={[styles.title, { gap: spacing.xs }]}>
          <AppText variant="heading">{reward.name}</AppText>
          <AppText color="muted">{reward.description}</AppText>
        </View>
        <View
          style={[
            styles.pointsBadge,
            {
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.full,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
            },
          ]}>
          <AppText color="primary" numberOfLines={1} variant="label">
            {pointsLabel}
          </AppText>
        </View>
      </View>

      <View style={[styles.footer, { gap: spacing.md }]}>
        <AppText
          accessibilityLabel={
            reward.is_redeemable ? 'Reward is available' : 'More points are required'
          }
          style={{ color: reward.is_redeemable ? colors.success : colors.textMuted }}
          variant="label">
          {reward.is_redeemable ? 'Available' : 'More points needed'}
        </AppText>
        {onRedeem ? (
          <Button
            disabled={!reward.is_redeemable}
            label="Redeem"
            loading={isRedeeming}
            onPress={() => onRedeem(reward)}
            style={styles.button}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  pointsBadge: {
    flexShrink: 0,
  },
  title: {
    flex: 1,
  },
});
