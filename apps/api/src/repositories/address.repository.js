const prisma = require('../config/prisma');

const findByIdAndUser = (id, userId) =>
  prisma.userAddress.findFirst({ where: { id, userId } });

const findAllByUser = (userId) =>
  prisma.userAddress.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });

const create = (userId, data) =>
  prisma.userAddress.create({ data: { ...data, userId } });

const update = (id, userId, data) =>
  prisma.userAddress.updateMany({ where: { id, userId }, data });

const setDefault = async (id, userId) => {
  await prisma.$transaction([
    prisma.userAddress.updateMany({ where: { userId },       data: { isDefault: false } }),
    prisma.userAddress.updateMany({ where: { id, userId },   data: { isDefault: true  } }),
  ]);
  return prisma.userAddress.findFirst({ where: { id, userId } });
};

module.exports = { findByIdAndUser, findAllByUser, create, update, setDefault };
