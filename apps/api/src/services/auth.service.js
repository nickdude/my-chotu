const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');
const config = require('../config/env');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');

const BCRYPT_ROUNDS = 12;

const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

const signToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const register = async ({ name, email, phone, password }) => {
  if (email) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new ConflictError('An account with this email already exists');
  }
  if (phone) {
    const existing = await userRepo.findByPhone(phone);
    if (existing) throw new ConflictError('An account with this phone already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepo.create({ name, email, phone, passwordHash });

  return sanitize(user);
};

const login = async ({ email, phone, password }, { ip, userAgent }) => {
  const user = email
    ? await userRepo.findByEmail(email)
    : await userRepo.findByPhone(phone);

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  if (!user.isActive) {
    throw new UnauthorizedError('Account suspended. Please contact support.');
  }

  const tokenPayload = { sub: user.id, role: user.role };
  const token = signToken(tokenPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await userRepo.createSession({ userId: user.id, token, expiresAt, ipAddress: ip, userAgent });
  await userRepo.deleteExpiredSessions(user.id);

  return { user: sanitize(user), token };
};

const logout = async (token) => {
  await userRepo.deleteSession(token);
};

const getMe = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError('User');
  return sanitize(user);
};

const sanitize = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

module.exports = { register, login, logout, getMe, signToken };
