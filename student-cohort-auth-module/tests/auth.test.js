const request = require('supertest');
const app = require('../server');

describe('Auth Module - integration', () => {
  let server;

  beforeAll((done) => {
    // listen only when running tests to ensure the app is a real http server
    server = app.listen(3001, () => done());
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
      .expect(200);

    expect(validateAfter.body).toHaveProperty('valid', false);
  });
});
