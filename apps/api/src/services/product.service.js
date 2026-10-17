const productRepo = require('../repositories/product.repository');
const shopRepo = require('../repositories/shop.repository');
const { NotFoundError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');

const getProductsByShop = async (shopSlug, query) => {
  const shop = await shopRepo.findBySlug(shopSlug);
  if (!shop) throw new NotFoundError('Shop');

  const { page, limit } = parsePagination(query);
  const availableOnly = query.available !== 'false';

  const [products, total] = await productRepo.findManyByShop({
    shopId: shop.id,
    search: query.search,
    categoryId: query.categoryId,
    availableOnly,
    page,
    limit,
  });

  return { products, meta: { page, limit, total } };
};

const getProduct = async (productId) => {
  const product = await productRepo.findById(productId);
  if (!product) throw new NotFoundError('Product');
  return product;
};

module.exports = { getProductsByShop, getProduct };
