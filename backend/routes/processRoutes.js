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

module.exports = router;
