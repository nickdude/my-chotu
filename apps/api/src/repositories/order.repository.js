const prisma = require('../config/prisma');

const ORDER_SUMMARY_SELECT = {
  id: true, orderNumber: true, status: true, total: true, subtotal: true,
  deliveryFee: true, discount: true, placedAt: true, updatedAt: true,
  shop: { select: { id: true, name: true, slug: true, logoUrl: true } },
  items: {
    select: {
      id: true, productNameSnapshot: true, variantNameSnapshot: true,
      qty: true, unitPrice: true, total: true,
    },
  },
};

const ORDER_DETAIL_SELECT = {
  ...ORDER_SUMMARY_SELECT,
  notes: true,
  customerNameSnapshot: true,
  customerPhoneSnapshot: true,
  deliveryAddressSnapshot: true,
  statusHistory: { orderBy: { createdAt: 'asc' } },
  deliveryAssignment: {
    select: {
      status: true, assignedAt: true, pickedUpAt: true, deliveredAt: true,
      staff: { select: { id: true, name: true, phone: true } },
    },
  },
  codCollection: { select: { status: true, amountDue: true, amountCollected: true } },
};

const findManyByCustomer = (customerId, { skip, limit }) =>
  Promise.all([
    prisma.order.findMany({
      where: { customerId },
      select: ORDER_SUMMARY_SELECT,
      skip,
      take: limit,
      orderBy: { placedAt: 'desc' },
    }),
    prisma.order.count({ where: { customerId } }),
  ]);

const findByIdAndCustomer = (id, customerId) =>
  prisma.order.findFirst({
    where: { id, customerId },
    select: ORDER_DETAIL_SELECT,
  });

const findByIdAndShop = (id, shopId) =>
  prisma.order.findFirst({ where: { id, shopId } });

const create = (data, tx) =>
  (tx || prisma).order.create({ data, select: ORDER_DETAIL_SELECT });

module.exports = {
  findManyByCustomer,
  findByIdAndCustomer,
  findByIdAndShop,
  create,
};
