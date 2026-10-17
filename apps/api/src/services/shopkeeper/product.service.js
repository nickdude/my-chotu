const { Decimal } = require('@prisma/client/runtime/library');
const prisma = require('../../config/prisma');
const { uniqueSlug } = require('../../utils/slug');
const { NotFoundError, AppError } = require('../../utils/errors');
const { parsePagination } = require('../../utils/pagination');

const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true } },
  variants: true,
};

const listProducts = async (shopId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = {
    shopId,
    isArchived: false,
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ],
    }),
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.lowStock === 'true' && {
      variants: { some: { stockQty: { lte: prisma.productVariant.fields.lowStockThreshold } } },
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, include: PRODUCT_INCLUDE, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.product.count({ where }),
  ]);

  return { products, meta: { page, limit, total } };
};

const getProduct = async (shopId, productId) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, shopId, isArchived: false },
    include: PRODUCT_INCLUDE,
  });
  if (!product) throw new NotFoundError('Product');
  return product;
};

const createProduct = async (shopId, data) => {
  const { price, costPrice, taxRate, stockQty, lowStockThreshold, ...productData } = data;

  const slug = await uniqueSlug(data.name, (s) =>
    prisma.product.findFirst({ where: { shopId, slug: s } }).then(Boolean)
  );

  return prisma.product.create({
    data: {
      shopId,
      slug,
      name:        productData.name,
      description: productData.description,
      categoryId:  productData.categoryId,
      sku:         productData.sku,
      images:      productData.images ?? [],
      variants: {
        create: {
          name:              'Default',
          price:             new Decimal(String(price)),
          costPrice:         costPrice ? new Decimal(String(costPrice)) : null,
          taxRate:           new Decimal(String(taxRate ?? 0)),
          stockQty:          stockQty ?? 0,
          lowStockThreshold: lowStockThreshold ?? 5,
        },
      },
    },
    include: PRODUCT_INCLUDE,
  });
};

const updateProduct = async (shopId, productId, data) => {
  const product = await prisma.product.findFirst({ where: { id: productId, shopId } });
  if (!product) throw new NotFoundError('Product');

  const { price, costPrice, taxRate, stockQty, lowStockThreshold, ...productData } = data;

  await prisma.product.update({ where: { id: productId }, data: productData });

  // Update default variant if pricing fields provided
  if (price !== undefined || costPrice !== undefined || taxRate !== undefined) {
    const variant = await prisma.productVariant.findFirst({ where: { productId } });
    if (variant) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          ...(price !== undefined && { price: new Decimal(String(price)) }),
          ...(costPrice !== undefined && { costPrice: new Decimal(String(costPrice)) }),
          ...(taxRate !== undefined && { taxRate: new Decimal(String(taxRate)) }),
        },
      });
    }
  }

  return getProduct(shopId, productId);
};

const archiveProduct = async (shopId, productId) => {
  const product = await prisma.product.findFirst({ where: { id: productId, shopId } });
  if (!product) throw new NotFoundError('Product');
  return prisma.product.update({ where: { id: productId }, data: { isArchived: true, isActive: false } });
};

const adjustStock = async (shopId, productId, { type, qty, reason }, actorId) => {
  const product = await prisma.product.findFirst({ where: { id: productId, shopId } });
  if (!product) throw new NotFoundError('Product');

  const variant = await prisma.productVariant.findFirst({ where: { productId } });
  if (!variant) throw new NotFoundError('Product variant');

  const isDeduction = ['ADJUSTMENT_REMOVE', 'LOSS', 'SALE'].includes(type);
  const delta = isDeduction ? -qty : qty;
  const newQty = variant.stockQty + delta;

  if (newQty < 0) throw new AppError('Insufficient stock for this adjustment', 409);

  await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: variant.id },
      data: { stockQty: newQty },
    }),
    prisma.inventoryMovement.create({
      data: {
        variantId:     variant.id,
        shopId,
        type,
        qty:           delta,
        balanceBefore: variant.stockQty,
        balanceAfter:  newQty,
        reason,
        actorId,
      },
    }),
  ]);

  return getProduct(shopId, productId);
};

const getLowStockProducts = (shopId) =>
  prisma.product.findMany({
    where: {
      shopId,
      isArchived: false,
      variants: { some: { stockQty: { lte: 5 } } },
    },
    include: { variants: { where: { stockQty: { lte: 5 } } } },
    take: 20,
  });

module.exports = { listProducts, getProduct, createProduct, updateProduct, archiveProduct, adjustStock, getLowStockProducts };
