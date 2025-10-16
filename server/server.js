require('dotenv').config();         // environment variables
const express = require('express'); // routing middleware
const { connect } = require('./mongo');
const cors = require('cors');
const { checkExpiredBans } = require('./services/banService');

const app = express();
const PORT = 3000;

// serve the public folder for assets
app.use('/public', express.static('public'));

// CRUD routes
const usersRoutes = require('./routes/api/users');
const loginRoutes = require('./routes/api/login');
const groupsRoutes = require('./routes/api/groups');
const channelsRoutes = require('./routes/api/channels');
const messagesRoutes = require('./routes/api/messages');
const bansRoutes = require('./routes/api/bans');

// middleware
app.use(express.json());    // parse JSON data
app.use(cors({ origin: 'http://localhost:4200' }))  // allow angular cors

// CRUD routes
app.use('/api/login', loginRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/bans', bansRoutes);


// Running the server
async function startServer() {
    try {
        // connect to Mongo
        await connect();    

        // automatically check to remove expired bans
        setInterval(() => {
            checkExpiredBans().catch(console.error);
        }, 5 * 60 * 1000 ); // every 5 minutes

        // start the server
        const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        // sockets.io
        const { initSocket } = require('./sockets');
        initSocket(server);
    } catch (err) {
        console.error('Failed to start server', err);
    }
}

// only start server when run directly (allow testing)
if (require.main === module) {
    startServer();
}
// export app for testing
module.exports = app;