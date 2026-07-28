import { PropsWithChildren } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';
import { TypographyVariant } from '@/src/theme/tokens';

type TextColor = 'default' | 'muted' | 'primary' | 'error' | 'inverse';

type AppTextProps = PropsWithChildren<
  TextProps & {
    color?: TextColor;
    style?: StyleProp<TextStyle>;
    variant?: TypographyVariant;
  }
>;

export function AppText({
  children,
  color = 'default',
  style,
  variant = 'body',
  ...props
}: AppTextProps) {
  const { colors, typography } = useAppTheme();

  const textColors: Record<TextColor, string> = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    error: colors.error,
    inverse: colors.onPrimary,
  };

  return (
    <Text
      {...props}
      style={[typography[variant] as TextStyle, { color: textColors[color] }, style]}>
      {children}
    </Text>
  );
}
