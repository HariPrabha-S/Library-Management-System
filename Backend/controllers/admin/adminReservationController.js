const { Reservation, Notification, Book, BookCopy, Student, Faculty, Issue, sequelize } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');

/**
 * Helper: Automatically process expired reservations where pickupExpiry < NOW()
 */
async function processExpiredReservations(transaction = null) {
    try {
        const now = new Date();
        const expiredReservations = await Reservation.findAll({
            where: {
                status: 'Ready for Pickup',
                pickupExpiry: { [Op.lt]: now }
            },
            include: [{ model: Book, attributes: ['id', 'title'] }],
            transaction
        });

        for (const resv of expiredReservations) {
            resv.status = 'Expired';
            await resv.save({ transaction });

            // Send notification to expired member
            const bookTitle = resv.Book ? resv.Book.title : 'Reserved Book';
            await Notification.create({
                memberId: resv.memberId,
                memberType: resv.memberType,
                title: 'Reservation Expired',
                message: `Your reservation for "${bookTitle}" has expired because it was not picked up within the allowed timeframe.`,
                type: 'RESERVATION_EXPIRED'
            }, { transaction });

            const copyId = resv.copyId;
            resv.copyId = null;
            await resv.save({ transaction });

            // Check if there is a waiting reservation in FIFO queue for this book
            const nextWaiting = await Reservation.findOne({
                where: {
                    bookId: resv.bookId,
                    status: 'Waiting'
                },
                order: [['reservationDate', 'ASC'], ['queuePosition', 'ASC']],
                transaction
            });

            if (nextWaiting && copyId) {
                // Assign copy to next waiting reservation
                const expiry = new Date();
                expiry.setHours(expiry.getHours() + 48); // 48-hour pickup window

                nextWaiting.status = 'Ready for Pickup';
                nextWaiting.copyId = copyId;
                nextWaiting.assignedDate = now;
                nextWaiting.pickupExpiry = expiry;
                await nextWaiting.save({ transaction });

                // Keep copy status as 'Reserved'
                if (copyId) {
                    await BookCopy.update({ status: 'Reserved' }, { where: { id: copyId }, transaction });
                }

                // Re-index remaining queue positions for this book
                await reindexQueuePositions(resv.bookId, transaction);

                // Notify next member
                await Notification.create({
                    memberId: nextWaiting.memberId,
                    memberType: nextWaiting.memberType,
                    title: 'Book Ready for Pickup',
                    message: `Your reserved book "${bookTitle}" is now ready for pickup! Please collect it by ${expiry.toLocaleString()}.`,
                    type: 'READY_FOR_PICKUP'
                }, { transaction });

            } else if (copyId) {
                // If no waiting reservations exist, set copy to 'Available'
                await BookCopy.update({ status: 'Available' }, { where: { id: copyId }, transaction });
            }
        }
    } catch (err) {
        console.error('Error processing expired reservations:', err);
    }
}

/**
 * Helper: Re-index queue positions for all waiting reservations of a book
 */
async function reindexQueuePositions(bookId, transaction = null) {
    const waitingList = await Reservation.findAll({
        where: { bookId, status: 'Waiting' },
        order: [['reservationDate', 'ASC'], ['queuePosition', 'ASC']],
        transaction
    });

    for (let index = 0; index < waitingList.length; index++) {
        const item = waitingList[index];
        item.queuePosition = index + 1;
        await item.save({ transaction });
    }
}

// Export Helper for use in IssueController return logic
exports.processExpiredReservations = processExpiredReservations;
exports.reindexQueuePositions = reindexQueuePositions;

/**
 * Create Reservation (Student / Faculty)
 */
exports.createReservation = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        await processExpiredReservations(transaction);

        let { bookId, memberId, memberType } = req.body;

        if ((!memberId || !memberType) && req.user) {
            memberId = memberId || req.user.id;
            memberType = memberType || (req.user.role === 'student' ? 'Student' : req.user.role === 'faculty' ? 'Faculty' : 'Student');
        }

        // If memberId is a rollNo or employeeId string, resolve internal PK
        if (memberId && typeof memberId === 'string' && isNaN(Number(memberId))) {
            if (memberType === 'Student') {
                const s = await Student.findOne({ where: { rollNo: memberId }, transaction });
                if (s) memberId = s.id;
            } else if (memberType === 'Faculty') {
                const f = await Faculty.findOne({ where: { employeeId: memberId }, transaction });
                if (f) memberId = f.id;
            }
        }

        if (!bookId || !memberId || !memberType) {
            await transaction.rollback();
            return sendError(res, 'Book ID, Member ID, and Member Type are required', 400);
        }

        if (!['Student', 'Faculty'].includes(memberType)) {
            await transaction.rollback();
            return sendError(res, 'Invalid Member Type', 400);
        }

        // Verify book exists
        const book = await Book.findByPk(bookId, { transaction });
        if (!book) {
            await transaction.rollback();
            return sendError(res, 'Book not found', 404);
        }

        // Rule 1: Check available copies. Reserving only allowed if available_copies === 0
        const availableCopiesCount = await BookCopy.count({
            where: { bookId, status: 'Available' },
            transaction
        });

        if (availableCopiesCount > 0) {
            await transaction.rollback();
            return sendError(res, 'Copies are currently available for this book. Please issue directly instead of reserving.', 400);
        }

        // Rule 2: Member has no active reservation for the same title
        const existingActiveRes = await Reservation.findOne({
            where: {
                bookId,
                memberId,
                memberType,
                status: { [Op.in]: ['Waiting', 'Ready for Pickup'] }
            },
            transaction
        });

        if (existingActiveRes) {
            await transaction.rollback();
            return sendError(res, 'You already have an active reservation for this book title.', 400);
        }

        // Rule 3: Member currently has not issued this book
        const borrowerField = memberType === 'Student' ? 'studentId' : 'facultyId';
        const existingIssue = await Issue.findOne({
            where: {
                bookId,
                [borrowerField]: memberId,
                status: 'Issued'
            },
            transaction
        });

        if (existingIssue) {
            await transaction.rollback();
            return sendError(res, 'You currently have an active issue record for this book.', 400);
        }

        // Rule 4: Check member reservation limit (Student: 3, Faculty: 5)
        const limit = memberType === 'Student' ? 3 : 5;
        const activeCount = await Reservation.count({
            where: {
                memberId,
                memberType,
                status: { [Op.in]: ['Waiting', 'Ready for Pickup'] }
            },
            transaction
        });

        if (activeCount >= limit) {
            await transaction.rollback();
            return sendError(res, `Reservation limit reached. Maximum ${limit} active reservations allowed for ${memberType}s.`, 400);
        }

        // Calculate FIFO queue position
        const waitingCount = await Reservation.count({
            where: { bookId, status: 'Waiting' },
            transaction
        });

        const queuePosition = waitingCount + 1;

        const reservation = await Reservation.create({
            memberId,
            memberType,
            bookId,
            queuePosition,
            reservationDate: new Date(),
            status: 'Waiting'
        }, { transaction });

        // Notification
        await Notification.create({
            memberId,
            memberType,
            title: 'Reservation Created',
            message: `Your reservation for "${book.title}" has been created. Queue Position: #${queuePosition}.`,
            type: 'RESERVATION_CREATED'
        }, { transaction });

        await transaction.commit();
        return sendSuccess(res, reservation, 'Book reserved successfully', 201);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('createReservation error:', error);
        return sendError(res, error.message || 'Error creating reservation', 500);
    }
};

/**
 * Get My Reservations (Student / Faculty)
 */
exports.getMyReservations = async (req, res) => {
    try {
        await processExpiredReservations();

        let { memberId, memberType } = req.query;

        if ((!memberId || !memberType) && req.user) {
            memberId = memberId || req.user.id;
            memberType = memberType || (req.user.role === 'student' ? 'Student' : req.user.role === 'faculty' ? 'Faculty' : 'Student');
        }

        if (memberId && typeof memberId === 'string' && isNaN(Number(memberId))) {
            if (memberType === 'Student') {
                const s = await Student.findOne({ where: { rollNo: memberId } });
                if (s) memberId = s.id;
            } else if (memberType === 'Faculty') {
                const f = await Faculty.findOne({ where: { employeeId: memberId } });
                if (f) memberId = f.id;
            }
        }

        if (!memberId || !memberType) {
            return sendError(res, 'Member ID and Member Type required', 400);
        }

        const reservations = await Reservation.findAll({
            where: { memberId, memberType },
            include: [
                { model: Book, attributes: ['id', 'title', 'author', 'department', 'isbn', 'frontPagePhoto'] },
                { model: BookCopy, attributes: ['accessionNo', 'shelfLocation'] }
            ],
            order: [['created_at', 'DESC']]
        });

        const formatted = reservations.map(r => {
            const item = r.toJSON();
            return {
                id: item.id,
                bookId: item.bookId,
                bookTitle: item.Book ? item.Book.title : 'Unknown Book',
                author: item.Book ? item.Book.author : '',
                department: item.Book ? item.Book.department : '',
                frontPagePhoto: item.Book ? item.Book.frontPagePhoto : null,
                accessionNo: item.BookCopy ? item.BookCopy.accessionNo : '-',
                queuePosition: item.queuePosition,
                reservationDate: item.reservationDate,
                pickupExpiry: item.pickupExpiry,
                status: item.status,
                canCancel: item.status === 'Waiting'
            };
        });

        return sendSuccess(res, formatted, 'Reservations fetched successfully');
    } catch (error) {
        console.error('getMyReservations error:', error);
        return sendError(res, 'Error fetching reservations', 500);
    }
};

/**
 * Cancel Reservation (Student / Faculty / Admin)
 */
exports.cancelReservation = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        await processExpiredReservations(transaction);

        const { id } = req.params;
        const { memberId, memberType, isAdmin } = req.body;

        const reservation = await Reservation.findByPk(id, {
            include: [{ model: Book, attributes: ['id', 'title'] }],
            transaction
        });

        if (!reservation) {
            await transaction.rollback();
            return sendError(res, 'Reservation record not found', 404);
        }

        if (!isAdmin && (reservation.memberId !== parseInt(memberId, 10) || reservation.memberType !== memberType)) {
            await transaction.rollback();
            return sendError(res, 'Unauthorized to cancel this reservation', 403);
        }

        if (reservation.status !== 'Waiting' && !isAdmin) {
            await transaction.rollback();
            return sendError(res, 'Only reservations in "Waiting" status can be cancelled.', 400);
        }

        const previousStatus = reservation.status;
        const assignedCopyId = reservation.copyId;

        reservation.status = 'Cancelled';
        reservation.cancelledDate = new Date();
        reservation.copyId = null;
        await reservation.save({ transaction });

        const bookTitle = reservation.Book ? reservation.Book.title : 'Book';

        // Re-index remaining queue positions
        await reindexQueuePositions(reservation.bookId, transaction);

        // If reservation was 'Ready for Pickup', process assigned copy to next waiting member or make Available
        if (previousStatus === 'Ready for Pickup' && assignedCopyId) {
            const nextWaiting = await Reservation.findOne({
                where: { bookId: reservation.bookId, status: 'Waiting' },
                order: [['reservationDate', 'ASC'], ['queuePosition', 'ASC']],
                transaction
            });

            if (nextWaiting) {
                const expiry = new Date();
                expiry.setHours(expiry.getHours() + 48);

                nextWaiting.status = 'Ready for Pickup';
                nextWaiting.copyId = assignedCopyId;
                nextWaiting.assignedDate = new Date();
                nextWaiting.pickupExpiry = expiry;
                await nextWaiting.save({ transaction });

                await reindexQueuePositions(reservation.bookId, transaction);

                await Notification.create({
                    memberId: nextWaiting.memberId,
                    memberType: nextWaiting.memberType,
                    title: 'Book Ready for Pickup',
                    message: `Your reserved book "${bookTitle}" is now ready for pickup! Please collect it by ${expiry.toLocaleString()}.`,
                    type: 'READY_FOR_PICKUP'
                }, { transaction });
            } else {
                await BookCopy.update({ status: 'Available' }, { where: { id: assignedCopyId }, transaction });
            }
        }

        // Send cancellation notification
        await Notification.create({
            memberId: reservation.memberId,
            memberType: reservation.memberType,
            title: 'Reservation Cancelled',
            message: `Your reservation for "${bookTitle}" has been cancelled.`,
            type: 'RESERVATION_CANCELLED'
        }, { transaction });

        await transaction.commit();
        return sendSuccess(res, reservation, 'Reservation cancelled successfully');
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('cancelReservation error:', error);
        return sendError(res, 'Error cancelling reservation', 500);
    }
};

/**
 * Admin: Get All Reservations with Filters
 */
exports.getAdminReservations = async (req, res) => {
    try {
        await processExpiredReservations();

        const { status, memberType, department, bookId, search, fromDate, toDate } = req.query;

        let whereClause = {};
        if (status && status !== 'All') whereClause.status = status;
        if (memberType && memberType !== 'All') whereClause.memberType = memberType;
        if (bookId) whereClause.bookId = bookId;

        if (fromDate || toDate) {
            let dateCond = {};
            if (fromDate) dateCond[Op.gte] = new Date(fromDate);
            if (toDate) dateCond[Op.lte] = new Date(toDate);
            whereClause.reservationDate = dateCond;
        }

        const reservations = await Reservation.findAll({
            where: whereClause,
            include: [
                { model: Book, attributes: ['id', 'title', 'department', 'isbn'] },
                { model: BookCopy, attributes: ['accessionNo', 'shelfLocation'] }
            ],
            order: [['created_at', 'DESC']]
        });

        // Enrich student/faculty member details
        const formatted = [];
        for (const resv of reservations) {
            const item = resv.toJSON();
            let memberName = 'Unknown Member';
            let memberIdentifier = '';
            let memberDept = '';

            if (item.memberType === 'Student') {
                const s = await Student.findByPk(item.memberId, { attributes: ['name', 'rollNo', 'department'] });
                if (s) {
                    memberName = s.name;
                    memberIdentifier = s.rollNo;
                    memberDept = s.department;
                }
            } else if (item.memberType === 'Faculty') {
                const f = await Faculty.findByPk(item.memberId, { attributes: ['name', 'employeeId', 'department'] });
                if (f) {
                    memberName = f.name;
                    memberIdentifier = f.employeeId;
                    memberDept = f.department;
                }
            }

            // Department filter check
            if (department && department !== 'All' && memberDept !== department && item.Book?.department !== department) {
                continue;
            }

            // Search filter check
            if (search) {
                const sLower = search.toLowerCase();
                const matchName = memberName.toLowerCase().includes(sLower);
                const matchId = memberIdentifier.toLowerCase().includes(sLower);
                const matchBook = (item.Book?.title || '').toLowerCase().includes(sLower);
                if (!matchName && !matchId && !matchBook) continue;
            }

            formatted.push({
                id: item.id,
                memberId: item.memberId,
                memberName,
                memberIdentifier,
                memberType: item.memberType,
                department: memberDept || item.Book?.department || '',
                bookId: item.bookId,
                bookTitle: item.Book ? item.Book.title : 'Unknown Book',
                accessionNo: item.BookCopy ? item.BookCopy.accessionNo : '-',
                queuePosition: item.queuePosition,
                reservationDate: item.reservationDate,
                pickupExpiry: item.pickupExpiry,
                status: item.status
            });
        }

        return sendSuccess(res, formatted, 'Reservations fetched successfully');
    } catch (error) {
        console.error('getAdminReservations error:', error);
        return sendError(res, 'Error fetching reservations', 500);
    }
};

/**
 * Admin: Mark as Collected (Issue Reserved Book)
 */
exports.collectReservedBook = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        await processExpiredReservations(transaction);

        const { id } = req.params;
        const reservation = await Reservation.findByPk(id, {
            include: [{ model: Book, attributes: ['id', 'title'] }],
            transaction
        });

        if (!reservation) {
            await transaction.rollback();
            return sendError(res, 'Reservation not found', 404);
        }

        if (reservation.status !== 'Ready for Pickup') {
            await transaction.rollback();
            return sendError(res, 'Only reservations with status "Ready for Pickup" can be marked as collected.', 400);
        }

        if (!reservation.copyId) {
            await transaction.rollback();
            return sendError(res, 'No physical copy assigned to this reservation.', 400);
        }

        const copy = await BookCopy.findByPk(reservation.copyId, { transaction });
        if (!copy) {
            await transaction.rollback();
            return sendError(res, 'Assigned copy record missing.', 404);
        }

        // Create Issue transaction
        const issueData = {
            bookId: reservation.bookId,
            copyId: reservation.copyId,
            issueDate: new Date(),
            returnDate: new Date(new Date().setDate(new Date().getDate() + 14)),
            status: 'Issued'
        };

        if (reservation.memberType === 'Student') {
            issueData.studentId = reservation.memberId;
        } else {
            issueData.facultyId = reservation.memberId;
        }

        const issue = await Issue.create(issueData, { transaction });

        // Update physical copy status
        copy.status = 'Issued';
        copy.timesIssued = (copy.timesIssued || 0) + 1;
        await copy.save({ transaction });

        // Complete Reservation
        reservation.status = 'Completed';
        reservation.completedDate = new Date();
        await reservation.save({ transaction });

        const bookTitle = reservation.Book ? reservation.Book.title : 'Book';

        // Send Notification
        await Notification.create({
            memberId: reservation.memberId,
            memberType: reservation.memberType,
            title: 'Book Collected & Issued',
            message: `Your reserved book "${bookTitle}" (Accession: ${copy.accessionNo}) has been collected and issued to you. Due date: ${issueData.returnDate.toLocaleDateString()}`,
            type: 'RESERVATION_COMPLETED'
        }, { transaction });

        await transaction.commit();
        return sendSuccess(res, { issue, reservation }, 'Reserved book collected and issued successfully');
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('collectReservedBook error:', error);
        return sendError(res, error.message || 'Error collecting reserved book', 500);
    }
};

/**
 * Get Notifications for Member
 */
exports.getNotifications = async (req, res) => {
    try {
        const { memberId, memberType } = req.query;
        if (!memberId || !memberType) {
            return sendError(res, 'Member ID and Member Type required', 400);
        }

        const notifications = await Notification.findAll({
            where: { memberId, memberType },
            order: [['created_at', 'DESC']],
            limit: 20
        });

        return sendSuccess(res, notifications, 'Notifications fetched successfully');
    } catch (error) {
        console.error('getNotifications error:', error);
        return sendError(res, 'Error fetching notifications', 500);
    }
};

/**
 * Mark Notification as Read
 */
exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.update({ isRead: true }, { where: { id } });
        return sendSuccess(res, null, 'Notification marked as read');
    } catch (error) {
        console.error('markNotificationRead error:', error);
        return sendError(res, 'Error updating notification', 500);
    }
};
