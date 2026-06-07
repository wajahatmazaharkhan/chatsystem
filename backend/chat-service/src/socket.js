const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Group = require('../schema/Group')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // Adjust this to match your specific React App URL if needed
            methods: ["GET", "POST"]
        }
    });

    // Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
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
            try {
                // IMPORTANT: If testing with mock frontend string IDs (like 'g1'), 
                // you might want to skip or adapt this MongoDB validation block temporarily.
                const group = await Group.findById(groupId);

                if (!group) {
                    return socket.emit("error_message", "Group not found");
                }

                const isMember = group.members.some(
                  (id) => id.toString() === socket.user.user_id,
                );

                const isAdmin = socket.user.role === "ADMIN";

                const isManager =
                  group.manager_id &&
                  group.manager_id.toString() === socket.user.user_id;

                if (!isMember && !isAdmin && !isManager) {
                  return socket.emit(
                    "error_message",
                    "Not allowed to join this group",
                  );
                }

                socket.join(groupId.toString());
                console.log(`User ${socket.user.user_id} joined room ${groupId}`);
            } catch (err) {
                console.log("Socket error:", err.message);
                socket.emit('error_message', 'Server error during room joining processing');
            }
        });

        // Intercept incoming chat signals and broadcast to other members in the room
        socket.on('send_message', (data) => {
            const { groupId, text, sender, time } = data;
            
            // Broadcast the payload out to all clients sitting within that designated room space,
            // excluding the sender since they have already appended it on their UI end locally.
            socket.to(groupId.toString()).emit('message_received', {
                groupId,
                id: Date.now(),
                sender: socket.user.name || "Unknown",
                text,
                time,
                isMe: false // It will evaluate as a remote user message for other recipients
            });
            
            console.log(`Message relayed in room ${groupId} from user ${socket.user.user_id}`);
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