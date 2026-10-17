const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');
const { success, created } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  return created(res, user, 'Account created successfully');
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return success(res, { user, token }, 'Logged in successfully');
});

const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token) await authService.logout(token);
  return success(res, null, 'Logged out');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.sub);
  return success(res, user);
});

const sendOtp = asyncHandler(async (req, res) => {
  const { target, purpose } = req.body;
  const result = await otpService.sendOtp(target, purpose);
  return success(res, { expiresAt: result.expiresAt }, 'OTP sent');
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { target, purpose, code } = req.body;
  await otpService.verifyOtp(target, purpose, code);
  return success(res, null, 'OTP verified');
});

module.exports = { register, login, logout, getMe, sendOtp, verifyOtp };
