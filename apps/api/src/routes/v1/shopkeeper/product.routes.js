const { Router } = require('express');
const productController = require('../../../controllers/shopkeeper/product.controller');
const validate = require('../../../middleware/validate');
const {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
} = require('../../../validators/shopkeeper.validator');

const router = Router();

router.get('/low-stock',              productController.getLowStock);
router.get('/',                       productController.listProducts);
router.post('/',  validate(createProductSchema), productController.createProduct);
router.get('/:productId',             productController.getProduct);
router.patch('/:productId', validate(updateProductSchema), productController.updateProduct);
router.delete('/:productId',          productController.archiveProduct);
router.post('/:productId/stock',      validate(adjustStockSchema), productController.adjustStock);

module.exports = router;
