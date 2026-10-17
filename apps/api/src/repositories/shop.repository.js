const prisma = require('../config/prisma');

const SHOP_PUBLIC_SELECT = {
  id: true, name: true, slug: true, logoUrl: true, coverImageUrl: true,
  description: true, phone: true, email: true,
  addressLine: true, city: true, state: true, pincode: true,
  lat: true, lng: true, deliveryRadiusKm: true, minOrderAmount: true,
  isPickupEnabled: true, isDeliveryEnabled: true, isOpen: true, status: true,
  category: { select: { id: true, name: true, slug: true } },
  operatingHours: true,
};

const findBySlug = (slug) =>
  prisma.shop.findFirst({
    where: { slug, status: 'APPROVED' },
    select: SHOP_PUBLIC_SELECT,
  });

const findMany = ({ search, categoryId, page, limit }) => {
  const skip = (page - 1) * limit;
  const where = {
    status: 'APPROVED',
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return Promise.all([
    prisma.shop.findMany({ where, select: SHOP_PUBLIC_SELECT, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.shop.count({ where }),
  ]);
};

const findById = (id) =>
  prisma.shop.findFirst({ where: { id, status: 'APPROVED' }, select: SHOP_PUBLIC_SELECT });

module.exports = { findBySlug, findMany, findById };
