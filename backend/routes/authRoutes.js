const express = require('express');
const router = express.Router();
const { getAuthUrl, saveTokens, hasValidToken } = require('../utils/googleCalendarService');

router.get('/google', (req, res) => {
    const url = getAuthUrl();
    res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('No code provided');
    }
    try {
        await saveTokens(code);
        // Redirect back to frontend
        res.redirect('http://localhost:5173'); // Assuming Vite default port
    } catch (error) {
        console.error('Error saving tokens:', error);
        res.status(500).send('Authentication failed');
    }
});

router.get('/google/status', (req, res) => {
    res.json({ connected: hasValidToken() });
});

module.exports = router;
