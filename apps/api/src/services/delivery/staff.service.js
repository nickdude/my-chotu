const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const { ConflictError, NotFoundError } = require('../../utils/errors');

const listStaff = (shopId) =>
  prisma.shopMembership.findMany({
    where:   { shopId, role: 'DELIVERY_STAFF' },
    include: { user: { select: { id: true, name: true, phone: true, email: true, isActive: true } } },
    orderBy: { createdAt: 'asc' },
  });

const addStaff = async (shopId, { phone, email, name }) => {
  // Find existing user or create a new one
  let user = phone
    ? await prisma.user.findFirst({ where: { phone } })
    : await prisma.user.findFirst({ where: { email } });

  if (!user) {
    // Create a basic account; staff will set their own password via OTP
    const passwordHash = await bcrypt.hash(
      Math.random().toString(36).slice(2) + Date.now(),
      10
    );
    user = await prisma.user.create({
      data: {
        name: name ?? 'Delivery Staff',
        phone,
        email,
        passwordHash,
        role: 'DELIVERY_STAFF',
      },
    });
  }

  const existing = await prisma.shopMembership.findFirst({
    where: { shopId, userId: user.id, role: 'DELIVERY_STAFF' },
  });
  if (existing) {
    if (!existing.isActive) {
      return prisma.shopMembership.update({ where: { id: existing.id }, data: { isActive: true } });
    }
    throw new ConflictError('This person is already a delivery staff member');
  }

  return prisma.shopMembership.create({
    data:    { shopId, userId: user.id, role: 'DELIVERY_STAFF' },
    include: { user: { select: { id: true, name: true, phone: true, email: true } } },
  });
};

const toggleStaff = async (shopId, membershipId) => {
  const m = await prisma.shopMembership.findFirst({ where: { id: membershipId, shopId, role: 'DELIVERY_STAFF' } });
  if (!m) throw new NotFoundError('Staff member');
  return prisma.shopMembership.update({ where: { id: membershipId }, data: { isActive: !m.isActive } });
};

module.exports = { listStaff, addStaff, toggleStaff };
