const express = require('express');
const router = express.Router();
const { Book, Student, Faculty, Issue, Fine, Request, Resource, Subject, sequelize } = require('../models/admin/adminmodels');
const { Op } = require('sequelize');
const resourceController = require('../controllers/resourceController');

// Helper to check if returnDate is close to due (within 2 days)
const isCloseToDue = (returnDateStr) => {
    if (!returnDateStr) return false;
    const returnDate = new Date(returnDateStr);
    const today = new Date();
    returnDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = returnDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
};
const { authenticateToken, requireRole } = require('../middleware/auth');

const verifyUserMatch = (req, res, next) => {
    if (req.user.role === 'admin') return next();
    if (req.params.identifier !== req.user.identifier) {
        return res.status(403).json({ success: false, message: 'Access Denied: You cannot view another user\'s data.' });
    }
    next();
};

const verifyBorrowerMatch = (req, res, next) => {
    if (req.user.role === 'admin') return next();
    const borrowerId = req.body.studentId || req.body.facultyId;
    if (borrowerId !== req.user.identifier) {
        return res.status(403).json({ success: false, message: 'Access Denied: You can only submit requests for yourself.' });
    }
    next();
};

const verifySelfUpdateMatch = (req, res, next) => {
    if (req.user.role === 'admin') return next();
    if (req.user.role === 'student') {
        return res.status(403).json({ success: false, message: 'Access Denied: Students cannot modify their profile. Contact the administrator for any corrections.' });
    }
    const targetId = req.body.studentId;
    if (targetId !== req.user.identifier) {
        return res.status(403).json({ success: false, message: 'Access Denied: You can only update your own profile.' });
    }
    next();
};

// Protect all public routes
router.use(authenticateToken);

// 1. Search books
router.get('/books/search', async (req, res) => {
    try {
        const { term, by, subject, availability } = req.query;
        let whereClause = {};

        if (term) {
            const lowerTerm = term.toLowerCase();
            if (by === 'title') {
                whereClause.title = { [Op.like]: `%${lowerTerm}%` };
            } else if (by === 'author') {
                whereClause.author = { [Op.like]: `%${lowerTerm}%` };
            } else if (by === 'isbn') {
                whereClause.isbn = { [Op.like]: `%${lowerTerm}%` };
            } else {
                whereClause[Op.or] = [
                    { title: { [Op.like]: `%${lowerTerm}%` } },
                    { author: { [Op.like]: `%${lowerTerm}%` } }
                ];
            }
        }

        if (subject && subject !== 'All') {
            whereClause.subjectId = subject;
        }

        const books = await Book.findAll({
            where: {
                ...whereClause,
                isDead: false
            },
            include: [
                {
                    model: Subject,
                    as: 'subjectEntry',
                    attributes: ['name']
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id
                        )`),
                        'totalCopies'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM issued_books AS issues
                            WHERE issues.book_id = Book.id AND issues.status IN ('Issued', 'Overdue')
                        )`),
                        'activeIssuedCopies'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT shelf_location
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id
                            LIMIT 1
                        )`),
                        'shelfLocation'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT MIN(accession_no)
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id
                        )`),
                        'minAccession'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT MAX(accession_no)
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id
                        )`),
                        'maxAccession'
                    ]
                ]
            }
        });

        // Map backend properties to match the frontend expectations
        const mappedBooks = books.map(b => {
            const data = b.toJSON();
            const totalCopiesCount = parseInt(data.totalCopies || 0, 10);
            const activeIssuedCopiesCount = parseInt(data.activeIssuedCopies || 0, 10);
            let availableCopiesCount = totalCopiesCount - activeIssuedCopiesCount;
            if (availableCopiesCount < 0) availableCopiesCount = 0;
            
            const minAcc = data.minAccession;
            const maxAcc = data.maxAccession;
            let range = "-";
            if (minAcc) {
                range = (minAcc === maxAcc) ? minAcc : `${minAcc} - ${maxAcc}`;
            }

            return {
                id: b.id,
                title: b.title,
                author: b.author,
                isbn: b.isbn,
                subject: data.subjectEntry ? data.subjectEntry.name : b.subject,
                category: b.category,
                available: availableCopiesCount > 0,
                availableCopies: availableCopiesCount,
                accessionNumbers: range,
                library: 'Central',
                location: data.shelfLocation || 'Section A, Shelf 1',
                callNumber: b.callNumber
            };
        });

        // Filter availability on client-mapped value if requested
        let finalBooks = mappedBooks;
        if (availability && availability !== 'All') {
            const expectAvailable = availability === 'AvailableOnly' || availability === 'Available';
            finalBooks = mappedBooks.filter(b => b.available === expectAvailable);
        }

        return res.json(finalBooks);
    } catch (error) {
        console.error('Public book search error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
    try {
        const subjects = await Subject.findAll({
            order: [['name', 'ASC']]
        });
        return res.json(subjects);
    } catch (error) {
        console.error('Fetch subjects error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 2. Department book list
router.get('/books/department', async (req, res) => {
    try {
        const { dept } = req.query;
        const whereClause = {};

        if (dept) {
            const normalizedDept = dept.toLowerCase();
            whereClause[Op.or] = [
                { department: { [Op.like]: `%${normalizedDept}%` } },
                { departmentFull: { [Op.like]: `%${normalizedDept}%` } },
            ];
        }

        const books = await Book.findAll({
            where: {
                ...whereClause,
                isDead: false
            },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id
                        )`),
                        'totalCopies'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM issued_books AS issues
                            WHERE issues.book_id = Book.id AND issues.status IN ('Issued', 'Overdue')
                        )`),
                        'activeIssuedCopies'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT shelf_location
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id
                            LIMIT 1
                        )`),
                        'shelfLocation'
                    ]
                ]
            }
        });

        const mappedBooks = books.map(b => {
            const data = b.toJSON();
            const totalCopiesCount = parseInt(data.totalCopies || 0, 10);
            const activeIssuedCopiesCount = parseInt(data.activeIssuedCopies || 0, 10);
            let availableCopiesCount = totalCopiesCount - activeIssuedCopiesCount;
            if (availableCopiesCount < 0) availableCopiesCount = 0;
            return {
                id: b.id,
                title: b.title,
                author: b.author,
                isbn: b.isbn,
                subject: b.subject,
                semester: b.semester || 'All',
                category: b.category,
                available: availableCopiesCount > 0,
                library: 'Department',
                location: data.shelfLocation || 'Department Stack',
                status: availableCopiesCount > 0 ? 'Available' : 'Out of Stock'
            };
        });

        return res.json(mappedBooks);
    } catch (error) {
        console.error('Department book list error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 3. Submit a book request
router.post('/books/request', verifyBorrowerMatch, async (req, res) => {
    try {
        const { studentId, facultyId, bookId, library } = req.body;

        if (!bookId) {
            return res.status(400).json({ success: false, message: 'Book ID is required' });
        }

        let dbStudent = null;
        let dbFaculty = null;

        if (studentId) {
            dbStudent = await Student.findOne({ where: { rollNo: studentId } });
            if (!dbStudent) {
                return res.status(404).json({ success: false, message: `Student roll number ${studentId} not found` });
            }
        } else if (facultyId) {
            dbFaculty = await Faculty.findOne({ where: { employeeId: facultyId } });
            if (!dbFaculty) {
                return res.status(404).json({ success: false, message: `Faculty ID ${facultyId} not found` });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Student Roll Number or Faculty ID is required' });
        }

        const book = await Book.findByPk(bookId);
        if (!book || book.isDead) {
            return res.status(404).json({ success: false, message: 'Book not found or is unavailable' });
        }

        // Create the request
        const newRequest = await Request.create({
            bookId: book.id,
            studentId: dbStudent ? dbStudent.id : null,
            facultyId: dbFaculty ? dbFaculty.id : null,
            requestDate: new Date(),
            status: 'Pending'
        });

        return res.json({ success: true, message: 'Book request submitted successfully', request: newRequest });
    } catch (error) {
        console.error('Public request error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 3. Get borrower's reservation requests
router.get('/requests/:identifier', verifyUserMatch, async (req, res) => {
    try {
        const { identifier } = req.params;

        // Try student first, then faculty
        const student = await Student.findOne({ where: { rollNo: identifier } });
        const faculty = !student ? await Faculty.findOne({ where: { employeeId: identifier } }) : null;

        if (!student && !faculty) {
            return res.status(404).json({ success: false, message: 'Borrower not found' });
        }

        const whereClause = student 
            ? { studentId: student.id } 
            : { facultyId: faculty.id };

        const requests = await Request.findAll({
            where: whereClause,
            include: [{
                model: Book,
                where: { isDead: false }
            }],
            order: [['requestDate', 'DESC']]
        });

        const formatted = requests.map(r => ({
            id: r.id,
            bookName: r.Book ? r.Book.title : 'Unknown Book',
            library: 'Main',
            requestDate: r.requestDate ? new Date(r.requestDate).toISOString().split('T')[0] : '',
            status: r.status
        }));

        return res.json(formatted);
    } catch (error) {
        console.error('Public get requests error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 4. Get student/faculty dashboard statistics
router.get('/dashboard/:identifier', verifyUserMatch, async (req, res) => {
    try {
        const { identifier } = req.params;

        const student = await Student.findOne({ where: { rollNo: identifier } });
        const faculty = !student ? await Faculty.findOne({ where: { employeeId: identifier } }) : null;

        if (!student && !faculty) {
            return res.status(404).json({ success: false, message: 'Borrower not found' });
        }

        const borrowerIdFilter = student 
            ? { studentId: student.id } 
            : { facultyId: faculty.id };

        // 1. Get issues
        const issues = await Issue.findAll({
            where: {
                ...borrowerIdFilter
            }
        });

        const activeIssues = issues.filter(i => i.status !== 'Returned');
        const totalIssued = activeIssues.length;
        const dueSoon = activeIssues.filter(i => i.status === 'Issued' && isCloseToDue(i.returnDate)).length;

        // 2. Get fines
        const fines = await Fine.findAll({
            where: {
                ...borrowerIdFilter,
                status: 'Pending'
            }
        });
        const totalFine = fines.reduce((sum, f) => sum + parseFloat(f.amount), 0);

        // 3. Get pending requests
        const requests = await Request.findAll({
            where: {
                ...borrowerIdFilter,
                status: 'Pending'
            }
        });
        const pendingReqs = requests.length;

        return res.json({
            name: student ? student.name : faculty.name,
            department: student ? (student.departmentFull || student.department) : (faculty.departmentFull || faculty.department),
            semester: student ? `Semester ${student.semester || 1}` : faculty.designation || 'Faculty',
            totalIssued,
            dueSoon,
            totalFine,
            pendingReqs,
            selectedLibrary: 'Main Library',
            libraryFocus: 'Main Library'
        });
    } catch (error) {
        console.error('Public get dashboard stats error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 5. Get recent activity log for dashboard
router.get('/activity/:identifier', verifyUserMatch, async (req, res) => {
    try {
        const { identifier } = req.params;

        const student = await Student.findOne({ where: { rollNo: identifier } });
        const faculty = !student ? await Faculty.findOne({ where: { employeeId: identifier } }) : null;

        if (!student && !faculty) {
            return res.status(404).json({ success: false, message: 'Borrower not found' });
        }

        const borrowerIdFilter = student 
            ? { studentId: student.id } 
            : { facultyId: faculty.id };

        // Gather all activities: issues, returns, requests
        const issuesList = await Issue.findAll({
            where: borrowerIdFilter,
            include: [Book],
            limit: 5,
            order: [['issueDate', 'DESC']]
        });

        const requestsList = await Request.findAll({
            where: borrowerIdFilter,
            include: [Book],
            limit: 5,
            order: [['requestDate', 'DESC']]
        });

        const activities = [];

        // Add issue and return activities
        issuesList.forEach(item => {
            if (item.status === 'Returned') {
                activities.push({
                    type: 'return',
                    title: `Returned: ${item.Book ? item.Book.title : 'Book'}`,
                    sub: 'Main Library',
                    date: item.actualReturnDate || item.issueDate
                });
            } else {
                activities.push({
                    type: item.status === 'Overdue' ? 'overdue' : 'issue',
                    title: `${item.status === 'Overdue' ? 'Overdue' : 'Issued'}: ${item.Book ? item.Book.title : 'Book'}`,
                    sub: item.status === 'Overdue' ? `Due ${item.returnDate}` : 'Main Library',
                    date: item.issueDate
                });
            }
        });

        // Add request activities
        requestsList.forEach(item => {
            activities.push({
                type: 'request',
                title: `Requested: ${item.Book ? item.Book.title : 'Book'}`,
                sub: item.status,
                date: item.requestDate ? new Date(item.requestDate).toISOString().split('T')[0] : ''
            });
        });

        // Sort by date desc
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.json(activities.slice(0, 5));
    } catch (error) {
        console.error('Public get activities error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 6. Recent borrowing history
router.get('/history/:identifier', verifyUserMatch, async (req, res) => {
    try {
        const { identifier } = req.params;
        const student = await Student.findOne({ where: { rollNo: identifier } });
        const faculty = !student ? await Faculty.findOne({ where: { employeeId: identifier } }) : null;

        if (!student && !faculty) {
            return res.status(404).json({ success: false, message: 'History not found' });
        }

        const borrowerIdFilter = student ? { studentId: student.id } : { facultyId: faculty.id };
        const issues = await Issue.findAll({ where: borrowerIdFilter, include: [Book], order: [['issueDate', 'DESC']] });

        const history = issues.map(issue => ({
            id: issue.id,
            title: issue.Book ? issue.Book.title : 'Book',
            issueDate: issue.issueDate ? new Date(issue.issueDate).toISOString().split('T')[0] : '',
            returnDate: issue.returnDate || '',
            status: issue.status,
            library: 'Main Library'
        }));

        return res.json(history);
    } catch (error) {
        console.error('Public get history error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 7. Profile endpoints
router.get('/profile/:identifier', verifyUserMatch, async (req, res) => {
    try {
        const { identifier } = req.params;

        const student = await Student.findOne({ where: { rollNo: identifier } });
        const faculty = !student ? await Faculty.findOne({ where: { employeeId: identifier } }) : null;

        if (!student && !faculty) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        if (student) {
            return res.json({
                name: student.name,
                studentId: student.rollNo,
                department: student.departmentFull || student.department,
                email: student.email,
                phone: student.phoneNumber,
                semester: `Semester ${student.semester}`,
                role: 'Student',
                enrollmentYear: student.batch ? student.batch.split('-')[0] : '2022',
                profileImage: student.photo
            });
        } else {
            return res.json({
                name: faculty.name,
                studentId: faculty.employeeId,
                department: faculty.departmentFull || faculty.department,
                email: faculty.email,
                phone: faculty.phone,
                semester: faculty.designation || 'Faculty',
                role: 'Faculty',
                enrollmentYear: faculty.joiningDate ? faculty.joiningDate.split('-')[0] : '2022',
                profileImage: faculty.photo
            });
        }
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/profile/update', verifySelfUpdateMatch, async (req, res) => {
    try {
        const { studentId, name, department, email, phone, semester } = req.body;

        // Try updating student first
        const student = await Student.findOne({ where: { rollNo: studentId } });
        if (student) {
            student.name = name || student.name;
            student.email = email || student.email;
            student.phoneNumber = phone || student.phoneNumber;
            if (semester) {
                const parsedSem = parseInt(semester.replace(/[^0-9]/g, ''));
                if (!isNaN(parsedSem)) student.semester = parsedSem;
            }
            await student.save();
            return res.json({ success: true, message: 'Profile updated successfully', user: student });
        }

        // Try updating faculty
        const faculty = await Faculty.findOne({ where: { employeeId: studentId } });
        if (faculty) {
            faculty.name = name || faculty.name;
            faculty.email = email || faculty.email;
            faculty.phone = phone || faculty.phone;
            await faculty.save();
            return res.json({ success: true, message: 'Profile updated successfully', user: faculty });
        }

        return res.status(404).json({ success: false, message: 'Profile not found' });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 7. Get user's active issues/history/fines
router.get('/borrowing-info/:identifier', verifyUserMatch, async (req, res) => {
    try {
        const { identifier } = req.params;

        const student = await Student.findOne({ where: { rollNo: identifier } });
        const faculty = !student ? await Faculty.findOne({ where: { employeeId: identifier } }) : null;

        if (!student && !faculty) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        const borrowerIdFilter = student 
            ? { studentId: student.id } 
            : { facultyId: faculty.id };

        const issues = await Issue.findAll({
            where: borrowerIdFilter,
            include: [Book]
        });

        const fines = await Fine.findAll({
            where: borrowerIdFilter,
            include: [{ model: Issue, include: [Book] }]
        });

        return res.json({ issues, fines });
    } catch (error) {
        console.error('Get borrowing info error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 8. Renew a book
router.post('/books/renew/:id', async (req, res) => {
    return res.status(403).json({ success: false, message: 'Book renewals are handled by admin only' });
});

router.get('/resources', (req, res) => {
    if (req.query.uploadedBy) return resourceController.listFacultySubmissions(req, res);
    return resourceController.listApprovedResources(req, res);
});
router.post('/resources/add', requireRole(['faculty']), resourceController.createFacultyResource);

// 9. Member Book Reservation Queue Endpoints
const reservationController = require('../controllers/admin/adminReservationController');
router.post('/reservations/reserve', reservationController.createReservation);
router.get('/reservations/my-reservations', reservationController.getMyReservations);
router.post('/reservations/cancel/:id', reservationController.cancelReservation);
router.get('/reservations/notifications', reservationController.getNotifications);
router.put('/reservations/notifications/:id/read', reservationController.markNotificationRead);

module.exports = router;
