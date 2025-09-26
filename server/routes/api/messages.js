const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDb } = require('../../mongo');
const { readJson } = require('../../utilities/fileHandler');
const Message = require('../../models/message.model');
const canAccessChannel = require('../../utilities/accessControl');

// POST a new channel message
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const { userId, channelId, content, attachment, replyTo } = req.body;

        const access = await canAccessChannel(db, userId, channelId);
        if (!access.ok) {
            return res.status(access.error.code).json({ error: access.error.msg });
        }

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

// GET messages of a channel
router.get('/', async (req, res) => {
    
})

module.exports = router;