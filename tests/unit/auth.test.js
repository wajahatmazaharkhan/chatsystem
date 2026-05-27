// tests/unit/auth.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  decode: jest.fn(),
}));

const authMiddleware = require('../../middleware/auth');

const app = express();
app.use(authMiddleware);
app.get('/protected', (req, res) => {
  res.json({ user: req.user });
});

describe('Auth Middleware Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should reject request without Authorization header', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });

  test('should reject invalid token', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('Invalid signature'); });
    jwt.decode.mockReturnValue(null);

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });

  test('should attach user info for valid token', async () => {
    jwt.verify.mockReturnValue({ user_id: '123', role: 'ADMIN' });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ user_id: '123', role: 'ADMIN' });
  });
});

