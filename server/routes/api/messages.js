const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDb } = require('../../mongo');
const canAccessChannel = require('../../utilities/accessControl');

// sockets.io for emitting message updates to sockets
const { emitMessageCreated, emitMessageUpdated, emitMessageDeleted } = require('../../sockets');

// POST a new channel message
router.post('/channel/:channelId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetUserId = new ObjectId(req.userId);
        const targetChannelId = new ObjectId(req.params.channelId);
        const { content, attachment, replyTo } = req.body;

        // check the user is unbanned and in the channel
        const access = await canAccessChannel(db, targetUserId, targetChannelId);
        if (!access.ok) {
            return res.status(access.error.code).json({ error: access.error.msg });
        }

        // set new message values
        const message = {
            channelId: targetChannelId,
            userId: targetUserId,
            content,
            attachment: attachment || null,
            replyTo: replyTo || null,
            timestamp: new Date()
        };

        // insert the message -> send back copy with it's assigned '_id'
        const result = await db.collection('messages').insertOne(message);
        const newMessage = { ...message, _id: result.insertedId };
        // emit new message to room
        emitMessageCreated(newMessage);
        res.status(201).json({ createdMessage: newMessage, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET messages of a channel (with pagination)
router.get('/channel/:channelId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetUserId = new ObjectId(req.userId);
        const targetChannelId = new ObjectId(req.params.channelId);

        // verify user has access to the channel
        const access = await canAccessChannel(db, targetUserId, targetChannelId);
        if (!access.ok) {
            return res.status(access.error.code).json({ error: access.error.msg });
        }

        // limit by messages and sort by time
        const limit = parseInt(req.query.limit) || 50;  // default is 50 messages
        const lastTimestamp = req.query.before ? new Date(req.query.before) : null;

        // build the query
        const query = { channelId: targetChannelId };
        if (lastTimestamp) query.timestamp = { $lt: lastTimestamp };

        // search by query in order
        const messages = await db.collection('messages')
            .find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        // reverse: show oldest messages at the top
        messages.reverse();

        res.json({ messages: messages, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT edit user's own message
router.put('/channel/:channelId/message/:messageId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetUserId = new ObjectId(req.userId);
        const targetChannelId = new ObjectId(req.params.channelId);
        const targetMessageId = new ObjectId(req.params.messageId);
        const { content } = req.body;

        // verify user has access to the channel
        const access = await canAccessChannel(db, targetUserId, targetChannelId);
        if (!access.ok) {
            return res.status(access.error.code).json({ error: access.error.msg });
        }

        // check message belongs to the user
        const targetMessage = await db.collection('messages').findOne({ _id: targetMessageId });
        if (!targetMessage.userId.equals(targetUserId)) return res.status(403).json({ error: 'Forbidden' });

        // update message
        await db.collection('messages').updateOne(
            { _id: targetMessageId },
            { $set: { content } }
        );

        // fetch result
        const updatedMessage = await db.collection('messages').findOne({ _id: targetMessageId });
        // emit edit to room
        emitMessageUpdated(updatedMessage);
        // return result
        res.json({ updatedMessage: updatedMessage, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE the user's message
router.delete('/channel/:channelId/message/:messageId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetUserId = new ObjectId(req.userId);
        const targetChannelId = new ObjectId(req.params.channelId);
        const targetMessageId = new ObjectId(req.params.messageId);

        // verify user has access to the channel
        const access = await canAccessChannel(db, targetUserId, targetChannelId);
        if (!access.ok) {
            return res.status(access.error.code).json({ error: access.error.msg });
        }

        // check message belongs to the user
        const targetMessage = await db.collection('messages').findOne({ _id: targetMessageId });
        if (!targetMessage.userId.equals(targetUserId)) return res.status(403).json({ error: 'Forbidden' });

        // delete message
        await db.collection('messages').deleteOne({ _id: targetMessageId });
        // emit to room & return result
        emitMessageDeleted(targetMessage);
        res.json({ deletedMessage: targetMessage, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

module.exports = router;