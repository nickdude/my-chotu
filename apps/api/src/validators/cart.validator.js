const { z } = require('zod');

const addItemSchema = z.object({
  variantId: z.string().min(1),
  qty:       z.number().int().min(1).max(99),
});

const updateItemSchema = z.object({
  qty: z.number().int().min(0).max(99),
});

module.exports = { addItemSchema, updateItemSchema };
