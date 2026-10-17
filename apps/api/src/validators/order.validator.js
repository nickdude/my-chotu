const { z } = require('zod');

const placeOrderSchema = z.object({
  shopId:    z.string().min(1),
  addressId: z.string().min(1),
  notes:     z.string().max(500).optional(),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(3).max(200),
});

module.exports = { placeOrderSchema, cancelOrderSchema };
