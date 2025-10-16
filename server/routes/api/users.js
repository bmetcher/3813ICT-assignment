const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');       // for hashing passwords
const fs = require('fs');
const path = require('path');
const { uploadAvatar } = require('../../utilities/upload');
const { authenticate } = require('../../utilities/authMiddleware');
const { getDb } = require('../../mongo');
const { requireSuper } = require('../../utilities/accessControl');
const { ObjectId } = require('mongodb');
const { emitUserUpdated, emitUserDeleted, emitMembershipDeleted } = require('../../sockets');

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
        const userResult = await db.collection('users').insertOne(user);

        // return without any password
        const { password: _, ...restUser } = user;  // discard the password specifically
        const safeUser = { ...restUser, _id: userResult.insertedId };
        res.status(201).json({ createdUser: safeUser, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST upload an avatar
router.post('/:userId/avatar', authenticate, uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const db = getDb();
        const targetUserId = new ObjectId(req.params.userId);
        
        console.log('Avatar upload request for user:', targetUserId.toString());
        console.log('Uploaded file:', req.file);

        // check the request is coming from the user themselves
        const isSelf = req.userId === req.params.userId;
        if (!isSelf) {
            // unless they're super admin
            const membership = await db.collection('memberships').findOne({
                userId: new ObjectId(req.userId)
            });
            if (!membership || membership.role !== 'super') {
                // delete uploaded file if unauthorized
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(403).json({ error: 'Forbidden' });
            }
        }

        // check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // build avatar path for database (relative path)
        const avatarPath = `public/avatars/${req.file.filename}`;
        console.log('Saving avatar path to database:', avatarPath);

        // get user's old avatar to delete it
        const user = await db.collection('users').findOne({ _id: targetUserId });
        if (user && user.avatar && user.avatar !== 'public/avatars/default.png') {
            // delete old avatar file
            const oldPath = path.join(__dirname, '../../', user.avatar);
            console.log('Checking for old avatar:', oldPath);

            // check if file exists before trying to delete it
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                    console.log('Deleted old avatar:', oldPath);
                } catch (err) {
                    console.error('Failed to delete old avatar:', err);
                }
            } else {
                console.log('Old avatar file does not exist, skipping delete');
            }
        }

        // update user document with new avatar path
        await db.collection('users').updateOne(
            { _id: targetUserId },
            { $set: { avatar: avatarPath } }
        );

        // fetch updated user (exclude password)
        const updatedUser = await db.collection('users').findOne(
            { _id: targetUserId },
            { projection: { password: 0 } }
        );

        console.log('Avatar updated successfully');

        // emit update to all connected clients
        const { emitUserUpdated } = require('../../sockets');
        emitUserUpdated(updatedUser);

        res.json({
            user: updatedUser,
            avatarUrl: avatarPath,
            success: true
        });
    } catch (err) {
        console.error('Avatar upload error:', err);
        // delete file if error occurs
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ error: err.message });
    }
});

// GET a single user by ID
router.get('/:userId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetUserId = new ObjectId(req.params.userId);

        // fetch user
        const user = await db.collection('users').findOne(
            { _id: targetUserId },
            { projection: { password: 0 } }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user, success: true });
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

        res.json({ users: users, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

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
        const now = new Date();
        const bans = await db.collection('bans')
            .find({
                userId: { $in: userIds },
                $or: [
                    { channelId: targetChannelId },
                    { groupId: groupId, channelId: null }   // remember: group bans have null channelId
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

        // check it's the user updating it themselves
        const isSelf = req.userId === req.params.userId;
        if (!isSelf) {
            // if not: is it the super admin?
            const membership = await db.collection('memberships').findOne({
                userId: new ObjectId(req.userId)
            });
            if (!membership || membership.role !== 'super') {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }

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
        emitUserUpdated(updatedUser);
        res.json({ updatedUser: updatedUser, success: true });
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

        // check it's the user updating it themselves
        const isSelf = req.userId === req.params.userId;
        if (!isSelf) {
            // if not: is it the super admin?
            const membership = await db.collection('memberships').findOne({
                userId: new ObjectId(req.userId)
            });
            if (!membership || membership.role !== 'super') {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }

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

        // find the group of the user we want to delete
        const membership = await db.collection('memberships').findOne({ userId: targetUserId });
        if (!membership) return res.status(404).json({ error: 'Membership not found' });

        // find user
        const targetUser = await db.collection('users').findOne({ _id: targetUserId });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });
        // their memberships
        const targetMemberships = await db.collection('memberships').find({ userId: targetUserId }).toArray();
        if (!targetMemberships || targetMemberships.length === 0) {
            return res.status(404).json({ error: 'Memberships not found' });
        }

        await requireSuper(db, req.userId);

        // delete all items
        await db.collection('users').deleteOne({ _id: targetUserId });
        await db.collection('memberships').deleteMany({ userId: targetUserId });
        // emit to room/s
        emitUserDeleted(targetUser);
        targetMemberships.forEach(membership => emitMembershipDeleted(membership));

        res.json({ deletedUser: targetUser, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;