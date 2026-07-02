const API_URL = '/api/processes';
const PROBLEMS_API_URL = '/api/problems';

export const getProcesses = async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch processes');
    return res.json();
};

export const createProcess = async (data) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create process');
    return res.json();
};

export const updateProcess = async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update process');
    return res.json();
};

export const deleteProcess = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete process');
    return res.json();
};

export const addAppointment = async (processId, appointmentData) => {
    const res = await fetch(`${API_URL}/${processId}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
    });
    if (!res.ok) throw new Error('Failed to add appointment');
    return res.json();
};

export const getProblems = async () => {
    const res = await fetch(PROBLEMS_API_URL);
    if (!res.ok) throw new Error('Failed to fetch problems');
    return res.json();
};

export const getDailyStats = async () => {
    const res = await fetch(`${PROBLEMS_API_URL}/daily-stats`);
    if (!res.ok) throw new Error('Failed to fetch daily stats');
    return res.json();
};

export const logProblem = async (data) => {
    const res = await fetch(PROBLEMS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log problem');
    return res.json();
};

const TASKS_API_URL = '/api/tasks';

export const getTasks = async () => {
    const res = await fetch(TASKS_API_URL);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
};

export const createTask = async (data) => {
    const res = await fetch(TASKS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
};

export const updateTask = async (id, data) => {
    const res = await fetch(`${TASKS_API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
};

export const deleteTask = async (id) => {
    const res = await fetch(`${TASKS_API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
};

export const getGoogleAuthStatus = async () => {
    const res = await fetch('/api/auth/google/status');
    if (!res.ok) throw new Error('Failed to fetch auth status');
    return res.json();
};

