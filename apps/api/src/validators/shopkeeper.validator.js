const { z } = require('zod');

// ─── Shop onboarding ──────────────────────────────────────────────────────────

const registerShopSchema = z.object({
  name:               z.string().min(2).max(100),
  description:        z.string().max(500).optional(),
  categoryId:         z.string().optional(),
  phone:              z.string().regex(/^\+?[6-9]\d{9}$/).optional(),
  email:              z.string().email().optional(),
  addressLine:        z.string().max(200).optional(),
  city:               z.string().max(100).optional(),
  state:              z.string().max(100).optional(),
  pincode:            z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode').optional(),
  lat:                z.number().min(-90).max(90).optional(),
  lng:                z.number().min(-180).max(180).optional(),
  deliveryRadiusKm:   z.number().min(0.5).max(50).optional(),
  minOrderAmount:     z.number().min(0).optional(),
  isPickupEnabled:    z.boolean().optional(),
  isDeliveryEnabled:  z.boolean().optional(),
});

const updateShopSchema = registerShopSchema.partial();

const updateHoursSchema = z.object({
  hours: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      openTime:  z.string().regex(/^\d{2}:\d{2}$/).optional(),
      closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      isClosed:  z.boolean().optional(),
    })
  ).min(1).max(7),
});

// ─── Products ─────────────────────────────────────────────────────────────────

const createProductSchema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  categoryId:  z.string().optional(),
  sku:         z.string().max(100).optional(),
  images:      z.array(z.string().url()).max(10).optional(),
  // Default variant fields (creates one variant automatically)
  price:               z.number().positive(),
  costPrice:           z.number().positive().optional(),
  taxRate:             z.number().min(0).max(100).optional(),
  stockQty:            z.number().int().min(0).optional(),
  lowStockThreshold:   z.number().int().min(0).optional(),
});

const updateProductSchema = createProductSchema.partial();

const adjustStockSchema = z.object({
  type:   z.enum(['ADJUSTMENT_ADD', 'ADJUSTMENT_REMOVE', 'PURCHASE', 'LOSS', 'RETURN']),
  qty:    z.number().int().positive(),
  reason: z.string().max(200).optional(),
});

// ─── Orders ───────────────────────────────────────────────────────────────────

const updateOrderStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'PREPARING', 'CANCELLED']),
  reason: z.string().max(300).optional(),
});

const listOrdersSchema = z.object({
  status: z.enum([
    'PENDING','ACCEPTED','REJECTED','PREPARING',
    'DELIVERY_ASSIGNED','PICKED_UP','OUT_FOR_DELIVERY',
    'DELIVERED','FAILED_DELIVERY','CANCELLED',
  ]).optional(),
  page:  z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = {
  registerShopSchema,
  updateShopSchema,
  updateHoursSchema,
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
  updateOrderStatusSchema,
  listOrdersSchema,
};
