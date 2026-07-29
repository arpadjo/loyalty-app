import { render, screen, userEvent } from '@testing-library/react-native';

import type { Reward } from '@/src/api/types';
import { AppThemeProvider } from '@/src/theme/theme-provider';
import { RewardCard } from '@/src/loyalty/components/reward-card';
import { RewardList } from '@/src/loyalty/components/reward-list';

const availableReward: Reward = {
  id: 'f431d603-d4e7-4497-ba10-885a757cfba0',
  name: 'Free coffee',
  description: 'Enjoy a coffee on us.',
  is_redeemable: true,
  needed_points: 10,
  cr_points: 30,
};

describe('reward states', () => {
  it('allows an available reward to be selected', async () => {
    const onRedeem = jest.fn();
    const user = userEvent.setup();

    await render(
      <AppThemeProvider>
        <RewardCard onRedeem={onRedeem} reward={availableReward} />
      </AppThemeProvider>,
    );

    expect(screen.getByText('Available')).toBeOnTheScreen();

    const redeemButton = screen.getByRole('button', { name: 'Redeem' });
    expect(redeemButton).toBeEnabled();

    await user.press(redeemButton);

    expect(onRedeem).toHaveBeenCalledWith(availableReward);
  });

  it('disables redemption when more points are required', async () => {
    const onRedeem = jest.fn();

    await render(
      <AppThemeProvider>
        <RewardCard
          onRedeem={onRedeem}
          reward={{ ...availableReward, is_redeemable: false }}
        />
      </AppThemeProvider>,
    );

    expect(screen.getByText('More points needed')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Redeem' })).toBeDisabled();
    expect(onRedeem).not.toHaveBeenCalled();
  });

  it('renders a meaningful empty rewards state', async () => {
    await render(
      <AppThemeProvider>
        <RewardList rewards={[]} />
      </AppThemeProvider>,
    );

    expect(screen.getByText('No rewards yet')).toBeOnTheScreen();
  });
});
