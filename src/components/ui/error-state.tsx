import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui/app-text';
import { Button } from '@/src/components/ui/button';
import { useAppTheme } from '@/src/theme/theme-provider';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  title?: string;
};

export function ErrorState({
  message,
  onRetry,
  title = 'Something went wrong',
}: ErrorStateProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: colors.errorSurface,
          borderColor: colors.error,
          borderRadius: radius.lg,
          gap: spacing.sm,
          padding: spacing.lg,
        },
      ]}>
      <AppText variant="heading">{title}</AppText>
      <AppText color="muted">{message}</AppText>
      {onRetry ? (
        <Button label="Try again" onPress={onRetry} style={styles.button} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
