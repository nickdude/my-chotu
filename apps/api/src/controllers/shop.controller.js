const prisma = require('../config/prisma');
const shopService = require('../services/shop.service');
const shopRepo = require('../repositories/shop.repository');
const { success, paginated } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');
const asyncHandler = require('../utils/asyncHandler');

const listShops = asyncHandler(async (req, res) => {
  const { shops, meta } = await shopService.getShops(req.query);
  return paginated(res, shops, meta);
});

const getShop = asyncHandler(async (req, res) => {
  const shop = await shopService.getShopBySlug(req.params.slug);
  return success(res, shop);
});

// Returns categories that have at least one active product in this shop
const getShopCategories = asyncHandler(async (req, res) => {
  const shop = await shopRepo.findBySlug(req.params.slug);
  if (!shop) throw new NotFoundError('Shop');

  const categories = await prisma.category.findMany({
    where: {
      products: {
        some: { shopId: shop.id, isActive: true, isArchived: false },
      },
    },
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });

  return success(res, categories);
});

// Lightweight scan/visit tracker — increments a counter without heavy analytics
const trackScan = asyncHandler(async (req, res) => {
  const shop = await shopRepo.findBySlug(req.params.slug);
  if (!shop) throw new NotFoundError('Shop');

  // PlatformSetting.value is Json — Prisma can't use numeric increment on Json fields.
  // Read-then-write inside a serializable transaction to stay consistent under concurrent scans.
  const key = `shop.${shop.id}.scans`;
  await prisma.$transaction(async (tx) => {
    const existing = await tx.platformSetting.findUnique({ where: { key } });
    const current  = existing ? (Number(existing.value) || 0) : 0;
    await tx.platformSetting.upsert({
      where:  { key },
      create: { key, value: current + 1, description: `QR scan count for shop ${shop.slug}` },
      update: { value: current + 1 },
    });
  });

  return success(res, null);
});

module.exports = { listShops, getShop, getShopCategories, trackScan };
