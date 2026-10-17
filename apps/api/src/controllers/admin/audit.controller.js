const prisma      = require('../../config/prisma');
const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');
const asyncHandler = require('../../utils/asyncHandler');

const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { entity, actorId } = req.query;

  const where = {
    ...(entity  && { entity }),
    ...(actorId && { actorId }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return success(res, { logs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

module.exports = { listAuditLogs };
