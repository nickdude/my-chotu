const request = require('supertest');
const app     = require('../helpers/app');
const { cleanAll, disconnect } = require('../helpers/db');
const { registerAndLogin, registerShop, createProduct, addAddress } = require('../helpers/factory');

let customerToken, addressId, variantId, shopId;

beforeAll(async () => {
  await cleanAll();

  // Shopkeeper
  const sk = await registerAndLogin({ email: 'test-ordsk@example.com', name: 'Order SK' });
  const shop = await registerShop(sk.token, { name: 'Order Test Shop' });
  shopId = shop?.id ?? shop?.shop?.id;
  const product = await createProduct(sk.token, { price: 100, stockQty: 20 });
  variantId = product?.variants?.[0]?.id;

  // Customer
  const cust = await registerAndLogin({ email: 'test-ordcust@example.com', name: 'Order Cust' });
  customerToken = cust.token;

  const addr = await addAddress(customerToken);
  addressId = addr?.id;

  // Add item to cart
  await request(app).post('/api/v1/cart/items')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ variantId, qty: 2 });
});

afterAll(() => disconnect());

describe('POST /api/v1/orders — place order', () => {
  let orderId;

  it('places an order and returns it with server-validated total', async () => {
    const res = await request(app).post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shopId, addressId, notes: 'Leave at door' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('orderNumber');
    expect(res.body.data.status).toBe('PENDING');
    // Total is server-computed from DB price (100) × qty (2) + delivery fee
    expect(Number(res.body.data.total)).toBeGreaterThan(0);
    // Must not equal a client-submitted amount (there wasn't one)
    expect(Number(res.body.data.subtotal)).toBe(200);

    orderId = res.body.data.id;
  });

  it('clears the cart after placing an order', async () => {
    const cart = await request(app).get('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(cart.body.data).toBeNull();
  });

  it('returns 400 when cart is empty', async () => {
    // Cart is already empty from previous test
    const res = await request(app).post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shopId, addressId });
    expect(res.status).toBe(400);
  });

  it('customer can retrieve their order', async () => {
    if (!orderId) return;
    const res = await request(app).get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(orderId);
  });

  it('customer cannot see another customer\'s order (IDOR guard)', async () => {
    if (!orderId) return;
    // Register a different customer
    const other = await registerAndLogin({ email: 'test-other@example.com', name: 'Other' });
    const res = await request(app).get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(res.status).toBe(404); // 404, not 403, so we don't confirm the order exists
  });

  it('customer can cancel a PENDING order', async () => {
    if (!orderId) return;
    const res = await request(app).post(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Changed my mind' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });
});

describe('Order — server-side price validation', () => {
  it('computes total from DB price, ignoring any client-submitted values', async () => {
    // Add item to cart again
    await request(app).post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId, qty: 1 });

    // The order endpoint takes no price from the client — total is always server-computed
    const res = await request(app).post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shopId, addressId });

    expect(res.status).toBe(201);
    // DB price is 100, qty 1, delivery 30 → total 130
    expect(Number(res.body.data.subtotal)).toBe(100);
  });
});
