// Initialize Socket.IO for live updates
import config from './config.js';
const socket = io(config.socketUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling']
});
let currentUser = null;
const currentRoom = 'general';

// Join chat room
socket.emit('join_room', { room: currentRoom });

// Speaker data
const speakers = [
    {
        id: 1,
        name: "Dr. Sarah Chen",
        role: "AI Research Director at TechCorp",
        image: "https://via.placeholder.com/300",
        bio: "Leading expert in AI and Machine Learning",
        links: {
            twitter: "https://twitter.com/sarahchen",
            github: "https://github.com/sarahchen",
            linkedin: "https://linkedin.com/in/sarahchen"
        },
        talk: {
            title: "The Future of AI in Development",
            description: "Exploring how AI will transform software development",
            time: "9:00 AM",
            date: "2025-03-15"
        }
    },
    // Add more speakers here
];

// Schedule data
const schedule = {
    day1: [
        {
            id: 1,
            time: "9:00 AM",
            title: "Opening Keynote",
            speaker: "Dr. Sarah Chen",
            description: "The Future of AI in Development",
            track: "Main Stage"
        },
        // Add more sessions
    ],
    day2: [
        // Day 2 sessions
    ]
};

// Initialize calendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridDay',
        initialDate: '2025-02-03',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek'
        },
        events: [
            {
                title: 'Opening Keynote: Future of Development',
                start: '2025-02-03T09:00:00',
                end: '2025-02-03T10:30:00',
                backgroundColor: '#4F46E5'
            },
            {
                title: 'AI in Modern Development',
                start: '2025-02-03T11:00:00',
                end: '2025-02-03T12:30:00',
                backgroundColor: '#4F46E5'
            },
            {
                title: 'Virtual Reality Workshop',
                start: '2025-02-03T14:00:00',
                end: '2025-02-03T15:30:00',
                backgroundColor: '#4F46E5'
            },
            {
                title: 'Networking Session',
                start: '2025-02-03T16:00:00',
                end: '2025-02-03T17:30:00',
                backgroundColor: '#4F46E5'
            }
        ],
        eventClick: function(info) {
            showNotification(`Added "${info.event.title}" to your schedule`);
            addToMySchedule(info.event.id);
        }
    });
    calendar.render();
}

// Initialize FullCalendar
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const onlineUsers = document.getElementById('onlineUsers');

    // Load speakers
    loadSpeakers();
    
    // Initialize chat features
    initializeChat();
});

// Convert schedule to FullCalendar events
function convertScheduleToEvents() {
    const events = [];
    [schedule.day1, schedule.day2].forEach((day, index) => {
        day.forEach(session => {
            events.push({
                id: session.id,
                title: session.title,
                start: `2025-03-${15 + index}T${session.time}`,
                description: session.description,
                speaker: session.speaker,
                track: session.track
            });
        });
    });
    return events;
}

// Switch between timeline and calendar views
function switchView(viewName) {
    const timelineView = document.getElementById('timelineView');
    const calendarView = document.getElementById('calendarView');
    const buttons = document.querySelectorAll('.schedule-view-btn');

    if (viewName === 'timelineView') {
        timelineView.classList.remove('hidden');
        calendarView.classList.add('hidden');
    } else {
        timelineView.classList.add('hidden');
        calendarView.classList.remove('hidden');
    }

    // Update button styles
    buttons.forEach(btn => {
        if (btn.dataset.view === viewName) {
            btn.classList.add('bg-indigo-600', 'text-white');
            btn.classList.remove('bg-gray-200', 'text-gray-700');
        } else {
            btn.classList.remove('bg-indigo-600', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        }
    });
}

// Load speaker profiles
function loadSpeakers() {
    const speakersContainer = document.querySelector('.speakers-grid');
    if (!speakersContainer) return;

    speakers.forEach(speaker => {
        const speakerCard = document.createElement('div');
        speakerCard.className = 'glass-card p-6 rounded-lg';
        speakerCard.innerHTML = `
            <img src="${speaker.image}" alt="${speaker.name}" class="w-full h-48 object-cover rounded-lg mb-4">
            <h3 class="text-xl font-bold">${speaker.name}</h3>
            <p class="text-gray-600 mb-2">${speaker.role}</p>
            <p class="mb-4">${speaker.bio}</p>
            <div class="flex space-x-4">
                <a href="${speaker.links.twitter}" class="text-blue-400 hover:text-blue-600">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="${speaker.links.github}" class="text-gray-700 hover:text-gray-900">
                    <i class="fab fa-github"></i>
                </a>
                <a href="${speaker.links.linkedin}" class="text-blue-700 hover:text-blue-900">
                    <i class="fab fa-linkedin"></i>
                </a>
            </div>
        `;
        speakersContainer.appendChild(speakerCard);
    });
}

// Chat functionality
// Handle sending messages
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        showNotification('Please login to send messages', 'error');
        openLoginModal();
        return;
    }

    try {
        // Emit message directly through socket
        socket.emit('chat_message', {
            message,
            room: currentRoom,
            user: {
                id: user.id,
                name: user.name
            }
        });
        
        // Clear input
        input.value = '';
    } catch (error) {
        console.error('Send message error:', error);
        showNotification('Error sending message', 'error');
    }
}

// Handle received messages
socket.on('chat_message', (data) => {
    console.log('Received message:', data);
    const messageDiv = document.createElement('div');
    const user = JSON.parse(localStorage.getItem('user'));
    
    messageDiv.className = 'p-3 mb-2 rounded-lg ' + 
        (data.user.id === user?.id 
            ? 'bg-indigo-100 ml-12' 
            : 'bg-gray-100 mr-12');
    
    messageDiv.innerHTML = `
        <div class="flex items-start">
            <div class="flex-1">
                <div class="font-semibold text-indigo-600">${data.user.name}</div>
                <div class="mt-1">${data.message}</div>
                <div class="text-xs text-gray-500 mt-1">
                    ${new Date(data.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Handle Enter key in chat input
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Join chat room when socket connects
socket.on('connect', () => {
    console.log('Connected to chat server');
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        socket.emit('join_room', { 
            room: currentRoom, 
            user: {
                id: user.id,
                name: user.name
            }
        });
    }
});

// Handle connection errors
socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    showNotification('Error connecting to chat server', 'error');
});

// Update online users list
socket.on('user_joined', (users) => {
    console.log('Users in room:', users);
    if (onlineUsers) {
        onlineUsers.innerHTML = users.map(user => `
            <div class="flex items-center space-x-2 mb-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>${user.name}</span>
            </div>
        `).join('');
    }
});

socket.on('user_left', (users) => {
    if (onlineUsers) {
        onlineUsers.innerHTML = users.map(user => `
            <div class="flex items-center space-x-2 mb-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>${user.name}</span>
            </div>
        `).join('');
    }
});

// Show notification with type
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } shadow-lg transform transition-transform duration-300 translate-x-full z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle user presence
socket.on('user_joined', (users) => {
    updateOnlineUsers(users);
});

socket.on('user_left', (users) => {
    updateOnlineUsers(users);
});

function updateOnlineUsers(users) {
    onlineUsers.innerHTML = users.map(user => `
        <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>${user.name}</span>
        </div>
    `).join('');
}

// Event listeners
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize chat when user is logged in
document.addEventListener('userLoggedIn', () => {
    loadChatHistory();
    socket.emit('join_room', { room: currentRoom });
});

// Auth functionality
function switchToLogin() {
    document.getElementById('loginTab').classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
    document.getElementById('signupTab').classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
    document.getElementById('signupTab').classList.add('text-gray-500');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('authError').classList.add('hidden');
}

function switchToSignup() {
    document.getElementById('signupTab').classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
    document.getElementById('loginTab').classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
    document.getElementById('loginTab').classList.add('text-gray-500');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('authError').classList.add('hidden');
}

function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Handle signup form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters long');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        console.log('Signup response:', data); // Debug log

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            closeLoginModal();
            updateUI(data.user);
            showNotification('Account created successfully!');
        } else {
            showAuthError(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showAuthError('Error creating account. Please try again.');
    }
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', data); // Debug log

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            closeLoginModal();
            updateUI(data.user);
            showNotification('Logged in successfully!');
        } else {
            showAuthError(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthError('Error logging in. Please try again.');
    }
});

// Update UI after login/signup
function updateUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    if (user) {
        loginBtn.textContent = user.name;
        loginBtn.onclick = logout;
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = openLoginModal;
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUI(null);
    showNotification('Logged out successfully');
}

// Open login modal
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    switchToLogin(); // Always start with login tab
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    document.getElementById('authError').classList.add('hidden');
}

// Initialize auth state
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        updateUI(user);
    }
});

// Add click handler for login button
document.getElementById('loginBtn').onclick = openLoginModal;

// Personal Schedule Management
let mySchedule = [];

function addToMySchedule(sessionId) {
    if (!mySchedule.includes(sessionId)) {
        mySchedule.push(sessionId);
        // Update UI
        const button = document.querySelector(`[data-session-id="${sessionId}"] button`);
        if (button) {
            button.textContent = 'Added to Schedule';
            button.classList.add('text-green-600');
        }
        // In a real app, this would sync with the server
        localStorage.setItem('mySchedule', JSON.stringify(mySchedule));
    }
}

// Initialize features when document loads
document.addEventListener('DOMContentLoaded', () => {
    // Load saved schedule
    const savedSchedule = localStorage.getItem('mySchedule');
    if (savedSchedule) {
        mySchedule = JSON.parse(savedSchedule);
        // Update UI for saved sessions
        mySchedule.forEach(sessionId => {
            const button = document.querySelector(`[data-session-id="${sessionId}"] button`);
            if (button) {
                button.textContent = 'Added to Schedule';
                button.classList.add('text-green-600');
            }
        });
    }
    
    // Example online users for demonstration
    const exampleUsers = [
        { name: 'Sarah Chen', role: 'Tech Lead' },
        { name: 'Alex Rodriguez', role: 'Full Stack Dev' },
        { name: 'Maya Patel', role: 'UI/UX Designer' },
        { name: 'Jordan Smith', role: 'DevOps' },
        { name: "Liam O'Connor", role: 'Backend Dev' }
    ];

    function updateOnlineUsersList() {
        const onlineUsersDiv = document.getElementById('onlineUsers');
        onlineUsersDiv.innerHTML = ''; // Clear current list
        
        exampleUsers.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'flex items-center space-x-2';
            userDiv.innerHTML = `
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-700">${user.name} (${user.role})</span>
            `;
            onlineUsersDiv.appendChild(userDiv);
        });

        // Update online count
        document.getElementById('onlineCount').textContent = `${exampleUsers.length} online`;
    }

    updateOnlineUsersList();
});
