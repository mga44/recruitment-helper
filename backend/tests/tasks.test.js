const request = require('supertest');

const app = require('../app');
const Task = require('../models/Task');
const Process = require('../models/Process');
const db = require('./db');

jest.setTimeout(60000);

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

describe('POST /api/tasks', () => {
    it('creates a general task when no process is linked', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: 'Update CV', dueDate: '2026-07-10' });

        expect(res.status).toBe(201);
        expect(res.body.type).toBe('General');
        expect(res.body.relatedProcess).toBeNull();
        expect(res.body.isDone).toBe(false);
    });

    it('creates a process task when linked to a process', async () => {
        const process = await Process.create({ companyName: 'Acme', position: 'Dev' });

        const res = await request(app)
            .post('/api/tasks')
            .send({ title: 'Prep interview', dueDate: '2026-07-10', relatedProcess: process._id });

        expect(res.status).toBe(201);
        expect(res.body.type).toBe('Process');
        expect(res.body.relatedProcess).toBe(String(process._id));
    });

    it('rejects a task without a due date', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: 'No due date' });

        expect(res.status).toBe(400);
    });
});

describe('GET /api/tasks', () => {
    it('returns tasks sorted by due date with related process populated', async () => {
        const process = await Process.create({ companyName: 'Acme', position: 'Dev' });
        await Task.create({ title: 'Later', dueDate: '2026-07-20' });
        await Task.create({ title: 'Sooner', dueDate: '2026-07-05', relatedProcess: process._id, type: 'Process' });

        const res = await request(app).get('/api/tasks');

        expect(res.status).toBe(200);
        expect(res.body.map(t => t.title)).toEqual(['Sooner', 'Later']);
        expect(res.body[0].relatedProcess.companyName).toBe('Acme');
        expect(res.body[1].relatedProcess).toBeFalsy();
    });
});

describe('PATCH /api/tasks/:id', () => {
    it('toggles completion', async () => {
        const task = await Task.create({ title: 'Toggle me', dueDate: '2026-07-10' });

        const res = await request(app)
            .patch(`/api/tasks/${task._id}`)
            .send({ isDone: true });

        expect(res.status).toBe(200);
        expect(res.body.isDone).toBe(true);
    });
});

describe('DELETE /api/tasks/:id', () => {
    it('removes the task', async () => {
        const task = await Task.create({ title: 'Remove me', dueDate: '2026-07-10' });

        const res = await request(app).delete(`/api/tasks/${task._id}`);

        expect(res.status).toBe(200);
        expect(await Task.countDocuments()).toBe(0);
    });
});
