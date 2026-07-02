// Seeds MongoDB with the sample dataset shared with the frontend demo mode.
// Usage: npm run seed [-- --force]   (--force required to wipe non-empty collections)
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Process = require('../models/Process');
const Problem = require('../models/Problem');
const Task = require('../models/Task');
const seed = require('../../frontend/src/api/seed-data.json');

const daysFromNow = (days, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    if (hour !== undefined) d.setHours(hour, 0, 0, 0);
    return d;
};

async function run() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/recruitment';
    await mongoose.connect(mongoUri);

    const counts = await Promise.all([
        Process.countDocuments(),
        Problem.countDocuments(),
        Task.countDocuments(),
    ]);
    if (counts.some(c => c > 0) && !process.argv.includes('--force')) {
        console.error(
            `Database at ${mongoUri} is not empty (${counts[0]} processes, ${counts[1]} problems, ${counts[2]} tasks).\n` +
            'Re-run with --force to wipe it and seed sample data.'
        );
        await mongoose.disconnect();
        process.exit(1);
    }

    await Promise.all([Process.deleteMany({}), Problem.deleteMany({}), Task.deleteMany({})]);

    const processes = await Process.insertMany(seed.processes.map(p => ({
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
        appointments: p.appointments.map(a => {
            const start = daysFromNow(a.inDays, a.startHour);
            return {
                eventId: `seed-${Math.random().toString(36).slice(2)}`,
                title: a.title,
                description: a.description,
                startTime: start,
                endTime: new Date(start.getTime() + a.durationMinutes * 60000),
                meetLink: null,
            };
        }),
    })));

    const byCompany = Object.fromEntries(processes.map(p => [p.companyName, p._id]));

    const problems = await Problem.insertMany(seed.problems.map(p => ({
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        solvedAt: daysFromNow(-p.solvedDaysAgo, 11),
    })));

    const tasks = await Task.insertMany(seed.tasks.map(t => ({
        title: t.title,
        dueDate: daysFromNow(t.dueInDays, 17),
        isDone: t.isDone,
        relatedProcess: t.relatedCompany ? byCompany[t.relatedCompany] : null,
        type: t.relatedCompany ? 'Process' : 'General',
    })));

    console.log(`Seeded ${processes.length} processes, ${problems.length} problems, ${tasks.length} tasks.`);
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
