const { Faculty } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.getFaculties = async (req, res) => {
    try {
        const { search, department, sort } = req.query;
        let whereClause = {};

        if (search) {
            whereClause = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { facultyId: { [Op.like]: `%${search}%` } },
                    { employeeId: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (department) {
            whereClause.department = department;
        }

        let order = [['name', 'ASC']];
        if (sort === 'facultyId') order = [['facultyId', 'ASC']];
        if (sort === 'department') order = [['department', 'ASC']];
        if (sort === 'recent') order = [['createdAt', 'DESC']];

        const faculties = await Faculty.findAll({ where: whereClause, order });
        return sendSuccess(res, faculties, 'Faculties fetched successfully');
    } catch (error) {
        return sendError(res, 'Error fetching faculties', 500);
    }
};

exports.addFaculty = async (req, res) => {
    try {
        const facultyData = req.body;

        const existing = await Faculty.findOne({
            where: {
                [Op.or]: [
                    { facultyId: facultyData.facultyId },
                    { employeeId: facultyData.employeeId }
                ]
            }
        });

        if (existing) {
            return sendError(res, 'Faculty with this ID or Employee ID already exists', 400);
        }

        const passwordPlain = facultyData.password || facultyData.facultyId;
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        const newFaculty = await Faculty.create({
            ...facultyData,
            password: hashedPassword
        });

        newFaculty.password = undefined;

        return sendSuccess(res, newFaculty, 'Faculty added successfully', 201);
    } catch (error) {
        return sendError(res, 'Error adding faculty', 500);
    }
};

exports.editFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const [updatedRows] = await Faculty.update(updates, { where: { id } });

        if (updatedRows === 0) {
            return sendError(res, 'Faculty not found or no changes made', 404);
        }

        const updatedFaculty = await Faculty.findByPk(id);
        updatedFaculty.password = undefined;

        return sendSuccess(res, updatedFaculty, 'Faculty updated successfully');
    } catch (error) {
        return sendError(res, 'Error updating faculty', 500);
    }
};

exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Faculty.destroy({ where: { id } });

        if (!deleted) return sendError(res, 'Faculty not found', 404);
        return sendSuccess(res, null, 'Faculty deleted successfully');
    } catch (error) {
        return sendError(res, 'Error deleting faculty', 500);
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return sendError(res, 'Invalid request, ids array required', 400);
        }

        await Faculty.destroy({ where: { id: { [Op.in]: ids } } });
        return sendSuccess(res, null, 'Faculties deleted successfully');
    } catch (error) {
        return sendError(res, 'Error bulk deleting faculties', 500);
    }
};

exports.bulkUpload = async (req, res) => {
    try {
        const faculties = req.body.faculties;
        if (!faculties || !faculties.length) return sendError(res, 'No faculty data provided', 400);

        const hashedFaculties = await Promise.all(faculties.map(async (f) => {
            const pwd = f.password || f.facultyId;
            const hash = await bcrypt.hash(pwd, 10);
            return {
                ...f,
                password: hash
            };
        }));

        const created = await Faculty.bulkCreate(hashedFaculties, { ignoreDuplicates: true });

        return sendSuccess(res, created, 'Bulked upload successful');
    } catch (error) {
        return sendError(res, 'Error with bulk upload', 500);
    }
};
