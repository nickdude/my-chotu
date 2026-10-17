const prisma  = require('../../config/prisma');
const deliveryRepo = require('../../repositories/delivery.repository');
const { NotFoundError, AppError, ForbiddenError } = require('../../utils/errors');
const { parsePagination } = require('../../utils/pagination');
const { notify } = require('../../notifications/notificationService');
const otpService = require('../otp.service');

const DELIVERY_TRANSITIONS = {
  ASSIGNED:         ['ACCEPTED'],
  ACCEPTED:         ['PICKED_UP'],
  PICKED_UP:        ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
};

// ─── Shopkeeper: assign delivery staff ────────────────────────────────────────

const assignStaff = async (shopId, orderId, staffId, assignedById) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, shopId, status: 'PREPARING' } });
  if (!order) throw new AppError('Order must be in PREPARING status before assigning delivery', 400);

  // Verify staff belongs to this shop
  const membership = await prisma.shopMembership.findFirst({
    where: { shopId, userId: staffId, role: 'DELIVERY_STAFF', isActive: true },
  });
  if (!membership) throw new ForbiddenError('Staff member not found in your shop');

  const existing = await prisma.deliveryAssignment.findFirst({ where: { orderId } });
  if (existing) throw new AppError('A delivery assignment already exists for this order', 409);

  const assignment = await prisma.$transaction(async (tx) => {
    const a = await tx.deliveryAssignment.create({
      data: { orderId, staffId, assignedById, status: 'ASSIGNED' },
    });

    await tx.order.update({ where: { id: orderId }, data: { status: 'DELIVERY_ASSIGNED' } });
    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: 'PREPARING', toStatus: 'DELIVERY_ASSIGNED', actorId: assignedById },
    });

    // Link COD collection to this assignment
    await tx.cODCollection.updateMany({
      where:  { orderId },
      data:   { assignmentId: a.id },
    });

    return a;
  });

  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { name: true } });

  // Notify delivery staff
  notify(staffId, 'DELIVERY_ASSIGNED', {
    orderNumber: order.orderNumber,
    total:       Number(order.total).toFixed(0),
    shopName:    shop?.name ?? '',
  });

  // Notify customer
  const staff = await prisma.user.findUnique({ where: { id: staffId }, select: { name: true } });
  notify(order.customerId, 'ORDER_DELIVERY_ASSIGNED', {
    orderNumber: order.orderNumber,
    staffName:   staff?.name ?? '',
  });

  return deliveryRepo.findById(assignment.id);
};

// ─── Delivery staff: update assignment status ──────────────────────────────────

const updateStatus = async (staffId, assignmentId, { status, notes, failureReason }) => {
  const assignment = await deliveryRepo.findByIdAndStaff(assignmentId, staffId);
  if (!assignment) throw new NotFoundError('Assignment');

  const allowed = DELIVERY_TRANSITIONS[assignment.status] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot move from "${assignment.status}" to "${status}"`, 400);
  }

  if (status === 'DELIVERED') {
    throw new AppError('Use the proof-of-delivery endpoint to mark as delivered', 400);
  }

  const now = new Date();
  const timestamps = {
    ACCEPTED:         { acceptedAt: now },
    PICKED_UP:        { pickedUpAt: now },
    OUT_FOR_DELIVERY: {},
    FAILED:           { failedAt: now, failureReason },
  };

  // Map delivery status → order status
  const orderStatusMap = {
    PICKED_UP:        'PICKED_UP',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    FAILED:           'FAILED_DELIVERY',
  };

  await prisma.$transaction(async (tx) => {
    await tx.deliveryAssignment.update({
      where: { id: assignmentId },
      data:  { status, notes, ...timestamps[status] },
    });

    if (orderStatusMap[status]) {
      const order = await tx.order.findUnique({ where: { id: assignment.orderId } });
      await tx.order.update({ where: { id: assignment.orderId }, data: { status: orderStatusMap[status] } });
      await tx.orderStatusHistory.create({
        data: { orderId: assignment.orderId, fromStatus: order.status, toStatus: orderStatusMap[status], actorId: staffId },
      });
    }
  });

  // Notify customer
  const order = assignment.order;
  const customerNotifMap = {
    PICKED_UP:        'ORDER_PICKED_UP',
    OUT_FOR_DELIVERY: 'ORDER_OUT_FOR_DELIVERY',
  };
  if (customerNotifMap[status]) {
    notify(order.customerId, customerNotifMap[status], { orderNumber: order.orderNumber, shopName: order.shop?.name ?? '' });
  }

  return deliveryRepo.findByIdAndStaff(assignmentId, staffId);
};

// ─── Proof of delivery (OTP) ──────────────────────────────────────────────────

const requestDeliveryOtp = async (staffId, assignmentId) => {
  const assignment = await deliveryRepo.findByIdAndStaff(assignmentId, staffId);
  if (!assignment) throw new NotFoundError('Assignment');
  if (assignment.status !== 'OUT_FOR_DELIVERY') {
    throw new AppError('Order must be out for delivery before requesting proof OTP', 400);
  }

  const customer = await prisma.user.findUnique({ where: { id: assignment.order.customerId } });
  const target   = customer.phone ?? customer.email;
  if (!target) throw new AppError('Customer has no phone or email for OTP delivery', 400);

  return otpService.sendOtp(target, 'DELIVERY_PROOF');
};

const submitProof = async (staffId, assignmentId, { proofType, proofValue }) => {
  const assignment = await deliveryRepo.findByIdAndStaff(assignmentId, staffId);
  if (!assignment) throw new NotFoundError('Assignment');
  if (assignment.status !== 'OUT_FOR_DELIVERY') {
    throw new AppError('Order must be out for delivery to submit proof', 400);
  }

  if (proofType === 'OTP') {
    const customer = await prisma.user.findUnique({ where: { id: assignment.order.customerId } });
    const target   = customer.phone ?? customer.email;
    await otpService.verifyOtp(target, 'DELIVERY_PROOF', proofValue);
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.deliveryAssignment.update({
      where: { id: assignmentId },
      data:  { status: 'DELIVERED', deliveredAt: now, proofType, proofValue },
    });

    const order = await tx.order.findUnique({ where: { id: assignment.orderId } });
    await tx.order.update({ where: { id: assignment.orderId }, data: { status: 'DELIVERED' } });
    await tx.orderStatusHistory.create({
      data: { orderId: assignment.orderId, fromStatus: order.status, toStatus: 'DELIVERED', actorId: staffId },
    });
  });

  const order = assignment.order;
  notify(order.customerId, 'ORDER_DELIVERED', { orderNumber: order.orderNumber, shopName: order.shop?.name ?? '' });

  return deliveryRepo.findByIdAndStaff(assignmentId, staffId);
};

// ─── Getters ──────────────────────────────────────────────────────────────────

const getActiveAssignments = (staffId) => deliveryRepo.findByStaff(staffId);

const getHistory = async (staffId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const [assignments, total] = await deliveryRepo.findHistoryByStaff(staffId, skip, limit);
  return { assignments, meta: { page, limit, total } };
};

const getAssignment = (staffId, assignmentId) => deliveryRepo.findByIdAndStaff(assignmentId, staffId);

module.exports = {
  assignStaff,
  updateStatus,
  requestDeliveryOtp,
  submitProof,
  getActiveAssignments,
  getHistory,
  getAssignment,
};
