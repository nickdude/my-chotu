const prisma = require('../config/prisma');

const ASSIGNMENT_INCLUDE = {
  order: {
    include: {
      items: { select: { productNameSnapshot: true, variantNameSnapshot: true, qty: true, unitPrice: true, total: true } },
      shop:  { select: { id: true, name: true, phone: true, addressLine: true, city: true } },
    },
  },
  codCollection: true,
};

const findByStaff = (staffId) =>
  prisma.deliveryAssignment.findMany({
    where:   { staffId, status: { notIn: ['DELIVERED', 'FAILED'] } },
    include: ASSIGNMENT_INCLUDE,
    orderBy: { assignedAt: 'desc' },
  });

const findHistoryByStaff = (staffId, skip, limit) =>
  Promise.all([
    prisma.deliveryAssignment.findMany({
      where:   { staffId, status: { in: ['DELIVERED', 'FAILED'] } },
      include: ASSIGNMENT_INCLUDE,
      skip, take: limit,
      orderBy: { assignedAt: 'desc' },
    }),
    prisma.deliveryAssignment.count({ where: { staffId, status: { in: ['DELIVERED', 'FAILED'] } } }),
  ]);

const findByIdAndStaff = (id, staffId) =>
  prisma.deliveryAssignment.findFirst({ where: { id, staffId }, include: ASSIGNMENT_INCLUDE });

const findById = (id) =>
  prisma.deliveryAssignment.findUnique({ where: { id }, include: ASSIGNMENT_INCLUDE });

const create = (data) =>
  prisma.deliveryAssignment.create({ data, include: ASSIGNMENT_INCLUDE });

const update = (id, data) =>
  prisma.deliveryAssignment.update({ where: { id }, data, include: ASSIGNMENT_INCLUDE });

module.exports = { findByStaff, findHistoryByStaff, findByIdAndStaff, findById, create, update };
