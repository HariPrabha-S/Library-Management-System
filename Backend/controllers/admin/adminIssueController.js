const { Issue, Book, Student, Faculty, Fine, sequelize } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');

exports.getIssues = async (req, res) => {
    try {
        const { search, department, status } = req.query;

        let whereClause = {};
        if (status && status !== 'All') {
            whereClause.status = status;
        }

        // Ideally, we'd do a complex raw query to filter by student/faculty name
        // For simplicity now, we'll fetch all matching issues and return
        const issues = await Issue.findAll({
             where: whereClause,
             include: [{ model: Book, attributes: ['title', 'accessionNo', 'department'] }],
             order: [['issueDate', 'DESC']]
        });

        // Resolve borrower names (since borrower Type can be Student or Faculty)
        const mappedIssues = await Promise.all(issues.map(async (issue) => {
            let borrowerName = 'Unknown';
            let dept = issue.Book ? issue.Book.department : '';
            if (issue.borrowerType === 'Student') {
                const s = await Student.findByPk(issue.borrowerId, { attributes: ['name', 'department']});
                if (s) { borrowerName = s.name; dept = s.department; }
            } else {
                const f = await Faculty.findByPk(issue.borrowerId, { attributes: ['name', 'department']});
                if (f) { borrowerName = f.name; dept = f.department; }
            }
            return {
                _id: issue.id, // For frontend compatibility
                id: issue.id,
                student: borrowerName, // Maps to 'student' in frontend
                borrowerType: issue.borrowerType,
                book: issue.Book ? issue.Book.title : 'Unknown Book',
                department: dept,
                issueDate: issue.issueDate,
                returnDate: issue.returnDate,
                dueDate: issue.dueDate,
                status: issue.status
            };
        }));

        // Filter by search string or department
        let finalIssues = mappedIssues;
        if (search) {
             const sLower = search.toLowerCase();
             finalIssues = finalIssues.filter(i => 
                 i.student.toLowerCase().includes(sLower) || 
                 i.book.toLowerCase().includes(sLower)
             );
        }
        if (department && department !== 'all') {
             finalIssues = finalIssues.filter(i => i.department === department);
        }

        return sendSuccess(res, finalIssues, 'Issues fetched successfully');
    } catch (error) {
        return sendError(res, 'Error fetching issues', 500);
    }
};

exports.issueBook = async (req, res) => {
    // Requires a transaction since we are issuing a book and decrementing stock
    const transaction = await Issue.sequelize.transaction();
    try {
        const { borrowerId, borrowerType, bookId, dueDate } = req.body;

        const book = await Book.findByPk(bookId, { transaction });
        if (!book) {
            await transaction.rollback();
            return sendError(res, 'Book not found', 404);
        }

        if (book.availableCopies <= 0) {
            await transaction.rollback();
            return sendError(res, 'No copies available to issue', 400);
        }

        const issue = await Issue.create({
            borrowerId,
            borrowerType,
            bookId,
            dueDate: dueDate || new Date(new Date().setDate(new Date().getDate() + 14)), // Default 14 days
            status: 'Issued'
        }, { transaction });

        book.availableCopies -= 1;
        await book.save({ transaction });

        // Update borrower stats
        if (borrowerType === 'Student') await Student.increment('issuedBooks', { by: 1, where: { id: borrowerId }, transaction });
        else await Faculty.increment('issuedBooks', { by: 1, where: { id: borrowerId }, transaction });

        await transaction.commit();
        return sendSuccess(res, issue, 'Book issued successfully', 201);
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error issuing book', 500);
    }
};

exports.returnBook = async (req, res) => {
    const transaction = await Issue.sequelize.transaction();
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id, { transaction });
        
        if (!issue || issue.status === 'Returned') {
            await transaction.rollback();
            return sendError(res, 'Issue not found or already returned', 400);
        }

        issue.status = 'Returned';
        issue.returnDate = new Date();
        await issue.save({ transaction });

        const book = await Book.findByPk(issue.bookId, { transaction });
        if (book) {
            book.availableCopies += 1;
            await book.save({ transaction });
        }

        // Calculate fine if overdue
        const dueDate = new Date(issue.dueDate);
        const returnDate = new Date();
        if (returnDate > dueDate) {
            const diffTime = Math.abs(returnDate - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const fineRate = process.env.FINE_PER_DAY ? parseFloat(process.env.FINE_PER_DAY) : 10;
            const fineAmount = diffDays * fineRate;

            await Fine.create({
                borrowerId: issue.borrowerId,
                borrowerType: issue.borrowerType,
                issueId: issue.id,
                amount: fineAmount,
                reason: `Late Return - ${diffDays} days`,
                status: 'Unpaid'
            }, { transaction });

            // Update borrower fine total
            if (issue.borrowerType === 'Student') {
                await Student.increment('fine', { by: fineAmount, where: { id: issue.borrowerId }, transaction });
            } else {
                await Faculty.increment('fine', { by: fineAmount, where: { id: issue.borrowerId }, transaction });
            }
        }

        // Update borrower stats
        if (issue.borrowerType === 'Student') {
             await Student.increment('returnedBooks', { by: 1, where: { id: issue.borrowerId }, transaction });
             await Student.decrement('issuedBooks', { by: 1, where: { id: issue.borrowerId }, transaction });
        } else {
             await Faculty.increment('returnedBooks', { by: 1, where: { id: issue.borrowerId }, transaction });
             await Faculty.decrement('issuedBooks', { by: 1, where: { id: issue.borrowerId }, transaction });
        }

        await transaction.commit();
        return sendSuccess(res, issue, 'Book marked as returned successfully');
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error returning book', 500);
    }
};

exports.revertReturn = async (req, res) => {
    const transaction = await Issue.sequelize.transaction();
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id, { transaction });
        
        if (!issue || issue.status !== 'Returned') {
            await transaction.rollback();
            return sendError(res, 'Issue not found or not returned', 400);
        }

        // Determine if Overdue based on dueDate
        const isOverdue = new Date() > new Date(issue.dueDate);
        issue.status = isOverdue ? 'Overdue' : 'Issued';
        issue.returnDate = null;
        await issue.save({ transaction });

        const book = await Book.findByPk(issue.bookId, { transaction });
        if (book) {
            book.availableCopies -= 1;
            await book.save({ transaction });
        }

        // Delete fine if exists for this issue 
        const fine = await Fine.findOne({ where: { issueId: issue.id }, transaction });
        if (fine) {
            if (issue.borrowerType === 'Student') {
                await Student.decrement('fine', { by: fine.amount, where: { id: issue.borrowerId }, transaction });
            } else {
                await Faculty.decrement('fine', { by: fine.amount, where: { id: issue.borrowerId }, transaction });
            }
            await fine.destroy({ transaction });
        }

        // Update borrower stats
        if (issue.borrowerType === 'Student') {
             await Student.decrement('returnedBooks', { by: 1, where: { id: issue.borrowerId }, transaction });
             await Student.increment('issuedBooks', { by: 1, where: { id: issue.borrowerId }, transaction });
        } else {
             await Faculty.decrement('returnedBooks', { by: 1, where: { id: issue.borrowerId }, transaction });
             await Faculty.increment('issuedBooks', { by: 1, where: { id: issue.borrowerId }, transaction });
        }

        await transaction.commit();
        return sendSuccess(res, issue, 'Return reverted successfully');
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error reverting return', 500);
    }
}
