const { ForbiddenError } = require('../utils/errors');

/**
 * Usage: authorize('SUPER_ADMIN') or authorize(['SHOP_OWNER', 'SHOP_MANAGER'])
 */
const authorize = (roles) => (req, res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!req.user || !allowed.includes(req.user.role)) {
    return next(new ForbiddenError('You do not have permission to perform this action'));
  }
  return next();
};

module.exports = authorize;
