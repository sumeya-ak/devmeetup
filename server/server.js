const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500']
                                   : '*',
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devmeetup', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/speakers', require('./routes/speakers'));

// Socket.IO connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_room', ({ room, user }) => {
        console.log('User joining room:', room, user);
        socket.join(room);
        if (user) {
            onlineUsers.set(socket.id, user);
            io.to(room).emit('user_joined', Array.from(onlineUsers.values()));
        }
    });

    socket.on('chat_message', (data) => {
        console.log('Received message:', data);
        io.to(data.room).emit('chat_message', {
            ...data,
            timestamp: new Date(),
            id: Date.now().toString()
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        const user = onlineUsers.get(socket.id);
        if (user) {
            onlineUsers.delete(socket.id);
            io.emit('user_left', Array.from(onlineUsers.values()));
        }
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
