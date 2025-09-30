const { getDb } = require('./mongo')

let io;

// Starting the server
function initSocket(server) {
    // TODO: adjust CORS for frontend
    io = require('socket.io')(server, { cors: { origin: '*' } });

    io.on('connection', (socket) => {
        console.log('a user connected: ', socket.id);

        // join/leave rooms
        socket.on('joinChannel', (channelId) => socket.join(channelId));
        socket.on('leaveChannel', (channelId) => socket.leave(channelId));

        // disconnect
        socket.on('disconnect', () => {
            console.log('user disconnected:', socket.id);
        });
    });

    return io;
};

// MESSAGES
async function emitNewMesssage(messageId) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        const db = getDb();
        // get the new message
        const message = await db.collection('messages').findOne({ _id: messageId });
        if (!message) return;
        // emit the new message
        io.to(message.channelId.toString()).emit('newMessage', message);
    } catch (err) {
        console.error('[SOCKET] emitNewMessage error:', err);
    }
}
async function emitEditMessage(messageId) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        const db = getDb();
        // get the new message
        const message = await db.collection('messages').findOne({ _id: messageId });
        if (!message) return;
        // emit the new message
        io.to(message.channelId.toString()).emit('editMessage', message);
    } catch (err) {
        console.error('[SOCKET] emitEditMessage error:', err);
    }
}
async function emitDeleteMessage(messageId) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        const db = getDb();
        const message = await db.collection('messages').findOne({ _id: messageId });
        if (!message) return;   // may already be deleted
        io.to(message.channelId.toString()).emit('deleteMessage', { _id: messageId });
    } catch (err) {
        console.error('[SOCKET] emitDeleteMessage error:', err);
    }
}

// BANS     (emit group-wide; no channel-only events)
async function emitUserBanned(banId) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        const db = getDb();
        const ban = await db.collection('bans').findOne({ _id: banId });
        if (!ban) return;
        io.to(ban.groupId.toString()).emit('userBanned', { _id: banId });
    } catch (err) {
        console.error('[SOCKET] emitUserBanned error:', err);
    }
}
async function emitUserUnbanned(banId) {
    if (!io) throw new Error('Socket.IO not initialized');
    try {
        const db = getDb();
        const ban = await db.collection('bans').findOne({ _id: banId });
        if (!ban) return;
        io.to(ban.groupId.toString()).emit('userUnbanned', { _id: banId });
    } catch (err) {
        console.error('[SOCKET] emitUserUnbanned error:', err);
    }
}
module.exports = { initSocket, 
    emitNewMessage, emitEditMessage, emitDeleteMessage,
    emitUserBanned, emitUserUnbanned
};