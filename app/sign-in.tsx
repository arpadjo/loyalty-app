import { StyleSheet, View } from 'react-native';

import { AppText, Screen } from '@/src/components/ui';
import { useAppTheme } from '@/src/theme/theme-provider';

export default function SignInScreen() {
  const { spacing } = useAppTheme();

  return (
    <Screen>
      <View style={[styles.content, { gap: spacing.md }]}>
        <AppText color="primary" variant="label">
          LOYALTY
        </AppText>
        <AppText variant="display">Your loyalty, rewarded.</AppText>
        <AppText color="muted">
          Sign in to check your points, discover rewards, and scan coupons.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
