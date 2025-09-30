const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');       // for hashing passwords
const authenticate = require('../../utilities/authMiddleware');
const { getDb } = require('../../mongo');
const { requireSuper } = require('../../utilities/accessControl');
const { ObjectId } = require('mongodb');

// CREATE a user
router.post('/', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const { password, ...rest } = req.body;
        await requireSuper(db, req.userId);

        if (!password) return res.status(400).json({ error: 'No password to hash' });
        
        // hash the user's password before saving it to the database
        const hashed = await bcrypt.hash(password, 10);
        const user = { ...rest, password: hashed };
        
        // insert into the db
        const { insertedId } = await db.collection('users').insertOne(user);

        // return without any password
        const { password: _, ...safeUser } = user;
        res.status(201).json({ _id: insertedId, ...safeUser, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET users belonging to a given group ID
router.get('/group/:groupId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetGroupId = new ObjectId(req.params.groupId);

        // find all memberships for this group
        const memberships = await db.collection('memberships')
            .find({ groupId: targetGroupId })
            .toArray();

        const userIds = memberships.map(mem => mem.userId);

        // fetch all users in one go using these IDs
        const users = await db.collection('users')
            .find(
                { _id: { $in: userIds } },
                { projection: { password: 0 } }     // exclude the password
            )
            .toArray();

        res.json({ users, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// * could probably handle this better..
// GET users belonging to a given channel ID (attach their roles)
router.get('/channel/:channelId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetChannelId = new ObjectId(req.params.channelId);

        // fetch channel's groupId
        const channel = await db.collection('channels').findOne({ _id: targetChannelId });
        if (!channel) return res.status(404).json({ error: 'Channel not found' });
        const groupId = (channel.groupId instanceof ObjectId) ? channel.groupId : new ObjectId(channel.groupId);

        // find all memberships for the group
        const memberships = await db.collection('memberships')
            .find({ groupId })
            .toArray();
        const userIds = memberships.map(mem => mem.userId);

        // niche case; return empty list
        if (userIds.length === 0) return res.json({ users: [], success: true });

        // find any existing channel bans
        const bans = await db.collection('bans')
            .find({
                userId: { $in: userIds },
                $or: [
                    { targetId: targetChannelId, targetType: 'channel' },
                    { targetId: groupId,   targetType: 'group' }
                ],
                $or: [
                    { expiresAt: null },        // permanent
                    { expiresAt: { $gt: now } } // active
                ]
            })
            .toArray();
        const bannedSet = new Set(bans.map(ban => ban.userId.toString()));

        // filter allowed userIds
        const allowedUserIds = userIds.filter(id => !bannedSet.has(id.toString()));
        if (allowedUserIds.length === 0) return res.json({ users: [], success: true });

        // fetch users (exclude passwords) and attach role from memberships
        const users = await db.collection('users')
            .find(
                { _id: { $in: allowedUserIds } },
                { projection: { password: 0 } }     // exclude the password
            )
            .toArray();
        
        // merge user roles into user objects
        const usersWithRoles = users.map(user => {
            const membership = memberships.find(mem => mem.userId.equals(user._id));
            return { ...user, role: membership?.role ?? 'user' };
        });

        res.json({ users: usersWithRoles, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update a user by their ID
router.put('/:userId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetUserId = new ObjectId(req.params.userId);

        // check permission
        if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

        // update allowed fields (filter them)
        const { username, avatar, status, email, dob } = req.body;
        const update = {};
        if (username) update.username = username;
        if (avatar) update.avatar = avatar;
        if (status) update.status = status;
        if (email) update.email = email;
        if (dob) update.dob = dob;

        // update user
        await db.collection('users').updateOne(
            { _id: targetUserId },
            { $set: update }
        );

        // return result
        const updatedUser = await db.collection('users').findOne(
            { _id: targetUserId },
            { projection: { password: 0 } }
        );
        res.json({ updatedUser, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update a user's password
router.put('/:userId/password', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetUserId = new ObjectId(req.params.userId);
        // verify the user
        const user = await db.collection('users').findOne({ _id: targetUserId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

        const { oldPassword, newPassword } = req.body;
        // verify the current/previous password
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(400).json({ error: 'Incorrect current password' });

        // hash and update the password
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.collection('users').updateOne(
            { _id: targetUserId }, 
            { $set: { password: hashed } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a user by ID
router.delete('/:userId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetUserId = new ObjectId(req.params.userId);
        await requireSuper(db, req.userId);

        // find the group of the user we want to delete
        const membership = await db.collection('memberships').findOne({ userId: targetUserId });
        if (!membership) return res.status(404).json({ error: 'Membership not found' });

        // safe to delete the user
        await db.collection('users').deleteOne({ _id: targetUserId });
        await db.collection('memberships').deleteMany({ userId: targetUserId });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;