const request = require('supertest');

const app = require('../app');
const Problem = require('../models/Problem');
const db = require('./db');

jest.setTimeout(60000);

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

describe('POST /api/problems', () => {
    it('logs a solved problem', async () => {
        const res = await request(app)
            .post('/api/problems')
            .send({ title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy' });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Two Sum');
        expect(res.body.solvedAt).toBeDefined();
    });

    it('defaults difficulty to Easy', async () => {
        const res = await request(app)
            .post('/api/problems')
            .send({ title: 'Untitled Kata' });

        expect(res.body.difficulty).toBe('Easy');
    });
});

describe('GET /api/problems', () => {
    it('returns problems sorted by most recently solved', async () => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await Problem.create({ title: 'Older', solvedAt: dayAgo });
        await Problem.create({ title: 'Newer' });

        const res = await request(app).get('/api/problems');

        expect(res.status).toBe(200);
        expect(res.body.map(p => p.title)).toEqual(['Newer', 'Older']);
    });
});

describe('GET /api/problems/daily-stats', () => {
    it('counts only problems solved today', async () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await Problem.create({ title: 'Yesterday', solvedAt: yesterday });
        await Problem.create({ title: 'Today 1' });
        await Problem.create({ title: 'Today 2' });

        const res = await request(app).get('/api/problems/daily-stats');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ count: 2 });
    });
});
