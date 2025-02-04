const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all sessions
router.get('/', async (req, res) => {
    try {
        const sessions = await Session.find()
            .populate('speaker', 'name role company')
            .sort('startTime');
        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get sessions by date
router.get('/date/:date', async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const sessions = await Session.find({
            startTime: {
                $gte: date,
                $lt: nextDay
            }
        })
        .populate('speaker', 'name role company')
        .sort('startTime');

        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get session by ID
router.get('/:id', async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate('speaker', 'name role company bio social')
            .populate('registeredAttendees', 'name');

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new session (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const session = new Session(req.body);
        await session.save();
        res.status(201).json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update session (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const session = await Session.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Emit socket event for live updates
        req.app.get('io').emit('session_updated', session);

        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete session (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        await session.remove();
        
        // Emit socket event for live updates
        req.app.get('io').emit('session_deleted', req.params.id);

        res.json({ message: 'Session removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register for session
router.post('/:id/register', auth, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check capacity
        if (session.capacity && session.registeredAttendees.length >= session.capacity) {
            return res.status(400).json({ message: 'Session is full' });
        }

        // Check if user is already registered
        if (session.registeredAttendees.includes(req.user.userId)) {
            return res.status(400).json({ message: 'Already registered' });
        }

        session.registeredAttendees.push(req.user.userId);
        await session.save();

        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add feedback to session
router.post('/:id/feedback', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.feedback.push({
            user: req.user.userId,
            rating,
            comment
        });

        await session.save();
        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
