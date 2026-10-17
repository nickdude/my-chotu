const crypto = require('crypto');
const otpRepo = require('../repositories/otp.repository');
const config = require('../config/env');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

const generateCode = (length) =>
  String(crypto.randomInt(0, 10 ** length)).padStart(length, '0');

const sendOtp = async (target, purpose) => {
  await otpRepo.deleteExpired(target, purpose);

  const code = generateCode(config.otp.length);
  const expiresAt = new Date(Date.now() + config.otp.expiresMinutes * 60 * 1000);

  await otpRepo.create({ target, purpose, code, expiresAt });

  // In production: dispatch to WhatsApp/SMS/email provider here.
  // For now, log in dev only.
  if (config.isDev) {
    logger.info(`[OTP] ${purpose} → ${target}: ${code}`);
  }

  return { expiresAt };
};

const verifyOtp = async (target, purpose, code) => {
  const otp = await otpRepo.findLatestActive(target, purpose);

  if (!otp) {
    throw new AppError('OTP expired or not found. Please request a new one.', 400);
  }

  if (otp.attempts >= config.otp.maxAttempts) {
    throw new AppError('Too many failed attempts. Please request a new OTP.', 429);
  }

  if (otp.code !== code) {
    await otpRepo.incrementAttempts(otp.id);
    throw new AppError('Invalid OTP', 400);
  }

  await otpRepo.markUsed(otp.id);
  return true;
};

module.exports = { sendOtp, verifyOtp };
