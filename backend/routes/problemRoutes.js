const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');

// @route   GET api/problems
// @desc    Get all problems
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find().sort({ solvedAt: -1 });
        res.json(problems);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/problems/daily-stats
// @desc    Get count of problems solved today
router.get('/daily-stats', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = await Problem.countDocuments({
            solvedAt: { $gte: startOfDay }
        });

        res.json({ count });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/problems
// @desc    Add a new solved problem
router.post('/', async (req, res) => {
    const { title, url, difficulty } = req.body;

    try {
        const newProblem = new Problem({
            title,
            url,
            difficulty
        });

        const problem = await newProblem.save();
        res.json(problem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
