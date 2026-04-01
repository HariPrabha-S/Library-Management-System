const { Issue, Book, Student, Faculty, Fine, sequelize } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');

exports.getIssues = async (req, res) => {
    try {
        const { search, department, status, fromDate, toDate } = req.query;

        let whereClause = {};
        if (status && status !== 'All') {
            whereClause.status = status;
        }

        if (fromDate && toDate) {
            whereClause.issueDate = {
                [Op.between]: [fromDate, toDate]
            };
        } else if (fromDate) {
            whereClause.issueDate = { [Op.gte]: fromDate };
        } else if (toDate) {
            whereClause.issueDate = { [Op.lte]: toDate };
        }

        const issues = await Issue.findAll({
            where: whereClause,
            include: [
                { model: Book, attributes: ['title', 'accessionNo', 'department'] },
                { model: Student, attributes: ['name', 'department', 'rollNo'] },
                { model: Faculty, attributes: ['name', 'department', 'employeeId'] }
            ],
            order: [['issueDate', 'DESC']]
        });

        const mappedIssues = issues.map(issue => {
            let borrowerName = 'Unknown';
            let rollNo = '';
            let dept = issue.Book ? issue.Book.department : '';

            if (issue.Student) {
                borrowerName = issue.Student.name;
                rollNo = issue.Student.rollNo;
                dept = issue.Student.department;
            } else if (issue.Faculty) {
                borrowerName = issue.Faculty.name;
                rollNo = issue.Faculty.employeeId;
                dept = issue.Faculty.department;
            }

            const isOverdue = issue.status === 'Issued' && new Date() > new Date(issue.returnDate);

            return {
                id: issue.id,
                student: borrowerName,
                rollNo: rollNo,
                book: issue.Book ? issue.Book.title : 'Unknown Book',
                department: dept,
                issueDate: issue.issueDate,
                returnDate: issue.actualReturnDate,
                dueDate: issue.returnDate,
                status: isOverdue ? 'Overdue' : issue.status
            };
        });

        // Filter search logic
        let finalOutput = mappedIssues;
        if (search) {
            const sLower = search.toLowerCase();
            finalOutput = finalOutput.filter(i =>
                i.student.toLowerCase().includes(sLower) ||
                i.book.toLowerCase().includes(sLower) ||
                i.rollNo.toLowerCase().includes(sLower)
            );
        }

        return sendSuccess(res, finalOutput, 'Issues fetched successfully');
    } catch (error) {
        return sendError(res, 'Error fetching issues', 500);
    }
};

exports.issueBook = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        let { borrowerId, borrowerType, bookId, student, book, department, issueDate, returnDate } = req.body;

        // 1. Lookup Student/Faculty if only name/rollNo provided
        if (!borrowerId && student) {
            // Try lookup by rollNo or name
            const foundStudent = await Student.findOne({
                where: {
                    [Op.or]: [
                        { rollNo: student },
                        { name: student }
                    ]
                },
                transaction
            });

            if (foundStudent) {
                borrowerId = foundStudent.id;
                borrowerType = 'Student';
            } else {
                // Try Faculty
                const foundFaculty = await Faculty.findOne({
                    where: {
                        [Op.or]: [
                            { employeeId: student },
                            { name: student }
                        ]
                    },
                    transaction
                });
                if (foundFaculty) {
                    borrowerId = foundFaculty.id;
                    borrowerType = 'Faculty';
                }
            }
        }

        if (!borrowerId) {
            await transaction.rollback();
            return sendError(res, 'Borrower (Student/Faculty) not found. Please provide a valid Roll No or Name.', 404);
        }

        // 2. Lookup Book if only title/accessionNo provided
        if (!bookId && book) {
            const foundBook = await Book.findOne({
                where: {
                    [Op.or]: [
                        { accessionNo: book },
                        { title: book }
                    ]
                },
                transaction
            });

            if (foundBook) {
                bookId = foundBook.id;
            }
        }

        if (!bookId) {
            await transaction.rollback();
            return sendError(res, 'Book not found. Please provide a valid Accession No or Title.', 404);
        }

        const targetBook = await Book.findByPk(bookId, { transaction });
        if (!targetBook) {
            await transaction.rollback();
            return sendError(res, 'Book record missing.', 404);
        }

        if (targetBook.availableCopies <= 0) {
            await transaction.rollback();
            return sendError(res, 'No copies available to issue', 400);
        }

        const issueData = {
            bookId,
            issueDate: issueDate || new Date(),
            returnDate: returnDate || new Date(new Date().setDate(new Date().getDate() + 14)),
            status: 'Issued'
        };

        if (borrowerType === 'Student') issueData.studentId = borrowerId;
        else issueData.facultyId = borrowerId;

        const issue = await Issue.create(issueData, { transaction });

        // Update stock
        targetBook.availableCopies -= 1;
        targetBook.timesIssued += 1;
        await targetBook.save({ transaction });

        await transaction.commit();
        return sendSuccess(res, issue, 'Book issued successfully', 201);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('issueBook error:', error);
        return sendError(res, 'Error issuing book', 500);
    }
};

exports.returnBook = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id, { transaction });
        if (!issue || issue.status === 'Returned') {
            await transaction.rollback();
            return sendError(res, 'Issue record not found or already returned', 400);
        }

        issue.status = 'Returned';
        issue.actualReturnDate = new Date();
        await issue.save({ transaction });

        const book = await Book.findByPk(issue.bookId, { transaction });
        if (book) {
            book.availableCopies += 1;
            await book.save({ transaction });
        }

        // Overdue logic + Fine
        const dueDate = new Date(issue.returnDate);
        const returnDate = new Date();
        if (returnDate > dueDate) {
            const diffDays = Math.ceil(Math.abs(returnDate - dueDate) / (1000 * 60 * 60 * 24));
            const fineRate = process.env.FINE_PER_DAY ? parseFloat(process.env.FINE_PER_DAY) : 10;
            const amount = diffDays * fineRate;

            await Fine.create({
                userType: issue.studentId ? 'Student' : 'Faculty',
                studentId: issue.studentId,
                facultyId: issue.facultyId,
                issueId: issue.id,
                amount,
                reason: `Late Return - ${diffDays} days`,
                status: 'Unpaid'
            }, { transaction });
        }

        await transaction.commit();
        return sendSuccess(res, issue, 'Book returned successfully');
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error returning book', 500);
    }
};

exports.revertReturn = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id, { transaction });
        if (!issue || issue.status !== 'Returned') {
            await transaction.rollback();
            return sendError(res, 'Issue record not found or not returned', 400);
        }

        const isOverdue = new Date() > new Date(issue.returnDate);
        issue.status = isOverdue ? 'Overdue' : 'Issued';
        issue.actualReturnDate = null;
        await issue.save({ transaction });

        const book = await Book.findByPk(issue.bookId, { transaction });
        if (book) {
            book.availableCopies -= 1;
            await book.save({ transaction });
        }

        // Delete fine if any
        await Fine.destroy({ where: { issueId: issue.id }, transaction });

        await transaction.commit();
        return sendSuccess(res, issue, 'Return reverted successfully');
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error reverting return', 500);
    }
};
