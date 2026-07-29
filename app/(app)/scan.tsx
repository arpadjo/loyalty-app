import type { BarcodeScanningResult } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { ApiError } from '@/src/api/client';
import { couponRedemptionRequestSchema } from '@/src/api/schemas';
import type { CouponRedemptionResponse } from '@/src/api/types';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  LoadingState,
  Screen,
  TextField,
} from '@/src/components/ui';
import { useCouponRedemptionMutation } from '@/src/loyalty';
import { useAppTheme } from '@/src/theme/theme-provider';

export default function CouponScannerScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const redemption = useCouponRedemptionMutation();
  const submissionLock = useRef(false);
  const [manualCode, setManualCode] = useState('');
  const [manualCodeError, setManualCodeError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CouponRedemptionResponse | null>(null);
  const [isScannerPaused, setIsScannerPaused] = useState(false);

  async function redeemCode(rawCode: string, source: 'manual' | 'scanner') {
    if (submissionLock.current) {
      return;
    }

    const result = couponRedemptionRequestSchema.safeParse({ code: rawCode });

    if (!result.success) {
      if (source === 'manual') {
        setManualCodeError(result.error.issues[0]?.message ?? 'Enter a coupon code.');
      } else {
        setSubmitError('This QR code does not contain a valid coupon code.');
      }
      return;
    }

    submissionLock.current = true;
    setIsScannerPaused(true);
    setManualCodeError(undefined);
    setSubmitError(null);

    try {
      const response = await redemption.mutateAsync(result.data);
      setSuccess(response);

      if (source === 'manual') {
        setManualCode('');
      }
    } catch (error) {
      setSubmitError(getRedemptionErrorMessage(error));
      setIsScannerPaused(false);
    } finally {
      submissionLock.current = false;
    }
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    void redeemCode(result.data, 'scanner');
  }

  function resetScanner() {
    redemption.reset();
    setSuccess(null);
    setSubmitError(null);
    setManualCodeError(undefined);
    setIsScannerPaused(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <Screen
        contentContainerStyle={{ gap: spacing.xl }}
        scroll
        scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}>
        <View style={{ alignItems: 'flex-start', gap: spacing.md }}>
          <Button
            accessibilityHint="Returns to the loyalty dashboard"
            label="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.backButton}
            variant="ghost"
          />
          <View style={{ gap: spacing.xs }}>
            <AppText color="primary" variant="label">
              ADD POINTS
            </AppText>
            <AppText variant="title">Scan a coupon</AppText>
            <AppText color="muted">
              Point your camera at the coupon QR code, or enter its code manually.
            </AppText>
          </View>
        </View>

        {success ? (
          <Card
            accessibilityLiveRegion="polite"
            style={{ gap: spacing.lg }}>
            <View style={{ gap: spacing.xs }}>
              <AppText style={{ color: colors.success }} variant="heading">
                Coupon redeemed
              </AppText>
              <AppText>
                {success.points} {success.points === 1 ? 'point was' : 'points were'} added
                to your account.
              </AppText>
              <AppText color="muted" variant="caption">
                Your new balance is {success.cr_points} points.
              </AppText>
            </View>
            <Button label="Done" onPress={() => router.back()} />
            <Button label="Redeem another code" onPress={resetScanner} variant="secondary" />
          </Card>
        ) : (
          <>
            <View style={{ gap: spacing.md }}>
              <AppText variant="heading">Scan QR code</AppText>
              <View
                style={[
                  styles.cameraFrame,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                  },
                ]}>
                {renderCamera({
                  cameraError,
                  colors,
                  isFocused,
                  isScannerPaused,
                  onBarcodeScanned: handleBarcodeScanned,
                  onCameraError: () =>
                    setCameraError('The camera could not start. Enter the code manually.'),
                  permission,
                  requestPermission,
                })}
              </View>
            </View>

            <View style={[styles.divider, { gap: spacing.md }]}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <AppText color="muted" variant="label">
                OR
              </AppText>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Card style={{ gap: spacing.lg }}>
              <View style={{ gap: spacing.xs }}>
                <AppText variant="heading">Enter code manually</AppText>
                <AppText color="muted">
                  Use this option if camera access is unavailable.
                </AppText>
              </View>
              <TextField
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!redemption.isPending}
                error={manualCodeError}
                label="Coupon code"
                onChangeText={(value) => {
                  setManualCode(value);
                  setManualCodeError(undefined);
                  setSubmitError(null);
                }}
                onSubmitEditing={() => void redeemCode(manualCode, 'manual')}
                placeholder="Enter coupon code"
                returnKeyType="done"
                value={manualCode}
              />
              {submitError ? (
                <ErrorState message={submitError} title="Unable to redeem coupon" />
              ) : null}
              <Button
                disabled={!manualCode.trim()}
                label="Redeem code"
                loading={redemption.isPending}
                onPress={() => void redeemCode(manualCode, 'manual')}
              />
            </Card>
          </>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

type CameraContentProps = {
  cameraError: string | null;
  colors: {
    border: string;
    onPrimary: string;
    primary: string;
    surfaceMuted: string;
  };
  isFocused: boolean;
  isScannerPaused: boolean;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
  onCameraError: () => void;
  permission: ReturnType<typeof useCameraPermissions>[0];
  requestPermission: ReturnType<typeof useCameraPermissions>[1];
};

function renderCamera({
  cameraError,
  colors,
  isFocused,
  isScannerPaused,
  onBarcodeScanned,
  onCameraError,
  permission,
  requestPermission,
}: CameraContentProps) {
  if (!permission) {
    return <LoadingState label="Checking camera permission…" />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.cameraFallback}>
        <AppText variant="heading">Camera access needed</AppText>
        <AppText color="muted" style={styles.centeredText}>
          Allow camera access to scan coupon QR codes. Manual entry remains available below.
        </AppText>
        <Button
          label={permission.canAskAgain ? 'Allow camera' : 'Open settings'}
          onPress={() => {
            if (permission.canAskAgain) {
              void requestPermission();
            } else {
              void Linking.openSettings();
            }
          }}
          variant="secondary"
        />
      </View>
    );
  }

  if (cameraError) {
    return (
      <View style={styles.cameraFallback}>
        <AppText variant="heading">Camera unavailable</AppText>
        <AppText color="muted" style={styles.centeredText}>
          {cameraError}
        </AppText>
      </View>
    );
  }

  if (!isFocused) {
    return <LoadingState label="Pausing camera…" />;
  }

  return (
    <>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        facing="back"
        onBarcodeScanned={isScannerPaused ? undefined : onBarcodeScanned}
        onMountError={onCameraError}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[
          styles.scanGuide,
          {
            borderColor: colors.onPrimary,
          },
        ]}
      />
      {isScannerPaused ? (
        <View style={styles.scanningOverlay}>
          <LoadingState label="Redeeming coupon…" />
        </View>
      ) : null}
    </>
  );
}

function getRedemptionErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : 'The coupon could not be redeemed. Please try again.';
}

const styles = StyleSheet.create({
  backButton: {
    minHeight: 44,
  },
  cameraFallback: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  cameraFrame: {
    aspectRatio: 1,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  centeredText: {
    textAlign: 'center',
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  flex: {
    flex: 1,
  },
  scanGuide: {
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 3,
    height: '58%',
    marginTop: '21%',
    width: '58%',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
});
