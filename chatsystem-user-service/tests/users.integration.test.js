const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.setTimeout(20000);

describe('User Service integration', () => {
  let mongod;
  let app;
  let server;
  let authServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Start auth server (Module 1) so validate endpoint is available
    const authApp = require('../../student-cohort-auth-module/server');
    authServer = authApp.listen(3001);

    // Ensure user-service middleware posts validate to auth server
    process.env.AUTH_VALIDATE_URL = 'http://localhost:3001/auth/validate';

    // Create express app mounting user routes
    app = express();
    app.use(express.json());
    const userRoutes = require('../services/user/routes/users.routes');
    app.use('/users', userRoutes);
  });

  afterAll(async () => {
    if (authServer && authServer.close) authServer.close();
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('create -> get -> list -> patchStatus', async () => {
    // Login to auth to get admin token
    const authReq = request('http://localhost:3001');
    const login = await authReq.post('/auth/login').send({ email: 'admin@cohort.com', password: 'admin123' }).expect(200);
    const token = login.body.token;

    // Create user
    const userReq = request(app);
    const createRes = await userReq.post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test User', email: 'test.user@example.com', password: 'pass123', role: 'STUDENT' })
      .expect(201);

    expect(createRes.body).toHaveProperty('user_id');
    const user_id = createRes.body.user_id;

    // Get user
    const getRes = await userReq.get(`/users/${user_id}`).set('Authorization', `Bearer ${token}`).expect(200);
    expect(getRes.body).toHaveProperty('user_id', user_id);
    expect(getRes.body).not.toHaveProperty('password_hash');

    // List users
    const listRes = await userReq.get('/users').set('Authorization', `Bearer ${token}`).expect(200);
    expect(listRes.body).toHaveProperty('items');
    expect(Array.isArray(listRes.body.items)).toBe(true);

    // Patch status (deactivate)
    const patchRes = await userReq.patch(`/users/${user_id}`).set('Authorization', `Bearer ${token}`).send({ is_active: false }).expect(200);
    expect(patchRes.body).toHaveProperty('user_id', user_id);
    expect(patchRes.body).toHaveProperty('status');
  });
});
