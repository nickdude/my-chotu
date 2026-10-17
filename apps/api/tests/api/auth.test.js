const request = require('supertest');
const app     = require('../helpers/app');
const { cleanAll, disconnect } = require('../helpers/db');
const { registerUser, loginUser, uid } = require('../helpers/factory');

beforeAll(() => cleanAll());
afterAll(() => disconnect());

describe('POST /api/v1/auth/register', () => {
  it('creates a new account and returns user without passwordHash', async () => {
    const body = { name: 'Raj', email: `test-${uid()}@x.com`, password: 'Password123!' };
    const res  = await request(app).post('/api/v1/auth/register').send(body);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toHaveProperty('passwordHash');
    expect(res.body.data.email).toBe(body.email);
  });

  it('rejects duplicate email with 409', async () => {
    const body = { name: 'Dup', email: `test-${uid()}@x.com`, password: 'Password123!' };
    await request(app).post('/api/v1/auth/register').send(body);
    const res = await request(app).post('/api/v1/auth/register').send(body);
    expect(res.status).toBe(409);
  });

  it('rejects missing name with 422', async () => {
    const res = await request(app).post('/api/v1/auth/register')
      .send({ email: `test-${uid()}@x.com`, password: 'Password123!' });
    expect(res.status).toBe(422);
  });

  it('rejects short password with 422', async () => {
    const res = await request(app).post('/api/v1/auth/register')
      .send({ name: 'X', email: `test-${uid()}@x.com`, password: 'short' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns a JWT token on valid credentials', async () => {
    const { body } = await registerUser();
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: body.email, password: body.password });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('rejects wrong password with 401', async () => {
    const { body } = await registerUser();
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: body.email, password: 'WrongPass99!' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'Whatever123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns current user when authenticated', async () => {
    const { body } = await registerUser();
    const token = await loginUser(body.email, body.password);

    const res = await request(app).get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(body.email);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app).get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
