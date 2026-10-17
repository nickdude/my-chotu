const productService = require('../services/product.service');
const { success, paginated } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const listShopProducts = asyncHandler(async (req, res) => {
  const { products, meta } = await productService.getProductsByShop(req.params.slug, req.query);
  return paginated(res, products, meta);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.productId);
  return success(res, product);
});

module.exports = { listShopProducts, getProduct };
