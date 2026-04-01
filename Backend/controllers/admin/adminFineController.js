const { Fine, Student, Faculty } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');

exports.getFines = async (req, res) => {
    try {
        const { status, fromDate, toDate } = req.query;
        const { Op } = require('sequelize');

        let whereClause = {};
        if (status && status !== 'All') {
            whereClause.status = status;
        }

        if (fromDate && toDate) {
            whereClause.createdAt = { [Op.between]: [fromDate + ' 00:00:00', toDate + ' 23:59:59'] };
        }

        const fines = await Fine.findAll({
            where: whereClause,
            include: [
                { model: Student, attributes: ['name'] },
                { model: Faculty, attributes: ['name'] }
            ],
            order: [['amount', 'DESC']]
        });

        const mappedFines = fines.map(fine => {
            let borrowerName = 'Unknown';
            if (fine.Student) borrowerName = fine.Student.name;
            else if (fine.Faculty) borrowerName = fine.Faculty.name;

            return {
                id: fine.id,
                name: borrowerName,
                type: fine.userType,
                amount: fine.amount,
                reason: fine.reason,
                status: fine.status
            }
        });

        return sendSuccess(res, mappedFines, 'Fines fetched successfully');
    } catch (error) {
        return sendError(res, 'Error fetching fines', 500);
    }
};

exports.clearFine = async (req, res) => {
    const transaction = await Fine.sequelize.transaction();
    try {
        const { id } = req.params;
        const fine = await Fine.findByPk(id, { transaction });

        if (!fine) {
            await transaction.rollback();
            return sendError(res, 'Fine not found', 404);
        }

        if (fine.status === 'Paid') {
            await transaction.rollback();
            return sendError(res, 'Fine already cleared', 400);
        }

        fine.status = 'Paid';
        await fine.save({ transaction });

        await transaction.commit();
        return sendSuccess(res, fine, 'Fine cleared successfully');
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error clearing fine', 500);
    }
};

exports.revertFine = async (req, res) => {
    const transaction = await Fine.sequelize.transaction();
    try {
        const { id } = req.params;
        const fine = await Fine.findByPk(id, { transaction });

        if (!fine) {
            await transaction.rollback();
            return sendError(res, 'Fine not found', 404);
        }

        if (fine.status === 'Unpaid') {
            await transaction.rollback();
            return sendError(res, 'Fine already unpaid', 400);
        }

        fine.status = 'Unpaid';
        await fine.save({ transaction });

        await transaction.commit();
        return sendSuccess(res, fine, 'Fine reverted successfully');
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error reverting fine', 500);
    }
};
