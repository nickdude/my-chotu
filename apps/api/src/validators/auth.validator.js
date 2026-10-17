const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[6-9]\d{9}$/, 'Enter a valid Indian mobile number').optional(),
  password: z.string().min(8).max(100),
}).refine((d) => d.email || d.phone, {
  message: 'Either email or phone is required',
});

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
}).refine((d) => d.email || d.phone, {
  message: 'Either email or phone is required',
});

const sendOtpSchema = z.object({
  target: z.string().min(1),
  purpose: z.enum(['REGISTRATION', 'LOGIN', 'PASSWORD_RESET']),
});

const verifyOtpSchema = z.object({
  target: z.string().min(1),
  code: z.string().length(6),
  purpose: z.enum(['REGISTRATION', 'LOGIN', 'PASSWORD_RESET']),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

module.exports = {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  changePasswordSchema,
};
