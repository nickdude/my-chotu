const { Router } = require('express');
const orderController = require('../../controllers/order.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { placeOrderSchema, cancelOrderSchema } = require('../../validators/order.validator');

const router = Router();

router.use(authenticate);

router.post('/',                              validate(placeOrderSchema), orderController.placeOrder);
router.get('/',                               orderController.getOrders);
router.get('/:orderId',                       orderController.getOrder);
router.post('/:orderId/cancel',               validate(cancelOrderSchema), orderController.cancelOrder);

module.exports = router;
