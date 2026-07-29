import {
  couponRedemptionRequestSchema,
  loginRequestSchema,
  rewardSchema,
} from '@/src/api/schemas';

describe('API schemas', () => {
  it('normalizes valid login and coupon input', () => {
    expect(
      loginRequestSchema.parse({
        email: '  testUser@dev.null  ',
        password: 'challenge-2026',
      }),
    ).toEqual({
      email: 'testUser@dev.null',
      password: 'challenge-2026',
    });

    expect(couponRedemptionRequestSchema.parse({ code: '  YFQY2D  ' })).toEqual({
      code: 'YFQY2D',
    });
  });

  it('rejects malformed login and reward payloads', () => {
    expect(
      loginRequestSchema.safeParse({
        email: 'not-an-email',
        password: '',
      }).success,
    ).toBe(false);

    expect(
      rewardSchema.safeParse({
        id: 'not-a-uuid',
        name: 'Coffee',
        description: 'A free coffee.',
        is_redeemable: true,
        needed_points: '10',
        cr_points: 30,
      }).success,
    ).toBe(false);
  });
});
