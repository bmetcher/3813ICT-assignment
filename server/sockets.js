const { getDb } = require('./mongo')
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let io;

// Starting the server
function initSocket(server) {
    io = require('socket.io')(server, { cors: { origin: '*' } });

    // Add auth middleware before connection
    io.use((socket, next) => {
        // extract token from handshake
        const token = socket.handshake.auth.token;

        if (!token) return next(new Error('No token provided'));

        try {
            const payload = jwt.verify(token, JWT_SECRET);
            socket.userId = payload.userId; // attach user ID
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });
    

    io.on('connection', (socket) => {
        console.log('a user connected: ', socket.id, 'userId:', socket.userId);

        // join/leave rooms
        socket.on('joinChannel', (channelId) => {
            socket.join(channelId);
            console.log(`User ${socket.userId} joined channel ${channelId}`);
        });

        socket.on('leaveChannel', (channelId) => {
            socket.leave(channelId)
            console.log(`User ${socket.userId} left ${channelId}`);
        });

        // disconnect
        socket.on('disconnect', () => {
            console.log('user disconnected:', socket.id);
        });
    });

    return io;
};

// CRUD emit functions
// MESSAGES
async function emitMessageCreated(message) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(message.channelId.toString()).emit('messageCreated', message);
    } catch (err) {
        console.error('[SOCKET] emitMessageCreated error:', err);
    }
}
async function emitMessageUpdated(message) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(message.channelId.toString()).emit('messageUpdated', message);
    } catch (err) {
        console.error('[SOCKET] emitMessageUpdated error:', err);
    }
}
async function emitMessageDeleted(message) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(message.channelId.toString()).emit('messageDeleted', message);
    } catch (err) {
        console.error('[SOCKET] emitMessageDeleted error:', err);
    }
}

// BANS     (emit group-wide; no channel-only events)
async function emitBanCreated(ban) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(ban.groupId.toString()).emit('banCreated', ban);
    } catch (err) {
        console.error('[SOCKET] emitBanCreated error:', err);
    }
}
async function emitBanUpdated(ban) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        const db = getDb();
        io.to(ban.groupId.toString()).emit('banUpdated', ban);
    } catch (err) {
        console.error('[SOCKET] emitBanUpdated error:', err);
    }
}
async function emitBanDeleted(ban) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(ban.groupId.toString()).emit('banDeleted', ban);
    } catch (err) {
        console.error('[SOCKET] emitBanDeleted error:', err);
    }
}

// GROUPS
// (we don't emit create group -- thats super user only for now)
async function emitGroupUpdated(group) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(group.groupId.toString()).emit('groupUpdated', group);
    } catch (err) {
        console.error('[SOCKET] emitGroupUpdated error:', err);
    }
}
async function emitGroupDeleted(group) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(group.groupId.toString()).emit('groupDeleted', group);
    } catch (err) {
        console.error('[SOCKET] emitGroupDeleted error:', err);
    }
}

// MEMBERSHIPS
async function emitMembershipCreated(membership) {
    if (!io) throw new Error('Socket.IO not initialized');
    try { 
        io.to(membership.groupId.toString()).emit('membershipCreated', membership);
    } catch (err) {
        console.error('[SOCKET] emitMembershipCreated error:', err);
    }
}
async function emitMembershipUpdated(membership) {
    if (!io) throw new Error('Socket.IO not initialized');
    try { 
        io.to(membership.groupId.toString()).emit('membershipUpdated', membership);
    } catch (err) {
        console.error('[SOCKET] emitMembershipUpdated error:', err);
    }
}
async function emitMembershipDeleted(membership) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(membership.groupId.toString()).emit('membershipDeleted', membership);
    } catch (err) {
        console.error('[SOCKET] emitMembershipDeleted error:', err);
    }
}

// CHANNELS
async function emitChannelCreated(channel) {
    if (!io) throw new Error('Socket.IO not initialized');
    try { 
        io.to(channel.groupId.toString()).emit('channelCreated', channel);
    } catch (err) {
        console.error('[SOCKET] emitChannelCreated error:', err);
    }
}
async function emitChannelUpdated(channel) {
    if (!io) throw new Error('Socket.IO not initialized');
    try { 
        io.to(channel.groupId.toString()).emit('channelUpdated', channel);
    } catch (err) {
        console.error('[SOCKET] emitChannelUpdated error:', err);
    }
}
async function emitChannelDeleted(channel) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(channel.groupId.toString()).emit('channelDeleted', channel);
    } catch (err) {
        console.error('[SOCKET] emitChannelDeleted error:', err);
    }
}

// USERS    (only super creates user; no emit (yet))
async function emitUserUpdated(user) {
    if (!io) throw new Error('Socket.IO not initialized');
    try { 
        io.to(user.groupId.toString()).emit('userUpdated', user);
    } catch (err) {
        console.error('[SOCKET] emitUserUpdated error:', err);
    }
}
async function emitUserDeleted(user) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        io.to(user.groupId.toString()).emit('userDeleted', user);
    } catch (err) {
        console.error('[SOCKET] emitUserDeleted error:', err);
    }
}

module.exports = { 
    initSocket,
    emitMessageCreated, emitMessageUpdated, emitMessageDeleted,
    emitBanCreated, emitBanUpdated, emitBanDeleted,
    emitGroupUpdated, emitGroupDeleted,
    emitMembershipCreated, emitMembershipUpdated, emitMembershipDeleted,
    emitChannelCreated, emitChannelUpdated, emitChannelDeleted,
    emitUserUpdated, emitUserDeleted,
};