const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    company: String,
    bio: String,
    image: String,
    social: {
        twitter: String,
        github: String,
        linkedin: String,
        website: String
    },
    sessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    }],
    tags: [String],
    featured: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Speaker', speakerSchema);
