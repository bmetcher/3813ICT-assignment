const express = require('express'); // routing middleware
const cors = require('cors');
const authRoutes = require('./routes/api/authRoutes');
const dataRoutes = require('./routes/api/dataRoutes');
const adminRoutes = require('./routes/api/adminRoutes');

const app = express();
const PORT = 3000;

// middleware
app.use(express.json());    // parse JSON data
app.use(cors({ origin: 'http://localhost:4200' }))  // allow angular cors

// inject express for single 'auth' endpoint
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/admin', adminRoutes);

// run the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});