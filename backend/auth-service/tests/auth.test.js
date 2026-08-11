const request = require('supertest');
const app = require('../server');

describe('Auth Module - integration', () => {
  let server;

  beforeAll(async () => {
    const mongoose = require('mongoose');
    const bcrypt = require('bcrypt');
    const User = mongoose.model('User');
    const email = 'admin@cohort.com';
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const password_hash = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Test Admin',
        email,
        password_hash,
        role: 'ADMIN',
        hierarchyLevel: 1,
        permissions: [
          "VIEW_USERS",
          "CREATE_USERS",
          "EDIT_USERS",
          "DELETE_USERS",
          "VIEW_CONTACTS",
          "ASSIGN_GROUPS",
          "MANAGE_GROUPS",
          "PUBLISH_CONTENT"
        ]
      });
      console.log('✅ Seeded admin@cohort.com in test database.');
    }

    return new Promise((resolve) => {
      server = app.listen(3001, () => resolve());
    });
  });

  afterAll((done) => {
    server.close(() => done());
  });

  test('login -> validate -> logout flow', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@cohort.com', password: 'admin123' })
      .expect(200);

    expect(loginRes.body).toHaveProperty('token');
    const token = loginRes.body.token;

    // validate should succeed
    const validateRes = await request(app)
      .get('/auth/validate')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(validateRes.body).toHaveProperty('valid', true);
    expect(validateRes.body).toHaveProperty('user_id');

    // logout
    const logoutRes = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(logoutRes.body).toHaveProperty('success', true);

    // validate after logout should be invalid
    const validateAfter = await request(app)
      .get('/auth/validate')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(validateAfter.body).toHaveProperty('valid', false);
  });
});
