const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/recruitment';
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const processRoutes = require('./routes/processRoutes');
const problemRoutes = require('./routes/problemRoutes');
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/processes', processRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('Recruitment Helper API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
