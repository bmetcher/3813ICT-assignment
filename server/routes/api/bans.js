const express = require('express');
const router = express.Router();
const { getDb } = require('../../mongo');
const { ObjectId } = require('mongodb');
const { authenticate } = require('../../utilities/authMiddleware');
const { requireAdmin } = require('../../utilities/accessControl');

const { emitUserBanned, emitUserUnbanned } = require('../../sockets');

// IMPLEMENT AUTOMATIC EXPIRATION CHECK & REMOVAL
// WHEN WE FETCH THINGS ??

// POST ban routes
router.post('/group/:groupId/user/:userId', authenticate, createBanRoute());
router.post('/group/:groupId/channel/:channelId/user/:userId', authenticate, createBanRoute());

// POST helper: create a new ban for given target (group, channel)
function createBanRoute() {
    return async (req, res) => {
        try {
            const db = getDb();
            const { reason, duration } = req.body;

            const targetUserId = new ObjectId(req.params.userId);
            const targetGroupId = new ObjectId(req.params.groupId);
            const targetChannelId = req.params.channelId ? new ObjectId(req.params.channelId) : null;

            await requireAdmin(db, req.userId, req.params.groupId);

            // validate duration
            if (!duration) return res.status(400).json({ error: 'Duration is required' });
            const durationSeconds = Number(duration);
            if (isNaN(durationSeconds) || (durationSeconds <= 0 && durationSeconds !== -1)) {
                return res.status(400).json({ error: 'Invalid duration' });
            }

            // check for any existing active ban
            const existingBan = await db.collection('bans').findOne({
                userId: targetUserId,
                groupId: targetGroupId,
                channelId: targetChannelId,
                $or: [
                    { expiresAt: { $gt: new Date() } },
                    { expiresAt: null }
                ]
            });
            if (existingBan) return res.status(409).json({ error: 'User is already banned' });

            // set expiration
            const expiresAt = (durationSeconds === -1) ? null : new Date(Date.now() + durationSeconds * 1000);

            // build new ban
            const newBan = {
                userId: targetUserId,
                groupId: targetGroupId,
                channelId: targetChannelId,
                date: new Date(),
                bannedBy: req.userId,
                reason: reason ? reason.trim() : '',
                expiresAt
            };

            // return result & emit the new ban
            const { insertedId } = await db.collection('bans').insertOne(newBan);
            emitUserBanned(insertedId);
            res.status(201).json({ _id: insertedId, ...newBan, success: true });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}

// GET routes for all active bans of a target
router.get('/group/:groupId/active', authenticate, createGetBansRoute(false));
router.get('/group/:groupId/channel/:channelId/active', authenticate, createGetBansRoute(false));
router.get('/group/:groupId/user/:userId/active', authenticate, createGetBansRoute(false));
// GET routes for all previous bans of a target
router.get('/group/:groupId/all', authenticate, createGetBansRoute(true));
router.get('/group/:groupId/channel/:channelId/all', authenticate, createGetBansRoute(true));
router.get('/group/:groupId/user/:userId/all', authenticate, createGetBansRoute(true));

// GET Helper: return a list of bans for the given target (group, channel, user)
function createGetBansRoute(allBans = false) {
    return async (req,res) =>{
        try { 
            const db = getDb();
            await requireAdmin(db, req.userId, req.params.groupId);

            // initialize query object
            const query = {};

            // collect appropriate parameters for query
            if (req.params.groupId) query.groupId = new ObjectId(req.params.groupId);
            if (req.params.channelId) query.channelId = new ObjectId(req.params.channelId);
            if (req.params.userId) query.userId = new ObjectId(req.params.userId);
            
            // filter for only active bans
            if (!allBans) {
                query.$or = [
                    { expiresAt: { $gt: new Date() } },
                    { expiresAt: null }
                ];
            }

            // find and return filtered ban list
            const bans = await db.collection('bans')
                .find(query)
                .toArray();
            res.json({ bans, success: true });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}

// PUT edit ban (duration?, reason?)
router.put('/:banId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetBanId = new ObjectId(req.params.banId);
        // verify the ban
        const ban = await db.collection('bans').findOne({ _id: targetBanId });
        if (!ban) return res.status(404).json({ error: 'Ban not found' });

        await requireAdmin(db, req.userId, ban.groupId);

        // prepare edit data
        const { reason, duration } = req.body;
        const update = {};
        // prepare edit data
        if (reason) update.reason = reason.trim();
        if (duration) {
            const durationSeconds = Number(duration);
            update.expiresAt = (durationSeconds === -1) ? null : new Date(Date.now() + durationSeconds * 1000);
        }

        // update ban in db
        const result = await db.collection('bans').updateOne(
            { _id: targetBanId },
            { $set: update }
        );

        // return result
        const updatedBan = await db.collection('bans').findOne({ _id: targetBanId });
        res.json({ ban: updatedBan, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

// DELETE a ban
router.delete('/:banId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetBanId = new ObjectId(req.params.banId);

        // verify ban exists
        const targetBan = await db.collection('bans').findOne({ _id: targetBanId });
        if (!targetBan) return res.status(404).json({ error: 'Ban not found' });

        await requireAdmin(db, req.userId, targetBan.groupId);

        // delete ban; return result and emit the unban
        const result = await db.collection('bans').deleteOne({ _id: targetBanId });
        emitUserUnbanned(targetBanId);
        res.json({ result, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});