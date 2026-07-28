import { StyleSheet, View } from 'react-native';

import { AppText, Card, Screen } from '@/src/components/ui';
import { useAppTheme } from '@/src/theme/theme-provider';

export default function IndexScreen() {
  const { spacing } = useAppTheme();

  return (
    <Screen>
      <View style={[styles.hero, { gap: spacing.md }]}>
        <AppText color="primary" variant="label">
          LOYALTY
        </AppText>
        <AppText variant="display">Your loyalty, rewarded.</AppText>
        <AppText color="muted">
          Sign in to check your points, discover rewards, and scan coupons.
        </AppText>
      </View>
      <Card style={{ gap: spacing.sm }}>
        <AppText color="muted" variant="label">
          CURRENT BALANCE
        </AppText>
        <AppText variant="title">— points</AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
});
