const { Attendance, Student, Faculty } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');

exports.getTodayAttendance = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const records = await Attendance.findAll({
            where: {
                date: startOfToday
            },
            order: [['createdAt', 'DESC']]
        });

        // The frontend expects the format { id, name, rollNo, type, time }
        return sendSuccess(res, records, 'Today attendance records fetched');
    } catch (error) {
        return sendError(res, 'Error fetching attendance', 500);
    }
};

exports.scanId = async (req, res) => {
    const transaction = await Attendance.sequelize.transaction();
    try {
        const { id } = req.body; // Can be rollNo or facultyId
        if (!id) return sendError(res, 'ID required', 400);
        
        // Find if student or faculty to get name
        let name = 'Unknown';
        let borrowerId = null;

        const student = await Student.findOne({ where: { rollNo: id }, transaction });
        if (student) {
            name = student.name;
            borrowerId = student.id;
        } else {
            const faculty = await Faculty.findOne({ where: { facultyId: id }, transaction });
            if (faculty) {
                name = faculty.name;
            } else {
                 await transaction.rollback();
                 return sendError(res, 'ID not registered', 404);
            }
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Check last record for this ID today
        const lastRecord = await Attendance.findOne({
            where: { rollNo: id, date: startOfToday },
            order: [['createdAt', 'DESC']],
            transaction
        });

        const nextType = (lastRecord && lastRecord.type === 'IN') ? 'OUT' : 'IN';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const newRecord = await Attendance.create({
            studentId: borrowerId, // optional link to User model
            rollNo: id,
            name,
            type: nextType,
            time: timeString
        }, { transaction });

        await transaction.commit();
        return sendSuccess(res, newRecord, `Marked ${nextType} successfully`, 201);
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error processing scan', 500);
    }
};

exports.moveOut = async (req, res) => {
    const transaction = await Attendance.sequelize.transaction();
    try {
        const { rollNumbers } = req.body; // Array of IDs
        if (!rollNumbers || !Array.isArray(rollNumbers)) {
            await transaction.rollback();
            return sendError(res, 'Roll numbers array required', 400);
        }

        const now = new Date();
        const startOfToday = new Date(now).setHours(0,0,0,0);
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const outRecords = [];
        for (const rollNo of rollNumbers) {
             // Let's get the name based on the last IN record today
             const lastIn = await Attendance.findOne({
                 where: { rollNo, type: 'IN', date: startOfToday },
                 order: [['createdAt', 'DESC']],
                 transaction
             });

             if (lastIn) {
                 outRecords.push({
                     studentId: lastIn.studentId,
                     rollNo: lastIn.rollNo,
                     name: lastIn.name,
                     type: 'OUT',
                     time: timeString,
                     date: now
                 });
             }
        }

        if (outRecords.length > 0) {
            await Attendance.bulkCreate(outRecords, { transaction });
        }

        await transaction.commit();
        return sendSuccess(res, null, 'Moved students to OUT successfully');
    } catch (error) {
        await transaction.rollback();
        return sendError(res, 'Error moving students to out', 500);
    }
};

exports.clearOut = async (req, res) => {
     try {
         const startOfToday = new Date();
         startOfToday.setHours(0,0,0,0);

         // Delete OUT records for today specifically for cleanup if required
         await Attendance.destroy({
             where: { type: 'OUT', date: startOfToday }
         });

         return sendSuccess(res, null, 'Cleared OUT records successfully');
     } catch (error) {
         return sendError(res, 'Error clearing OUT records', 500);
     }
};
