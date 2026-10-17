const prisma = require('../config/prisma');

const PRODUCT_SELECT = {
  id: true, name: true, slug: true, description: true, images: true,
  sku: true, isActive: true, isArchived: true,
  category: { select: { id: true, name: true, slug: true } },
  variants: {
    where: { },
    select: {
      id: true, name: true, sku: true, price: true, taxRate: true,
      stockQty: true, lowStockThreshold: true, isAvailable: true,
    },
  },
};

const findManyByShop = ({ shopId, search, categoryId, availableOnly, page, limit }) => {
  const skip = (page - 1) * limit;
  const where = {
    shopId,
    isActive: true,
    isArchived: false,
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(availableOnly && {
      variants: { some: { isAvailable: true, stockQty: { gt: 0 } } },
    }),
  };

  return Promise.all([
    prisma.product.findMany({
      where,
      select: PRODUCT_SELECT,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.product.count({ where }),
  ]);
};

const findById = (id) =>
  prisma.product.findFirst({
    where: { id, isActive: true, isArchived: false },
    select: PRODUCT_SELECT,
  });

const findVariantById = (id) =>
  prisma.productVariant.findUnique({
    where: { id },
    include: { product: { select: { id: true, shopId: true, name: true, isActive: true, isArchived: true } } },
  });

module.exports = { findManyByShop, findById, findVariantById };
