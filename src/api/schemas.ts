import { z } from "zod";

const nonEmptyStringSchema = z.string().min(1);

export const loginRequestSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(1, "Password is required"),
});

export const loginResponseSchema = z.object({
  id: z.number(),
  success: z.boolean(),
  access_token: nonEmptyStringSchema,
  token: nonEmptyStringSchema,
});

export const appUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
});

export const customerRelationshipSchema = z.object({
  id: z.number(),
  points: z.number(),
  appuser: appUserSchema,
});

export const userProfileSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  locale: z.string(),
  customer_id: z.string(),
});

export const rewardSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  is_redeemable: z.boolean(),
  needed_points: z.number(),
  cr_points: z.number(),
});

export const rewardsResponseSchema = z.array(rewardSchema);

export const couponRedemptionRequestSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
});

export const couponRedemptionResponseSchema = z.object({
  success: z.boolean(),
  coupon: nonEmptyStringSchema,
  points: z.number(),
  cr_points: z.number(),
});

export const rewardRedemptionRequestSchema = z.object({
  bounty_id: z.uuid(),
});

export const rewardRedemptionResponseSchema = z.object({
  bounty_id: z.uuid(),
});
