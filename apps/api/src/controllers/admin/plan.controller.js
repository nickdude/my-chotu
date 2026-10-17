const { Decimal } = require('@prisma/client/runtime/library');
const prisma      = require('../../config/prisma');
const { success, created } = require('../../utils/response');
const { NotFoundError }    = require('../../utils/errors');
const { audit } = require('../../utils/audit');
const asyncHandler = require('../../utils/asyncHandler');

const listPlans = asyncHandler(async (req, res) => {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { priceMonthly: 'asc' },
    include: { _count: { select: { subscriptions: true } } },
  });
  return success(res, plans);
});

const getPlan = asyncHandler(async (req, res) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where:   { id: req.params.planId },
    include: { _count: { select: { subscriptions: true } } },
  });
  if (!plan) throw new NotFoundError('Plan');
  return success(res, plan);
});

const createPlan = asyncHandler(async (req, res) => {
  const { priceMonthly, ...rest } = req.body;
  const plan = await prisma.subscriptionPlan.create({
    data: { ...rest, priceMonthly: new Decimal(String(priceMonthly)) },
  });
  await audit(req.user.sub, 'SubscriptionPlan', plan.id, 'CREATED', { after: plan, ip: req.ip });
  return created(res, plan, 'Plan created');
});

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: req.params.planId } });
  if (!plan) throw new NotFoundError('Plan');

  const { priceMonthly, ...rest } = req.body;
  const data = { ...rest };
  if (priceMonthly !== undefined) data.priceMonthly = new Decimal(String(priceMonthly));

  // Intentional: updating a plan does NOT alter existing subscriptions.
  // Existing subscribers stay on their old terms; new subscribers get the updated plan.
  const updated = await prisma.subscriptionPlan.update({ where: { id: plan.id }, data });

  await audit(req.user.sub, 'SubscriptionPlan', plan.id, 'UPDATED', {
    before: plan, after: data, ip: req.ip,
  });
  return success(res, updated, 'Plan updated');
});

const archivePlan = asyncHandler(async (req, res) => {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: req.params.planId } });
  if (!plan) throw new NotFoundError('Plan');

  const updated = await prisma.subscriptionPlan.update({
    where: { id: plan.id },
    data:  { isActive: false },
  });
  await audit(req.user.sub, 'SubscriptionPlan', plan.id, 'ARCHIVED', { ip: req.ip });
  return success(res, updated, 'Plan archived');
});

module.exports = { listPlans, getPlan, createPlan, updatePlan, archivePlan };
