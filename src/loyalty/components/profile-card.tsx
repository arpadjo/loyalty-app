import { StyleSheet, View } from 'react-native';

import type { UserProfile } from '@/src/api/types';
import { AppText, Card } from '@/src/components/ui';
import { useAppTheme } from '@/src/theme/theme-provider';

type ProfileCardProps = {
  profile: UserProfile;
};

export function ProfileCard({ profile }: ProfileCardProps) {
  const { colors, radius, spacing } = useAppTheme();
  const displayName = getDisplayName(profile);
  const initials = getInitials(profile, displayName);

  return (
    <Card style={{ gap: spacing.lg }}>
      <View style={[styles.header, { gap: spacing.md }]}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.avatar,
            {
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.full,
            },
          ]}>
          <AppText color="primary" variant="heading">
            {initials}
          </AppText>
        </View>
        <View style={styles.identity}>
          <AppText numberOfLines={1} variant="heading">
            {displayName}
          </AppText>
          <AppText color="muted" numberOfLines={1}>
            {profile.email}
          </AppText>
        </View>
      </View>

      <View
        style={[
          styles.details,
          {
            borderTopColor: colors.border,
            gap: spacing.md,
            paddingTop: spacing.lg,
          },
        ]}>
        <ProfileDetail label="Customer ID" value={profile.customer_id} />
        <ProfileDetail label="Locale" value={profile.locale} />
      </View>
    </Card>
  );
}

type ProfileDetailProps = {
  label: string;
  value: string;
};

function ProfileDetail({ label, value }: ProfileDetailProps) {
  return (
    <View style={styles.detailRow}>
      <AppText color="muted" variant="caption">
        {label}
      </AppText>
      <AppText numberOfLines={1} variant="label">
        {value || '—'}
      </AppText>
    </View>
  );
}

function getDisplayName(profile: UserProfile): string {
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  return profile.name.trim() || fullName || profile.email;
}

function getInitials(profile: UserProfile, displayName: string): string {
  const initials = [profile.first_name, profile.last_name]
    .map((name) => name.trim().charAt(0))
    .filter(Boolean)
    .join('');

  return (initials || displayName.trim().charAt(0) || '?').toUpperCase();
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  details: {
    borderTopWidth: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  identity: {
    flex: 1,
  },
});
