const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Or specific origins
            methods: ["GET", "POST"]
        }
    });

    // Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token required'));
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.user = decoded; // { user_id, role }
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id} (User: ${socket.user.user_id})`);

        // Client joins a specific group room
        socket.on('join_group', (groupId) => {
            // NOTE: In a real app, verify they are a member of this group first.
            socket.join(groupId);
            console.log(`User ${socket.user.user_id} joined room ${groupId}`);
        });

        // Client leaves a group room
        socket.on('leave_group', (groupId) => {
            socket.leave(groupId);
            console.log(`User ${socket.user.user_id} left room ${groupId}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = initSocket;
module.exports.getIo = getIo;
