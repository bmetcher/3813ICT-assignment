const express = require('express'); // routing middleware
const { connect } = require('./mongo');
const cors = require('cors');

// OLD ROUTES
const authRoutes = require('./routes/api/authRoutes');
const dataRoutes = require('./routes/api/dataRoutes');
const adminRoutes = require('./routes/api/adminRoutes');
// *TBD*
// app.use('/api/auth', authRoutes);
// app.use('/api/data', dataRoutes);
// app.use('/api/admin', adminRoutes);

// New Routes
const usersRoutes = require('./routes/api/users');
const loginRoutes = require('./routes/api/login');
const groupsRoutes = require('./routes/api/groups');
const channelsRoutes = require('./routes/api/channels');

const app = express();
const PORT = 3000;

// middleware
app.use(express.json());    // parse JSON data
app.use(cors({ origin: 'http://localhost:4200' }))  // allow angular cors

// Running the server
async function startServer() {
    try {
        // connect to Mongo
        await connect();    
        // include CRUD routes for all 6 collections

        // app.use('/api/bans', bansRoutes);
        app.use('/api/login', loginRoutes);
        app.use('/api/users', usersRoutes);
        app.use('/api/groups', groupsRoutes);
        app.use('/api/channels', channelsRoutes);

        // app.use('/api/messages', messagesRoutes);
        // app.use('/api/memberships', membershipsRoutes);

        // TODO: Get all users ???     -- replace with Memberships?

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('Failed to start server', err);
    }
}
startServer();