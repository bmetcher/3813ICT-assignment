const express = require('express');
const router = express.Router();
const { getDb } = require('../../mongo');
const { ObjectId } = require('mongodb');
const { authenticate } = require('../../utilities/authMiddleware');
const { requireAdmin, requireSuper } = require('../../utilities/accessControl');

const { 
    emitGroupUpdated, emitGroupDeleted, 
    emitChannelDeleted, 
    emitMembershipCreated, emitMembershipUpdated, emitMembershipDeleted,
    emitChannelCreated, emitChannelDeleted
    } = require('../../sockets');

// POST create a new group
router.post('/', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const { group } = req.body;
        await requireSuper(db, req.userId);

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
        const newGroup = {
            name: group.name,
            imageUrl: req.body.imageUrl || 'public/groupIcons/default.png',
            bannedUsers: [],
            createdBy: req.userId,
            createdAt: new Date()
        }
        // insert group
        const groupResult = await db.collection('groups').insertOne(newGroup);
        const groupId = groupResult.insertedId;
        
        // create a default channel
        const defaultChannel = {
            groupId,
            name: 'Default',
            description: "Default channel",
            bannedUsers: [],
            createdBy: req.userId,
            createdAt: new Date()
        }
        const channelResult = await db.collection('channels').insertOne({ defaultChannel });
        // create a membership for the admin
        const newMembership = {
            userId: req.userId,
            groupId,
            role: 'super',
        }
        const membershipResult = await db.collection('memberships').insertOne({ newMembership });
        // collect and emit the new objects
        newChannel = { ...defaultChannel, _id: channelResult.insertedId };
        newMembership = { ...newMembership, _id: membershipResult.insertedId };
        emitChannelCreated(newChannel);
        emitMembershipCreated(newMembership);

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
        const targetUserId = new ObjectId(req.params.userId);

        // find all group memberships
        const memberships = await db.collection('memberships')
            .find({ userId: targetUserId })
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
router.put('/:groupId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetGroupId = new ObjectId(req.params.groupId);
        await requireAdmin(db, req.userId, targetGroupId);

        // check group exists
        const group = await db.collection('groups').findOne({ _id: targetGroupId });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        // build new group object
        const { name, imageUrl } = req.body;
        const update = {};
        if (name) update.name = name.trim();
        if (imageUrl) update.imageUrl = imageUrl;   // TODO: process & validate upload

        // update in DB
        await db.collection('groups').updateOne(
            { _id: targetGroupId },
            { $set: update }
        );

        // return success
        const updatedGroup = await db.collection('groups').findOne({ _id: targetGroupId });
        emitGroupUpdated(updatedGroup);
        res.json({ group: updatedGroup, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

// PUT to grant/revoke Group Admin with a user
router.put('/:groupId/:userId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetGroup = req.params.groupId;
        const targetUser = req.params.userId;
        const { newRole } = req.body;
        await requireSuper(db, req.userId);

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

        // emit & return the updated membership
        const updatedMembership = await db.collection('memberships').findOne({ groupId: targetGroup, userId: targetUser });
        emitMembershipUpdated(updatedMembership);
        res.json({ updatedMembership, success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT add a user to a group
router.put('/:groupId/:userId/invite', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetGroupId = new ObjectId(req.params.groupId);
        const targetUserId = new ObjectId(req.params.userId);
        await requireAdmin(db, req.userId, targetGroupId);

        // check user banned
        const group = await db.collection('groups').findOne({ _id: targetGroupId });
        if (!group) return res.status(404).json({ error: 'Group not found' });
        if (group.bannedUsers.some(id => id.equals(targetUserId))) {
            return res.status(403).json({ error: 'User is banned from this group' });
        }

        // check user is already a member
        const existingMembership = await db.collection('memberships').findOne({
            groupId: targetGroupId,
            userId: targetUserId
        });
        if (existingMembership) return res.status(400).json({ error: 'User is already a member' });

        // add membership
        const membership = await db.collection('memberships').insertOne({
            groupId: targetGroupId,
            userId: targetUserId,
            role: 'user'
        });
        emitMembershipCreated(membership);

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a group (& dependent channels + memberships)
router.delete('/:groupId', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const targetGroupId = new ObjectId(req.params.groupId);
        await requireSuper(db, req.userId);

        // delete the group
        const targetGroup = await db.collection('groups').findOne({ _id: targetGroupId });
        if (!targetGroup) return res.status(404).json({ error: 'Group not found' });
        await db.collection('groups').deleteOne({ targetGroup });
        
        // find any dependent entries
        const targetMemberships = await db.collection('memberships').find({ groupId: targetGroupId });
        const targetChannels = await db.collection('channels').find({ groupId: targetGroupId });
        // delete those too
        await db.collection('memberships').deleteMany({ groupId: targetGroupId });
        await db.collection('channels').deleteMany({ groupId: targetGroupId });

        // emit all deletions
        targetMemberships.forEach(member => emitMembershipDeleted(member));
        targetChannels.forEach(ch => emitChannelDeleted(ch));
        emitGroupDeleted(targetGroup);

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
