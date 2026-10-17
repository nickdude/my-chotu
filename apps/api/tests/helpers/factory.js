/**
 * Test data factories — build payloads and create records via the API.
 * Using the API (not direct DB) exercises the full request stack.
 */
const request = require('supertest');
const app     = require('./app');

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Auth ─────────────────────────────────────────────────────────────────────

const registerUser = async (overrides = {}) => {
  const body = {
    name:     `Test User ${uid()}`,
    email:    `test-${uid()}@example.com`,
    password: 'Password123!',
    ...overrides,
  };
  const res = await request(app).post('/api/v1/auth/register').send(body);
  return { user: res.body.data, body };
};

const loginUser = async (email, password = 'Password123!') => {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.data?.token;
};

const registerAndLogin = async (overrides = {}) => {
  const { user, body } = await registerUser(overrides);
  const token = await loginUser(body.email, body.password);
  return { user, token, email: body.email };
};

// ─── Shop ─────────────────────────────────────────────────────────────────────

const registerShop = async (token, overrides = {}) => {
  const body = {
    name:  `Test Shop ${uid()}`,
    city:  'Mumbai',
    state: 'Maharashtra',
    ...overrides,
  };
  const res = await request(app)
    .post('/api/v1/shopkeeper/shop/register')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
  return res.body.data;
};

// ─── Product ──────────────────────────────────────────────────────────────────

const createProduct = async (token, overrides = {}) => {
  const body = {
    name:     `Product ${uid()}`,
    price:    50,
    stockQty: 100,
    ...overrides,
  };
  const res = await request(app)
    .post('/api/v1/shopkeeper/products')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
  return res.body.data;
};

// ─── Address ──────────────────────────────────────────────────────────────────

const addAddress = async (token, overrides = {}) => {
  const body = {
    label:   'Home',
    line1:   '123 Test Street',
    city:    'Mumbai',
    state:   'Maharashtra',
    pincode: '400001',
    ...overrides,
  };
  const res = await request(app)
    .post('/api/v1/addresses')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
  return res.body.data;
};

module.exports = { registerUser, loginUser, registerAndLogin, registerShop, createProduct, addAddress, uid };
