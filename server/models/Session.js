const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    speaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Speaker'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    track: {
        type: String,
        enum: ['Main Stage', 'Workshop', 'Lightning Talks', 'Panel']
    },
    capacity: Number,
    registeredAttendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [String],
    materials: {
        slides: String,
        repo: String,
        resources: [String]
    },
    feedback: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        comment: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Session', sessionSchema);
