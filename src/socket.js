const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Group = require('../schema/Group')

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
        socket.on('join_group', async(groupId) => {

            try{
                const group = await Group.findOne({
                    _id: groupId,
                    members: socket.user.user_id
                });

                if (!group) {
                    return socket.emit('error_message', 'Not allowed');
                }
                socket.join(groupId.toString());
                console.log(`User ${socket.user.user_id} joined room ${groupId}`);
            }catch (err) {
                console.log("Socket error:", err.message);
                socket.emit('error_message', 'Server error');
            }
        });

        // Client leaves a group room
        socket.on('leave_group', (groupId) => {
            socket.leave(groupId.toString());
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
