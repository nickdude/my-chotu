const { Router } = require('express');
const cartController = require('../../controllers/cart.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { addItemSchema, updateItemSchema } = require('../../validators/cart.validator');

const router = Router();

router.use(authenticate);

router.get('/',                      cartController.getCart);
router.post('/items',                validate(addItemSchema), cartController.addItem);
router.patch('/items/:itemId',       validate(updateItemSchema), cartController.updateItem);
router.delete('/items/:itemId',      cartController.removeItem);
router.delete('/',                   cartController.clearCart);

module.exports = router;
