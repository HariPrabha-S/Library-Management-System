/**
 * Password Initialization Script
 * 
 * This script initializes passwords for students, faculty, and admins in the LMS database.
 * 
 * Password Rules:
 * - Students: SHA256 hash of their DOB (YYYY-MM-DD format)
 * - Faculty: SHA256 hash of 'nscet123' (same for all faculty)
 * - Admins: SHA256 hash of custom password
 */

const crypto = require('crypto');
const mysql = require('mysql2/promise');
require('dotenv').config();

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

async function initializePasswords() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('Connected to database');

        // Update student passwords (DOB-based)
        console.log('\n📚 Setting student passwords based on DOB...');
                const [students] = await connection.query(
            'SELECT id, dob FROM students WHERE password IS NULL OR password = "" OR LENGTH(password) != 64'
        );
        
        let studentCount = 0;
        for (const student of students) {
            if (!student.dob) continue;
            const dobString = student.dob instanceof Date ? student.dob.toISOString().split('T')[0] : student.dob.toString();
            const hashedDob = hashPassword(dobString);
            await connection.query(
                'UPDATE students SET password = ?, is_first_login = TRUE WHERE id = ?',
                [hashedDob, student.id]
            );
            studentCount++;
        }
        console.log(`✅ Updated ${studentCount} student(s) with DOB-based passwords`);

        // Update faculty passwords (nscet123)
        console.log('\n👨‍🏫 Setting faculty passwords to nscet123...');
        const hashedFacultyPassword = hashPassword('nscet123');
        const [facultyResult] = await connection.query(
            'UPDATE faculties SET password = ?, is_first_login = TRUE WHERE password IS NULL OR password = "" OR LENGTH(password) != 64',
            [hashedFacultyPassword]
        );
        console.log(`✅ Updated faculty members with nscet123 password`);

        // Check/create admin user
        console.log('\n🔐 Setting up admin user...');
        const adminUsername = 'admin';
        const adminPassword = 'admin123'; // Change this to your desired admin password
        const hashedAdminPassword = hashPassword(adminPassword);
        
        const admins = await connection.query(
            'SELECT id FROM admins WHERE username = ?',
            [adminUsername]
        );

        if (admins[0].length === 0) {
            await connection.query(
                'INSERT INTO admins (username, password, email, full_name, created_at) VALUES (?, ?, ?, ?, ?)',
                [adminUsername, hashedAdminPassword, 'admin@lms.com', 'System Administrator', new Date()]
            );
            console.log(`✅ Created admin user: ${adminUsername} with password: ${adminPassword}`);
        } else {
            await connection.query(
                'UPDATE admins SET password = ? WHERE username = ?',
                [hashedAdminPassword, adminUsername]
            );
            console.log(`✅ Updated admin password for user: ${adminUsername}`);
        }

        console.log('\n✨ Password initialization complete!');
        console.log('\n📝 Login Credentials:');
        console.log('   Students: Register No + DOB (YYYY-MM-DD)');
        console.log('   Faculty: Faculty ID + nscet123');
        console.log('   Admin: admin + admin123');

        await connection.end();
    } catch (error) {
        console.error('Error initializing passwords:', error);
        process.exit(1);
    }
}

// Run the script
initializePasswords();
