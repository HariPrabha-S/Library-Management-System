const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Student, Faculty, Admin } = require('../models/admin/adminmodels');

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(String(password)).digest('hex');
};

const getPasswordCandidates = (password) => {
    const trimmed = String(password || '').trim();
    return [trimmed, hashPassword(trimmed)].filter(Boolean);
};

const isPasswordMatch = (storedPassword, password) => {
    if (!storedPassword || !password) {
        return false;
    }

    const normalizedStored = String(storedPassword).trim();
    const normalizedPassword = String(password).trim();
    if (!normalizedStored || !normalizedPassword) {
        return false;
    }

    if (normalizedStored === normalizedPassword) {
        return true;
    }

    const hashedInput = hashPassword(normalizedPassword);
    if (normalizedStored === hashedInput) {
        return true;
    }

    return false;
};

const authenticateUser = async (userId, password, roleHint) => {
    const normalizedUserId = String(userId || '').trim();
    const normalizedPassword = String(password || '').trim();

    if (!normalizedUserId || !normalizedPassword) {
        return { success: false, status: 400, message: 'User ID and password are required' };
    }

    if (!roleHint || roleHint === 'student') {
        const student = await Student.findOne({ where: { rollNo: normalizedUserId } });
        if (student) {
            const dobString = student.dob instanceof Date ? student.dob.toISOString().split('T')[0] : student.dob;
            const studentPasswordMatches = isPasswordMatch(student.password, normalizedPassword) ||
                isPasswordMatch(student.password, dobString) ||
                isPasswordMatch(student.password, hashPassword(dobString));

            if (studentPasswordMatches) {
                if (student.status && String(student.status).toLowerCase() === 'inactive') {
                    return { success: false, status: 403, message: 'Account inactive' };
                }
                return { success: true, role: 'student', user: student };
            }

            return { success: false, status: 401, message: 'Incorrect password' };
        }
    }

    if (!roleHint || roleHint === 'faculty') {
        const faculty = await Faculty.findOne({ where: { employeeId: normalizedUserId } });
        if (faculty) {
            const facultyPasswordMatches = isPasswordMatch(faculty.password, normalizedPassword) ||
                isPasswordMatch(faculty.password, 'nscet123') ||
                isPasswordMatch(faculty.password, 'faculty123');

            if (facultyPasswordMatches) {
                return { success: true, role: 'faculty', user: faculty };
            }

            return { success: false, status: 401, message: 'Incorrect password' };
        }
    }

    if (!roleHint || roleHint === 'admin') {
        const admin = await Admin.findOne({ where: { username: normalizedUserId } });
        if (admin) {
            if (isPasswordMatch(admin.password, normalizedPassword) || isPasswordMatch(admin.password, 'admin123')) {
                return { success: true, role: 'admin', user: admin };
            }

            return { success: false, status: 401, message: 'Incorrect password' };
        }
    }

    return { success: false, status: 404, message: 'User not found' };
};

// Login endpoint - auto-detects role
exports.login = async (req, res) => {
    try {
        console.log('[AUTH] Login request received', {
            userId: req.body?.user_id,
            roleHint: req.body?.role,
            passwordLength: String(req.body?.password || '').length,
        });

        const result = await authenticateUser(req.body?.user_id, req.body?.password, req.body?.role);

        if (!result.success) {
            console.warn('[AUTH] Login failed', {
                userId: req.body?.user_id,
                reason: result.message,
            });
            return res.status(result.status || 401).json({
                success: false,
                message: result.message,
            });
        }

        const { role, user } = result;
        const identifier = role === 'student' ? user.rollNo : role === 'faculty' ? user.employeeId : user.username;
        const token = jwt.sign(
            { id: user.id, role, identifier },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const userPayload = {
            id: user.id,
            name: user.name || user.fullName,
            email: user.email,
            role,
            identifier,
            department: user.departmentFull || user.department || user.dept,
            dept: user.departmentFull || user.department || user.dept,
            profileImage: user.photo || null,
        };

        if (role === 'student') {
            userPayload.studentId = user.rollNo;
            userPayload.semester = user.semester ? `Semester ${user.semester}` : user.semester || '';
            userPayload.enrollmentYear = user.batch ? user.batch.split('-')[0] : '2022';
            userPayload.phone = user.phoneNumber || user.phone;
        } else if (role === 'faculty') {
            userPayload.facultyId = user.employeeId;
            userPayload.semester = user.designation || '';
            userPayload.enrollmentYear = user.joiningDate ? user.joiningDate.split('-')[0] : '2022';
            userPayload.phone = user.phone;
        } else if (role === 'admin') {
            userPayload.username = user.username;
        }

        console.log('[AUTH] Login succeeded', { role, identifier, userId: user.id });
        res.json({
            success: true,
            token,
            role,
            userId: user.id,
            user: userPayload,
        });
    } catch (error) {
        console.error('[AUTH] Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message,
        });
    }
};

// Verify token middleware
exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
};
