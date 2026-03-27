const { Book, Student, Issue, Fine } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const totalBooks = await Book.sum('totalCopies') || 0;
        const issuedBooks = await Book.sum('totalCopies') - await Book.sum('availableCopies') || 0;
        const availableBooks = await Book.sum('availableCopies') || 0;
        
        const overdueBooks = await Issue.count({
            where: {
                status: 'Overdue'
            }
        });

        // Current month bounds
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

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
                returnDate: { [Op.gte]: startOfToday },
                status: 'Returned'
            }
        });

        const returnedMonth = await Issue.count({
            where: {
                returnDate: { [Op.gte]: startOfMonth },
                status: 'Returned'
            }
        });

        return sendSuccess(res, {
            totalBooks: totalBooks.toString(),
            issuedBooks: issuedBooks.toString(),
            availableBooks: availableBooks.toString(),
            overdueBooks: overdueBooks.toString(),
            issuedToday: issuedToday.toString(),
            issuedMonth: issuedMonth.toString(),
            returnedToday: returnedToday.toString(),
            returnedMonth: returnedMonth.toString(),
        }, 'Stats retrieved successfully');

    } catch (error) {
        return sendError(res, 'Error fetching dashboard stats', 500);
    }
};

exports.getOverduePriority = async (req, res) => {
    try {
        const overdues = await Issue.findAll({
            where: {
                status: 'Overdue'
            },
            include: [
                { model: Book, attributes: ['title'] },
                { model: Fine, attributes: ['amount', 'status'] }
            ],
            limit: 5 // Top 5
            // Sort by fine amount logically goes here or via DB ordering
        });

        // In a real app, join borrowers tables manually because polymorphic assoc in sequelize needs union or raw query
        // Map data suitably for frontend
        const mapped = overdues.map(issue => {
            const fineRec = issue.Fines && issue.Fines.length > 0 ? issue.Fines[0] : null;
            return {
                id: issue.id,
                book: issue.Book ? issue.Book.title : 'Unknown',
                dueDate: issue.dueDate,
                fine: fineRec ? fineRec.amount : 0,
                // placeholder for student logic
                student: `Borrower ID ${issue.borrowerId} (${issue.borrowerType})`,
                rollNo: '',
                days: Math.floor((new Date() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24))
            };
        });

        return sendSuccess(res, mapped.sort((a,b) => b.fine - a.fine), 'Overdue priority fetched');
    } catch (error) {
        return sendError(res, 'Error fetching overdue issues', 500);
    }
};

exports.getRequests = async (req, res) => {
    // Requires a request model, returning empty for now matching mocked requests
    return sendSuccess(res, [], "Requests fetched");
};
