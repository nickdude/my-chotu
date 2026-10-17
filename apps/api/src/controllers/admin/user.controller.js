const prisma      = require('../../config/prisma');
const { success, paginated } = require('../../utils/response');
const { NotFoundError }      = require('../../utils/errors');
const { parsePagination }    = require('../../utils/pagination');
const { audit }  = require('../../utils/audit');
const asyncHandler = require('../../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, role } = req.query;

  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, isVerified: true, isActive: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return paginated(res, users, { page, limit, total });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive, reason } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!user) throw new NotFoundError('User');

  const updated = await prisma.user.update({
    where: { id: user.id },
    data:  { isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  await audit(req.user.sub, 'User', user.id, isActive ? 'ACTIVATED' : 'SUSPENDED', {
    before: { isActive: user.isActive },
    after:  { isActive },
    ip: req.ip,
  });

  return success(res, updated, `User ${isActive ? 'activated' : 'suspended'}`);
});

module.exports = { listUsers, updateUserStatus };
