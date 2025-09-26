const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');       // for hashing passwords
const jwt = require('jsonwebtoken');
const authenticate = require('../../utiltities/auth');
const User = require('../../models/user.model')
const { readJson } = require('../../utilities/fileHandler');
const { getDb } = require('../../mongo');
const { requireAdmin } = require('../../utilities/accessControl');
const { ObjectId } = require('mongodb');


// CREATE a user
router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// GET users belonging to a given group ID
router.get('/group/:id', async (req, res) => {
    try {
        const db = getDb();
        const groupId = req.params.id;

        // find all memberships for this group
        const memberships = await db.collection('memberships')
            .find({ groupId })
            .toArray();

        const userIds = memberships.map(mem => mem.userId);

        // fetch all users in one go using these IDs
        const users = await db.collection('users')
            .find(
                { _id: { $in: userIds.map(id => ObjectId(id)) } },
                { projection: { password: 0 } }     // exclude the password
            )
            .toArray();

        res.json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// GET users belonging to a given channel ID (attach their roles)
router.get('/channel/:id', async (req, res) => {
    try {
        const db = getDb();
        const channelId = req.params.id;

        // find all memberships for the channel
        const memberships = await db.collection('memberships')
            .find({ channelId })
            .toArray();
        
        const userIds = memberships.map(mem => mem.userId);

        // fetch all users in one go using found IDs
        const users = await db.collection('users')
            .find(
                { _id: { $in: userIds.map(id => ObjectId(id)) } },
                { projection: { password: 0 } }     // exclude the password
            )
            .toArray();
        
        // merge user roles into user objects
        const usersWithRoles = users.map(user => {
            const membership = memberships.find(mem => mem.userId === user._id.toString());
            return { ...user, role: membership.role };
        })

        res.json(usersWithRoles);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// PUT update a user by their ID
router.put('/:id', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetId = req.params.id;

        // check permission
        if (req.userId !== targetId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // update allowed fields
        const { username, avatar, status, email, dob } = req.body;
        await db.collection('users').updateOne(
            { _id: ObjectId(targetId) },
            { $set: { username, avatar, status, email, dob } }
        );

        const updatedUser = await db.collection('users').findOne({ _id: ObjectId(targetId) });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// PUT update a user's password
router.put('/:id/password', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const { oldPassword, newPassword } = req.body;
        if (req.userId !== req.params.id) return res.status(403).json({ error: 'Forbidden' });

        // verify the current/previous password
        const user = await db.collection('users').findOne({ _id: ObjectId(req.params.id) });
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(400).json({ error: 'Incorrect current password' });

        // hash and update the password
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.collection('users').updateOne({ _id: ObjectId(req.params.id) }, { $set: { password: hashed } });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// DELETE a user by ID
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetId = req.params.id;

        // find the group of the user we want to delete
        const membership = await db.collection('memberships').findOne({ userId: targetId });
        if (!membership) return res.status(404).json({ error: 'Membership not found' });

        // check if the requester is an admin in that group
        await requireAdmin(db, req.userId, membership.groupId);

        // safe to delete the user
        await db.collection('users').deleteOne({ _id: ObjectId(targetId) });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;