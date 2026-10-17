const { Decimal } = require('@prisma/client/runtime/library');
const prisma = require('../../config/prisma');

const startOf = (date, unit) => {
  const d = new Date(date);
  if (unit === 'day')   { d.setHours(0, 0, 0, 0); }
  if (unit === 'week')  { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); }
  if (unit === 'month') { d.setDate(1); d.setHours(0, 0, 0, 0); }
  return d;
};

const getSummary = async (shopId) => {
  const now = new Date();
  const todayStart = startOf(now, 'day');
  const weekStart  = startOf(now, 'week');
  const monthStart = startOf(now, 'month');

  const [todayOrders, weekOrders, monthOrders, pendingCount, totalProducts, lowStockCount] =
    await Promise.all([
      prisma.order.findMany({
        where: { shopId, placedAt: { gte: todayStart }, status: { notIn: ['CANCELLED', 'REJECTED'] } },
        select: { total: true, status: true },
      }),
      prisma.order.findMany({
        where: { shopId, placedAt: { gte: weekStart }, status: { notIn: ['CANCELLED', 'REJECTED'] } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { shopId, placedAt: { gte: monthStart }, status: { notIn: ['CANCELLED', 'REJECTED'] } },
        select: { total: true },
      }),
      prisma.order.count({ where: { shopId, status: 'PENDING' } }),
      prisma.product.count({ where: { shopId, isArchived: false } }),
      prisma.productVariant.count({
        where: { product: { shopId, isArchived: false }, stockQty: { lte: 5 } },
      }),
    ]);

  const sum = (orders) =>
    orders.reduce((acc, o) => acc + Number(o.total ?? 0), 0);

  const todayDelivered = todayOrders.filter((o) => o.status === 'DELIVERED').length;

  return {
    today: {
      orders:    todayOrders.length,
      revenue:   sum(todayOrders),
      delivered: todayDelivered,
    },
    week:  { orders: weekOrders.length,  revenue: sum(weekOrders) },
    month: { orders: monthOrders.length, revenue: sum(monthOrders) },
    pending:   pendingCount,
    products:  totalProducts,
    lowStock:  lowStockCount,
  };
};

const getTopProducts = async (shopId, limit = 5) => {
  const rows = await prisma.orderItem.groupBy({
    by: ['productNameSnapshot'],
    where: { order: { shopId, status: { notIn: ['CANCELLED', 'REJECTED'] } } },
    _sum: { qty: true, total: true },
    orderBy: { _sum: { qty: 'desc' } },
    take: limit,
  });

  return rows.map((r) => ({
    name:     r.productNameSnapshot,
    unitsSold: r._sum.qty ?? 0,
    revenue:   Number(r._sum.total ?? 0),
  }));
};

const getOrderTrend = async (shopId, days = 7) => {
  const results = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = startOf(date, 'day');
    const dayEnd   = new Date(dayStart.getTime() + 86400000);

    const orders = await prisma.order.findMany({
      where: { shopId, placedAt: { gte: dayStart, lt: dayEnd }, status: { notIn: ['CANCELLED', 'REJECTED'] } },
      select: { total: true },
    });

    results.push({
      date:    dayStart.toISOString().split('T')[0],
      orders:  orders.length,
      revenue: orders.reduce((s, o) => s + Number(o.total ?? 0), 0),
    });
  }
  return results;
};

module.exports = { getSummary, getTopProducts, getOrderTrend };
