import { PropsWithChildren } from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';

type CardProps = PropsWithChildren<
  ViewProps & {
    style?: StyleProp<ViewStyle>;
  }
>;

export function Card({ children, style, ...props }: CardProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          borderWidth: 1,
          padding: spacing.lg,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
