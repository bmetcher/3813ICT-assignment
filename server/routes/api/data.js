const express = require('express');
const router = express.Router();
const { readJson } = require('../../utilities/fileDb');

// GET all users
router.get('/users', (req, res) => {
    const users = readJson('users.json');
    res.json(users);
});

// GET all groups
router.get('/groups', (req, res) => {
    const groups = readJson('groups.json');
    res.json(groups);
});

// GET channels (by groupId)
router.get('/channels/:groupId', (req, res) => {
    const channels = readJson('channels.json');
    // return only channels belonging to provided group
    const filtered = channels.filter(ch => ch.groupId == req.params.groupId);
    res.json(filtered);
})

// POST a new channel message
router.post('/channels/:channelId/message', (req, res) => {
    // collect valid message data
    const { userId, content } = req.body;
    if (!userId || !content) return res.sendStatus(400);

    // find & read the current channel data
    const channels = readJson('channels.json');
    const channel = channels.find(ch => ch.id == req.params.channelId);
    if (!channel) return res.sendStatus(404);

    // define the new message; and append it
    const message = { userId, content, timestamp: new Date() };
    channel.messages.push(message);

    // overwrite with updated channels data
    writeJson('channels.json', channels);
    res.json(message);
});



module.exports = router;