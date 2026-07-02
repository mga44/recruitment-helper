// localStorage-backed implementation of the API, used by the GitHub Pages
// demo build (VITE_DEMO_MODE=true). Mirrors the response shapes of the real
// backend routes so components work unchanged. Seeding is lazy so importing
// this module in a non-demo build has no side effects.
import seed from './seed-data.json';

const STORAGE_KEY = 'recruitment-helper-demo';

const newId = () =>
    (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);

const daysFromNow = (days, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    if (hour !== undefined) d.setHours(hour, 0, 0, 0);
    return d.toISOString();
};

// Seed dates are stored as day offsets so the demo data always looks recent.
const materializeSeed = () => {
    const now = new Date().toISOString();
    const processes = seed.processes.map(p => ({
        _id: newId(),
        companyName: p.companyName,
        position: p.position,
        status: p.status,
        salary: p.salary,
        jobUrl: p.jobUrl,
        appliedAt: daysFromNow(-p.appliedDaysAgo, 9),
        additionalInformation: p.additionalInformation,
        rejectionFeedback: p.rejectionFeedback || '',
        contact: p.contact,
        notes: p.notes.map(n => ({ date: daysFromNow(-n.daysAgo, 12), content: n.content })),
        appointments: p.appointments.map(a => ({
            eventId: `demo-${newId()}`,
            title: a.title,
            description: a.description,
            startTime: daysFromNow(a.inDays, a.startHour),
            endTime: new Date(
                new Date(daysFromNow(a.inDays, a.startHour)).getTime() + a.durationMinutes * 60000
            ).toISOString(),
            meetLink: null,
        })),
        createdAt: daysFromNow(-p.appliedDaysAgo, 9),
        updatedAt: now,
    }));

    const byCompany = Object.fromEntries(processes.map(p => [p.companyName, p._id]));

    const problems = seed.problems.map(p => ({
        _id: newId(),
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        solvedAt: daysFromNow(-p.solvedDaysAgo, 11),
        createdAt: now,
        updatedAt: now,
    }));

    const tasks = seed.tasks.map(t => ({
        _id: newId(),
        title: t.title,
        dueDate: daysFromNow(t.dueInDays, 17),
        isDone: t.isDone,
        relatedProcess: t.relatedCompany ? byCompany[t.relatedCompany] : null,
        type: t.relatedCompany ? 'Process' : 'General',
        createdAt: now,
        updatedAt: now,
    }));

    return { processes, problems, tasks };
};

const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const db = materializeSeed();
    save(db);
    return db;
};

const save = (db) => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

export const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
};

// --- Processes ---

export const getProcesses = async () => {
    const { processes } = load();
    return [...processes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const createProcess = async (data) => {
    const db = load();
    const now = new Date().toISOString();
    const process = {
        notes: [],
        appointments: [],
        ...data,
        _id: newId(),
        status: data.status || 'Applied',
        appliedAt: data.appliedAt || now,
        createdAt: now,
        updatedAt: now,
    };
    db.processes.push(process);
    save(db);
    return process;
};

export const updateProcess = async (id, data) => {
    const db = load();
    const idx = db.processes.findIndex(p => p._id === id);
    if (idx === -1) return null;
    db.processes[idx] = { ...db.processes[idx], ...data, _id: id, updatedAt: new Date().toISOString() };
    save(db);
    return db.processes[idx];
};

export const deleteProcess = async (id) => {
    const db = load();
    db.processes = db.processes.filter(p => p._id !== id);
    save(db);
    return { message: 'Process deleted' };
};

export const addAppointment = async (processId, { title, description, start, end }) => {
    const db = load();
    const process = db.processes.find(p => p._id === processId);
    if (!process) throw new Error('Process not found');
    process.appointments.push({
        eventId: `demo-${newId()}`,
        title,
        description,
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
        meetLink: null,
    });
    process.updatedAt = new Date().toISOString();
    save(db);
    return process;
};

// --- Problems ---

export const getProblems = async () => {
    const { problems } = load();
    return [...problems].sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
};

export const getDailyStats = async () => {
    const { problems } = load();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const count = problems.filter(p => new Date(p.solvedAt) >= startOfDay).length;
    return { count };
};

export const logProblem = async ({ title, url, difficulty }) => {
    const db = load();
    const now = new Date().toISOString();
    const problem = {
        _id: newId(),
        title,
        url,
        difficulty: difficulty || 'Easy',
        solvedAt: now,
        createdAt: now,
        updatedAt: now,
    };
    db.problems.push(problem);
    save(db);
    return problem;
};

// --- Tasks ---

export const getTasks = async () => {
    const db = load();
    return [...db.tasks]
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .map(t => ({
            ...t,
            // Mirror mongoose populate(): full process object, or null if dangling
            relatedProcess: t.relatedProcess
                ? db.processes.find(p => p._id === t.relatedProcess) || null
                : null,
        }));
};

export const createTask = async (data) => {
    const db = load();
    const now = new Date().toISOString();
    const task = {
        _id: newId(),
        title: data.title,
        dueDate: data.dueDate,
        isDone: data.isDone || false,
        relatedProcess: data.relatedProcess || null,
        type: data.relatedProcess ? 'Process' : 'General',
        createdAt: now,
        updatedAt: now,
    };
    db.tasks.push(task);
    save(db);
    return task;
};

export const updateTask = async (id, data) => {
    const db = load();
    const task = db.tasks.find(t => t._id === id);
    if (!task) throw new Error('Task not found');
    if (data.title != null) task.title = data.title;
    if (data.dueDate != null) task.dueDate = data.dueDate;
    if (data.isDone != null) task.isDone = data.isDone;
    if (data.relatedProcess != null) {
        task.relatedProcess = data.relatedProcess;
        task.type = 'Process';
    }
    task.updatedAt = new Date().toISOString();
    save(db);
    return task;
};

export const deleteTask = async (id) => {
    const db = load();
    db.tasks = db.tasks.filter(t => t._id !== id);
    save(db);
    return { message: 'Deleted Task' };
};

// --- Auth ---

// Pretend Google Calendar is connected so the appointment flow is demoable
export const getGoogleAuthStatus = async () => ({ connected: true });
