/**
 * Standardized API response helpers.
 * All endpoints use these so the shape never drifts.
 */

const success = (res, data = null, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const created = (res, data = null, message = 'Created') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const paginated = (res, data, meta) => {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
};

module.exports = { success, created, error, paginated };
