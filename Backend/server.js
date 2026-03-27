require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/adminDb');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Connect to Database, then start server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to the database. Server shutting down.', err);
    process.exit(1);
});
