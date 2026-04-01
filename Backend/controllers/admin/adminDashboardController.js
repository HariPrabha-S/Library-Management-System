const { Book, Student, Faculty, Issue, Fine, Request } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const totalBooks = await Book.sum('total_copies') || 0;
        const availableBooks = await Book.sum('available_copies') || 0;
        const issuedBooksCount = totalBooks - availableBooks;

        const overdueBooks = await Issue.count({
            where: {
                status: 'Overdue'
            }
        });

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const issuedToday = await Issue.count({
            where: {
                issueDate: { [Op.gte]: startOfToday }
            }
        });

        const issuedMonth = await Issue.count({
            where: {
                issueDate: { [Op.gte]: startOfMonth }
            }
        });

        const returnedToday = await Issue.count({
            where: {
                actualReturnDate: { [Op.gte]: startOfToday },
                status: 'Returned'
            }
        });

        const returnedMonth = await Issue.count({
            where: {
                actualReturnDate: { [Op.gte]: startOfMonth },
                status: 'Returned'
            }
        });

        return sendSuccess(res, {
            totalBooks: totalBooks.toString(),
            issuedBooks: issuedBooksCount.toString(),
            availableBooks: availableBooks.toString(),
            overdueBooks: overdueBooks.toString(),
            issuedToday: issuedToday.toString(),
            issuedMonth: issuedMonth.toString(),
            returnedToday: returnedToday.toString(),
            returnedMonth: returnedMonth.toString(),
        }, 'Stats retrieved successfully');

    } catch (error) {
        console.error('getStats error:', error);
        return sendError(res, 'Error fetching dashboard stats', 500);
    }
};

exports.getOverduePriority = async (req, res) => {
    try {
        const overdues = await Issue.findAll({
            where: { status: 'Overdue' },
            include: [
                { model: Book, attributes: ['title'] },
                { model: Student, attributes: ['name', 'rollNo'] },
                { model: Faculty, attributes: ['name', 'employeeId'] },
                {
                    model: Fine,
                    attributes: ['amount', 'status'],
                    where: { status: 'Unpaid' } // Only bring records with unpaid fines
                }
            ],
            limit: 5
        });

        const mapped = overdues.map(issue => {
            let borrowerName = 'Unknown';
            let rollNo = '';

            if (issue.Student) {
                borrowerName = issue.Student.name;
                rollNo = issue.Student.rollNo;
            } else if (issue.Faculty) {
                borrowerName = issue.Faculty.name;
                rollNo = issue.Faculty.employeeId;
            }

            const fineAmount = (issue.Fines && issue.Fines.length > 0) ? issue.Fines[0].amount : 0;
            const daysOverdue = Math.floor((new Date() - new Date(issue.returnDate)) / (1000 * 60 * 60 * 24));

            return {
                id: issue.id,
                book: issue.Book ? issue.Book.title : 'Unknown',
                dueDate: issue.returnDate,
                fine: fineAmount,
                student: borrowerName,
                rollNo: rollNo,
                days: daysOverdue > 0 ? daysOverdue : 0
            };
        });

        return sendSuccess(res, mapped.sort((a, b) => b.fine - a.fine), 'Overdue priority fetched');
    } catch (error) {
        console.error('getOverduePriority error:', error);
        return sendError(res, 'Error fetching overdue issues', 500);
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: { status: 'Pending' },
            include: [
                { model: Book, attributes: ['title'] },
                { model: Student, attributes: ['name', 'rollNo'] },
                { model: Faculty, attributes: ['name', 'employeeId'] }
            ],
            order: [['requestDate', 'DESC']]
        });

        const mapped = requests.map(item => {
            let borrowerName = 'Unknown';
            let rollNo = '';
            if (item.Student) {
                borrowerName = item.Student.name;
                rollNo = item.Student.rollNo;
            } else if (item.Faculty) {
                borrowerName = item.Faculty.name;
                rollNo = item.Faculty.employeeId;
            } else {
                borrowerName = `Unknown (ID: ${item.studentId || item.facultyId})`;
            }

            return {
                id: item.id,
                book: item.Book ? item.Book.title : `Unknown Book (ID: ${item.bookId})`,
                student: borrowerName,
                rollNo: rollNo,
                date: item.requestDate,
                status: item.status
            };
        });

        return sendSuccess(res, mapped, "Requests fetched successfully");
    } catch (error) {
        console.error('getRequests error:', error);
        return sendError(res, 'Error fetching requests', 500);
    }
};

exports.getRecentTransactions = async (req, res) => {
    try {
        const issues = await Issue.findAll({
            limit: 5,
            order: [['issueDate', 'DESC']],
            include: [
                { model: Book, attributes: ['title'] },
                { model: Student, attributes: ['name'] },
                { model: Faculty, attributes: ['name'] }
            ]
        });

        const mapped = issues.map(issue => {
            const borrowerName = issue.Student ? issue.Student.name : (issue.Faculty ? issue.Faculty.name : 'Unknown');
            return {
                studentName: borrowerName,
                bookName: issue.Book ? issue.Book.title : 'Unknown',
                issueDate: issue.issueDate,
                status: issue.status
            };
        });

        return sendSuccess(res, mapped, 'Recent transactions fetched');
    } catch (error) {
        console.error('getRecentTransactions error:', error);
        return sendError(res, 'Error fetching recent transactions', 500);
    }
};
