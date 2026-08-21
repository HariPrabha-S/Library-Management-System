const { Issue, Book, BookCopy, Student, Faculty, Fine, Holiday, Reservation, Notification, sequelize } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');
const { getOverdueDaysCount, getFineableOverdueDays } = require('../../utils/fineHelper');
const { reindexQueuePositions, processExpiredReservations } = require('./adminReservationController');

const calculateOverdueFine = async (dueDate, endDate, transaction) => {
    const overdueDays = getOverdueDaysCount(dueDate, endDate);
    if (!overdueDays) return { fineableDays: 0, amount: 0 };
    const holidays = await Holiday.findAll({
        where: { date: { [Op.gt]: dueDate, [Op.lte]: endDate } },
        attributes: ['date'],
        transaction
    });
    const fineableDays = getFineableOverdueDays(dueDate, endDate, holidays);
    return { fineableDays, amount: fineableDays * 1 };
};

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
                { model: Book, attributes: ['title', 'department'] },
                { model: BookCopy, attributes: ['accessionNo'] },
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
                status: isOverdue ? 'Overdue' : issue.status,
                accessionNo: issue.BookCopy ? issue.BookCopy.accessionNo : ''
            };
        });

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
        console.error('getIssues error:', error);
        return sendError(res, 'Error fetching issues', 500);
    }
};

exports.issueBook = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        let { borrowerId, borrowerType, bookId, student, book, department, issueDate, returnDate } = req.body;

        // 1. Lookup Student/Faculty if only name/rollNo provided
        if (!borrowerId && student) {
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

        let targetCopy = null;

        // 2. Lookup physical BookCopy first if a copy/accessionNo is specified
        if (book) {
            // Check if book input is a specific accession number
            targetCopy = await BookCopy.findOne({
                where: { accessionNo: book, status: 'Available' },
                include: [{ model: Book }],
                transaction
            });

            if (targetCopy) {
                bookId = targetCopy.bookId;
            } else {
                // If not found as accession number, check if it's a book title
                const foundBook = await Book.findOne({
                    where: { title: book },
                    transaction
                });
                if (foundBook) {
                    bookId = foundBook.id;
                }
            }
        }

        if (!bookId) {
            await transaction.rollback();
            return sendError(res, 'Book not found or no copies available.', 404);
        }

        const targetBook = await Book.findByPk(bookId, { transaction });
        if (!targetBook) {
            await transaction.rollback();
            return sendError(res, 'Book record missing.', 404);
        }

        if (targetBook.isDead) {
            await transaction.rollback();
            return sendError(res, 'This book is marked as dead and cannot be issued', 400);
        }

        // If we haven't resolved a specific copy yet, find any available copy of the book
        if (!targetCopy) {
            targetCopy = await BookCopy.findOne({
                where: { bookId: targetBook.id, status: 'Available' },
                transaction
            });
        }

        if (!targetCopy) {
            await transaction.rollback();
            return sendError(res, 'No copies available to issue', 400);
        }

        const issueData = {
            bookId: targetBook.id,
            copyId: targetCopy.id,
            issueDate: issueDate || new Date(),
            returnDate: returnDate || new Date(new Date().setDate(new Date().getDate() + 14)),
            status: 'Issued'
        };

        if (borrowerType === 'Student') issueData.studentId = borrowerId;
        else issueData.facultyId = borrowerId;

        const issue = await Issue.create(issueData, { transaction });

        // Update physical copy status
        targetCopy.status = 'Issued';
        targetCopy.timesIssued = (targetCopy.timesIssued || 0) + 1;
        await targetCopy.save({ transaction });

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
        await processExpiredReservations(transaction);

        const { id } = req.params;
        const issue = await Issue.findByPk(id, { transaction });
        if (!issue || issue.status === 'Returned' || issue.status === 'Lost') {
            await transaction.rollback();
            return sendError(res, 'Issue record not found or already closed', 400);
        }

        issue.status = 'Returned';
        issue.actualReturnDate = new Date();
        await issue.save({ transaction });

        // Handle physical copy status and FIFO queue assignment
        if (issue.copyId) {
            const copy = await BookCopy.findByPk(issue.copyId, { transaction });
            if (copy) {
                // Check if there are waiting reservations for this book (FIFO)
                const nextWaiting = await Reservation.findOne({
                    where: {
                        bookId: issue.bookId,
                        status: 'Waiting'
                    },
                    order: [['reservationDate', 'ASC'], ['queuePosition', 'ASC']],
                    transaction
                });

                if (nextWaiting) {
                    // Assign copy to oldest FIFO reservation
                    const expiry = new Date();
                    expiry.setHours(expiry.getHours() + 48); // 48-hour pickup window

                    nextWaiting.status = 'Ready for Pickup';
                    nextWaiting.copyId = copy.id;
                    nextWaiting.assignedDate = new Date();
                    nextWaiting.pickupExpiry = expiry;
                    await nextWaiting.save({ transaction });

                    // Update copy status to Reserved (cannot become available to walk-in borrowers)
                    copy.status = 'Reserved';
                    await copy.save({ transaction });

                    // Re-index remaining queue positions
                    await reindexQueuePositions(issue.bookId, transaction);

                    // Send notification to member
                    const book = await Book.findByPk(issue.bookId, { transaction });
                    const bookTitle = book ? book.title : 'Reserved Book';
                    await Notification.create({
                        memberId: nextWaiting.memberId,
                        memberType: nextWaiting.memberType,
                        title: 'Book Ready for Pickup',
                        message: `Your reserved book "${bookTitle}" is now ready for pickup! Please collect it by ${expiry.toLocaleString()}.`,
                        type: 'READY_FOR_PICKUP'
                    }, { transaction });
                } else {
                    // If no waiting reservations, revert copy to Available
                    copy.status = 'Available';
                    await copy.save({ transaction });
                }
            }
        }

        // Overdue fine: Rs.1 per day after due date
        const { waiveFine } = req.body || {};
        const dueDate = new Date(issue.returnDate);
        const returnDate = new Date();
        if (returnDate > dueDate && !waiveFine) {
            const { fineableDays, amount } = await calculateOverdueFine(dueDate, returnDate, transaction);
            if (fineableDays > 0) {
                await Fine.create({
                    userType: issue.studentId ? 'Student' : 'Faculty',
                    studentId: issue.studentId,
                    facultyId: issue.facultyId,
                    issueId: issue.id,
                    amount,
                    reason: 'Overdue Fine',
                    status: 'Pending'
                }, { transaction });
            }
        }

        await transaction.commit();
        return sendSuccess(res, issue, 'Book returned successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('returnBook error:', error);
        return sendError(res, 'Error returning book', 500);
    }
};

exports.renewBook = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id, { transaction });
        if (!issue || issue.status === 'Returned' || issue.status === 'Lost') {
            await transaction.rollback();
            return sendError(res, 'Only active issue records can be renewed', 400);
        }

        const book = await Book.findByPk(issue.bookId, { transaction });
        if (book && book.isDead) {
            await transaction.rollback();
            return sendError(res, 'This book is marked as dead and cannot be renewed', 400);
        }

        const today = new Date();
        const dueDate = new Date(issue.returnDate);
        let newDueDate;

        if (today > dueDate) {
            const { fineableDays, amount } = await calculateOverdueFine(dueDate, today, transaction);
            if (fineableDays > 0) {
                await Fine.create({
                    userType: issue.studentId ? 'Student' : 'Faculty',
                    studentId: issue.studentId,
                    facultyId: issue.facultyId,
                    issueId: issue.id,
                    amount,
                    reason: 'Overdue Fine',
                    status: 'Pending'
                }, { transaction });
            }
            const d = new Date();
            d.setDate(d.getDate() + 14);
            newDueDate = d.toISOString().split('T')[0];
        } else {
            const d = new Date(dueDate);
            d.setDate(d.getDate() + 14);
            newDueDate = d.toISOString().split('T')[0];
        }

        issue.returnDate = newDueDate;
        issue.renewalCount = (issue.renewalCount || 0) + 1;
        issue.renewalDate = new Date().toISOString().split('T')[0];
        issue.status = 'Issued';
        await issue.save({ transaction });

        await transaction.commit();
        return sendSuccess(res, issue, 'Book renewed successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('renewBook error:', error);
        return sendError(res, 'Error renewing book', 500);
    }
};

exports.markLost = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id, { transaction });
        if (!issue || issue.status === 'Returned' || issue.status === 'Lost') {
            await transaction.rollback();
            return sendError(res, 'Only active issue records can be marked lost', 400);
        }

        const book = await Book.findByPk(issue.bookId, { transaction });
        const bookPrice = book ? Number(book.price || 0) : 0;
        const amount = bookPrice * 3;

        issue.status = 'Lost';
        issue.actualReturnDate = new Date();
        await issue.save({ transaction });

        // Update physical copy status to Lost
        if (issue.copyId) {
            const copy = await BookCopy.findByPk(issue.copyId, { transaction });
            if (copy) {
                copy.status = 'Lost';
                await copy.save({ transaction });
            }
        }

        if (book) {
            book.isDead = true;
            await book.save({ transaction });
        }

        const { waiveFine } = req.body || {};
        const finePayload = {
            userType: issue.studentId ? 'Student' : 'Faculty',
            studentId: issue.studentId,
            facultyId: issue.facultyId,
            issueId: issue.id,
            amount,
            reason: 'Lost Book',
            status: 'Pending'
        };

        if (!waiveFine) {
            await Fine.create(finePayload, { transaction });
        }

        await transaction.commit();
        return sendSuccess(res, { issue, fine: finePayload }, 'Book marked as lost and fine generated');
    } catch (error) {
        await transaction.rollback();
        console.error('markLost error:', error);
        return sendError(res, 'Error marking book as lost', 500);
    }
};
