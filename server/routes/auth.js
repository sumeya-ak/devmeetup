const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user storage for testing
const users = new Map();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        if (users.has(email.toLowerCase())) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = {
            id: Date.now().toString(),
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        };

        // Save user
        users.set(user.email, user);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'devmeetup-secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user
        const user = users.get(email.toLowerCase());
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'devmeetup-secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devmeetup-secret');
        const user = users.get(decoded.email);
        
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        res.json({ message: 'Token is valid' });
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devmeetup-secret');
            const user = users.get(decoded.email);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                id: user.id,
                name: user.name,
                email: user.email
            });
        } catch (err) {
            res.status(401).json({ message: 'Token is not valid' });
        }
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error getting user data' });
    }
});

module.exports = router;
