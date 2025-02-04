const express = require('express');
const router = express.Router();
const Speaker = require('../models/Speaker');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all speakers
router.get('/', async (req, res) => {
    try {
        const speakers = await Speaker.find()
            .populate('sessions', 'title startTime endTime track');
        res.json(speakers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get featured speakers
router.get('/featured', async (req, res) => {
    try {
        const speakers = await Speaker.find({ featured: true })
            .populate('sessions', 'title startTime endTime track');
        res.json(speakers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get speaker by ID
router.get('/:id', async (req, res) => {
    try {
        const speaker = await Speaker.findById(req.params.id)
            .populate('sessions', 'title description startTime endTime track');
        
        if (!speaker) {
            return res.status(404).json({ message: 'Speaker not found' });
        }
        
        res.json(speaker);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new speaker (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const {
            name,
            role,
            company,
            bio,
            image,
            social,
            tags,
            featured
        } = req.body;

        const speaker = new Speaker({
            name,
            role,
            company,
            bio,
            image,
            social,
            tags,
            featured
        });

        await speaker.save();
        res.status(201).json(speaker);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update speaker (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const speaker = await Speaker.findById(req.params.id);
        
        if (!speaker) {
            return res.status(404).json({ message: 'Speaker not found' });
        }

        const updatedSpeaker = await Speaker.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedSpeaker);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete speaker (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const speaker = await Speaker.findById(req.params.id);
        
        if (!speaker) {
            return res.status(404).json({ message: 'Speaker not found' });
        }

        await speaker.remove();
        res.json({ message: 'Speaker removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add session to speaker
router.post('/:id/sessions', [auth, admin], async (req, res) => {
    try {
        const { sessionId } = req.body;
        const speaker = await Speaker.findById(req.params.id);
        
        if (!speaker) {
            return res.status(404).json({ message: 'Speaker not found' });
        }

        if (!speaker.sessions.includes(sessionId)) {
            speaker.sessions.push(sessionId);
            await speaker.save();
        }

        res.json(speaker);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
