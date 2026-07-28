import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ApiError, ApiHttpError } from '@/src/api/client';
import { loginRequestSchema } from '@/src/api/schemas';
import type { LoginRequest } from '@/src/api/types';
import { useAuth } from '@/src/auth';
import { AppText, Button, Card, ErrorState, Screen, TextField } from '@/src/components/ui';
import { useAppTheme } from '@/src/theme/theme-provider';

type FieldErrors = Partial<Record<keyof LoginRequest, string>>;

export default function SignInScreen() {
  const { login, restorationError } = useAuth();
  const { spacing } = useAppTheme();
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);

    const result = loginRequestSchema.safeParse({ email, password });

    if (!result.success) {
      const errors: FieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if ((field === 'email' || field === 'password') && !errors[field]) {
          errors[field] = issue.message;
        }
      }

      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await login(result.data);
    } catch (error) {
      setSubmitError(getLoginErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  const visibleError = submitError
    ? submitError
    : restorationError
      ? 'Your saved session could not be restored. Please sign in again.'
      : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Screen
        contentContainerStyle={[styles.content, { gap: spacing.xl }]}
        scroll
        scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}>
        <View style={{ gap: spacing.md }}>
          <AppText color="primary" variant="label">
            LOYALTY
          </AppText>
          <AppText variant="display">Welcome back.</AppText>
          <AppText color="muted">
            Sign in to check your points, discover rewards, and scan coupons.
          </AppText>
        </View>

        <Card style={{ gap: spacing.lg }}>
          <TextField
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!isSubmitting}
            error={fieldErrors.email}
            keyboardType="email-address"
            label="Email"
            onChangeText={(value) => {
              setEmail(value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
              setSubmitError(null);
            }}
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            placeholder="you@example.com"
            returnKeyType="next"
            textContentType="emailAddress"
            value={email}
          />

          <TextField
            ref={passwordInputRef}
            autoCapitalize="none"
            autoComplete="current-password"
            editable={!isSubmitting}
            error={fieldErrors.password}
            label="Password"
            onChangeText={(value) => {
              setPassword(value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
              setSubmitError(null);
            }}
            onSubmitEditing={() => {
              void handleSubmit();
            }}
            placeholder="Enter your password"
            returnKeyType="go"
            secureTextEntry
            textContentType="password"
            value={password}
          />

          {visibleError ? (
            <ErrorState message={visibleError} title="Unable to sign in" />
          ) : null}

          <Button
            label="Sign in"
            loading={isSubmitting}
            onPress={() => {
              void handleSubmit();
            }}
          />
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function getLoginErrorMessage(error: unknown): string {
  if (
    error instanceof ApiHttpError &&
    (error.status === 400 || error.status === 401 || error.status === 403)
  ) {
    return 'The email or password is incorrect.';
  }

  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Sign in failed. Please try again.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    justifyContent: 'center',
  },
});
