const { Request, Book, Student, Faculty, Issue } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            include: [
                { model: Book, attributes: ['id', 'title'] },
                { model: Student, attributes: ['id', 'name', 'rollNo'] },
                { model: Faculty, attributes: ['id', 'name', 'employeeId'] }
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
                borrowerName = `Unknown (SD:${item.studentId || '-'} / FC:${item.facultyId || '-'})`;
            }

            return {
                id: item.id,
                book: item.Book ? item.Book.title : `Unknown Book (ID:${item.bookId})`,
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

exports.approveRequest = async (req, res) => {
    const transaction = await Request.sequelize.transaction();
    try {
        const { id } = req.params;
        const bookRequest = await Request.findByPk(id, { include: [Book], transaction });

        if (!bookRequest) {
            await transaction.rollback();
            return sendError(res, 'Request not found', 404);
        }

        if (bookRequest.status !== 'Pending') {
            await transaction.rollback();
            return sendError(res, 'Request already processed', 400);
        }

        if (!bookRequest.Book) {
            await transaction.rollback();
            return sendError(res, 'The book for this request no longer exists in the library collection.', 404);
        }

        if (bookRequest.Book.available_copies <= 0) {
            await transaction.rollback();
            return sendError(res, 'No copies available for this book', 400);
        }

        // 1. Update Request Status
        bookRequest.status = 'Approved';
        await bookRequest.save({ transaction });

        // 2. Create Issue record
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        await Issue.create({
            bookId: bookRequest.bookId,
            studentId: bookRequest.studentId || null,
            facultyId: bookRequest.facultyId || null,
            userType: bookRequest.userType || (bookRequest.studentId ? 'Student' : 'Faculty'),
            issueDate: today,
            returnDate: dueDate,
            status: 'Issued'
        }, { transaction });

        // 3. Decrement available copies
        await Book.decrement('available_copies', {
            where: { id: bookRequest.bookId },
            transaction
        });

        await transaction.commit();
        return sendSuccess(res, null, 'Request approved successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('approveRequest error:', error);
        return sendError(res, 'Error approving request', 500);
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const bookRequest = await Request.findByPk(id);

        if (!bookRequest) return sendError(res, 'Request not found', 404);

        bookRequest.status = 'Rejected';
        await bookRequest.save();

        return sendSuccess(res, null, 'Request rejected successfully');
    } catch (error) {
        console.error('rejectRequest error:', error);
        return sendError(res, 'Error rejecting request', 500);
    }
};
exports.revertRequest = async (req, res) => {
    const transaction = await Request.sequelize.transaction();
    try {
        const { id } = req.params;
        const bookRequest = await Request.findByPk(id, { transaction });

        if (!bookRequest) {
            await transaction.rollback();
            return sendError(res, 'Request not found', 404);
        }

        const oldStatus = bookRequest.status;
        bookRequest.status = 'Pending';
        await bookRequest.save({ transaction });

        if (oldStatus === 'Approved') {
            // Find and delete the issue record created during approval
            const issueToDelete = await Issue.findOne({
                where: {
                    bookId: bookRequest.bookId,
                    [Op.or]: [
                        { studentId: bookRequest.studentId || -1 },
                        { facultyId: bookRequest.facultyId || -1 }
                    ],
                    status: 'Issued'
                },
                transaction
            });

            if (issueToDelete) {
                await issueToDelete.destroy({ transaction });

                // Increment book stock
                await Book.increment('available_copies', {
                    where: { id: bookRequest.bookId },
                    transaction
                });
            }
        }

        await transaction.commit();
        return sendSuccess(res, null, 'Request reverted to pending successfully');
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('revertRequest error:', error);
        return sendError(res, 'Error reverting request', 500);
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const bookReq = await Request.findByPk(id);
        if (!bookReq) return sendError(res, 'Request not found', 404);
        await bookReq.destroy();
        return sendSuccess(res, null, 'Request deleted successfully');
    } catch (error) {
        return sendError(res, 'Error deleting request', 500);
    }
};
