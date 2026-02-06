const request = require('supertest');
const app = require('../index');
const sequelize = require('../config/index');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Appointment approval flow', () => {
  let adminToken;
  let user;
  let appointment;

  test('setup users and appointment', async () => {
    const adminPassword = await bcrypt.hash('password123', 10);
    const userPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      phone: '0000001',
      email: 'admin@example.com',
      password: adminPassword,
      rpCollege: 'RPTUMBA',
      role: 'ADMIN'
    });

    user = await User.create({
      firstName: 'Visitor',
      lastName: 'User',
      phone: '0000002',
      email: 'visitor@example.com',
      password: userPassword,
      rpCollege: 'RPTUMBA',
      role: 'USER'
    });

    // signin admin
    const res = await request(app).post('/api/users/signin').send({ email: 'admin@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    adminToken = res.body.token;

    // create appointment as user
    const apptRes = await request(app)
      .post('/api/appointment/create')
      .set('Authorization', `Bearer ${ (await request(app).post('/api/users/signin').send({ email: 'visitor@example.com', password: 'password123' })).body.token }`)
      .send({
        type: 'VISIT',
        startTime: new Date(Date.now() + 60*60*1000).toISOString(),
        endTime: new Date(Date.now() + 2*60*60*1000).toISOString(),
        description: 'Test appointment',
        rpCollege: 'RPTUMBA',
        guestList: [{ fullname: 'John Doe', id: 'ID1' }]
      });

    expect(apptRes.statusCode).toBe(201);
    appointment = apptRes.body;
  });

  test('admin can approve appointment and receive aptCode', async () => {
    const res = await request(app)
      .post(`/api/appointment/${appointment.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('aptCode');
    expect(res.body).toHaveProperty('aptExpiresAt');
  });
});