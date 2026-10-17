const { Router } = require('express');
const authRoutes          = require('./auth.routes');
const shopRoutes          = require('./shop.routes');
const cartRoutes          = require('./cart.routes');
const orderRoutes         = require('./order.routes');
const addressRoutes       = require('./address.routes');
const shopkeeperRoutes    = require('./shopkeeper');
const deliveryRoutes      = require('./delivery');
const notificationRoutes  = require('./notifications.routes');
const adminRoutes         = require('./admin');

const router = Router();

router.use('/auth',          authRoutes);
router.use('/shops',         shopRoutes);
router.use('/cart',          cartRoutes);
router.use('/orders',        orderRoutes);
router.use('/addresses',     addressRoutes);
router.use('/shopkeeper',    shopkeeperRoutes);
router.use('/delivery',      deliveryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin',         adminRoutes);

module.exports = router;
