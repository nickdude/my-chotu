const prisma = require('../config/prisma');

const create = (data) =>
  prisma.otpVerification.create({ data });

const findLatestActive = (target, purpose) =>
  prisma.otpVerification.findFirst({
    where: {
      target,
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

const incrementAttempts = (id) =>
  prisma.otpVerification.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  });

const markUsed = (id) =>
  prisma.otpVerification.update({
    where: { id },
    data: { usedAt: new Date() },
  });

const deleteExpired = (target, purpose) =>
  prisma.otpVerification.deleteMany({
    where: {
      target,
      purpose,
      OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
    },
  });

module.exports = { create, findLatestActive, incrementAttempts, markUsed, deleteExpired };
