import { ActivityIndicator, Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';

import { AppText } from '@/src/components/ui/app-text';
import { useAppTheme } from '@/src/theme/theme-provider';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  loading?: boolean;
  style?: ViewStyle;
  variant?: ButtonVariant;
};

export function Button({
  disabled = false,
  label,
  loading = false,
  style,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const { colors, radius } = useAppTheme();
  const isDisabled = disabled || loading;

  const backgroundColors: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.surface,
    ghost: 'transparent',
    danger: colors.error,
  };

  const pressedColors: Record<ButtonVariant, string> = {
    primary: colors.primaryPressed,
    secondary: colors.surfaceMuted,
    ghost: colors.surfaceMuted,
    danger: colors.errorPressed,
  };

  const textColor = variant === 'primary' || variant === 'danger' ? 'inverse' : 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={4}
      {...props}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isDisabled
            ? colors.disabledSurface
            : pressed
              ? pressedColors[variant]
              : backgroundColors[variant],
          borderColor: variant === 'secondary' ? colors.border : 'transparent',
          borderRadius: radius.md,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.primary} />
      ) : (
        <AppText
          color={isDisabled ? 'muted' : textColor}
          numberOfLines={1}
          variant="bodyStrong">
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
