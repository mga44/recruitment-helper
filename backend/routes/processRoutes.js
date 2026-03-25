const express = require('express');
const router = express.Router();
const Process = require('../models/Process');

// Get all processes
router.get('/', async (req, res) => {
    try {
        const processes = await Process.find().sort({ updatedAt: -1 });
        res.json(processes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a process
router.post('/', async (req, res) => {
    const process = new Process(req.body);
    try {
        const newProcess = await process.save();
        res.status(201).json(newProcess);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a process
router.patch('/:id', async (req, res) => {
    try {
        const updatedProcess = await Process.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProcess);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a process
router.delete('/:id', async (req, res) => {
    try {
        await Process.findByIdAndDelete(req.params.id);
        res.json({ message: 'Process deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const { createEvent } = require('../utils/googleCalendarService');

// Add an appointment to a process and Google Calendar
router.post('/:id/appointments', async (req, res) => {
    try {
        const { title, description, start, end } = req.body;
        const processId = req.params.id;

        // 1. Find process
        const process = await Process.findById(processId);
        if (!process) {
            return res.status(404).json({ message: 'Process not found' });
        }

        // 2. Create event in Google Calendar
        const eventData = await createEvent({
            summary: title, // use summary for event title
            description,
            start,
            end
        });

        // 3. Save appointment details to Process model
        const appointment = {
            eventId: eventData.id,
            title: title,
            description: description,
            startTime: new Date(start),
            endTime: new Date(end),
            meetLink: eventData.hangoutLink || null // If meet link is generated
        };

        process.appointments.push(appointment);
        const updatedProcess = await process.save();

        res.status(201).json(updatedProcess);
    } catch (err) {
        console.error('Error adding appointment:', err);
        res.status(500).json({ message: 'Error adding appointment to calendar', error: err.message });
    }
});

module.exports = router;
