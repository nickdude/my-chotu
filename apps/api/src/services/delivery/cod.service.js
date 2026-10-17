const { Decimal } = require('@prisma/client/runtime/library');
const prisma = require('../../config/prisma');
const { NotFoundError, AppError } = require('../../utils/errors');

const collectCod = async (staffId, assignmentId, amountCollected) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where:   { id: assignmentId, staffId },
    include: { codCollection: true },
  });
  if (!assignment) throw new NotFoundError('Assignment');
  if (assignment.status !== 'DELIVERED') {
    throw new AppError('Order must be delivered before recording COD collection', 400);
  }

  const cod = assignment.codCollection;
  if (!cod) throw new NotFoundError('COD collection record');
  if (cod.status === 'COLLECTED') throw new AppError('COD already marked as collected', 409);

  return prisma.cODCollection.update({
    where: { id: cod.id },
    data:  {
      amountCollected: new Decimal(String(amountCollected)),
      status:          'COLLECTED',
      collectedAt:     new Date(),
    },
  });
};

// Shopkeeper reconciles COD at end of day
const reconcile = async (shopId, assignmentId, reconciledById) => {
  const assignment = await prisma.deliveryAssignment.findFirst({
    where:   { id: assignmentId, order: { shopId } },
    include: { codCollection: true },
  });
  if (!assignment) throw new NotFoundError('Assignment');

  const cod = assignment.codCollection;
  if (!cod) throw new NotFoundError('COD record');
  if (cod.status !== 'COLLECTED') throw new AppError('COD must be collected before reconciliation', 400);

  return prisma.cODCollection.update({
    where: { id: cod.id },
    data:  { status: 'RECONCILED', reconciledAt: new Date(), reconciledById },
  });
};

// List unreconciled COD collections for shop
const listUnreconciled = (shopId) =>
  prisma.cODCollection.findMany({
    where: {
      status:     { in: ['PENDING_COLLECTION', 'COLLECTED'] },
      order:      { shopId },
    },
    include: {
      order:      { select: { orderNumber: true, total: true, customerNameSnapshot: true } },
      assignment: { select: { staff: { select: { name: true } }, deliveredAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

module.exports = { collectCod, reconcile, listUnreconciled };
