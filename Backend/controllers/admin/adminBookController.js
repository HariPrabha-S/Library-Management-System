const { Book } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');

exports.getBooks = async (req, res) => {
    try {
        const { keyword, field, department, subject, issueType, availability, limit, fromDate, toDate } = req.query;

        let whereClause = {};

        if (keyword && field) {
            whereClause[field] = { [Op.like]: `%${keyword}%` };
        } else if (keyword) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${keyword}%` } },
                { author: { [Op.like]: `%${keyword}%` } },
                { accessionNo: { [Op.like]: `%${keyword}%` } }
            ];
        }

        if (department) whereClause.department = department;
        if (subject) whereClause.subject = { [Op.like]: `%${subject}%` };
        if (issueType) whereClause.issueType = issueType;

        if (availability === 'available') {
            whereClause.availableCopies = { [Op.gt]: 0 };
        } else if (availability === 'issued') {
            whereClause.availableCopies = 0;
        }

        if (fromDate || toDate) {
            whereClause.purchaseDate = {};
            if (fromDate) whereClause.purchaseDate[Op.gte] = fromDate;
            if (toDate) whereClause.purchaseDate[Op.lte] = toDate;
        }

        const queryOptions = { where: whereClause, order: [['created_at', 'DESC']] };
        if (limit) queryOptions.limit = parseInt(limit);

        const books = await Book.findAll(queryOptions);
        return sendSuccess(res, books, 'Books fetched successfully');
    } catch (error) {
        return sendError(res, 'Error fetching books', 500);
    }
};

exports.addBook = async (req, res) => {
    try {
        const bookData = req.body;
        const existingBook = await Book.findOne({ where: { accessionNo: bookData.accessionNo } });
        if (existingBook) {
            return sendError(res, 'Book with this Accession No already exists', 400);
        }

        const newBook = await Book.create({
            ...bookData,
            availableCopies: bookData.totalCopies || 1
        });

        return sendSuccess(res, newBook, 'Book added successfully', 201);
    } catch (error) {
        console.error('addBook error:', error);
        return sendError(res, 'Error adding book', 500);
    }
};

exports.editBook = async (req, res) => {
    try {
        const { id } = req.params;
        const [updatedRows] = await Book.update(req.body, { where: { id } });

        if (updatedRows === 0) return sendError(res, 'Book not found or no changes made', 404);
        const updatedBook = await Book.findByPk(id);
        return sendSuccess(res, updatedBook, 'Book updated successfully');
    } catch (error) {
        return sendError(res, 'Error updating book', 500);
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Book.destroy({ where: { id } });
        if (!deleted) return sendError(res, 'Book not found', 404);
        return sendSuccess(res, null, 'Book deleted successfully');
    } catch (error) {
        return sendError(res, 'Error deleting book', 500);
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return sendError(res, 'Invalid request, ids array required', 400);

        await Book.destroy({ where: { id: { [Op.in]: ids } } });
        return sendSuccess(res, null, 'Books deleted successfully');
    } catch (error) {
        return sendError(res, 'Error bulk deleting books', 500);
    }
};

exports.bulkUpload = async (req, res) => {
    try {
        const books = req.body.books;
        if (!books || !books.length) return sendError(res, 'No book data provided', 400);

        const createdBooks = await Book.bulkCreate(books.map(b => ({
            ...b,
            availableCopies: b.totalCopies
        })), { ignoreDuplicates: true });

        return sendSuccess(res, createdBooks, 'Bulk upload successful');
    } catch (error) {
        return sendError(res, 'Error with bulk upload', 500);
    }
};
