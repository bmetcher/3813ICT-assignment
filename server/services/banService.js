const { getDb } = require('../mongo');
const { emitUserUnbanned } = require('../sockets');

async function checkExpiredBans() {
    const db = getDb();
    const now = new Date();
    const expiredBans = await db.collection('bans').find({
        expiresAt: { $lte: now }
    }).toArray();

    for (const ban of expiredBans) {
        await db.collection('bans').deleteOne({ _id: ban._id });
        emitBanDeleted(ban._id);
    }
}

module.exports = { checkExpiredBans };
