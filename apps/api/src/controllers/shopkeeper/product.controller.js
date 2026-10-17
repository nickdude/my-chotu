const productService = require('../../services/shopkeeper/product.service');
const { success, created, paginated } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const listProducts = asyncHandler(async (req, res) => {
  const { products, meta } = await productService.listProducts(req.shop.id, req.query);
  return paginated(res, products, meta);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.shop.id, req.params.productId);
  return success(res, product);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.shop.id, req.body);
  return created(res, product, 'Product created');
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.shop.id, req.params.productId, req.body);
  return success(res, product, 'Product updated');
});

const archiveProduct = asyncHandler(async (req, res) => {
  await productService.archiveProduct(req.shop.id, req.params.productId);
  return success(res, null, 'Product archived');
});

const adjustStock = asyncHandler(async (req, res) => {
  const product = await productService.adjustStock(req.shop.id, req.params.productId, req.body, req.user.sub);
  return success(res, product, 'Stock updated');
});

const getLowStock = asyncHandler(async (req, res) => {
  const products = await productService.getLowStockProducts(req.shop.id);
  return success(res, products);
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, archiveProduct, adjustStock, getLowStock };
