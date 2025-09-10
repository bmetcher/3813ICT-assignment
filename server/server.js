const express = require('express'); // routing middleware
const cors = require('cors');
const authRoutes = require('./routes/api/auth');

const app = express();
const PORT = 3000;

// middleware
app.use(express.json());    // parse JSON data
app.use(cors({ origin: 'http://localhost:4200' }))  // allow angular cors

// inject express for single 'auth' endpoint
authRoutes(app);

// run the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});