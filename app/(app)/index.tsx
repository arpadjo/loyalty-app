import { StyleSheet, View } from 'react-native';

import { AppText, Card, Screen } from '@/src/components/ui';
import { useAppTheme } from '@/src/theme/theme-provider';

export default function HomeScreen() {
  const { spacing } = useAppTheme();

  return (
    <Screen>
      <View style={[styles.hero, { gap: spacing.md }]}>
        <AppText color="primary" variant="label">
          LOYALTY
        </AppText>
        <AppText variant="display">Welcome back.</AppText>
        <AppText color="muted">Your points and available rewards will appear here.</AppText>
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
