const { MongoClient } = require('mongodb');

// can override with system variables if running somewhere else
const defaultUrl = process.env.MONGO_URL || 'mongodb://192.168.10.100:27017';
const defaultDbName = process.env.MONGO_DB || 'chat-app';

let db = null;

// (server URL + database name) -> database
async function connect(url = defaultUrl, dbName = defaultDbName) {
    const client = new MongoClient(url);
    await client.connect();
    db = client.db(dbName);

    console.log(`Connected to MongoDB: ${dbName}`);
    return db;
}

function getDb() {
    if (!db) throw new Error('Database not connected');
    return db;
}

module.exports = { connect, getDb };