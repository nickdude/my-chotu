const prisma      = require('../../config/prisma');
const { success, paginated } = require('../../utils/response');
const { parsePagination }    = require('../../utils/pagination');
const asyncHandler = require('../../utils/asyncHandler');

const searchOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, status, shopId } = req.query;

  const where = {
    ...(status && { status }),
    ...(shopId && { shopId }),
    ...(search && {
      OR: [
        { orderNumber:          { contains: search, mode: 'insensitive' } },
        { customerNameSnapshot: { contains: search, mode: 'insensitive' } },
        { customerPhoneSnapshot:{ contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        shop:     { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        codCollection: { select: { status: true, amountDue: true } },
      },
      orderBy: { placedAt: 'desc' },
      skip, take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return paginated(res, orders, { page, limit, total });
});

module.exports = { searchOrders };
