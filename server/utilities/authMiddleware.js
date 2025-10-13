const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function authenticate(req, res, next) {
    // prepare the auth header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    // if there is a valid token; authenticate allowed
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;    // routes can access req.userId
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = { authenticate };