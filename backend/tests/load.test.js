/**
 * Testy stabilności pod obciążeniem (Issue #18)
 * ─────────────────────────────────────────────
 * Weryfikują, że serwer zachowuje stabilność przy jednoczesnym
 * wysyłaniu wielu żądań HTTP i spełnia podstawowe wymagania wydajności.
 *
 * Strategia: wszystkie modele MongoDB są mockowane, więc testy nie
 * wymagają połączenia z bazą danych ani działającego serwera.
 */
const request = require('supertest');
const express = require('express');

// ── Mocki modeli ────────────────────────────────────────────────────
jest.mock('../models/User');
jest.mock('../models/Facility', () => ({
    find: jest.fn().mockResolvedValue([
        { _id: 'fac1', name: 'Boisko A', address: 'ul. Sportowa 1', is_active: true },
        { _id: 'fac2', name: 'Hala B',   address: 'ul. Sportowa 2', is_active: true },
    ]),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
}));
jest.mock('../models/Reservation');

process.env.JWT_SECRET = 'test_secret_key_load';

// ── Budowanie aplikacji testowej ────────────────────────────────────
const responseTime = require('../middleware/responseTime');
const errorLogger  = require('../middleware/errorLogger');

const app = express();
app.use(express.json());
app.use(responseTime);
app.use('/api/facilities', require('../routes/facilityRoutes'));
app.use(errorLogger);

// ── Stałe testu ─────────────────────────────────────────────────────
const CONCURRENT_REQUESTS    = 50;   // liczba równoległych żądań
const MAX_P95_RESPONSE_MS    = 2000; // maksymalny czas odpowiedzi p95 (ms)
const MAX_ALLOWED_ERROR_RATE = 0.0;  // 0 % odpowiedzi 5xx

// ── Testy ────────────────────────────────────────────────────────────

describe('Testy stabilności pod obciążeniem', () => {
    let responseTimes;
    let statuses;

    beforeAll(async () => {
        // Wyślij wszystkie żądania równolegle
        const promises = Array.from({ length: CONCURRENT_REQUESTS }, () => {
            const start = Date.now();
            return request(app)
                .get('/api/facilities')
                .then((res) => ({
                    status: res.status,
                    durationMs: Date.now() - start,
                    hasResponseTimeHeader: res.headers['x-response-time'] !== undefined,
                }));
        });

        const results = await Promise.all(promises);
        responseTimes = results.map((r) => r.durationMs);
        statuses      = results.map((r) => r.status);

        // Zapisz wyniki do zmiennych dostępnych w testach
        app._loadTestResults = { results };
    });

    test(`Wszystkie ${CONCURRENT_REQUESTS} żądań zwraca odpowiedź (brak zablokowanych)`, () => {
        expect(statuses.length).toBe(CONCURRENT_REQUESTS);
    });

    test('Serwer jest stabilny — brak odpowiedzi 5xx', () => {
        const serverErrors = statuses.filter((s) => s >= 500);
        const errorRate = serverErrors.length / CONCURRENT_REQUESTS;
        expect(errorRate).toBeLessThanOrEqual(MAX_ALLOWED_ERROR_RATE);
    });

    test(`Czas odpowiedzi p95 jest poniżej ${MAX_P95_RESPONSE_MS} ms`, () => {
        const sorted = [...responseTimes].sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        const p95 = sorted[p95Index];
        expect(p95).toBeLessThan(MAX_P95_RESPONSE_MS);
    });

    test('GET /api/facilities zwraca status 200 dla wszystkich żądań', () => {
        const non200 = statuses.filter((s) => s !== 200);
        expect(non200.length).toBe(0);
    });

    test('Nagłówek X-Response-Time jest obecny w odpowiedziach', async () => {
        const res = await request(app).get('/api/facilities');
        expect(res.headers['x-response-time']).toBeDefined();
        expect(res.headers['x-response-time']).toMatch(/^\d+(\.\d+)?ms$/);
    });
});
