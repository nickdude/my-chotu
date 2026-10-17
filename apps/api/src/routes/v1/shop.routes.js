const { Router } = require('express');
const shopController    = require('../../controllers/shop.controller');
const productController = require('../../controllers/product.controller');
const validate = require('../../middleware/validate');
const { listShopsSchema } = require('../../validators/shop.validator');
const { listProductsSchema } = require('../../validators/product.validator');

const router = Router();

router.get('/',                    validate(listShopsSchema, 'query'), shopController.listShops);
router.get('/:slug',               shopController.getShop);
router.get('/:slug/products',      validate(listProductsSchema, 'query'), productController.listShopProducts);
router.get('/:slug/categories',    shopController.getShopCategories);
router.post('/:slug/scan',         shopController.trackScan);

module.exports = router;
