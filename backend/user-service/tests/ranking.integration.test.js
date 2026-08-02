const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

jest.setTimeout(20000);

describe('Ranking and Star System API integration', () => {
  let mongod;
  let app;
  let adminToken;
  let studentToken;
  let managerToken;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Clear AUTH_VALIDATE_URL so it uses the JWT fallback mode without contacting auth-service
    delete process.env.AUTH_VALIDATE_URL;

    // Create express app mounting user routes
    app = express();
    app.use(express.json());
    const userRoutes = require('../services/user/routes/users.routes');
    app.use('/users', userRoutes);

    // Create a dummy ADMIN token
    adminToken = jwt.sign({
      user_id: new mongoose.Types.ObjectId().toString(),
      role: 'ADMIN',
      is_active: true
    }, 'secret');

    // Create a dummy MANAGER token
    managerToken = jwt.sign({
      user_id: new mongoose.Types.ObjectId().toString(),
      role: 'MANAGER',
      is_active: true
    }, 'secret');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('Ranking workflow: create students, patch marks, and verify ranking visibility', async () => {
    // 1. Create a student using ADMIN token
    const createRes = await request(app).post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Alice Student', email: 'alice@test.com', password: 'pass', role: 'STUDENT' })
      .expect(201);
    
    const studentId = createRes.body.user_id;

    // Create a dummy STUDENT token for Alice
    studentToken = jwt.sign({
      user_id: studentId,
      role: 'STUDENT',
      is_active: true
    }, 'secret');

    // 2. Patch marks for the student as MANAGER
    const patchRes = await request(app).patch(`/users/${studentId}/marks`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ marks: 85 })
      .expect(200);

    expect(patchRes.body).toHaveProperty('stars', 5);

    // 3. Admin viewing the ranking should see the marks
    const adminRankingRes = await request(app).get('/users/ranking')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(adminRankingRes.body.ranking.length).toBe(1);
    expect(adminRankingRes.body.ranking[0]).toHaveProperty('user_id', studentId);
    expect(adminRankingRes.body.ranking[0]).toHaveProperty('stars', 5);
    expect(adminRankingRes.body.ranking[0]).toHaveProperty('marks', 85); // Admin sees marks

    // 4. Student viewing the ranking should NOT see the marks
    const studentRankingRes = await request(app).get('/users/ranking')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);
    
    expect(studentRankingRes.body.ranking.length).toBe(1);
    expect(studentRankingRes.body.ranking[0]).toHaveProperty('user_id', studentId);
    expect(studentRankingRes.body.ranking[0]).toHaveProperty('stars', 5);
    expect(studentRankingRes.body.ranking[0]).not.toHaveProperty('marks'); // Student DOES NOT see marks
  });
});
