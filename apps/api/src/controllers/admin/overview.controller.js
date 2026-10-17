const prisma      = require('../../config/prisma');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const startOf = (unit) => {
  const d = new Date();
  if (unit === 'day')   d.setHours(0, 0, 0, 0);
  if (unit === 'week')  { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); }
  if (unit === 'month') { d.setDate(1); d.setHours(0, 0, 0, 0); }
  return d;
};

const getOverview = asyncHandler(async (req, res) => {
  const [
    shopsByStatus,
    usersByRole,
    subsbyStatus,
    ordersToday,
    ordersMonth,
    recentShops,
    recentOrders,
  ] = await Promise.all([
    prisma.shop.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.user.groupBy({ by: ['role'],   _count: { id: true } }),
    prisma.subscription.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.order.findMany({
      where: { placedAt: { gte: startOf('day') }, status: { notIn: ['CANCELLED','REJECTED'] } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { placedAt: { gte: startOf('month') }, status: { notIn: ['CANCELLED','REJECTED'] } },
      select: { total: true },
    }),
    prisma.shop.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, slug: true, status: true, createdAt: true,
                category: { select: { name: true } } },
    }),
    prisma.order.findMany({
      orderBy: { placedAt: 'desc' },
      take: 5,
      select: { id: true, orderNumber: true, status: true, total: true, placedAt: true,
                shop: { select: { name: true } },
                customer: { select: { name: true } } },
    }),
  ]);

  const sum = (arr) => arr.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const byKey = (arr, field) =>
    Object.fromEntries(arr.map((r) => [r[field], r._count.id]));

  return success(res, {
    shops: byKey(shopsByStatus, 'status'),
    users: byKey(usersByRole, 'role'),
    subscriptions: byKey(subsbyStatus, 'status'),
    orders: {
      today:       ordersToday.length,
      todayGmv:    sum(ordersToday),
      month:       ordersMonth.length,
      monthGmv:    sum(ordersMonth),
    },
    recentShops,
    recentOrders,
  });
});

// 30-day daily order + GMV trend for the overview chart
const getTrend = asyncHandler(async (req, res) => {
  const results = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d.getTime() + 86400000);

    const orders = await prisma.order.findMany({
      where: { placedAt: { gte: d, lt: end }, status: { notIn: ['CANCELLED','REJECTED'] } },
      select: { total: true },
    });
    results.push({
      date:    d.toISOString().split('T')[0],
      orders:  orders.length,
      gmv:     orders.reduce((s, o) => s + Number(o.total ?? 0), 0),
    });
  }
  return success(res, results);
});

module.exports = { getOverview, getTrend };
