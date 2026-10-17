const { ValidationError } = require('../utils/errors');

/**
 * Wraps a Zod schema and validates req.body, req.query, or req.params.
 * Usage: validate(schema) or validate(schema, 'query')
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return next(new ValidationError('Validation failed', errors));
  }
  req[source] = result.data;
  return next();
};

module.exports = validate;
