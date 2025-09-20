const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDb } = require('../../mongo');
const { readJson } = require('../../utilities/fileHandler');
const Message = require('../../models/message.model');

// POST a new channel message
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const { userId, channelId, content, attachment, replyTo } = req.body;

        // fetch the channel for its groupId
        const channel = await db.collection('channels').findOne({ _id: ObjectId(channelId) });
        if (!channel) return res.status(404).json({ error: 'Channel not found' });

        // validate user has membership first
        const membership = await db.collection('memberships').findOne({
            userId,
            groupId: channel.groupId
        });
        if (!membership) {
            return res.status(403).json({ error: 'User is not a member of this group' });
        }

        // check if user is banned from channel or group
        const banned = await db.collection('bans').findOne({
            userId,
            $or: [
                { targetId: channelId, targetType: 'channel' },
                { targetId: channel.groupId, targetType: 'group' }
            ]
        });
        if (banned) return res.status(403).json({ error: 'User is banned from this channel' });

        // set new message values
        const message = {
            channelId,
            userId,
            content,
            attachment: attachment || null,
            replyTo: replyTo || null,
            timestamp: new Date()
        };

        // insert the message -> send back copy with it's assigned '_id'
        const result = await db.collection('messages').insertOne(message);
        res.status(201).json({ ...message, _id: result.insertedId });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;