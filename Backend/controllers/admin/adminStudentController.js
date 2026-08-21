const { Student, Issue, Fine, Book, BookCopy } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/db');

exports.getStudents = async (req, res) => {
    try {
        const { search, department, year, status, sort, batch } = req.query;
        let whereClause = {};

        if (batch) {
            whereClause.batch = batch;
        }

        if (search) {
            whereClause = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { rollNo: { [Op.like]: `%${search}%` } },
                    { studentId: { [Op.like]: `%${search}%` } },
                    { department: { [Op.like]: `%${search}%` } },
                    { departmentFull: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (department) {
            whereClause.department = department;
        }

        if (year) {
            let mappedYear = year;
            if (year === 'I Year') mappedYear = '1';
            else if (year === 'II Year') mappedYear = '2';
            else if (year === 'III Year') mappedYear = '3';
            else if (year === 'IV Year') mappedYear = '4';
            whereClause.year = mappedYear;
        }

        if (status) {
            whereClause.status = status;
        }

        let order = [['name', 'ASC']];
        if (sort === 'roll') order = [['rollNo', 'ASC']];
        if (sort === 'department') order = [['department', 'ASC']];
        if (sort === 'recent') order = [['createdAt', 'DESC']];

        const students = await Student.findAll({
            where: whereClause,
            include: [
                {
                    model: Issue,
                    include: [Book, BookCopy]
                },
                {
                    model: Fine
                }
            ],
            order
        });

        // Sanitize: replace password hash with a boolean flag (existing security policy)
        const sanitizedStudents = students.map(s => {
            const plain = s.toJSON();
            plain.hasPassword = !!plain.password;
            delete plain.password;
            return plain;
        });

        return sendSuccess(res, sanitizedStudents, 'Students fetched successfully');
    } catch (error) {
        console.error('Error fetching students:', error);
        return sendError(res, 'Error fetching students', 500);
    }
};


exports.addStudent = async (req, res) => {
    try {
        const studentData = req.body;

        const existing = await Student.findOne({ where: { rollNo: studentData.rollNo } });
        if (existing) {
            return sendError(res, 'Student with this Roll No already exists', 400);
        }

        // Hash password (default: student123)
        const passwordPlain = studentData.password || 'student123';
        const hashedPassword = crypto.createHash('sha256').update(String(passwordPlain)).digest('hex');

        const newStudent = await Student.create({
            ...studentData,
            password: hashedPassword
        });

        // Hide password in response
        newStudent.password = undefined;

        return sendSuccess(res, newStudent, 'Student added successfully', 201);
    } catch (error) {
        return sendError(res, 'Error adding student', 500);
    }
};

exports.editStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (updates.password) {
            updates.password = crypto.createHash('sha256').update(String(updates.password)).digest('hex');
        } else {
            delete updates.password;
        }

        const [updatedRows] = await Student.update(updates, { where: { id } });

        if (updatedRows === 0) {
            return sendError(res, 'Student not found or no changes made', 404);
        }

        const updatedStudent = await Student.findByPk(id);
        updatedStudent.password = undefined; // hide password

        return sendSuccess(res, updatedStudent, 'Student updated successfully');
    } catch (error) {
        return sendError(res, 'Error updating student', 500);
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Student.destroy({ where: { id } });

        if (!deleted) return sendError(res, 'Student not found', 404);
        return sendSuccess(res, null, 'Student deleted successfully');
    } catch (error) {
        return sendError(res, 'Error deleting student', 500);
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return sendError(res, 'Invalid request, ids array required', 400);
        }

        await Student.destroy({ where: { id: { [Op.in]: ids } } });
        return sendSuccess(res, null, 'Students deleted successfully');
    } catch (error) {
        return sendError(res, 'Error bulk deleting students', 500);
    }
};

exports.bulkUpload = async (req, res) => {
    let transaction;
    try {
        const students = req.body.students;
        console.log(`[DEBUG] Number of records sent from the frontend: ${students ? students.length : 0}`);
        console.log(`[DEBUG] req.body.students.length: ${students ? students.length : 0}`);

        if (!students || !students.length) return sendError(res, 'No student data provided', 400);

        transaction = await sequelize.transaction();

        let insertedCount = 0;

        for (let i = 0; i < students.length; i++) {
            const s = students[i];
            console.log(`[DEBUG] Processing row index: ${i + 1}`);
            console.log(`[DEBUG] Student registration number: ${s.rollNo}`);
            
            try {
                // Convert all empty strings to null to prevent ENUM/DATE/INT strict mode validation errors
                for (let key in s) {
                    if (s[key] === "") {
                        s[key] = null;
                    }
                }

                const pwd = s.password || 'student123';
                const hash = crypto.createHash('sha256').update(String(pwd)).digest('hex');
                
                const newStudent = await Student.create({
                    ...s,
                    password: hash,
                    isFirstLogin: true
                }, { transaction });
                
                console.log(`[DEBUG] Student ID created: ${newStudent.id}`);
                insertedCount++;
            } catch (err) {
                console.error(`[DEBUG] Error on row ${i + 1}: ${err.message}`);
                const reason = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
                throw new Error(`Row ${i + 1} (${s.name || 'Unknown'}): ${reason}`);
            }
        }

        await transaction.commit();
        console.log(`[DEBUG] Total inserted records: ${insertedCount}`);
        console.log(`[DEBUG] Transaction commit status: SUCCESS`);

        return sendSuccess(res, { insertedCount }, `Successfully imported ${insertedCount} students`);
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
            console.log(`[DEBUG] Transaction commit status: ROLLED BACK`);
        }
        console.error(`[DEBUG] Bulk upload failed: ${error.message}`);
        // Return clear error with row number if thrown from loop, or general error
        const msg = error.message.startsWith('Row') ? error.message : 'Error with bulk upload';
        return sendError(res, msg, 400);
    }
};

exports.getBatches = async (req, res) => {
    try {
        const batches = await Student.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('batch')), 'batch']],
            where: { batch: { [Op.not]: null } },
            order: [['batch', 'DESC']]
        });
        const batchList = batches.map(b => b.batch);
        return sendSuccess(res, batchList, 'Batches fetched successfully');
    } catch (error) {
        console.error('Error fetching batches:', error);
        return sendError(res, 'Error fetching batches', 500);
    }
};

exports.bulkUpdateAcademic = async (req, res) => {
    let transaction;
    try {
        const { batch, year, semester } = req.body;
        if (!batch) {
            return sendError(res, 'Academic Year (batch) is required', 400);
        }
        if (!year && !semester) {
            return sendError(res, 'Either Year or Semester must be provided', 400);
        }

        const updates = {};
        if (year) updates.year = year;
        if (semester) updates.semester = semester;

        transaction = await sequelize.transaction();

        const [updatedCount] = await Student.update(updates, { 
            where: { batch }, 
            transaction 
        });

        if (updatedCount === 0) {
            await transaction.rollback();
            return sendError(res, 'No students were found for the selected Academic Year', 404);
        }

        await transaction.commit();

        return sendSuccess(res, { updatedCount }, `Successfully updated ${updatedCount} students`);
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Error in bulkUpdateAcademic:', error);
        return sendError(res, 'Error updating students', 500);
    }
};
