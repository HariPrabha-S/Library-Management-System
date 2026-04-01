const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

// 1. Admin Model
const Admin = sequelize.define('Admin', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    fullName: { type: DataTypes.STRING, field: 'full_name' }
}, {
    tableName: 'admins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// 2. Book Model
const Book = sequelize.define('Book', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accessionNo: { type: DataTypes.STRING, field: 'accession_no', unique: true, allowNull: false },
    isbn: { type: DataTypes.STRING },
    title: { type: DataTypes.STRING, allowNull: false },
    subtitle: { type: DataTypes.STRING },
    author: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    edition: { type: DataTypes.STRING },
    year: { type: DataTypes.INTEGER },
    department: { type: DataTypes.STRING },
    subject: { type: DataTypes.STRING },
    language: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
    callNumber: { type: DataTypes.STRING, field: 'call_number' },
    shelfLocation: { type: DataTypes.STRING, field: 'shelf_location' },
    issueType: { type: DataTypes.ENUM('Issuable', 'Reference', 'Overnight'), field: 'issue_type', defaultValue: 'Issuable' },
    totalCopies: { type: DataTypes.INTEGER, field: 'total_copies', defaultValue: 1 },
    availableCopies: { type: DataTypes.INTEGER, field: 'available_copies', defaultValue: 1 },
    timesIssued: { type: DataTypes.INTEGER, field: 'times_issued', defaultValue: 0 }
}, {
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// 3. Student Model
const Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rollNo: { type: DataTypes.STRING, field: 'roll_no', unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    department: { type: DataTypes.STRING },
    year: { type: DataTypes.ENUM('1', '2', '3', '4') },
    password: { type: DataTypes.STRING, defaultValue: 'student123', allowNull: false }
}, {
    tableName: 'students',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// 4. Faculty Model
const Faculty = sequelize.define('Faculty', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employeeId: { type: DataTypes.STRING, field: 'employee_id', unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    department: { type: DataTypes.STRING },
    designation: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING, defaultValue: 'faculty123', allowNull: false }
}, {
    tableName: 'faculties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// 5. Issue Model (Transction)
const Issue = sequelize.define('Issue', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.INTEGER, field: 'student_id' },
    facultyId: { type: DataTypes.INTEGER, field: 'faculty_id' },
    bookId: { type: DataTypes.INTEGER, field: 'book_id', allowNull: false },
    issueDate: { type: DataTypes.DATEONLY, field: 'issue_date', allowNull: false },
    returnDate: { type: DataTypes.DATEONLY, field: 'return_date', allowNull: false },
    actualReturnDate: { type: DataTypes.DATEONLY, field: 'actual_return_date' },
    status: { type: DataTypes.ENUM('Issued', 'Returned', 'Overdue'), defaultValue: 'Issued' }
}, {
    tableName: 'issued_books',
    timestamps: false
});

// 6. Fine Model
const Fine = sequelize.define('Fine', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userType: { type: DataTypes.ENUM('Student', 'Faculty'), field: 'user_type', allowNull: false },
    studentId: { type: DataTypes.INTEGER, field: 'student_id' },
    facultyId: { type: DataTypes.INTEGER, field: 'faculty_id' },
    issueId: { type: DataTypes.INTEGER, field: 'issue_id' },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    reason: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('Unpaid', 'Paid'), defaultValue: 'Unpaid' }
}, {
    tableName: 'fines',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// 7. Attendance Model
const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.INTEGER, field: 'student_id', allowNull: false },
    type: { type: DataTypes.ENUM('IN', 'OUT'), allowNull: false },
    scanTime: { type: DataTypes.DATE, field: 'scan_time', defaultValue: DataTypes.NOW }
}, {
    tableName: 'attendance',
    timestamps: false
});

// 8. Request Model
const Request = sequelize.define('Request', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bookId: { type: DataTypes.INTEGER, field: 'book_id', allowNull: false },
    studentId: { type: DataTypes.INTEGER, field: 'student_id' },
    facultyId: { type: DataTypes.INTEGER, field: 'faculty_id' },
    requestDate: { type: DataTypes.DATE, field: 'request_date', defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending' }
}, {
    tableName: 'book_requests',
    timestamps: false
});

// Associations
Book.hasMany(Issue, { foreignKey: 'book_id' });
Issue.belongsTo(Book, { foreignKey: 'book_id' });
Student.hasMany(Issue, { foreignKey: 'student_id' });
Issue.belongsTo(Student, { foreignKey: 'student_id' });
Faculty.hasMany(Issue, { foreignKey: 'faculty_id' });
Issue.belongsTo(Faculty, { foreignKey: 'faculty_id' });

Issue.hasMany(Fine, { foreignKey: 'issue_id' });
Fine.belongsTo(Issue, { foreignKey: 'issue_id' });
Student.hasMany(Fine, { foreignKey: 'student_id' });
Fine.belongsTo(Student, { foreignKey: 'student_id' });
Faculty.hasMany(Fine, { foreignKey: 'faculty_id' });
Fine.belongsTo(Faculty, { foreignKey: 'faculty_id' });

Student.hasMany(Attendance, { foreignKey: 'student_id' });
Attendance.belongsTo(Student, { foreignKey: 'student_id' });

Book.hasMany(Request, { foreignKey: 'book_id' });
Request.belongsTo(Book, { foreignKey: 'book_id' });
Student.hasMany(Request, { foreignKey: 'student_id' });
Request.belongsTo(Student, { foreignKey: 'student_id' });
Faculty.hasMany(Request, { foreignKey: 'faculty_id' });
Request.belongsTo(Faculty, { foreignKey: 'faculty_id' });

module.exports = {
    Admin,
    Book,
    Student,
    Faculty,
    Issue,
    Fine,
    Attendance,
    Request,
    sequelize,
};
