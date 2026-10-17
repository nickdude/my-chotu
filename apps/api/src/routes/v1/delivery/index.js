const { Router } = require('express');
const authenticate = require('../../../middleware/authenticate');
const validate = require('../../../middleware/validate');
const assignmentCtrl = require('../../../controllers/delivery/assignment.controller');
const codCtrl = require('../../../controllers/delivery/cod.controller');
const {
  updateDeliveryStatusSchema,
  submitProofSchema,
  collectCodSchema,
} = require('../../../validators/delivery.validator');

const router = Router();

router.use(authenticate);

router.get('/assignments',             assignmentCtrl.getActive);
router.get('/assignments/history',     assignmentCtrl.getHistory);
router.get('/assignments/:id',         assignmentCtrl.getOne);
router.patch('/assignments/:id/status', validate(updateDeliveryStatusSchema), assignmentCtrl.updateStatus);
router.post('/assignments/:id/otp',    assignmentCtrl.requestOtp);
router.post('/assignments/:id/proof',  validate(submitProofSchema), assignmentCtrl.submitProof);
router.post('/assignments/:id/cod',    validate(collectCodSchema), codCtrl.collectCod);

module.exports = router;
