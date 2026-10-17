const prisma = require('../config/prisma');
const logger  = require('./logger');

/**
 * Writes an audit log entry without blocking the caller.
 * Never throws — a failed audit log must not break a business operation.
 */
const audit = async (actorId, entity, entityId, action, { before, after, ip } = {}) => {
  try {
    await prisma.auditLog.create({
      data: { actorId, entity, entityId, action, before, after, ip },
    });
  } catch (err) {
    logger.error(`[audit] Failed to write log: ${err.message}`);
  }
};

module.exports = { audit };
