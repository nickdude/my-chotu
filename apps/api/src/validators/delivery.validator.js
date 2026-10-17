const { z } = require('zod');

const updateDeliveryStatusSchema = z.object({
  status:        z.enum(['ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'FAILED']),
  notes:         z.string().max(300).optional(),
  failureReason: z.string().max(300).optional(),
});

const submitProofSchema = z.object({
  proofType:  z.enum(['OTP', 'CONFIRMATION']),
  proofValue: z.string().min(1).max(10),
});

const collectCodSchema = z.object({
  amountCollected: z.number().positive(),
});

const assignDeliverySchema = z.object({
  staffId: z.string().min(1),
});

const addStaffSchema = z.object({
  phone: z.string().regex(/^\+?[6-9]\d{9}$/).optional(),
  email: z.string().email().optional(),
  name:  z.string().min(2).optional(),
}).refine((d) => d.phone || d.email, { message: 'Phone or email required' });

module.exports = {
  updateDeliveryStatusSchema,
  submitProofSchema,
  collectCodSchema,
  assignDeliverySchema,
  addStaffSchema,
};
