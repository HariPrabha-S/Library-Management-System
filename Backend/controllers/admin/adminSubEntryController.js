const { Department, Language, Vendor, Subject, Holiday, Publisher } = require('../../models/admin/adminmodels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

const models = { departments: Department, languages: Language, vendors: Vendor, subjects: Subject, holidays: Holiday, publishers: Publisher };

const getModel = (req) => models[req.params.type];
const validate = (body, isHoliday) => {
    const name = String(body.name || '').trim();
    if (!name) return 'Name is required';
    if (isHoliday && !body.date) return 'Holiday date is required';
    return null;
};

exports.list = async (req, res) => {
    try { return sendSuccess(res, await getModel(req).findAll({ order: [['name', 'ASC']] }), 'Entries fetched successfully'); }
    catch (error) { return sendError(res, 'Error fetching entries', 500); }
};
exports.get = async (req, res) => {
    try {
        const entry = await getModel(req).findByPk(req.params.id);
        return entry ? sendSuccess(res, entry, 'Entry fetched successfully') : sendError(res, 'Entry not found', 404);
    } catch (error) { return sendError(res, 'Error fetching entry', 500); }
};
exports.create = async (req, res) => {
    try {
        const isHoliday = req.params.type === 'holidays';
        const error = validate(req.body, isHoliday);
        if (error) return sendError(res, error, 400);
        const entry = await getModel(req).create({ name: String(req.body.name).trim(), ...(isHoliday ? { date: req.body.date } : {}) });
        return sendSuccess(res, entry, 'Entry created successfully', 201);
    } catch (error) {
        if (error instanceof UniqueConstraintError) return sendError(res, 'An entry with the same name or date already exists', 409);
        return sendError(res, 'Error creating entry', 500);
    }
};
exports.update = async (req, res) => {
    try {
        const isHoliday = req.params.type === 'holidays';
        const error = validate(req.body, isHoliday);
        if (error) return sendError(res, error, 400);
        const entry = await getModel(req).findByPk(req.params.id);
        if (!entry) return sendError(res, 'Entry not found', 404);
        await entry.update({ name: String(req.body.name).trim(), ...(isHoliday ? { date: req.body.date } : {}) });
        return sendSuccess(res, entry, 'Entry updated successfully');
    } catch (error) {
        if (error instanceof UniqueConstraintError) return sendError(res, 'An entry with the same name or date already exists', 409);
        return sendError(res, 'Error updating entry', 500);
    }
};
exports.remove = async (req, res) => {
    try { return await getModel(req).destroy({ where: { id: req.params.id } }) ? sendSuccess(res, null, 'Entry deleted successfully') : sendError(res, 'Entry not found', 404); }
    catch (error) {
        if (error instanceof ForeignKeyConstraintError) return sendError(res, 'This entry is used by one or more books and cannot be deleted.', 409);
        return sendError(res, 'Error deleting entry', 500);
    }
};
