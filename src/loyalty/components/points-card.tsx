import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { useAppTheme } from '@/src/theme/theme-provider';

type PointsCardProps = {
  points: number;
};

export function PointsCard({ points }: PointsCardProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${points} loyalty points`}
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          borderRadius: radius.xl,
          gap: spacing.sm,
          padding: spacing.xl,
        },
      ]}>
      <AppText color="inverse" variant="label">
        CURRENT BALANCE
      </AppText>
      <View style={[styles.balance, { gap: spacing.sm }]}>
        <AppText color="inverse" style={styles.points} variant="display">
          {points}
        </AppText>
        <AppText color="inverse" style={styles.unit} variant="bodyStrong">
          points
        </AppText>
      </View>
      <AppText color="inverse" style={styles.supportingText} variant="caption">
        Use your points to unlock available rewards.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  balance: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  container: {
    overflow: 'hidden',
  },
  points: {
    fontVariant: ['tabular-nums'],
  },
  supportingText: {
    opacity: 0.8,
  },
  unit: {
    opacity: 0.9,
  },
});
