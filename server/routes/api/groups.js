const express = require('express');
const router = express.Router();
const { getDb } = require('../../mongo');
const { ObjectId } = require('mongodb');
const { authenticate } = require('../../utilities/auth');
const { requireAdmin, requireSuper } = require('../../utilities/accessControl');

// POST create a new group
router.post('/', authenticate, requireSuper, async (req, res) => {
    try {
        const db = getDb();
        const { group } = req.body;

        // validate input
        if (!group || !group.name) {
            return res.status(400).json({ error: 'Group name is required' });
        }
        // sanitize input
        group.name = group.name.trim();
        // check for duplicates
        const existing = await db.collection('groups').findOne({ name: group.name });
        if (existing) {
            return res.status(409).json({ error: 'Group with that name already exists' });
        }

        // initialize base group
        const groupObj = {
            name: group.name,
            imageUrl: req.body.imageUrl || 'public/groupIcons/default.png',
            bannedUsers: [],
            createdBy: req.userId,
            createdAt: new Date()
        }
        // insert group
        const groupResult = await db.collection('groups').insertOne(groupObj);
        const groupId = groupResult.insertedId;

        // create a default channel
        await db.collection('channels').insertOne({
            groupId,
            name: 'Default',
            description: "Default channel",
            bannedUsers: [],
            createdBy: req.userId,
            createdAt: new Date()
        });
        // create a membership for the admin
        await db.collection('memberships').insertOne({
            userId: req.userId,
            groupId,
            role: 'super',
        });

        // return result
        res.status(201).json({ ...groupObj, _id: groupId, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all groups for the authenticated user
router.get('/:userId', authenticate, async (req, res) => {
    try {
        // fetch memberships collection with user's ID
        const db = getDb();
        const memberships = await db.collection('memberships')
            .find({ userId: req.userId })
            .toArray();

        // collect the group IDs that are a match
        const groupIds = memberships.map(mem => ObjectId(mem.groupId));

        // retrieve all groups using that match (do not return 'banned users' list)
        const groups = await db.collection('groups')
            .find({ _id: { $in: groupIds } }, { projection: { bannedUsers: 0 } })
            .toArray();

        // return result
        res.json({ groups, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT to change group's name or image (requires admin || super)
router.put('/:groupId', authenticate, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const groupId = req.params.groupId;
        const { name, imageUrl } = req.body;

        // build new group object
        const update = {};
        if (name) update.name = name.trim();
        if (imageUrl) update.imageUrl = imageUrl;   // TODO: process & validate upload

        // update in DB
        const result = await db.collection('groups').updateOne(
            { _id: ObjectId(groupId) },
            { $set: update }
        );

        // return success
        const updatedGroup = await db.collection('groups').findOne({ _id: ObjectId(groupId) });
        res.json({ group: updatedGroup, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

// PUT to grant/revoke Group Admin with a user
router.put('/:groupId/:userId', authenticate, requireSuper, async (req, res) => {
    try {
        const db = getDb();
        const targetGroup = req.params.groupId;
        const targetUser = req.params.userId;
        const { newRole } = req.body;

        // check valid role requested
        if (!['user', 'admin'].includes(newRole)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // find the membership
        const membership = await db.collection('memberships').findOne({ groupId: targetGroup, userId: targetUser });
        // validate result
        if (!membership) return res.status(404).json({ error: 'Membership not found' });
        if (membership.role === 'super') return res.status(400).json({ error: 'Cannot revoke Super Admin' });

        // update the role
        await db.collection('memberships').updateOne(
            { groupId: targetGroup, userId: targetUser },
            { $set: { role: newRole } }
        );

        // return the updated membership
        const updatedMembership = await db.collection('memberships').findOne({ groupId: targetGroup, userId: targetUser });
        res.json({ updatedMembership, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a group
router.delete('/:groupId', authenticate, requireSuper, async (req, res) => {
    try {
        const db = getDb();
        const targetId = req.params.groupId;

        // find the group to be deleted
        const groupToDelete = await db.collection('groups').findOne({ _id: ObjectId(targetId) });
        if (!groupToDelete) return res.status(404).json({ error: 'Group not found' });

        // delete the group
        await db.collection('groups').deleteOne({ _id: ObjectId(targetId) });
        await db.collection('memberships').deleteMany({ groupId: targetId });
        await db.collection('channels').deleteMany({ groupId: targetId });

        // return result
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
