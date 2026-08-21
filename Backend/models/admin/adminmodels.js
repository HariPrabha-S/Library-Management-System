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
    isbn: { type: DataTypes.STRING },
    title: { type: DataTypes.STRING, allowNull: false },
    subtitle: { type: DataTypes.STRING },
    author: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    publicationPlace: { type: DataTypes.STRING, field: 'publication_place' },
    edition: { type: DataTypes.STRING },
    indianEdition: { type: DataTypes.BOOLEAN, field: 'indian_edition', defaultValue: false },
    year: { type: DataTypes.INTEGER },
    departmentId: { type: DataTypes.INTEGER, field: 'department_id', allowNull: true },
    languageId: { type: DataTypes.INTEGER, field: 'language_id', allowNull: true },
    subjectId: { type: DataTypes.INTEGER, field: 'subject_id', allowNull: true },
    publisherId: { type: DataTypes.INTEGER, field: 'publisher_id', allowNull: true },
    vendorId: { type: DataTypes.INTEGER, field: 'vendor_id', allowNull: true },
    department: { type: DataTypes.STRING },
    subject: { type: DataTypes.STRING },
    language: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
    bindingType: { type: DataTypes.STRING, field: 'binding_type' },
    callNumber: { type: DataTypes.STRING, field: 'call_number' },
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    contentPages: { type: DataTypes.INTEGER, field: 'content_pages' },
    textPages: { type: DataTypes.INTEGER, field: 'text_pages' },
    vendor: { type: DataTypes.STRING },
    invoiceNumber: { type: DataTypes.STRING, field: 'invoice_number' },
    fundSource: { type: DataTypes.STRING, field: 'fund_source' },
    purchaseCost: { type: DataTypes.DECIMAL(10, 2), field: 'purchase_cost' },
    giftBook: { type: DataTypes.BOOLEAN, field: 'gift_book', defaultValue: false },
    giftNote: { type: DataTypes.TEXT, field: 'gift_note' },
    remarks: { type: DataTypes.TEXT },
    frontPagePhoto: { type: DataTypes.STRING, field: 'front_page_photo' },
    contentPagePhoto: { type: DataTypes.STRING, field: 'content_page_photo' },
    isDead: { type: DataTypes.BOOLEAN, field: 'is_dead', defaultValue: false }
}, {
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// 2b. BookCopy Model
const BookCopy = sequelize.define('BookCopy', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'copy_id' },
    bookId: { type: DataTypes.INTEGER, field: 'book_id', allowNull: false },
    accessionNo: { type: DataTypes.STRING, field: 'accession_no', unique: true, allowNull: false },
    shelfLocation: { type: DataTypes.STRING, field: 'shelf_location' },
    issueType: { type: DataTypes.ENUM('Issuable', 'Reference', 'Overnight'), field: 'issue_type', defaultValue: 'Issuable' },
    status: { type: DataTypes.ENUM('Available', 'Issued', 'Reserved', 'Lost', 'Damaged'), defaultValue: 'Available' },
    purchaseDate: { type: DataTypes.DATEONLY, field: 'purchase_date' },
    timesIssued: { type: DataTypes.INTEGER, field: 'times_issued', defaultValue: 0 }
}, {
    tableName: 'book_copies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// 3. Student Model
const Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rollNo: { type: DataTypes.STRING, field: 'register_no', unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    photo: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true, allowNull: true },
    department: { type: DataTypes.STRING(10) },
    departmentFull: { type: DataTypes.STRING(100), field: 'department_full' },
    year: { type: DataTypes.INTEGER },
    batch: { type: DataTypes.STRING },
    gender: { type: DataTypes.ENUM('Male', 'Female'), defaultValue: 'Female' },
    category: { type: DataTypes.ENUM('UG Student', 'PG Student'), field: 'category', defaultValue: 'UG Student' },
    dob: { type: DataTypes.DATEONLY },
    phoneNumber: { type: DataTypes.STRING(15), field: 'phone' },
    semester: { type: DataTypes.INTEGER, defaultValue: 1 },
    admissionDate: { type: DataTypes.DATEONLY, field: 'admission_date' },
    studentId: { type: DataTypes.STRING, field: 'student_id', unique: true },
    status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
    password: { type: DataTypes.STRING, allowNull: true },
    isFirstLogin: { type: DataTypes.BOOLEAN, field: 'is_first_login', defaultValue: true },
    isLocked: { type: DataTypes.BOOLEAN, field: 'is_locked', defaultValue: false }
}, {
    tableName: 'students',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// 4. Faculty Model
const Faculty = sequelize.define('Faculty', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employeeId: { type: DataTypes.STRING, field: 'faculty_id', unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    photo: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    department: { type: DataTypes.STRING },
    departmentFull: { type: DataTypes.STRING(100), field: 'department_full' },
    designation: { type: DataTypes.STRING },
    qualification: { type: DataTypes.STRING(20) },
    joiningDate: { type: DataTypes.DATEONLY, field: 'joining_date' },
    experienceYears: { type: DataTypes.INTEGER, field: 'experience_years' },
    specialization: { type: DataTypes.STRING(100) },
    phone: { type: DataTypes.STRING(15) },
    gender: { type: DataTypes.ENUM('Male', 'Female'), defaultValue: 'Male' },
    password: { type: DataTypes.STRING, allowNull: true },
    isFirstLogin: { type: DataTypes.BOOLEAN, field: 'is_first_login', defaultValue: true }
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
    copyId: { type: DataTypes.INTEGER, field: 'copy_id', allowNull: true },
    issueDate: { type: DataTypes.DATEONLY, field: 'issue_date', allowNull: false },
    returnDate: { type: DataTypes.DATEONLY, field: 'return_date', allowNull: false },
    actualReturnDate: { type: DataTypes.DATEONLY, field: 'actual_return_date' },
    status: { type: DataTypes.ENUM('Issued', 'Returned', 'Overdue', 'Lost'), defaultValue: 'Issued' },
    renewalDate: { type: DataTypes.DATEONLY, field: 'renewal_date' },
    renewalCount: { type: DataTypes.INTEGER, field: 'renewal_count', defaultValue: 0 }
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
    status: { type: DataTypes.ENUM('Pending', 'Paid'), defaultValue: 'Pending' }
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

// 9. Digital Resource Model (DigitalResources table)
const DigitalResource = sequelize.define('DigitalResource', {
    digitalResourceId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'digital_resource_id' },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    resourceType: { type: DataTypes.ENUM('Journal', 'E-Book', 'Research Paper', 'Video Lecture', 'Other'), defaultValue: 'Research Paper', field: 'resource_type' },
    fileUrl: { type: DataTypes.STRING, field: 'file_url' },
    filePath: { type: DataTypes.STRING, field: 'file_path' },
    uploadedByFacultyId: { type: DataTypes.INTEGER, field: 'uploaded_by_faculty_id' },
    approvalStatus: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending', field: 'approval_status' },
    approvedByAdminId: { type: DataTypes.INTEGER, field: 'approved_by_admin_id' }
}, {
    tableName: 'DigitalResources',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// 10. Reservation Model
const Reservation = sequelize.define('Reservation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'reservation_id' },
    memberId: { type: DataTypes.INTEGER, field: 'member_id', allowNull: false },
    memberType: { type: DataTypes.ENUM('Student', 'Faculty'), field: 'member_type', allowNull: false },
    bookId: { type: DataTypes.INTEGER, field: 'book_id', allowNull: false },
    copyId: { type: DataTypes.INTEGER, field: 'book_copy_id', allowNull: true },
    queuePosition: { type: DataTypes.INTEGER, field: 'queue_position', allowNull: false },
    reservationDate: { type: DataTypes.DATE, field: 'reservation_date', defaultValue: DataTypes.NOW },
    pickupExpiry: { type: DataTypes.DATE, field: 'pickup_expiry', allowNull: true },
    status: { type: DataTypes.ENUM('Waiting', 'Ready for Pickup', 'Completed', 'Expired', 'Cancelled'), defaultValue: 'Waiting' },
    assignedDate: { type: DataTypes.DATE, field: 'assigned_date', allowNull: true },
    completedDate: { type: DataTypes.DATE, field: 'completed_date', allowNull: true },
    cancelledDate: { type: DataTypes.DATE, field: 'cancelled_date', allowNull: true }
}, {
    tableName: 'book_reservations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// 11. Notification Model
const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    memberId: { type: DataTypes.INTEGER, field: 'member_id', allowNull: false },
    memberType: { type: DataTypes.ENUM('Student', 'Faculty'), field: 'member_type', allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING(50), defaultValue: 'GENERAL' },
    isRead: { type: DataTypes.BOOLEAN, field: 'is_read', defaultValue: false }
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

const masterDataOptions = (tableName, fieldName, type = DataTypes.STRING) => ({
    tableName,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Department = sequelize.define('Department', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true }
}, masterDataOptions('departments'));
const Language = sequelize.define('Language', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true }
}, masterDataOptions('languages'));
const Vendor = sequelize.define('Vendor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true }
}, masterDataOptions('vendors'));
const Subject = sequelize.define('Subject', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true }
}, masterDataOptions('subjects'));
const Holiday = sequelize.define('Holiday', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false, unique: true }
}, masterDataOptions('holidays'));
const Publisher = sequelize.define('Publisher', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true }
}, masterDataOptions('publishers'));

// Associations
Department.hasMany(Book, { foreignKey: 'department_id', as: 'books', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Book.belongsTo(Department, { foreignKey: 'department_id', as: 'departmentEntry' });
Language.hasMany(Book, { foreignKey: 'language_id', as: 'books', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Book.belongsTo(Language, { foreignKey: 'language_id', as: 'languageEntry' });
Subject.hasMany(Book, { foreignKey: 'subject_id', as: 'books', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Book.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subjectEntry' });
Publisher.hasMany(Book, { foreignKey: 'publisher_id', as: 'books', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Book.belongsTo(Publisher, { foreignKey: 'publisher_id', as: 'publisherEntry' });
Vendor.hasMany(Book, { foreignKey: 'vendor_id', as: 'books', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Book.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendorEntry' });
Book.hasMany(BookCopy, { foreignKey: 'book_id', as: 'copies', onDelete: 'CASCADE' });
BookCopy.belongsTo(Book, { foreignKey: 'book_id' });

Book.hasMany(Issue, { foreignKey: 'book_id' });
Issue.belongsTo(Book, { foreignKey: 'book_id' });
Student.hasMany(Issue, { foreignKey: 'student_id' });
Issue.belongsTo(Student, { foreignKey: 'student_id' });
Faculty.hasMany(Issue, { foreignKey: 'faculty_id' });
Issue.belongsTo(Faculty, { foreignKey: 'faculty_id' });

BookCopy.hasMany(Issue, { foreignKey: 'copy_id' });
Issue.belongsTo(BookCopy, { foreignKey: 'copy_id' });

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

// Associations for DigitalResource
Faculty.hasMany(DigitalResource, { foreignKey: 'uploaded_by_faculty_id' });
DigitalResource.belongsTo(Faculty, { foreignKey: 'uploaded_by_faculty_id', as: 'uploader' });

Admin.hasMany(DigitalResource, { foreignKey: 'approved_by_admin_id' });
DigitalResource.belongsTo(Admin, { foreignKey: 'approved_by_admin_id', as: 'approver' });

// Associations for Reservations & Notifications
Book.hasMany(Reservation, { foreignKey: 'book_id', as: 'reservations' });
Reservation.belongsTo(Book, { foreignKey: 'book_id' });

BookCopy.hasMany(Reservation, { foreignKey: 'book_copy_id' });
Reservation.belongsTo(BookCopy, { foreignKey: 'book_copy_id' });

Student.hasMany(Reservation, { foreignKey: 'member_id', constraints: false, scope: { member_type: 'Student' } });
Reservation.belongsTo(Student, { foreignKey: 'member_id', constraints: false });

Faculty.hasMany(Reservation, { foreignKey: 'member_id', constraints: false, scope: { member_type: 'Faculty' } });
Reservation.belongsTo(Faculty, { foreignKey: 'member_id', constraints: false });

Student.hasMany(Notification, { foreignKey: 'member_id', constraints: false, scope: { member_type: 'Student' } });
Notification.belongsTo(Student, { foreignKey: 'member_id', constraints: false });

Faculty.hasMany(Notification, { foreignKey: 'member_id', constraints: false, scope: { member_type: 'Faculty' } });
Notification.belongsTo(Faculty, { foreignKey: 'member_id', constraints: false });

module.exports = {
    Admin,
    Book,
    BookCopy,
    Student,
    Faculty,
    Issue,
    Fine,
    Attendance,
    Request,
    Reservation,
    Notification,
    Department,
    Language,
    Vendor,
    Subject,
    Holiday,
    Publisher,
    Resource: DigitalResource,
    sequelize,
};
