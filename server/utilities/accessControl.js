const { ObjectId } = require('mongodb');

// Check a user is an unbanned member of a channel (Mongo ID: userId, channelId)
async function canAccessChannel(db, userId, channelId) {
    // convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const channelObjectId = typeof channelId === 'string' ? new ObjectId(channelId) : channelId;

    // fetch the channel for its groupId
    const channel = await db.collection('channels').findOne({ _id: channelObjectId });
    if (!channel) return { ok: false, error: { code: 404, msg: 'Channel not found' } };

    // validate user has membership first
    const membership = await db.collection('memberships').findOne({
        userId: userObjectId,
        groupId: channel.groupId
    });
    if (!membership) return { ok: false, error: { code: 403, msg: 'User is not a member of this group' } };

    // check if user is banned from channel or group
    const banned = await db.collection('bans').findOne({
        userId: userObjectId,
        $and: [
            {
                $or: [
                    { channelId: channelObjectId },
                    { groupId: channel.groupId }
                ]
            },
            {
                $or: [
                    { expiresAt: { $gt: new Date() } },
                    { expiresAt: null }
                ]
            }   
        ]
    });
    if (banned) return { ok: false, error: { code: 403, msg: 'User is banned from this channel' } };
    return { ok: true, channel };
}


// Helper for requiring admin in endpoints
async function requireAdmin(db, userId, groupId) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const groupObjectId = typeof groupId === 'string' ? new ObjectId(groupId): groupId;

    console.log('requireAdmin - searching for userId:', userObjectId);
    console.log('requireAdmin - searching for groupId:', groupObjectId);

    // find the user's membership
    let membership = await db.collection('memberships').findOne({ 
        userId: userObjectId,
        groupId: groupObjectId 
    });

    console.log('requireAdmin - found membership:', membership);

    // check their role is valid
    if (!membership || (membership.role !== 'admin' && membership.role !== 'super')) {
        const err = new Error('Admin privileges required');
        err.status = 403;
        throw err;
    }
    return membership;
}

// Helper for requiring super admin (very specific endpoints)
async function requireSuper(db, userId) {
    // convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

    // find membership and check for super
    const membership = await db.collection('memberships').findOne({ userId: userObjectId });

    if (!membership || membership.role !== 'super') {
        const err = new Error('Super Admin privileges required');
        err.status = 403;
        throw err;
    }
    return membership;
}


module.exports = { canAccessChannel, requireAdmin, requireSuper };    