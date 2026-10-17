const prisma = require('../config/prisma');

const findById = (id) =>
  prisma.user.findUnique({ where: { id } });

const findByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

const findByPhone = (phone) =>
  prisma.user.findUnique({ where: { phone } });

const create = (data) =>
  prisma.user.create({ data });

const update = (id, data) =>
  prisma.user.update({ where: { id }, data });

const createSession = (data) =>
  prisma.userSession.create({ data });

const findSessionByToken = (token) =>
  prisma.userSession.findUnique({ where: { token }, include: { user: true } });

const deleteSession = (token) =>
  prisma.userSession.delete({ where: { token } });

const deleteExpiredSessions = (userId) =>
  prisma.userSession.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });

module.exports = {
  findById,
  findByEmail,
  findByPhone,
  create,
  update,
  createSession,
  findSessionByToken,
  deleteSession,
  deleteExpiredSessions,
};
