const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/adminDb');

// 1. Book Model
const Book = sequelize.define('Book', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING, allowNull: false },
    isbn: { type: DataTypes.STRING },
    accessionNo: { type: DataTypes.STRING, unique: true, allowNull: false },
    department: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    subject: { type: DataTypes.STRING },
    issueType: { type: DataTypes.ENUM('Stack', 'Reference'), defaultValue: 'Stack' },
    availableCopies: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalCopies: { type: DataTypes.INTEGER, defaultValue: 0 },
    price: { type: DataTypes.FLOAT },
    purchaseDate: { type: DataTypes.DATE }
}, {
    timestamps: true,
});

// 2. Student Model
const Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    rollNo: { type: DataTypes.STRING, unique: true, allowNull: false },
    department: { type: DataTypes.STRING },
    year: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    phone: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING, allowNull: false },
    totalBooks: { type: DataTypes.INTEGER, defaultValue: 0 },
    issuedBooks: { type: DataTypes.INTEGER, defaultValue: 0 },
    returnedBooks: { type: DataTypes.INTEGER, defaultValue: 0 },
    fine: { type: DataTypes.FLOAT, defaultValue: 0 }
}, {
    timestamps: true,
});

// 3. Faculty Model
const Faculty = sequelize.define('Faculty', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    facultyId: { type: DataTypes.STRING, unique: true, allowNull: false },
    employeeId: { type: DataTypes.STRING, unique: true },
    department: { type: DataTypes.STRING },
    designation: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    phone: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING, allowNull: false },
    totalBooks: { type: DataTypes.INTEGER, defaultValue: 0 },
    issuedBooks: { type: DataTypes.INTEGER, defaultValue: 0 },
    returnedBooks: { type: DataTypes.INTEGER, defaultValue: 0 },
    fine: { type: DataTypes.FLOAT, defaultValue: 0 }
}, {
    timestamps: true,
});

// 4. Issue Model
const Issue = sequelize.define('Issue', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    borrowerId: { type: DataTypes.INTEGER, allowNull: false }, // Store studentId or facultyId
    borrowerType: { type: DataTypes.ENUM('Student', 'Faculty'), allowNull: false },
    issueDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    dueDate: { type: DataTypes.DATE, allowNull: false },
    returnDate: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('Issued', 'Returned', 'Overdue'), defaultValue: 'Issued' }
}, {
    timestamps: true,
});

// Issue associations
Book.hasMany(Issue, { foreignKey: 'bookId' });
Issue.belongsTo(Book, { foreignKey: 'bookId' });

// 5. Fine Model
const Fine = sequelize.define('Fine', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    borrowerId: { type: DataTypes.INTEGER, allowNull: false },
    borrowerType: { type: DataTypes.ENUM('Student', 'Faculty'), allowNull: false },
    reason: { type: DataTypes.STRING },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('Paid', 'Unpaid'), defaultValue: 'Unpaid' }
}, {
    timestamps: true,
});

Issue.hasMany(Fine, { foreignKey: 'issueId' });
Fine.belongsTo(Issue, { foreignKey: 'issueId' });

// 6. Attendance Model
const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rollNo: { type: DataTypes.STRING, allowNull: false }, // can be student's rollNo or faculty's ID
    name: { type: DataTypes.STRING },
    type: { type: DataTypes.ENUM('IN', 'OUT'), allowNull: false },
    time: { type: DataTypes.STRING }, // "HH:MM AM/PM"
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, {
    timestamps: true,
});

// Associations for Attendance
Student.hasMany(Attendance, { foreignKey: 'studentId' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

module.exports = {
    Book,
    Student,
    Faculty,
    Issue,
    Fine,
    Attendance,
};
