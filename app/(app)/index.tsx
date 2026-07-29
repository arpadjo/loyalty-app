import { RefreshControl, View } from 'react-native';

import { AppText, ErrorState, LoadingState, Screen } from '@/src/components/ui';
import {
  PointsCard,
  ProfileCard,
  RewardList,
  useCustomerRelationshipQuery,
  useProfileQuery,
  useRewardsQuery,
} from '@/src/loyalty';
import { useAppTheme } from '@/src/theme/theme-provider';

export default function HomeScreen() {
  const { colors, spacing } = useAppTheme();
  const customerRelationshipQuery = useCustomerRelationshipQuery();
  const profileQuery = useProfileQuery();
  const rewardsQuery = useRewardsQuery();
  const queries = [customerRelationshipQuery, profileQuery, rewardsQuery];
  const isInitialLoading = queries.every((query) => query.isPending);
  const isRefreshing = queries.some((query) => query.isRefetching);

  function refreshDashboard() {
    void Promise.all(queries.map((query) => query.refetch()));
  }

  if (isInitialLoading) {
    return (
      <Screen>
        <LoadingState label="Loading your loyalty account…" />
      </Screen>
    );
  }

  return (
    <Screen
      contentContainerStyle={{ gap: spacing.xl }}
      scroll
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={refreshDashboard}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        ),
      }}>
      <View style={{ gap: spacing.xs }}>
        <AppText color="primary" variant="label">
          YOUR LOYALTY
        </AppText>
        <AppText variant="title">
          {profileQuery.data?.first_name
            ? `Welcome, ${profileQuery.data.first_name}.`
            : 'Welcome back.'}
        </AppText>
      </View>

      {customerRelationshipQuery.data ? (
        <PointsCard points={customerRelationshipQuery.data.points} />
      ) : customerRelationshipQuery.isError ? (
        <ErrorState
          message={getErrorMessage(customerRelationshipQuery.error)}
          onRetry={() => void customerRelationshipQuery.refetch()}
          title="Points unavailable"
        />
      ) : (
        <LoadingState label="Loading points…" />
      )}

      <View style={{ gap: spacing.md }}>
        <SectionHeader title="Profile" />
        {profileQuery.data ? (
          <ProfileCard profile={profileQuery.data} />
        ) : profileQuery.isError ? (
          <ErrorState
            message={getErrorMessage(profileQuery.error)}
            onRetry={() => void profileQuery.refetch()}
            title="Profile unavailable"
          />
        ) : (
          <LoadingState label="Loading profile…" />
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionHeader
          subtitle="Choose how you want to use your points."
          title="Rewards"
        />
        {rewardsQuery.data ? (
          <RewardList rewards={rewardsQuery.data} />
        ) : rewardsQuery.isError ? (
          <ErrorState
            message={getErrorMessage(rewardsQuery.error)}
            onRetry={() => void rewardsQuery.refetch()}
            title="Rewards unavailable"
          />
        ) : (
          <LoadingState label="Loading rewards…" />
        )}
      </View>
    </Screen>
  );
}

type SectionHeaderProps = {
  subtitle?: string;
  title: string;
};

function SectionHeader({ subtitle, title }: SectionHeaderProps) {
  const { spacing } = useAppTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="heading">{title}</AppText>
      {subtitle ? <AppText color="muted">{subtitle}</AppText> : null}
    </View>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Please try again.';
}
