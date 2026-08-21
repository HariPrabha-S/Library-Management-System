const { Request, Book, BookCopy, Student, Faculty, Issue } = require('../../models/admin/adminModels');
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

        const availableCopy = await BookCopy.findOne({
            where: { bookId: bookRequest.bookId, status: 'Available' },
            transaction
        });

        if (!availableCopy) {
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
            copyId: availableCopy.id,
            studentId: bookRequest.studentId || null,
            facultyId: bookRequest.facultyId || null,
            issueDate: today,
            returnDate: dueDate,
            status: 'Issued'
        }, { transaction });

        // 3. Mark copy as Issued and increment timesIssued
        availableCopy.status = 'Issued';
        availableCopy.timesIssued = (availableCopy.timesIssued || 0) + 1;
        await availableCopy.save({ transaction });

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
