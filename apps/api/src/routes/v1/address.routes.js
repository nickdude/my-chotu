const { Router } = require('express');
const addressController = require('../../controllers/address.controller');
const authenticate = require('../../middleware/authenticate');

const router = Router();

router.use(authenticate);

router.get('/',           addressController.listAddresses);
router.post('/',          addressController.addAddress);
router.patch('/:id/default', addressController.setDefault);

module.exports = router;
