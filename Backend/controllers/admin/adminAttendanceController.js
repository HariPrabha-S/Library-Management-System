const { Attendance, Student, Faculty, sequelize } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');

exports.getTodayAttendance = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const records = await Attendance.findAll({
            where: {
                scanTime: { [Op.gte]: startOfToday }
            },
            include: [{ model: Student, attributes: ['name', 'rollNo', 'department'] }],
            order: [['scanTime', 'DESC']]
        });

        const mapped = records.map(r => ({
            id: r.id,
            name: r.Student ? r.Student.name : 'Unknown',
            rollNo: r.Student ? r.Student.rollNo : '',
            type: r.type,
            time: new Date(r.scanTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }));

        return sendSuccess(res, mapped, 'Today attendance records fetched');
    } catch (error) {
        console.error('getTodayAttendance error:', error);
        return sendError(res, 'Error fetching attendance', 500);
    }
};

exports.scanId = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.body; // rollNo
        if (!id) return sendError(res, 'ID required', 400);

        const student = await Student.findOne({ where: { rollNo: id }, transaction });
        if (!student) {
            await transaction.rollback();
            return sendError(res, 'Student not found', 404);
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const lastRecord = await Attendance.findOne({
            where: { studentId: student.id, scanTime: { [Op.gte]: startOfToday } },
            order: [['scanTime', 'DESC']],
            transaction
        });

        const nextType = (lastRecord && lastRecord.type === 'IN') ? 'OUT' : 'IN';

        const newRecord = await Attendance.create({
            studentId: student.id,
            type: nextType,
            scanTime: new Date()
        }, { transaction });

        await transaction.commit();

        const responseData = {
            id: newRecord.id,
            name: student.name,
            rollNo: student.rollNo,
            type: nextType,
            time: new Date(newRecord.scanTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        return sendSuccess(res, responseData, `Marked ${nextType} successfully`, 201);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('scanId error:', error);
        return sendError(res, 'Error processing scan', 500);
    }
};

exports.moveOut = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { rollNumbers } = req.body; // Array of rollNos
        if (!rollNumbers || !Array.isArray(rollNumbers)) {
            await transaction.rollback();
            return sendError(res, 'Roll numbers array required', 400);
        }

        const students = await Student.findAll({ where: { rollNo: { [Op.in]: rollNumbers } }, transaction });
        const now = new Date();

        const outRecords = students.map(s => ({
            studentId: s.id,
            type: 'OUT',
            scanTime: now
        }));

        if (outRecords.length > 0) {
            await Attendance.bulkCreate(outRecords, { transaction });
        }

        await transaction.commit();
        return sendSuccess(res, null, 'Moved students to OUT successfully');
    } catch (error) {
        if (transaction) await transaction.rollback();
        return sendError(res, 'Error moving students to out', 500);
    }
};

exports.clearOut = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        await Attendance.destroy({
            where: { type: 'OUT', scanTime: { [Op.gte]: startOfToday } }
        });

        return sendSuccess(res, null, 'Cleared OUT records successfully');
    } catch (error) {
        return sendError(res, 'Error clearing OUT records', 500);
    }
};
