const express = require('express');
const router = express.Router();
const { getDb } = require('../../mongo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST login request
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const { email, password } = req.body;

        // find user by email
        const user = await db.collection('users').findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        // check if password is a match
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        // generate JSON Web Token
        const token = jwt.sign(
            { userId: user._id.toString() },
            JWT_SECRET,
            { expiresIn: '8h' } // token lasts 8 hours
        );

        res.json({ token, userId: user._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;