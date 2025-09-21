const { ObjectId } = require('mongodb');

async function canAccessChannel(db, userId, channelId) {
    // fetch the channel for its groupId
    const channel = await db.collection('channels').findOne({ _id: ObjectId(channelId) });
    if (!channel) return { ok: false, error: { code: 404, msg: 'Channel not found' } };

    // validate user has membership first
    const membership = await db.collection('memberships').findOne({
        userId,
        groupId: channel.groupId
    });
    if (!membership) return { ok: false, error: { code: 403, msg: 'User is not a member of this group' } };

    // check if user is banned from channel or group
    const banned = await db.collection('bans').findOne({
        userId,
        $or: [
            { targetId: channelId, targetType: 'channel' },
            { targetId: channel.groupId, targetType: 'group' }
        ]
    });
    if (banned) return { ok: false, error: { code: 403, msg: 'User is banned from this channel' } };

    return { ok: true, channel };
}

module.exports = { canAccessChannel };