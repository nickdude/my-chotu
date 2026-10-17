const prisma = require('../../config/prisma');
const { uniqueSlug } = require('../../utils/slug');
const subscriptionService = require('../subscription.service');
const { ConflictError, NotFoundError } = require('../../utils/errors');
const config = require('../../config/env');

const registerShop = async (ownerId, data) => {
  // One shop per owner for now
  const existing = await prisma.shopMembership.findFirst({
    where: { userId: ownerId, role: 'OWNER', isActive: true },
  });
  if (existing) throw new ConflictError('You already have a registered shop');

  const slug = await uniqueSlug(data.name, (s) =>
    prisma.shop.findFirst({ where: { slug: s } }).then(Boolean)
  );

  // Auto-approve in development; PENDING in production for admin review
  const status = config.isDev ? 'APPROVED' : 'PENDING';
  const approvedAt = config.isDev ? new Date() : null;

  const shop = await prisma.$transaction(async (tx) => {
    const newShop = await tx.shop.create({
      data: {
        ownerId,
        name:             data.name,
        slug,
        description:      data.description,
        categoryId:       data.categoryId,
        phone:            data.phone,
        email:            data.email,
        addressLine:      data.addressLine,
        city:             data.city,
        state:            data.state,
        pincode:          data.pincode,
        lat:              data.lat,
        lng:              data.lng,
        deliveryRadiusKm: data.deliveryRadiusKm ?? 5,
        minOrderAmount:   data.minOrderAmount ?? 0,
        isPickupEnabled:  data.isPickupEnabled ?? true,
        isDeliveryEnabled: data.isDeliveryEnabled ?? true,
        status,
        approvedAt,
      },
    });

    // Create owner membership
    await tx.shopMembership.create({
      data: { shopId: newShop.id, userId: ownerId, role: 'OWNER' },
    });

    // Update user role to SHOP_OWNER
    await tx.user.update({
      where: { id: ownerId },
      data: { role: 'SHOP_OWNER' },
    });

    return newShop;
  });

  // Start trial subscription if auto-approved
  if (status === 'APPROVED') {
    await subscriptionService.startTrial(shop.id);
  }

  return getShopDashboard(shop.id);
};

const getShopDashboard = (shopId) =>
  prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      category: true,
      operatingHours: { orderBy: { dayOfWeek: 'asc' } },
      memberships: {
        where: { isActive: true },
        include: { user: { select: { id: true, name: true, role: true, phone: true } } },
      },
    },
  });

const updateShop = async (shopId, data) => {
  await prisma.shop.update({ where: { id: shopId }, data });
  return getShopDashboard(shopId);
};

const updateHours = async (shopId, hours) => {
  await prisma.$transaction(
    hours.map((h) =>
      prisma.shopOperatingHour.upsert({
        where: { shopId_dayOfWeek: { shopId, dayOfWeek: h.dayOfWeek } },
        create: { shopId, ...h },
        update: h,
      })
    )
  );
  return prisma.shopOperatingHour.findMany({ where: { shopId }, orderBy: { dayOfWeek: 'asc' } });
};

module.exports = { registerShop, getShopDashboard, updateShop, updateHours };
