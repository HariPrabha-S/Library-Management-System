const { Book, BookCopy, Student, Faculty, Issue, Fine, Request } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');
const { getOverdueDaysCount } = require('../../utils/fineHelper');


const getTodayISO = () => new Date().toISOString().split('T')[0];

exports.getStats = async (req, res) => {
    try {
        const today = getTodayISO();

        const totalBooks = await BookCopy.count();
        const issuedBooks = await BookCopy.count({
            where: {
                status: 'Issued'
            }
        });
        const availableBooks = await BookCopy.count({
            where: {
                status: 'Available'
            }
        });
        const overdueBooks = await Issue.count({
            where: {
                [Op.or]: [
                    { status: 'Overdue' },
                    {
                        status: 'Issued',
                        returnDate: {
                            [Op.lt]: today
                        }
                    }
                ]
            }
        });

        return sendSuccess(res, {
            totalBooks,
            issuedBooks,
            availableBooks,
            overdueBooks,
        }, 'Stats retrieved successfully');
    } catch (error) {
        console.error('getStats error:', error);
        return sendError(res, 'Error fetching dashboard statistics', 500);
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            include: [
                { model: Book, attributes: ['title'] },
                { model: Student, attributes: ['name', 'rollNo'] },
                { model: Faculty, attributes: ['name', 'employeeId'] }
            ],
            order: [['requestDate', 'DESC']]
        });

        const mapped = requests.map(item => {
            const borrowerName = item.Student ? item.Student.name : item.Faculty ? item.Faculty.name : 'Unknown';
            const rollNo = item.Student ? item.Student.rollNo : item.Faculty ? item.Faculty.employeeId : '';

            return {
                id: item.id,
                student: borrowerName,
                rollNo,
                book: item.Book ? item.Book.title : 'Unknown Book',
                date: item.requestDate,
                status: item.status
            };
        });

        return sendSuccess(res, mapped, 'Requests fetched successfully');
    } catch (error) {
        console.error('getRequests error:', error);
        return sendError(res, 'Error fetching requests', 500);
    }
};

