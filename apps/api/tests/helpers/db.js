/**
 * Database helpers for test teardown.
 * Deletes test-created rows without wiping seed data.
 */
const prisma = require('../../src/config/prisma');

const cleanTestUsers = (emailPattern = 'test-') =>
  prisma.user.deleteMany({ where: { email: { contains: emailPattern } } });

const cleanAll = async () => {
  // Order matters — foreign keys require child deletion first
  await prisma.inventoryMovement.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.cODCollection.deleteMany({});
  await prisma.deliveryAssignment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.shopOperatingHour.deleteMany({});
  await prisma.shopMembership.deleteMany({});
  await prisma.subscriptionEvent.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.shop.deleteMany({});
  await prisma.otpVerification.deleteMany({});
  await prisma.userSession.deleteMany({});
  await prisma.userAddress.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { contains: 'test-' } } });
};

const disconnect = () => prisma.$disconnect();

module.exports = { cleanAll, cleanTestUsers, disconnect };
