const { Router } = require('express');
const authenticate = require('../../../middleware/authenticate');
const { shopContext } = require('../../../middleware/shopContext');
const shopRoutes          = require('./shop.routes');
const productRoutes       = require('./product.routes');
const orderRoutes         = require('./order.routes');
const staffRoutes         = require('./staff.routes');
const analyticsController = require('../../../controllers/shopkeeper/analytics.controller');

const router = Router();

router.use(authenticate);

router.use('/shop',     shopRoutes);
router.use('/products', shopContext, productRoutes);
router.use('/orders',   shopContext, orderRoutes);
router.use('/staff',    shopContext, staffRoutes);

router.get('/analytics/summary',      shopContext, analyticsController.getSummary);
router.get('/analytics/top-products', shopContext, analyticsController.getTopProducts);
router.get('/analytics/trend',        shopContext, analyticsController.getOrderTrend);

module.exports = router;
