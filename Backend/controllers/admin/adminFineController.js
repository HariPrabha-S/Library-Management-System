const { Fine, Student, Faculty } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');

exports.getFines = async (req, res) => {
    try {
        const fines = await Fine.findAll();
        
        // Similarly mapping the fine list
        const mappedFines = await Promise.all(fines.map(async (fine) => {
             let borrowerName = 'Unknown';
             if (fine.borrowerType === 'Student') {
                 const s = await Student.findByPk(fine.borrowerId, { attributes: ['name']});
                 if (s) borrowerName = s.name;
             } else {
                 const f = await Faculty.findByPk(fine.borrowerId, { attributes: ['name']});
                 if (f) borrowerName = f.name;
             }

             return {
                 id: fine.id,
                 name: borrowerName,
                 type: fine.borrowerType,
                 amount: fine.amount,
                 reason: fine.reason,
                 status: fine.status
             }
        }));

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

        // Deduct from total fine of borrower
        if (fine.borrowerType === 'Student') {
            await Student.decrement('fine', { by: fine.amount, where: { id: fine.borrowerId }, transaction });
        } else {
            await Faculty.decrement('fine', { by: fine.amount, where: { id: fine.borrowerId }, transaction });
        }

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

        // Add back to total fine of borrower
        if (fine.borrowerType === 'Student') {
            await Student.increment('fine', { by: fine.amount, where: { id: fine.borrowerId }, transaction });
        } else {
            await Faculty.increment('fine', { by: fine.amount, where: { id: fine.borrowerId }, transaction });
        }

        await transaction.commit();
        return sendSuccess(res, fine, 'Fine reverted successfully');
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error reverting fine', 500);
    }
};
