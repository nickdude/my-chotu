const { Router } = require('express');
const staffCtrl = require('../../../controllers/shopkeeper/staff.controller');
const validate  = require('../../../middleware/validate');
const { addStaffSchema, assignDeliverySchema } = require('../../../validators/delivery.validator');

const router = Router();

router.get('/',              staffCtrl.listStaff);
router.post('/',             validate(addStaffSchema), staffCtrl.addStaff);
router.patch('/:id/toggle',  staffCtrl.toggleStaff);

// Delivery assignment from order context
router.post('/orders/:orderId/assign', validate(assignDeliverySchema), staffCtrl.assignDelivery);

// COD
router.get('/cod',                            staffCtrl.listCod);
router.post('/cod/:assignmentId/reconcile',   staffCtrl.reconcileCod);

module.exports = router;
