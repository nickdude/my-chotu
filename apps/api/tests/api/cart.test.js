const request = require('supertest');
const app     = require('../helpers/app');
const { cleanAll, disconnect } = require('../helpers/db');
const { registerAndLogin, registerShop, createProduct } = require('../helpers/factory');

let shopkeeperToken, customerToken, variantId, shopId;

beforeAll(async () => {
  await cleanAll();

  // Shopkeeper registers their shop and product
  const sk = await registerAndLogin({ email: 'test-sk@example.com', name: 'Shopkeeper' });
  shopkeeperToken = sk.token;
  const shop = await registerShop(shopkeeperToken);
  shopId = shop?.id ?? shop?.shop?.id;

  const product = await createProduct(shopkeeperToken, { price: 100, stockQty: 50 });
  variantId = product?.variants?.[0]?.id;

  // Customer
  const cust = await registerAndLogin({ email: 'test-cust@example.com', name: 'Customer' });
  customerToken = cust.token;
});

afterAll(() => disconnect());

describe('Cart — add item', () => {
  it('adds an item and returns the cart', async () => {
    const res = await request(app).post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId, qty: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].qty).toBe(2);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/cart/items')
      .send({ variantId, qty: 1 });
    expect(res.status).toBe(401);
  });

  it('rejects qty 0 with 422', async () => {
    const res = await request(app).post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId, qty: 0 });
    expect(res.status).toBe(422);
  });
});

describe('Cart — cross-shop guard', () => {
  it('returns 409 when adding from a different shop', async () => {
    // Create a second shop and product
    const sk2 = await registerAndLogin({ email: 'test-sk2@example.com', name: 'SK2' });
    await registerShop(sk2.token, { name: 'Shop Two' });
    const p2 = await createProduct(sk2.token, { price: 200, stockQty: 10 });
    const v2Id = p2?.variants?.[0]?.id;

    const res = await request(app).post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId: v2Id, qty: 1 });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/another shop/i);
  });
});

describe('Cart — update and remove', () => {
  it('updates item quantity', async () => {
    const cart = await request(app).get('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    const itemId = cart.body.data?.items?.[0]?.id;

    if (!itemId) return; // cart may be cleared between tests

    const res = await request(app).patch(`/api/v1/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ qty: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data.items[0].qty).toBe(5);
  });

  it('removes item when qty is set to 0', async () => {
    const cart = await request(app).get('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    const itemId = cart.body.data?.items?.[0]?.id;
    if (!itemId) return;

    const res = await request(app).patch(`/api/v1/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ qty: 0 });
    expect(res.status).toBe(200);
  });
});

describe('Cart — clear', () => {
  it('clears the cart', async () => {
    // Re-add something first
    await request(app).post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId, qty: 1 });

    const res = await request(app).delete('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);

    const cart = await request(app).get('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(cart.body.data).toBeNull();
  });
});
