import { forwardRef, useId, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { AppText } from '@/src/components/ui/app-text';
import { useAppTheme } from '@/src/theme/theme-provider';

type TextFieldProps = TextInputProps & {
  error?: string;
  hint?: string;
  label: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { error, hint, label, onBlur, onFocus, style, ...props },
  ref,
) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const generatedId = useId();
  const hintId = `${generatedId}-hint`;
  const errorId = `${generatedId}-error`;

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        {...props}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        style={[
          styles.input,
          typography.body,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.error : isFocused ? colors.focus : colors.border,
            borderRadius: radius.md,
            color: colors.text,
          },
          style,
        ]}
      />
      {error ? (
        <AppText nativeID={errorId} color="error" variant="caption">
          {error}
        </AppText>
      ) : hint ? (
        <AppText nativeID={hintId} color="muted" variant="caption">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
