const shopRepo = require('../repositories/shop.repository');
const { NotFoundError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');

const getShops = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const [shops, total] = await shopRepo.findMany({ ...query, page, limit });
  return { shops, meta: { page, limit, total } };
};

const getShopBySlug = async (slug) => {
  const shop = await shopRepo.findBySlug(slug);
  if (!shop) throw new NotFoundError('Shop');
  return shop;
};

module.exports = { getShops, getShopBySlug };
