const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();
const { connectDB } = require('../config/db');

const app = express();

// Database connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploaded profile photos as static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `profile_${Date.now()}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

// Profile photo upload endpoint
const { authenticateToken } = require('../middleware/auth');
const { Student, Faculty } = require('../models/admin/adminmodels');
app.post('/api/profile/upload-photo', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
        if (req.user.role === 'student') {
            return res.status(403).json({ success: false, message: 'Access Denied: Students cannot modify their profile. Contact the administrator for any corrections.' });
        }
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const { identifier } = req.body;
        const photoUrl = `/uploads/profiles/${req.file.filename}`;

        // Update student or faculty
        const student = await Student.findOne({ where: { rollNo: identifier } });
        if (student) {
            student.photo = photoUrl;
            await student.save();
            return res.json({ success: true, photoUrl });
        }

        const faculty = await Faculty.findOne({ where: { employeeId: identifier } });
        if (faculty) {
            faculty.photo = photoUrl;
            await faculty.save();
            return res.json({ success: true, photoUrl });
        }

        return res.status(404).json({ success: false, message: 'User not found' });
    } catch (error) {
        console.error('Photo upload error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
});

// Handle invalid JSON payloads from body-parser
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Invalid JSON payload:', err.message);
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
    next(err);
});

// Auth Routes (Login)
const authRoutes = require('../routes/authRoutes');
app.use('/api/auth', authRoutes);

// Admin Routes
const adminRoutes = require('../routes/admin/adminroutes');
app.use('/api/admin', adminRoutes);

// Public student/faculty routes
const publicRoutes = require('../routes/publicRoutes');
app.use('/api', publicRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('Library Management System Backend is running...');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
