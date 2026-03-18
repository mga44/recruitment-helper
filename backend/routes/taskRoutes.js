const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().populate('relatedProcess').sort({ dueDate: 1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create task
router.post('/', async (req, res) => {
    const task = new Task({
        title: req.body.title,
        dueDate: req.body.dueDate,
        isDone: req.body.isDone || false,
        relatedProcess: req.body.relatedProcess || null,
        type: req.body.relatedProcess ? 'Process' : 'General'
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update task
router.patch('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (req.body.title != null) {
            task.title = req.body.title;
        }
        if (req.body.dueDate != null) {
            task.dueDate = req.body.dueDate;
        }
        if (req.body.isDone != null) {
            task.isDone = req.body.isDone;
        }
        if (req.body.relatedProcess != null) {
            task.relatedProcess = req.body.relatedProcess;
            task.type = 'Process';
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted Task' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
