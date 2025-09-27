const express = require('express');
const router = express.Router();
const Channel = require('../../models/channel.model');
const { readJson } = require('../../utilities/fileHandler');

// Helper to create a new default channel
async function createDefaultChannel(db, groupId) {
    const channel = {
        groupId,
        name: 'Default',
        description: "Channel description goes here...",
        bannedUsers: []
    };
    await db.collection('channels').insertOne(channel);
}