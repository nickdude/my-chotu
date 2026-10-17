const prisma = require('../../config/prisma');
const { NotFoundError, AppError } = require('../../utils/errors');
const { parsePagination } = require('../../utils/pagination');
const { ORDER_TRANSITIONS } = require('@my-chotu/shared');
const { notify } = require('../../notifications/notificationService');

// Transitions the shop owner is allowed to trigger
const SHOPKEEPER_ALLOWED = ['ACCEPTED', 'REJECTED', 'PREPARING', 'CANCELLED'];

const ORDER_INCLUDE = {
  items: true,
  statusHistory: { orderBy: { createdAt: 'asc' } },
  customer: { select: { id: true, name: true, phone: true } },
  deliveryAssignment: {
    select: {
      status: true,
      staff: { select: { id: true, name: true, phone: true } },
    },
  },
  codCollection: { select: { status: true, amountDue: true, amountCollected: true } },
};

const listOrders = async (shopId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = {
    shopId,
    ...(query.status && { status: query.status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { select: { id: true, productNameSnapshot: true, qty: true, unitPrice: true } },
        customer: { select: { name: true, phone: true } },
        codCollection: { select: { status: true } },
      },
      skip,
      take: limit,
      orderBy: { placedAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, meta: { page, limit, total } };
};

const getOrder = async (shopId, orderId) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, shopId }, include: ORDER_INCLUDE });
  if (!order) throw new NotFoundError('Order');
  return order;
};

const updateStatus = async (shopId, orderId, { status, reason }, actorId) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, shopId } });
  if (!order) throw new NotFoundError('Order');

  if (!SHOPKEEPER_ALLOWED.includes(status)) {
    throw new AppError(`Shopkeepers cannot set status to "${status}"`, 403);
  }

  const allowed = ORDER_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot transition from "${order.status}" to "${status}"`, 400);
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderStatusHistory.create({
      data: { orderId, fromStatus: order.status, toStatus: status, reason, actorId },
    }),
  ]);

  // Notify customer of status change
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { name: true } });
  const typeMap = {
    ACCEPTED:  'ORDER_ACCEPTED',
    REJECTED:  'ORDER_REJECTED',
    PREPARING: 'ORDER_PREPARING',
    CANCELLED: 'ORDER_CANCELLED',
  };
  if (typeMap[status]) {
    notify(order.customerId, typeMap[status], {
      orderNumber: order.orderNumber,
      shopName:    shop?.name ?? '',
      reason,
    });
  }

  return getOrder(shopId, orderId);
};

const getPendingCount = (shopId) =>
  prisma.order.count({ where: { shopId, status: 'PENDING' } });

module.exports = { listOrders, getOrder, updateStatus, getPendingCount };
