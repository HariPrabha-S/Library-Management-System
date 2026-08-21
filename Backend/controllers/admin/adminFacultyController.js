const { Faculty, Issue, Fine, Book, BookCopy } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const crypto = require('crypto');
const { Op } = require('sequelize');

exports.getFaculties = async (req, res) => {
    try {
        const { search, department, sort } = req.query;
        let whereClause = {};

        if (search) {
            whereClause = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { employeeId: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { department: { [Op.like]: `%${search}%` } },
                    { departmentFull: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (department) {
            whereClause.department = department;
        }

        let order = [['name', 'ASC']];
        if (sort === 'facultyId' || sort === 'employeeId') order = [['employeeId', 'ASC']];
        if (sort === 'department') order = [['department', 'ASC']];
        if (sort === 'recent') order = [['createdAt', 'DESC']];

        const faculties = await Faculty.findAll({
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
        const sanitizedFaculties = faculties.map(f => {
            const plain = f.toJSON();
            plain.hasPassword = !!plain.password;
            delete plain.password;
            return plain;
        });

        return sendSuccess(res, sanitizedFaculties, 'Faculties fetched successfully');
    } catch (error) {
        console.error('Error fetching faculties:', error);
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

        const passwordPlain = facultyData.password || 'NSCET123';
        const hashedPassword = crypto.createHash('sha256').update(String(passwordPlain)).digest('hex');

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
            updates.password = crypto.createHash('sha256').update(String(updates.password)).digest('hex');
        } else {
            delete updates.password;
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
            const pwd = f.password || 'NSCET123';
            const hash = crypto.createHash('sha256').update(String(pwd)).digest('hex');
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
