const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['text', 'system', 'announcement'],
        default: 'text'
    },
    room: {
        type: String,
        default: 'general'
    }
});

// Index for efficient querying of chat history
chatMessageSchema.index({ timestamp: -1, room: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
