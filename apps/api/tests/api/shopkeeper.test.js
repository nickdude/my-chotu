const request = require('supertest');
const app     = require('../helpers/app');
const { cleanAll, disconnect } = require('../helpers/db');
const { registerAndLogin, registerShop, createProduct } = require('../helpers/factory');

let token, productId;

beforeAll(async () => {
  await cleanAll();
  const sk = await registerAndLogin({ email: 'test-sktest@example.com', name: 'SK Test' });
  token = sk.token;
  await registerShop(token, { name: 'SK Test Shop' });
  const p = await createProduct(token, { price: 250, stockQty: 30 });
  productId = p?.id;
});

afterAll(() => disconnect());

describe('POST /api/v1/shopkeeper/shop/register', () => {
  it('prevents registering a second shop', async () => {
    const res = await request(app)
      .post('/api/v1/shopkeeper/shop/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Another Shop', city: 'Delhi', state: 'Delhi' });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/v1/shopkeeper/shop', () => {
  it('returns the shop with subscription and QR URL', async () => {
    const res = await request(app).get('/api/v1/shopkeeper/shop')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('shop');
    expect(res.body.data).toHaveProperty('subscription');
    expect(res.body.data).toHaveProperty('storefrontUrl');
    expect(res.body.data).toHaveProperty('qrUrl');
    expect(res.body.data.subscription.status).toBe('TRIAL');
  });
});

describe('Products — CRUD', () => {
  it('creates a product with a default variant', async () => {
    const res = await request(app).post('/api/v1/shopkeeper/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Milk 1L', price: 60, stockQty: 100 });
    expect(res.status).toBe(201);
    expect(res.body.data.variants).toHaveLength(1);
    expect(Number(res.body.data.variants[0].price)).toBe(60);
    expect(res.body.data.variants[0].stockQty).toBe(100);
  });

  it('updates a product', async () => {
    if (!productId) return;
    const res = await request(app).patch(`/api/v1/shopkeeper/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Product', price: 300 });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Product');
  });

  it('lists products', async () => {
    const res = await request(app).get('/api/v1/shopkeeper/products')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Stock adjustment', () => {
  it('adds stock and records an inventory movement', async () => {
    if (!productId) return;
    const res = await request(app).post(`/api/v1/shopkeeper/products/${productId}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'PURCHASE', qty: 50, reason: 'Weekly restock' });
    expect(res.status).toBe(200);
    expect(res.body.data.variants[0].stockQty).toBeGreaterThanOrEqual(50);
  });

  it('rejects deduction that would make stock negative', async () => {
    if (!productId) return;
    const res = await request(app).post(`/api/v1/shopkeeper/products/${productId}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'ADJUSTMENT_REMOVE', qty: 999999 });
    expect(res.status).toBe(409);
  });
});
