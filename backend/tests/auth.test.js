const request = require('supertest');
const express = require('express');

jest.mock('../models/User', () => {
  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  return mockUser;
});

jest.mock('../models/Facility');
jest.mock('../models/Reservation');

process.env.JWT_SECRET = 'test_secret_key';

const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const User = require('../models/User');

test('Test 6: POST /api/auth/register bez danych ciała zwraca błąd serwera', async () => {
  User.create.mockRejectedValueOnce(new Error('Validation failed'));

  const res = await request(app)
    .post('/api/auth/register')
    .send({});

  expect(res.status).toBeGreaterThanOrEqual(400);
});

test('Test 7: POST /api/auth/login z nieznanym emailem zwraca 404', async () => {
  User.findOne.mockResolvedValueOnce(null);

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'unknown@example.com', password: 'somepassword' });

  expect(res.status).toBe(404);
  expect(res.body.message).toMatch(/nie znaleziono użytkownika/i);
});

test('Test 8: POST /api/auth/login z błędnym hasłem zwraca 400', async () => {
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('correct_password', 10);

  User.findOne.mockResolvedValueOnce({
    _id: 'mockid123',
    email: 'jan@example.com',
    password_hash: passwordHash,
    role: 'user',
  });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'jan@example.com', password: 'wrong_password' });

  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/błędne hasło/i);
});
