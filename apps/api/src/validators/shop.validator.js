const { z } = require('zod');

const listShopsSchema = z.object({
  search:     z.string().max(100).optional(),
  categoryId: z.string().optional(),
  lat:        z.coerce.number().min(-90).max(90).optional(),
  lng:        z.coerce.number().min(-180).max(180).optional(),
  radiusKm:   z.coerce.number().min(1).max(50).optional(),
  page:       z.coerce.number().int().positive().optional(),
  limit:      z.coerce.number().int().positive().max(50).optional(),
});

module.exports = { listShopsSchema };
