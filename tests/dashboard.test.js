const request = require('supertest');
const app = require('../app');
const connectDB = require('../config/db');

let token;

beforeAll(async () => {
  // connect to DB
  await connectDB();

  // login as admin to get token
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@gmail.com', password: 'admin123' });

  token = res.body.token;
});

afterAll(async () => {
  // close mongoose connection
  const mongoose = require('mongoose');
  await mongoose.disconnect();
});

describe('Dashboard Endpoints', () => {
  test('GET /api/dashboard/admin should return metrics for admin', async () => {
    const res = await request(app)
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('topSponsors');
  });

  test('GET /api/dashboard/user should return user dashboard data', async () => {
    const res = await request(app)
      .get('/api/dashboard/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('memberId');
    expect(res.body.data).toHaveProperty('referralsCount');
  });
});
