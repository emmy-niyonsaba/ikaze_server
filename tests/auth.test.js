const request = require('supertest');
const app = require('../index');
const sequelize = require('../config/index');
const User = require('../models/User');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth endpoints', () => {
  test('signup creates a user and returns token', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        phone: '12345678',
        email: 'test@example.com',
        password: 'password123',
        rpCollege: 'RPTUMBA'
      })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('role');
  });

  test('signin returns token for existing user', async () => {
    const res = await request(app)
      .post('/api/users/signin')
      .send({ email: 'test@example.com', password: 'password123' })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('role');
  });
});