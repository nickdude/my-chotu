const prisma      = require('../../config/prisma');
const { success, paginated } = require('../../utils/response');
const { NotFoundError }      = require('../../utils/errors');
const { parsePagination }    = require('../../utils/pagination');
const { audit }  = require('../../utils/audit');
const asyncHandler = require('../../utils/asyncHandler');
const subscriptionService = require('../../services/subscription.service');

const listShops = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, status } = req.query;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { name:  { contains: search, mode: 'insensitive' } },
        { slug:  { contains: search, mode: 'insensitive' } },
        { city:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      include: {
        category: { select: { name: true } },
        owner:    { select: { id: true, name: true, email: true, phone: true } },
        subscriptions: {
          where: { status: { in: ['TRIAL','ACTIVE','GRACE_PERIOD'] } },
          select: { status: true, trialEndsAt: true },
          take: 1,
        },
      },
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.shop.count({ where }),
  ]);

  return paginated(res, shops, { page, limit, total });
});

const getShop = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({
    where: { id: req.params.shopId },
    include: {
      category: true,
      owner:    { select: { id: true, name: true, email: true, phone: true } },
      memberships: {
        include: { user: { select: { id: true, name: true, role: true, phone: true } } },
      },
      operatingHours: { orderBy: { dayOfWeek: 'asc' } },
      subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
      _count: { select: { products: true, orders: true } },
    },
  });
  if (!shop) throw new NotFoundError('Shop');
  return success(res, shop);
});

const updateShopStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const shop = await prisma.shop.findUnique({ where: { id: req.params.shopId } });
  if (!shop) throw new NotFoundError('Shop');

  const before = { status: shop.status };
  const data   = { status };
  if (status === 'APPROVED' && shop.status !== 'APPROVED') data.approvedAt = new Date();
  if (status === 'REJECTED') { data.rejectedAt = new Date(); data.rejectionReason = reason; }

  const updated = await prisma.shop.update({ where: { id: shop.id }, data });

  // Start trial subscription on first approval
  if (status === 'APPROVED' && shop.status !== 'APPROVED') {
    await subscriptionService.startTrial(shop.id).catch(() => {});
  }

  await audit(req.user.sub, 'Shop', shop.id, `STATUS_${status}`, { before, after: data, ip: req.ip });
  return success(res, updated, `Shop ${status.toLowerCase()}`);
});

module.exports = { listShops, getShop, updateShopStatus };
