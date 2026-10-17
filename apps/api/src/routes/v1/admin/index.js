const { Router } = require('express');
const authenticate = require('../../../middleware/authenticate');
const authorize    = require('../../../middleware/authorize');
const validate     = require('../../../middleware/validate');

const overviewCtrl  = require('../../../controllers/admin/overview.controller');
const shopCtrl      = require('../../../controllers/admin/shop.controller');
const userCtrl      = require('../../../controllers/admin/user.controller');
const planCtrl      = require('../../../controllers/admin/plan.controller');
const categoryCtrl  = require('../../../controllers/admin/category.controller');
const auditCtrl     = require('../../../controllers/admin/audit.controller');
const settingsCtrl  = require('../../../controllers/admin/settings.controller');
const orderCtrl     = require('../../../controllers/admin/order.controller');

const {
  listShopsSchema, updateShopStatusSchema,
  listUsersSchema, updateUserStatusSchema,
  planSchema, categorySchema, settingSchema,
} = require('../../../validators/admin.validator');

const router = Router();

// Every admin route requires authentication + SUPER_ADMIN role
router.use(authenticate, authorize('SUPER_ADMIN'));

// ─── Overview ─────────────────────────────────────────────────────────────────
router.get('/overview',       overviewCtrl.getOverview);
router.get('/overview/trend', overviewCtrl.getTrend);

// ─── Shops ────────────────────────────────────────────────────────────────────
router.get('/shops',                       validate(listShopsSchema, 'query'), shopCtrl.listShops);
router.get('/shops/:shopId',               shopCtrl.getShop);
router.patch('/shops/:shopId/status',      validate(updateShopStatusSchema),   shopCtrl.updateShopStatus);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users',                       validate(listUsersSchema, 'query'), userCtrl.listUsers);
router.patch('/users/:userId/status',      validate(updateUserStatusSchema),   userCtrl.updateUserStatus);

// ─── Plans ────────────────────────────────────────────────────────────────────
router.get('/plans',          planCtrl.listPlans);
router.get('/plans/:planId',  planCtrl.getPlan);
router.post('/plans',         validate(planSchema), planCtrl.createPlan);
router.patch('/plans/:planId', validate(planSchema.partial()), planCtrl.updatePlan);
router.delete('/plans/:planId', planCtrl.archivePlan);

// ─── Categories ───────────────────────────────────────────────────────────────
router.get('/categories',                    categoryCtrl.listCategories);
router.post('/categories',                   validate(categorySchema), categoryCtrl.createCategory);
router.patch('/categories/:categoryId',      validate(categorySchema.partial()), categoryCtrl.updateCategory);
router.patch('/categories/:categoryId/toggle', categoryCtrl.toggleCategory);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.get('/orders', orderCtrl.searchOrders);

// ─── Audit logs ───────────────────────────────────────────────────────────────
router.get('/audit-logs', auditCtrl.listAuditLogs);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings',          settingsCtrl.listSettings);
router.put('/settings/:key',     validate(settingSchema), settingsCtrl.updateSetting);

module.exports = router;
