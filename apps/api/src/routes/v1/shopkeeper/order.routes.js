const { Router } = require('express');
const orderController = require('../../../controllers/shopkeeper/order.controller');
const analyticsController = require('../../../controllers/shopkeeper/analytics.controller');
const validate = require('../../../middleware/validate');
const { updateOrderStatusSchema, listOrdersSchema } = require('../../../validators/shopkeeper.validator');

const router = Router();

router.get('/',           validate(listOrdersSchema, 'query'), orderController.listOrders);
router.get('/:orderId',   orderController.getOrder);
router.patch('/:orderId/status', validate(updateOrderStatusSchema), orderController.updateStatus);

module.exports = router;
