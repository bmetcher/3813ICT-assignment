const express = require('express'); // routing middleware
const { connect } = require('./mongo');
const cors = require('cors');
const { checkExpiredBans } = require('./services/banService');

// CRUD routes
const usersRoutes = require('./routes/api/users');
const loginRoutes = require('./routes/api/login');
const groupsRoutes = require('./routes/api/groups');
const channelsRoutes = require('./routes/api/channels');
const messagesRoutes = require('./routes/api/messages');
const bansRoutes = require('./routes/api/bans');

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
        // CRUD routes
        app.use('/api/login', loginRoutes);
        app.use('/api/users', usersRoutes);
        app.use('/api/groups', groupsRoutes);
        app.use('/api/channels', channelsRoutes);
        app.use('/api/messages', messagesRoutes);
        app.use('/api/bans', bansRoutes);

        // automatically check to remove expired bans
        setInterval(() => {
            checkExpiredBans().catch(console.error);
        }, 5 * 60 * 1000 ); // every 5 minutes

        // start the server
        const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        // sockets.io
        const { initSocket } = require('./sockets');
        const io = initSocket(server);
    } catch (err) {
        console.error('Failed to start server', err);
    }
}
startServer();