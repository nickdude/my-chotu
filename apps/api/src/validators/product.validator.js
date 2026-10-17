const { z } = require('zod');

const listProductsSchema = z.object({
  search:     z.string().max(100).optional(),
  categoryId: z.string().optional(),
  available:  z.enum(['true', 'false']).optional(),
  page:       z.coerce.number().int().positive().optional(),
  limit:      z.coerce.number().int().positive().max(100).optional(),
});

module.exports = { listProductsSchema };
