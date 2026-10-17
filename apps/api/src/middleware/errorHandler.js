const logger = require('../utils/logger');
const { error } = require('../utils/response');
const { AppError } = require('../utils/errors');
const config = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.id,
  });

  if (err.isOperational) {
    return error(res, err.message, err.statusCode, err.errors);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return error(res, 'A record with this value already exists.', 409);
  }
  if (err.code === 'P2025') {
    return error(res, 'Record not found.', 404);
  }

  // ZodError bubbled without wrapping
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    return error(res, 'Validation failed', 422, errors);
  }

  // Never expose internal error details outside development
  const message = config.isDev ? err.message : 'Something went wrong';
  return error(res, message, 500);
};

module.exports = errorHandler;
