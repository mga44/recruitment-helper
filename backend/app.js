const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const processRoutes = require('./routes/processRoutes');
const problemRoutes = require('./routes/problemRoutes');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/processes', processRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Recruitment Helper API');
});

module.exports = app;
