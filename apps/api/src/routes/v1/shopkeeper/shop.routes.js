const { Router } = require('express');
const shopController = require('../../../controllers/shopkeeper/shop.controller');
const { shopContext } = require('../../../middleware/shopContext');
const validate = require('../../../middleware/validate');
const { updateShopSchema, updateHoursSchema } = require('../../../validators/shopkeeper.validator');

const router = Router();

// Register shop — no shopContext yet (user doesn't have a shop)
router.post('/register', shopController.registerShop);

// All routes below require a resolved shop context
router.use(shopContext);

router.get('/',       shopController.getShop);
router.patch('/',     validate(updateShopSchema), shopController.updateShop);
router.patch('/hours', validate(updateHoursSchema), shopController.updateHours);

module.exports = router;
