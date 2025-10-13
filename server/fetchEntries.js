const { connect, getDb } = require('./mongo');

async function main() {
    await connect('mongodb://192.168.10.100:27017', 'chat-app');
    const db = getDb();

    const users = await db.collection('users').find({}).toArray();
    const groups = await db.collection('groups').find({}).toArray();
    const memberships = await db.collection('memberships').find({}).toArray();

    console.log({ users, groups, memberships });

    db.client.close();
}

main();