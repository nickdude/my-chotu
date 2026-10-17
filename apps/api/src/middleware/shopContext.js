const prisma = require('../config/prisma');
const { ForbiddenError, AppError } = require('../utils/errors');

/**
 * Resolves the shop from the authenticated user's membership.
 * Attaches req.shop and req.shopMembership.
 * Must run after authenticate middleware.
 */
const shopContext = async (req, res, next) => {
  try {
    const membership = await prisma.shopMembership.findFirst({
      where: { userId: req.user.sub, isActive: true },
      include: { shop: true },
    });

    if (!membership) {
      return next(new ForbiddenError('No active shop membership found'));
    }

    req.shop = membership.shop;
    req.shopMembership = membership;
    return next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Guards routes that require an active or trial subscription.
 * Must run after shopContext.
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { shopId: req.shop.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) return next(new AppError('No subscription found for this shop', 402));

    const allowed = ['TRIAL', 'ACTIVE', 'GRACE_PERIOD'];
    if (!allowed.includes(sub.status)) {
      return next(new AppError('Your subscription has expired. Please renew to continue.', 402));
    }

    req.subscription = sub;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { shopContext, requireActiveSubscription };
