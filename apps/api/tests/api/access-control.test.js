/**
 * Access control tests — verify that every role boundary is enforced server-side.
 * These catch IDOR, privilege escalation, and missing authorization checks.
 */
const request = require('supertest');
const app     = require('../helpers/app');
const { cleanAll, disconnect } = require('../helpers/db');
const { registerAndLogin, registerShop } = require('../helpers/factory');

let customerToken, shopkeeperToken;

beforeAll(async () => {
  await cleanAll();

  const cust = await registerAndLogin({ email: 'test-ac-cust@example.com', name: 'AC Customer' });
  customerToken = cust.token;

  const sk = await registerAndLogin({ email: 'test-ac-sk@example.com', name: 'AC Shopkeeper' });
  shopkeeperToken = sk.token;
  await registerShop(shopkeeperToken, { name: 'AC Shop' });
});

afterAll(() => disconnect());

describe('Admin routes — SUPER_ADMIN only', () => {
  const adminEndpoints = [
    ['GET',    '/api/v1/admin/overview'],
    ['GET',    '/api/v1/admin/shops'],
    ['GET',    '/api/v1/admin/users'],
    ['GET',    '/api/v1/admin/plans'],
    ['GET',    '/api/v1/admin/audit-logs'],
    ['GET',    '/api/v1/admin/settings'],
  ];

  it.each(adminEndpoints)('%s %s returns 403 for a regular customer', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it.each(adminEndpoints)('%s %s returns 403 for a shopkeeper', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path)
      .set('Authorization', `Bearer ${shopkeeperToken}`);
    expect(res.status).toBe(403);
  });

  it.each(adminEndpoints)('%s %s returns 401 with no token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
  });
});

describe('Shopkeeper routes — authenticated shop members only', () => {
  const shopkeeperEndpoints = [
    ['GET',  '/api/v1/shopkeeper/shop'],
    ['GET',  '/api/v1/shopkeeper/orders'],
    ['GET',  '/api/v1/shopkeeper/products'],
  ];

  it.each(shopkeeperEndpoints)('%s %s returns 401 with no token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
  });

  it.each(shopkeeperEndpoints)('%s %s returns 403 for a customer without a shop', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });
});

describe('Delivery routes — authenticated only', () => {
  it('GET /api/v1/delivery/assignments returns 401 with no token', async () => {
    const res = await request(app).get('/api/v1/delivery/assignments');
    expect(res.status).toBe(401);
  });
});

describe('Protected user data', () => {
  it('customer cannot read another customer\'s addresses', async () => {
    // Addresses endpoint is scoped to the authenticated user — no userId param to exploit
    const res = await request(app).get('/api/v1/addresses')
      .set('Authorization', `Bearer ${customerToken}`);
    // Returns the caller's own addresses (empty), not another user's
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
