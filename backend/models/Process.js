const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    position: { type: String, required: true },
    status: {
        type: String,
        enum: ['Applied', 'Screened', 'Technical', 'Managerial', 'Offer', 'Rejected', 'Ghosted'],
        default: 'Applied'
    },
    salary: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'PLN' }
    },
    jobUrl: String,
    appliedAt: { type: Date, default: Date.now },
    additionalInformation: String,
    rejectionFeedback: String,
    notes: [{
        date: { type: Date, default: Date.now },
        content: String
    }],
    contact: {
        name: String,
        linkedIn: String
    },
    appointments: [{
        eventId: String,
        title: String,
        description: String,
        startTime: Date,
        endTime: Date,
        meetLink: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Process', processSchema);
