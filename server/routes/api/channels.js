const express = require('express');
const router = express.Router();
const { getDb } = require('../../mongo');
const { ObjectId } = require('mongodb');
const { authenticate } = require('../../utilities/authMiddleware');
const { requireAdmin } = require('../../utilities/accessControl');
const { emitChannelCreated, emitChannelUpdated, emitChannelDeleted } = require('../../sockets');

// POST create a new channel
router.post('/', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const { channel } = req.body;
        await requireAdmin(db, req.userId, targetGroupId);

        // validate input
        if (!channel || !channel.name || !channel.groupId) {
            return res.status(400).json({ error: 'Channel name is required' });
        }
        // sanitize
        channel.name = channel.name.trim();
        const newGroupId = new ObjectId(channel.groupId);

        // check for duplicates within the group
        const existing = await db.collection('channels').findOne({ 
            groupId, 
            name: channel.name 
        });
        if (existing) return res.status(409).json({ error: 'Channel with that name already exists' });

        // initialize a channel object
        const newChannel = {
            name: channel.name,
            groupId: newGroupId,
            bannedUsers: [],
            createdBy: new ObjectId(req.userId),
            createdAt: new Date()
        };
        // insert channel
        const channelResult = await db.collection('channels').insertOne(newChannel);
        newChannel = { ...newChannel, _id: channelResult._id };
        emitChannelCreated(newChannel);

        res.status(201).json({ newChannel, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET channels by groupId
router.get('/:groupId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetGroupId = new ObjectId(req.params.groupId);

        // check group exists
        const group = await db.collection('groups').findOne({ _id: targetGroupId });
        if (!group) return res.status(404).json({ error: 'Group not found' });
        // check if user is in memberships for the group
        const membership = await db.collection('memberships').findOne({ groupId: targetGroupId, userId: req.userId });
        if (!membership) return res.status(403).json({ error: 'Forbidden' });

        // fetch channels (exclude ban list)
        const channels = await db.collection('channels')
            .find({ groupId: targetGroupId }, { projection: { bannedUsers: 0 } })
            .toArray();

        res.json({ channels, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT edit channel (name, description) by channelId
router.put('/:channelId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetChannelId = new ObjectId(req.params.channelId);
        const { name, description } = req.body;
        await requireAdmin(db, req.userId, targetGroupId);

        // check channel exists
        const channel = await db.collection('channels').findOne({ _id: targetChannelId });
        if (!channel) return res.status(404).json({ error: 'Channel not found' });

        // build new channel object
        const update = {};
        if (name) update.name = name.trim();
        if (description) update.description = description ? description.trim() : '';

        // set the new channel
        await db.collection('channels').updateOne(
            { _id: targetChannelId },
            { $set: update }
        );

        // return success
        const updatedChannel = await db.collection('channels').findOne({ _id: targetChannelId });
        emitChannelUpdated(updatedChannel);
        res.json({ channel: updatedChannel, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE delete channel by channelId
router.delete('/:channelId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetChannelId = new ObjectId(req.params.channelId);
        await requireAdmin(db, req.userId, targetGroupId);

        // delete the channel
        const targetChannel = await db.collection('channels').findOne({ _id: targetChannelId });
        if (!targetChannel) return res.status(404).json({ error: 'Channel not found' });
        await db.collection('channels').deleteOne({ _id: targetChannelId });

        // emit & return result
        emitChannelDeleted(targetChannel);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
