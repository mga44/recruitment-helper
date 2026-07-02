// Build-time switch between the real backend client and the localStorage
// demo implementation (GitHub Pages build sets VITE_DEMO_MODE=true).
import * as real from './real';
import * as demo from './demo';

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const impl = isDemoMode ? demo : real;

export const {
    getProcesses,
    createProcess,
    updateProcess,
    deleteProcess,
    addAppointment,
    getProblems,
    getDailyStats,
    logProblem,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getGoogleAuthStatus,
} = impl;

export const { resetDemoData } = demo;
