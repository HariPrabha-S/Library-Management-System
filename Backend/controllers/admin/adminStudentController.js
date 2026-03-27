const { Student } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.getStudents = async (req, res) => {
    try {
        const { search, department, sort } = req.query;
        let whereClause = {};

        if (search) {
            whereClause = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { rollNo: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (department) {
            whereClause.department = department;
        }

        let order = [['name', 'ASC']];
        if (sort === 'roll') order = [['rollNo', 'ASC']];
        if (sort === 'department') order = [['department', 'ASC']];
        if (sort === 'recent') order = [['createdAt', 'DESC']];

        const students = await Student.findAll({ where: whereClause, order });
        return sendSuccess(res, students, 'Students fetched successfully');
    } catch (error) {
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

        // Hash password (default: dob or random)
        const passwordPlain = studentData.password || studentData.rollNo;
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

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
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const [ updatedRows ] = await Student.update(updates, { where: { id } });

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
    try {
        const students = req.body.students;
        if (!students || !students.length) return sendError(res, 'No student data provided', 400);

        const hashedStudents = await Promise.all(students.map(async (s) => {
            const pwd = s.password || s.rollNo; 
            const hash = await bcrypt.hash(pwd, 10);
            return {
                ...s,
                password: hash
            };
        }));

        const created = await Student.bulkCreate(hashedStudents, { ignoreDuplicates: true });
        
        return sendSuccess(res, created, 'Bulked upload successful');
    } catch (error) {
        return sendError(res, 'Error with bulk upload', 500);
    }
};
