const prisma = require('../config/prisma');
const config = require('../config/env');
const { SUBSCRIPTION } = require('@my-chotu/shared');

/**
 * Creates a trial subscription for a newly approved shop.
 * Uses the first active plan or falls back to defaults from PlatformSetting.
 */
const startTrial = async (shopId) => {
  // Prevent duplicate active subscriptions
  const existing = await prisma.subscription.findFirst({
    where: { shopId, status: { in: ['TRIAL', 'ACTIVE'] } },
  });
  if (existing) return existing;

  const plan = await prisma.subscriptionPlan.findFirst({ where: { isActive: true } });
  if (!plan) throw new Error('No active subscription plan found. Run db:seed first.');

  const trialDays = plan.trialDays ?? SUBSCRIPTION.DEFAULT_TRIAL_DAYS;
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const sub = await prisma.subscription.create({
    data: {
      shopId,
      planId: plan.id,
      status: 'TRIAL',
      trialStartsAt: now,
      trialEndsAt,
    },
  });

  await prisma.subscriptionEvent.create({
    data: { subscriptionId: sub.id, event: 'TRIAL_STARTED', metadata: { trialDays } },
  });

  return sub;
};

const getForShop = (shopId) =>
  prisma.subscription.findFirst({
    where: { shopId },
    orderBy: { createdAt: 'desc' },
    include: { plan: true },
  });

/**
 * Returns how many trial days remain. Negative means expired.
 */
const trialDaysRemaining = (subscription) => {
  if (!subscription?.trialEndsAt) return 0;
  const ms = new Date(subscription.trialEndsAt).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

module.exports = { startTrial, getForShop, trialDaysRemaining };
