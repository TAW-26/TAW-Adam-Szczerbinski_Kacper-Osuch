const request = require('supertest');
const express = require('express');

// ─── Mock mongoose models before requiring routes ────────────────────────────
// This prevents needing a live MongoDB connection during tests.

jest.mock('../models/User', () => {
  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  return mockUser;
});

jest.mock('../models/Facility');
jest.mock('../models/Reservation');

// ─── Build a minimal Express app for testing ─────────────────────────────────

// Set a dummy JWT secret so jwt.sign / jwt.verify don't fail
process.env.JWT_SECRET = 'test_secret_key';

const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const User = require('../models/User');

// ─── Test 6: POST /api/auth/register – missing fields returns 500 ────────────

test('Test 6: POST /api/auth/register bez danych ciała zwraca błąd serwera', async () => {
  // User.create rejects when required fields are missing (simulate mongoose validation error)
  User.create.mockRejectedValueOnce(new Error('Validation failed'));

  const res = await request(app)
    .post('/api/auth/register')
    .send({});

  // Either 400 (if we add validation) or 500 (mongoose throws) – both are error responses
  expect(res.status).toBeGreaterThanOrEqual(400);
});

// ─── Test 7: POST /api/auth/login – user not found returns 404 ───────────────

test('Test 7: POST /api/auth/login z nieznanym emailem zwraca 404', async () => {
  User.findOne.mockResolvedValueOnce(null); // no user in DB

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'unknown@example.com', password: 'somepassword' });

  expect(res.status).toBe(404);
  expect(res.body.message).toMatch(/nie znaleziono użytkownika/i);
});

// ─── Test 8: POST /api/auth/login – wrong password returns 400 ───────────────

test('Test 8: POST /api/auth/login z błędnym hasłem zwraca 400', async () => {
  // Return a user with a bcrypt hash that will NOT match the password we send
  // bcrypt hash of "correct_password"
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
