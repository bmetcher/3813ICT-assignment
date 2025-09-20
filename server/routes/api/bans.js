const express = require('express');
const router = express.Router();
const Ban = require('../../models/ban.model')
const { readJson } = require('../../utilities/fileHandler');

// BAN a user
router.post('/bans/:id', async (req, res) => {
    try { 
        const { reason, duration } = req.body;
        // create a Ban linked to the user
        const ban = await Ban.create({
            userId: req.params.id,
            reason,
            duration,
            date: new Date()
        });
        res.status(201).json(ban);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});