const express = require('express');
const router = express.Router();

// In-memory message storage
const messages = new Map(); // room -> messages[]

// Get chat history
router.get('/:room', async (req, res) => {
    try {
        const roomMessages = messages.get(req.params.room) || [];
        res.json(roomMessages.slice(-50)); // Get last 50 messages
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Save chat message
router.post('/', async (req, res) => {
    try {
        const { message, room } = req.body;
        const token = req.header('x-auth-token');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Get user from token
        const user = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        const newMessage = {
            id: Date.now().toString(),
            message,
            room,
            timestamp: new Date(),
            user: {
                id: user.userId,
                name: user.name || 'Anonymous'
            }
        };

        // Store message
        if (!messages.has(room)) {
            messages.set(room, []);
        }
        messages.get(room).push(newMessage);

        // Emit through Socket.IO
        req.app.get('io').to(room).emit('chat_message', newMessage);
        
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Server error sending message' });
    }
});

module.exports = router;
