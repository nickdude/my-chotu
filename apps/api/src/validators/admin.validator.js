const { z } = require('zod');

const listShopsSchema = z.object({
  search:  z.string().max(100).optional(),
  status:  z.enum(['PENDING','APPROVED','SUSPENDED','REJECTED']).optional(),
  page:    z.coerce.number().int().positive().optional(),
  limit:   z.coerce.number().int().positive().max(100).optional(),
});

const updateShopStatusSchema = z.object({
  status: z.enum(['APPROVED', 'SUSPENDED', 'REJECTED']),
  reason: z.string().max(500).optional(),
});

const listUsersSchema = z.object({
  search: z.string().max(100).optional(),
  role:   z.enum(['SUPER_ADMIN','SHOP_OWNER','SHOP_MANAGER','DELIVERY_STAFF','CUSTOMER']).optional(),
  page:   z.coerce.number().int().positive().optional(),
  limit:  z.coerce.number().int().positive().max(100).optional(),
});

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
  reason:   z.string().max(500).optional(),
});

const planSchema = z.object({
  name:              z.string().min(2).max(100),
  description:       z.string().max(500).optional(),
  priceMonthly:      z.number().min(0),
  billingPeriodDays: z.number().int().min(1).optional(),
  trialDays:         z.number().int().min(0),
  gracePeriodDays:   z.number().int().min(0),
  maxProducts:       z.number().int().min(0).nullable().optional(),
  maxOrdersPerMonth: z.number().int().min(0).nullable().optional(),
  maxStaff:          z.number().int().min(0).nullable().optional(),
  features:          z.record(z.unknown()).optional(),
});

const categorySchema = z.object({
  name:      z.string().min(1).max(100),
  parentId:  z.string().optional(),
  imageUrl:  z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const settingSchema = z.object({
  value:       z.unknown(),
  description: z.string().optional(),
});

module.exports = {
  listShopsSchema,
  updateShopStatusSchema,
  listUsersSchema,
  updateUserStatusSchema,
  planSchema,
  categorySchema,
  settingSchema,
};
