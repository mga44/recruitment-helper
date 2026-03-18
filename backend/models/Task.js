const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    isDone: { type: Boolean, default: false },
    relatedProcess: { type: mongoose.Schema.Types.ObjectId, ref: 'Process', required: false },
    type: { type: String, enum: ['General', 'Process'], default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
