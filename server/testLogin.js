const request = require('supertest');
const app = require('./server'); // your Express app
const { connect } = require('./mongo');

(async () => {
    try {
        await connect('mongodb://192.168.10.100:27017', 'chat-app');

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'super@admin.com', password: 'superpassword' });

        console.log('Login response:', res.body);
        } catch (err) {
        console.error(err);
    }
})();