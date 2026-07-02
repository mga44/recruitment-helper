const request = require('supertest');
const mongoose = require('mongoose');

jest.mock('../utils/googleCalendarService', () => ({
    getAuthUrl: jest.fn(() => 'https://accounts.google.com/o/oauth2/auth?mock'),
    saveTokens: jest.fn(),
    hasValidToken: jest.fn(() => false),
    createEvent: jest.fn(),
}));

const app = require('../app');
const Process = require('../models/Process');
const { createEvent } = require('../utils/googleCalendarService');
const db = require('./db');

jest.setTimeout(60000);

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(async () => {
    await db.clear();
    jest.clearAllMocks();
});

const tick = () => new Promise(resolve => setTimeout(resolve, 5));

describe('POST /api/processes', () => {
    it('creates a process with default status Applied', async () => {
        const res = await request(app)
            .post('/api/processes')
            .send({ companyName: 'Acme', position: 'Backend Dev' });

        expect(res.status).toBe(201);
        expect(res.body._id).toBeDefined();
        expect(res.body.status).toBe('Applied');
        expect(res.body.companyName).toBe('Acme');
    });

    it('rejects a process missing required fields', async () => {
        const res = await request(app)
            .post('/api/processes')
            .send({ position: 'Backend Dev' });

        expect(res.status).toBe(400);
    });
});

describe('GET /api/processes', () => {
    it('returns processes sorted by most recently updated', async () => {
        const first = await Process.create({ companyName: 'First', position: 'Dev' });
        await tick();
        await Process.create({ companyName: 'Second', position: 'Dev' });
        await tick();
        first.position = 'Senior Dev';
        await first.save();

        const res = await request(app).get('/api/processes');

        expect(res.status).toBe(200);
        expect(res.body.map(p => p.companyName)).toEqual(['First', 'Second']);
    });
});

describe('PATCH /api/processes/:id', () => {
    it('updates the given fields', async () => {
        const process = await Process.create({ companyName: 'Acme', position: 'Dev' });

        const res = await request(app)
            .patch(`/api/processes/${process._id}`)
            .send({ status: 'Technical', rejectionFeedback: '' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Technical');
        expect(res.body.companyName).toBe('Acme');
    });
});

describe('DELETE /api/processes/:id', () => {
    it('removes the process', async () => {
        const process = await Process.create({ companyName: 'Acme', position: 'Dev' });

        const res = await request(app).delete(`/api/processes/${process._id}`);

        expect(res.status).toBe(200);
        expect(await Process.countDocuments()).toBe(0);
    });
});

describe('POST /api/processes/:id/appointments', () => {
    const appointment = {
        title: 'Technical Interview',
        description: 'Round 1',
        start: '2026-07-10T10:00:00.000Z',
        end: '2026-07-10T11:00:00.000Z',
    };

    it('creates a calendar event and embeds the appointment', async () => {
        createEvent.mockResolvedValue({ id: 'evt-123', hangoutLink: 'https://meet.google.com/mock' });
        const process = await Process.create({ companyName: 'Acme', position: 'Dev' });

        const res = await request(app)
            .post(`/api/processes/${process._id}/appointments`)
            .send(appointment);

        expect(res.status).toBe(201);
        expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ summary: 'Technical Interview' }));
        expect(res.body.appointments).toHaveLength(1);
        expect(res.body.appointments[0].eventId).toBe('evt-123');
        expect(res.body.appointments[0].meetLink).toBe('https://meet.google.com/mock');
    });

    it('returns 404 for an unknown process', async () => {
        const res = await request(app)
            .post(`/api/processes/${new mongoose.Types.ObjectId()}/appointments`)
            .send(appointment);

        expect(res.status).toBe(404);
        expect(createEvent).not.toHaveBeenCalled();
    });

    it('returns 500 when Google Calendar is not connected', async () => {
        createEvent.mockRejectedValue(new Error('Google Calendar is not connected. Please connect first.'));
        const process = await Process.create({ companyName: 'Acme', position: 'Dev' });

        const res = await request(app)
            .post(`/api/processes/${process._id}/appointments`)
            .send(appointment);

        expect(res.status).toBe(500);
        expect(res.body.error).toMatch(/not connected/);
        expect((await Process.findById(process._id)).appointments).toHaveLength(0);
    });
});
