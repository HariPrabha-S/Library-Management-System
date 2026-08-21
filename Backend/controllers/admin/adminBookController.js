const { Book, BookCopy, Department, Language, Subject, Publisher, Vendor } = require('../../models/admin/adminModels');
const { sendSuccess, sendError } = require('../../utils/adminResponse');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/db');
const XLSX = require('xlsx');
const { normalizeBookUploadRow, getNextAccessionNumber, getNextAccessionDetails } = require('../../utils/bookBulkUpload');

const isValidIsbn = (isbnVal) => {
    if (isbnVal === null || isbnVal === undefined) return false;
    const str = String(isbnVal).trim();
    if (str === '' || str === '0' || str.toLowerCase() === 'unknown' || str.toLowerCase() === 'n/a') {
        return false;
    }
    return true;
};

const masterDataModels = {
    departmentId: Department,
    languageId: Language,
    subjectId: Subject,
    publisherId: Publisher,
    vendorId: Vendor
};

const validateMasterDataIds = async (payload, transaction, requireClassification = false) => {
    if (requireClassification && (!payload.departmentId || !payload.subjectId)) {
        return 'Department and Subject must be selected.';
    }

    for (const [field, Model] of Object.entries(masterDataModels)) {
        if (payload[field] === undefined || payload[field] === null || payload[field] === '') continue;
        const record = await Model.findByPk(payload[field], { transaction });
        if (!record) return `Selected ${field.replace('Id', '')} does not exist.`;
    }
    return null;
};

exports.getBooks = async (req, res) => {
    try {
        const { keyword, field, department, subject, issueType, availability, limit, fromDate, toDate } = req.query;

        let whereClause = {};

        if (keyword && field) {
            if (field === 'accessionNo') {
                const copy = await BookCopy.findOne({ where: { accessionNo: keyword } });
                if (!copy) {
                    return sendSuccess(res, [], 'Books fetched successfully');
                }
                whereClause.id = copy.bookId;
            } else {
                whereClause[field] = { [Op.like]: `%${keyword}%` };
            }
        } else if (keyword) {
            const copy = await BookCopy.findOne({ where: { accessionNo: keyword } });
            if (copy) {
                whereClause.id = copy.bookId;
            } else {
                whereClause[Op.or] = [
                    { title: { [Op.like]: `%${keyword}%` } },
                    { author: { [Op.like]: `%${keyword}%` } }
                ];
            }
        }

        if (department) whereClause.department = department;
        if (subject) whereClause.subject = { [Op.like]: `%${subject}%` };

        // Subquery mapping for copy constraints
        if (issueType) {
            whereClause.id = {
                [Op.in]: sequelize.literal(`(
                    SELECT DISTINCT book_id FROM book_copies WHERE issue_type = ${sequelize.escape(issueType)}
                )`)
            };
        }

        if (availability === 'available') {
            whereClause.id = {
                [Op.in]: sequelize.literal(`(
                    SELECT DISTINCT book_id FROM book_copies WHERE status = 'Available'
                )`)
            };
        } else if (availability === 'issued') {
            whereClause.id = {
                [Op.in]: sequelize.literal(`(
                    SELECT DISTINCT book_id FROM book_copies WHERE status = 'Issued'
                )`)
            };
        }

        if (fromDate || toDate) {
            let purchaseWhere = [];
            if (fromDate) purchaseWhere.push(`purchase_date >= ${sequelize.escape(fromDate)}`);
            if (toDate) purchaseWhere.push(`purchase_date <= ${sequelize.escape(toDate)}`);
            whereClause.id = {
                [Op.in]: sequelize.literal(`(
                    SELECT DISTINCT book_id FROM book_copies WHERE ${purchaseWhere.join(' AND ')}
                )`)
            };
        }

        const books = await Book.findAll({
            where: whereClause,
            include: [
                { model: Department, as: 'departmentEntry', attributes: ['id', 'name'], required: false },
                { model: Language, as: 'languageEntry', attributes: ['id', 'name'], required: false },
                { model: Subject, as: 'subjectEntry', attributes: ['id', 'name'], required: false },
                { model: Publisher, as: 'publisherEntry', attributes: ['id', 'name'], required: false },
                { model: Vendor, as: 'vendorEntry', attributes: ['id', 'name'], required: false }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id
                        )`),
                        'totalCopies'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id AND copies.status = 'Available'
                        )`),
                        'availableCopies'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id AND copies.status = 'Issued'
                        )`),
                        'issuedCopies'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT MIN(accession_no)
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id
                        )`),
                        'minAccession'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT MAX(accession_no)
                            FROM book_copies AS copies
                            WHERE copies.book_id = Book.id
                        )`),
                        'maxAccession'
                    ]
                ]
            },
            order: [['created_at', 'DESC']],
            limit: limit ? parseInt(limit, 10) : undefined
        });

        const formattedBooks = books.map(book => {
            const data = book.toJSON();
            data.department = data.departmentEntry?.name || data.department;
            data.language = data.languageEntry?.name || data.language;
            data.subject = data.subjectEntry?.name || data.subject;
            data.publisher = data.publisherEntry?.name || data.publisher;
            data.vendor = data.vendorEntry?.name || data.vendor;
            data.totalCopies = parseInt(data.totalCopies || 0, 10);
            data.availableCopies = parseInt(data.availableCopies || 0, 10);
            data.issuedCopies = parseInt(data.issuedCopies || 0, 10);

            const minAcc = data.minAccession;
            const maxAcc = data.maxAccession;
            if (!minAcc) {
                data.accessionNumbers = "-";
            } else if (minAcc === maxAcc) {
                data.accessionNumbers = minAcc;
            } else {
                data.accessionNumbers = `${minAcc} - ${maxAcc}`;
            }
            return data;
        });

        return sendSuccess(res, formattedBooks, 'Books fetched successfully');
    } catch (error) {
        require('fs').appendFileSync('C:/Users/hari2/.gemini/antigravity-ide/brain/d3445933-d394-478b-a059-0049aca19e94/scratch/error.log', 'getBooks error: ' + error.stack + '\n');
        console.error('getBooks error:', error);
        return sendError(res, 'Error fetching books', 500);
    }
};

exports.addBook = async (req, res) => {
    try {
        const { normalizeBookUploadRow, getNextAccessionNumber } = require('../../utils/bookBulkUpload');
        const row = req.body;
        const normalized = normalizeBookUploadRow(row);

        if (!normalized.title || !String(normalized.title).trim()) {
            return sendError(res, 'Book title is required', 400);
        }

        const bookPayload = {
            isbn: normalized.isbn || null,
            title: normalized.title.trim(),
            subtitle: normalized.subtitle || null,
            author: normalized.author || null,
            publisher: normalized.publisher || null,
            publicationPlace: normalized.publicationPlace || null,
            edition: normalized.edition || null,
            indianEdition: !!normalized.indianEdition,
            year: normalized.year || null,
            department: normalized.department || null,
            subject: normalized.subject || null,
            language: normalized.language || null,
            category: normalized.category || null,
            bindingType: normalized.bindingType || null,
            callNumber: normalized.callNumber || null,
            price: normalized.price !== null ? normalized.price : 0.00,
            contentPages: normalized.contentPages || null,
            textPages: normalized.textPages || null,
            vendor: normalized.vendor || null,
            invoiceNumber: normalized.invoiceNumber || null,
            fundSource: normalized.fundSource || null,
            purchaseCost: normalized.purchaseCost || null,
            giftBook: !!normalized.giftBook,
            giftNote: normalized.giftNote || null,
            remarks: normalized.remarks || null
        };

        const transaction = await sequelize.transaction();
        try {
            let targetBook = null;
            if (isValidIsbn(bookPayload.isbn)) {
                targetBook = await Book.findOne({ where: { isbn: String(bookPayload.isbn).trim() }, transaction });
            }

            if (!targetBook && !isValidIsbn(bookPayload.isbn)) {
                const getFieldCondition = (fieldName, value, isNumeric = false) => {
                    const val = value !== null && value !== undefined ? String(value).trim() : '';
                    if (val === '' || (isNumeric && val === '0')) {
                        if (isNumeric) {
                            return { [Op.or]: [{ [fieldName]: null }, { [fieldName]: 0 }] };
                        } else {
                            return { [Op.or]: [{ [fieldName]: null }, sequelize.where(sequelize.fn('TRIM', sequelize.col(fieldName)), '')] };
                        }
                    }
                    if (!isNumeric) {
                        return sequelize.where(sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col(fieldName))), val.toLowerCase());
                    } else {
                        return { [fieldName]: Number(val) };
                    }
                };

                targetBook = await Book.findOne({
                    where: {
                        [Op.and]: [
                            getFieldCondition('title', bookPayload.title),
                            getFieldCondition('subtitle', bookPayload.subtitle),
                            getFieldCondition('author', bookPayload.author),
                            getFieldCondition('publisher', bookPayload.publisher),
                            getFieldCondition('edition', bookPayload.edition),
                            getFieldCondition('year', bookPayload.year, true),
                            getFieldCondition('department', bookPayload.department),
                            getFieldCondition('subject', bookPayload.subject),
                            getFieldCondition('language', bookPayload.language)
                        ]
                    },
                    transaction
                });
            }

            if (!targetBook) {
                targetBook = await Book.create(bookPayload, { transaction });
            }

            const totalCopiesCount = normalized.numberOfCopies !== undefined ? normalized.numberOfCopies : 1;
            const copiesToCreate = [];

            let currentAccession = row.accessionNo || row.startingAccessionNo || normalized.accessionNumber;
            if (!currentAccession) {
                currentAccession = await getNextAccessionNumber(sequelize, transaction);
            }

            let match = String(currentAccession).match(/^([a-zA-Z_\-]*?)(\d+)$/);
            let prefix = match ? (match[1] || '') : '';
            let num = match ? parseInt(match[2], 10) : 1;

            let finalPurchaseDate = normalized.purchaseDate || row.purchaseDate;
            if (finalPurchaseDate) {
                if (typeof finalPurchaseDate === 'number' || !isNaN(Number(finalPurchaseDate))) {
                    finalPurchaseDate = null;
                } else if (new Date(finalPurchaseDate).toString() === 'Invalid Date') {
                    finalPurchaseDate = null;
                }
            }

            for (let c = 0; c < totalCopiesCount; c++) {
                let targetAcc = `${prefix}${num + c}`;
                let existing = await BookCopy.findOne({ where: { accessionNo: targetAcc }, transaction });
                while (existing) {
                    num += 1;
                    targetAcc = `${prefix}${num + c}`;
                    existing = await BookCopy.findOne({ where: { accessionNo: targetAcc }, transaction });
                }

                copiesToCreate.push({
                    bookId: targetBook.id,
                    accessionNo: targetAcc,
                    shelfLocation: normalized.rackLocation || row.shelfLocation || null,
                    issueType: normalized.issueType ? (String(normalized.issueType).trim().charAt(0).toUpperCase() + String(normalized.issueType).trim().slice(1).toLowerCase()) : 'Issuable',
                    status: 'Available',
                    purchaseDate: finalPurchaseDate || null,
                    timesIssued: 0
                });
            }

            if (copiesToCreate.length > 0) {
                await BookCopy.bulkCreate(copiesToCreate, { transaction });
            }
            await transaction.commit();

            const savedBook = await Book.findByPk(targetBook.id, {
                include: [
                    { model: Department, as: 'departmentEntry', attributes: ['id', 'name'], required: false },
                    { model: Language, as: 'languageEntry', attributes: ['id', 'name'], required: false },
                    { model: Subject, as: 'subjectEntry', attributes: ['id', 'name'], required: false },
                    { model: Publisher, as: 'publisherEntry', attributes: ['id', 'name'], required: false },
                    { model: Vendor, as: 'vendorEntry', attributes: ['id', 'name'], required: false }
                ]
            });

            const bookJSON = savedBook ? savedBook.toJSON() : targetBook.toJSON();
            bookJSON.totalCopies = totalCopiesCount;
            bookJSON.availableCopies = totalCopiesCount;
            bookJSON.issuedCopies = 0;

            return sendSuccess(res, bookJSON, 'Book added successfully', 201);
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            let statusCode = 500;
            if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError' || error.message.includes('must be a')) {
                statusCode = 400;
            }
            return sendError(res, error.message || 'Error adding book', statusCode);
        }
    } catch (error) {
        require('fs').appendFileSync('C:/Users/hari2/.gemini/antigravity-ide/brain/d3445933-d394-478b-a059-0049aca19e94/scratch/error.log', 'addBook error: ' + error.stack + '\n');
        console.error('addBook error:', error);
        let statusCode = 500;
        if (error.message && error.message.includes('must be a')) statusCode = 400;
        return sendError(res, error.message || 'Error processing request', statusCode);
    }
};

exports.editBook = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const masterDataError = await validateMasterDataIds(req.body, transaction);
        if (masterDataError) {
            await transaction.rollback();
            return sendError(res, masterDataError, 400);
        }
        const bookUpdates = { ...req.body };
        const legacyNameFields = {
            departmentId: 'department', languageId: 'language', subjectId: 'subject',
            publisherId: 'publisher', vendorId: 'vendor'
        };
        Object.entries(legacyNameFields).forEach(([idField, nameField]) => {
            if (bookUpdates[idField]) delete bookUpdates[nameField];
        });
        const [updatedRows] = await Book.update(bookUpdates, { where: { id }, transaction });

        // Check if an accessionNo was provided indicating a specific copy was loaded
        if (req.body.accessionNo) {
            const { accessionNo, shelfLocation, issueType, copyStatus, status, purchaseDate } = req.body;
            const newStatus = copyStatus || status;
            const copyUpdatePayload = {};
            
            if (shelfLocation !== undefined) copyUpdatePayload.shelfLocation = shelfLocation;
            if (issueType !== undefined) copyUpdatePayload.issueType = issueType;
            if (newStatus !== undefined) copyUpdatePayload.status = newStatus;
            if (purchaseDate !== undefined) copyUpdatePayload.purchaseDate = purchaseDate;
            
            if (Object.keys(copyUpdatePayload).length > 0) {
                await BookCopy.update(copyUpdatePayload, { 
                    where: { accessionNo, bookId: id },
                    transaction 
                });
            }
        }

        if (updatedRows === 0 && !req.body.accessionNo) {
            await transaction.rollback();
            return sendError(res, 'Book not found or no changes made', 404);
        }

        await transaction.commit();
        const updatedBook = await Book.findByPk(id);
        return sendSuccess(res, updatedBook, 'Book updated successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('editBook error:', error);
        return sendError(res, 'Error updating book', 500);
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const issuedCopy = await BookCopy.findOne({
            where: { bookId: id, status: 'Issued' }
        });
        if (issuedCopy) {
            return sendError(res, 'Cannot delete book: One or more physical copies are currently issued', 400);
        }

        const deleted = await Book.destroy({ where: { id } });
        if (!deleted) return sendError(res, 'Book not found', 404);
        return sendSuccess(res, null, 'Book deleted successfully');
    } catch (error) {
        console.error('deleteBook error:', error);
        return sendError(res, 'Error deleting book', 500);
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return sendError(res, 'Invalid request, ids array required', 400);

        const issuedCopy = await BookCopy.findOne({
            where: { bookId: { [Op.in]: ids }, status: 'Issued' }
        });
        if (issuedCopy) {
            return sendError(res, 'Cannot delete books: One or more selected books have physical copies currently issued', 400);
        }

        await Book.destroy({ where: { id: { [Op.in]: ids } } });
        return sendSuccess(res, null, 'Books deleted successfully');
    } catch (error) {
        console.error('bulkDelete error:', error);
        return sendError(res, 'Error bulk deleting books', 500);
    }
};

exports.bulkUpload = async (req, res) => {
    try {
        const books = req.body.books;
        console.log(`[bulkUpload] received ${Array.isArray(books) ? books.length : 0} rows`);
        if (!books || !Array.isArray(books) || !books.length) {
            return sendError(res, 'No book data provided', 400);
        }

        // Step 1: Validate all rows before starting transaction
        for (let i = 0; i < books.length; i++) {
            const row = books[i];
            if (!row || typeof row !== 'object') {
                return sendError(res, `Row ${i + 1} is invalid`, 400);
            }
            const title = row.title ?? row.bookTitle ?? row['Book Title'] ?? row.Title;
            if (!title || !String(title).trim()) {
                return sendError(res, `Row ${i + 1}: Book title is required`, 400);
            }
            const copiesVal = row.numberOfCopies ?? row.totalCopies ?? row.total ?? row.copies ?? row['Number of Copies'] ?? row['Total Copies'] ?? 1;
            const numberOfCopies = Number.parseInt(copiesVal, 10);
            if (Number.isNaN(numberOfCopies) || numberOfCopies < 0) {
                return sendError(res, `Row ${i + 1}: Number of copies must be a non-negative integer`, 400);
            }
        }

        // Reset AUTO_INCREMENT if DB is empty
        try {
            const booksCount = await Book.count();
            if (booksCount === 0) {
                await sequelize.query('ALTER TABLE books AUTO_INCREMENT = 1;');
            }
            const copiesCountDB = await BookCopy.count();
            if (copiesCountDB === 0) {
                await sequelize.query('ALTER TABLE book_copies AUTO_INCREMENT = 1;');
            }
        } catch (e) {
            console.warn("Could not reset AUTO_INCREMENT:", e.message);
        }

        const transaction = await sequelize.transaction();
        try {
            // Get initial sequential accession details from book_copies table
            const accessionDetails = await getNextAccessionDetails(sequelize, transaction);
            let currentPrefix = accessionDetails.prefix;
            let currentAccessionNum = accessionDetails.number;

            const createdBooks = [];

            for (const row of books) {
                const normalized = normalizeBookUploadRow(row);

                // Step 2: Book-level payload (do NOT include id parameter; let MySQL AUTO_INCREMENT generate books.id)
                const bookPayload = {
                    isbn: normalized.isbn || null,
                    title: normalized.title.trim(),
                    subtitle: normalized.subtitle || null,
                    author: normalized.author || null,
                    publisher: normalized.publisher || null,
                    publicationPlace: normalized.publicationPlace || null,
                    edition: normalized.edition || null,
                    indianEdition: !!normalized.indianEdition,
                    year: normalized.year || null,
                    department: normalized.department || null,
                    subject: normalized.subject || null,
                    language: normalized.language || null,
                    category: normalized.category || null,
                    bindingType: normalized.bindingType || null,
                    callNumber: normalized.callNumber || null,
                    price: normalized.price !== null ? normalized.price : 0.00,
                    contentPages: normalized.contentPages || null,
                    textPages: normalized.textPages || null,
                    vendor: normalized.vendor || null,
                    invoiceNumber: normalized.invoiceNumber || null,
                    fundSource: normalized.fundSource || null,
                    purchaseCost: normalized.purchaseCost || null,
                    giftBook: !!normalized.giftBook,
                    giftNote: normalized.giftNote || null,
                    remarks: normalized.remarks || null
                };

                let targetBook = null;

                // If user provided an explicit ID (e.g., from bulk upload CSV)
                if (normalized.id) {
                    targetBook = await Book.findByPk(normalized.id, { transaction });
                }

                // Look up by ISBN or Title if existing
                if (!targetBook && isValidIsbn(bookPayload.isbn)) {
                    targetBook = await Book.findOne({
                        where: { isbn: String(bookPayload.isbn).trim() },
                        transaction
                    });
                }
                
                if (!targetBook && !isValidIsbn(bookPayload.isbn)) {
                    const getFieldCondition = (fieldName, value, isNumeric = false) => {
                        const val = value !== null && value !== undefined ? String(value).trim() : '';
                        if (val === '' || (isNumeric && val === '0')) {
                            if (isNumeric) {
                                return {
                                    [Op.or]: [
                                        { [fieldName]: null },
                                        { [fieldName]: 0 }
                                    ]
                                };
                            } else {
                                return {
                                    [Op.or]: [
                                        { [fieldName]: null },
                                        sequelize.where(sequelize.fn('TRIM', sequelize.col(fieldName)), '')
                                    ]
                                };
                            }
                        }
                        
                        if (!isNumeric) {
                            return sequelize.where(
                                sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col(fieldName))),
                                val.toLowerCase()
                            );
                        } else {
                            return { [fieldName]: Number(val) };
                        }
                    };

                    targetBook = await Book.findOne({
                        where: {
                            [Op.and]: [
                                getFieldCondition('title', bookPayload.title),
                                getFieldCondition('subtitle', bookPayload.subtitle),
                                getFieldCondition('author', bookPayload.author),
                                getFieldCondition('publisher', bookPayload.publisher),
                                getFieldCondition('edition', bookPayload.edition),
                                getFieldCondition('year', bookPayload.year, true),
                                getFieldCondition('department', bookPayload.department),
                                getFieldCondition('subject', bookPayload.subject),
                                getFieldCondition('language', bookPayload.language)
                            ]
                        },
                        transaction
                    });
                }

                if (!targetBook) {
                    // Create ONE record in books table. Database automatically generates books.id.
                    targetBook = await Book.create(bookPayload, { transaction });
                }

                // Step 3: Immediately retrieve generated books.id
                const bookId = targetBook.id;

                // Step 4 & 5: Read Total Copies and create corresponding records in book_copies
                const totalCopiesCount = normalized.numberOfCopies !== undefined ? normalized.numberOfCopies : 1;
                const copiesToCreate = [];

                let finalPurchaseDate = normalized.purchaseDate;
                if (finalPurchaseDate) {
                    if (typeof finalPurchaseDate === 'number' || !isNaN(Number(finalPurchaseDate))) {
                        finalPurchaseDate = null;
                    } else if (new Date(finalPurchaseDate).toString() === 'Invalid Date') {
                        finalPurchaseDate = null;
                    }
                }

                for (let c = 0; c < totalCopiesCount; c++) {
                    let targetAcc = `${currentPrefix}${currentAccessionNum}`;

                    let existing = await BookCopy.findOne({ where: { accessionNo: targetAcc }, transaction });
                    while (existing) {
                        currentAccessionNum += 1;
                        targetAcc = `${currentPrefix}${currentAccessionNum}`;
                        existing = await BookCopy.findOne({ where: { accessionNo: targetAcc }, transaction });
                    }

                    copiesToCreate.push({
                        bookId: bookId,
                        accessionNo: targetAcc,
                        shelfLocation: normalized.rackLocation || null,
                        issueType: normalized.issueType ? (String(normalized.issueType).trim().charAt(0).toUpperCase() + String(normalized.issueType).trim().slice(1).toLowerCase()) : 'Issuable',
                        status: 'Available',
                        purchaseDate: finalPurchaseDate || null,
                        timesIssued: 0
                    });

                    currentAccessionNum += 1;
                }

                if (copiesToCreate.length > 0) {
                    await BookCopy.bulkCreate(copiesToCreate, { transaction });
                }

                createdBooks.push(targetBook);
            }

            await transaction.commit();
            return sendSuccess(res, createdBooks, 'Bulk upload successful', 201);
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            let statusCode = 500;
            if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError' || error.message.includes('must be a')) {
                statusCode = 400;
            }
            return sendError(res, error.message || 'Error with bulk upload', statusCode);
        }
    } catch (error) {
        console.error('bulkUpload outer error:', error);
        return sendError(res, error.message || 'Error processing bulk upload request', 500);
    }
};

exports.exportBooks = async (req, res) => {
    try {
        const {
            exportType = 'all',
            format = 'xlsx',
            department,
            subject,
            language,
            category,
            author,
            publisher,
            issueType,
            shelfLocation,
            fromDate,
            toDate,
            publicationYear,
            availability
        } = req.body || {};

        const filterClauses = [];
        const replacements = {};

        const applyBookFilter = (column, value, operator = '=') => {
            if (value === undefined || value === null || value === '') return;
            const placeholder = `${column.replace(/[^a-zA-Z0-9]/g, '_')}`;
            filterClauses.push(`b.${column} ${operator} :${placeholder}`);
            replacements[placeholder] = value;
        };

        const applyCopyFilter = (column, value, operator = '=', placeholder = null) => {
            if (value === undefined || value === null || value === '') return;
            const key = placeholder || column.replace(/[^a-zA-Z0-9]/g, '_');
            filterClauses.push(`c.${column} ${operator} :${key}`);
            replacements[key] = value;
        };

        if (exportType === 'filtered') {
            applyBookFilter('department', department);
            applyBookFilter('subject', subject);
            applyBookFilter('language', language);
            applyBookFilter('category', category);
            applyBookFilter('author', author);
            applyBookFilter('publisher', publisher);
            applyBookFilter('year', publicationYear);
            applyCopyFilter('issue_type', issueType);
            applyCopyFilter('shelf_location', shelfLocation);
            applyCopyFilter('purchase_date', fromDate, '>=', 'fromDate');
            applyCopyFilter('purchase_date', toDate, '<=', 'toDate');

            if (availability) {
                filterClauses.push('c.status = :availability');
                replacements.availability = availability;
            }
        }

        const whereSQL = filterClauses.length ? `WHERE ${filterClauses.join(' AND ')}` : '';

        const books = await sequelize.query(`
            SELECT
                b.isbn,
                b.title,
                b.subtitle,
                b.author,
                b.publisher,
                b.edition,
                b.year,
                b.department,
                b.subject,
                b.language,
                b.category,
                b.call_number AS callNumber,
                MIN(c.shelf_location) AS shelfLocation,
                MIN(c.issue_type) AS issueType,
                COUNT(c.copy_id) AS totalCopies,
                SUM(CASE WHEN c.status = 'Available' THEN 1 ELSE 0 END) AS availableCopies,
                SUM(CASE WHEN c.status = 'Issued' THEN 1 ELSE 0 END) AS issuedCopies,
                b.price,
                MIN(c.purchase_date) AS purchaseDate,
                b.remarks,
                MIN(c.accession_no) AS minAccession,
                MAX(c.accession_no) AS maxAccession,
                b.created_at AS createdAt
            FROM books b
            LEFT JOIN book_copies c ON c.book_id = b.id
            ${whereSQL}
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        const exportRows = books.map(book => ({
            isbn: book.isbn || '',
            title: book.title || '',
            subtitle: book.subtitle || '',
            author: book.author || '',
            publisher: book.publisher || '',
            edition: book.edition || '',
            publicationYear: book.year || '',
            department: book.department || '',
            subject: book.subject || '',
            language: book.language || '',
            category: book.category || '',
            callNumber: book.callNumber || '',
            shelfLocation: book.shelfLocation || '',
            issueType: book.issueType || '',
            totalCopies: Number(book.totalCopies || 0),
            availableCopies: Number(book.availableCopies || 0),
            issuedCopies: Number(book.issuedCopies || 0),
            price: book.price || 0,
            purchaseDate: book.purchaseDate || '',
            remarks: book.remarks || '',
            accessionNumberRange: book.minAccession && book.maxAccession ? `${book.minAccession} - ${book.maxAccession}` : '',
            createdAt: book.createdAt || ''
        }));

        if (format === 'csv') {
            const headers = [
                'ISBN','Title','Subtitle','Author','Publisher','Edition','Publication Year','Department','Subject','Language','Category','Call Number','Shelf Location','Issue Type','Total Copies','Available Copies','Issued Copies','Price','Purchase Date','Remarks','Accession Number Range','Created At'
            ];
            const rows = exportRows.map(row => headers.map(header => {
                const value = row[header.toLowerCase().replace(/ /g, '')] ?? row[header.replace(/ /g, '')] ?? '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(','));
            const csv = [headers.join(','), ...rows].join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${(exportType === 'all' ? 'books_all' : 'books_filtered')}_${new Date().toISOString().slice(0, 10)}.csv"`);
            return res.send(csv);
        }

        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
            throw new Error('Excel workbook generation produced an empty buffer');
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${(exportType === 'all' ? 'books_all' : 'books_filtered')}_${new Date().toISOString().slice(0, 10)}.xlsx"`);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Cache-Control', 'no-cache');
        return res.end(buffer);
    } catch (error) {
        console.error('exportBooks error:', error);
        return sendError(res, 'Error exporting books', 500);
    }
};

exports.getBookByAccession = async (req, res) => {
    try {
        const { accessionNo } = req.params;
        const copy = await BookCopy.findOne({ 
            where: { accessionNo },
            include: [{
                model: Book,
                include: [
                    { model: Department, as: 'departmentEntry', attributes: ['id', 'name'], required: false },
                    { model: Language, as: 'languageEntry', attributes: ['id', 'name'], required: false },
                    { model: Subject, as: 'subjectEntry', attributes: ['id', 'name'], required: false },
                    { model: Publisher, as: 'publisherEntry', attributes: ['id', 'name'], required: false },
                    { model: Vendor, as: 'vendorEntry', attributes: ['id', 'name'], required: false }
                ]
            }]
        });
        if (!copy) {
            return sendError(res, 'Book copy not found', 404);
        }
        
        const response = {
            ...copy.Book.toJSON(),
            department: copy.Book.departmentEntry?.name || copy.Book.department,
            language: copy.Book.languageEntry?.name || copy.Book.language,
            subject: copy.Book.subjectEntry?.name || copy.Book.subject,
            publisher: copy.Book.publisherEntry?.name || copy.Book.publisher,
            vendor: copy.Book.vendorEntry?.name || copy.Book.vendor,
            accessionNo: copy.accessionNo,
            shelfLocation: copy.shelfLocation,
            issueType: copy.issueType,
            timesIssued: copy.timesIssued,
            purchaseDate: copy.purchaseDate,
            copyId: copy.id,
            copyStatus: copy.status
        };

        return sendSuccess(res, response, 'Book fetched successfully');
    } catch (error) {
        console.error('getBookByAccession error:', error);
        return sendError(res, 'Error fetching book', 500);
    }
};

exports.addCopies = async (req, res) => {
    const { id } = req.params;
    const { totalCopies, startingAccessionNo, shelfLocation, issueType, purchaseDate } = req.body;

    const transaction = await sequelize.transaction();
    try {
        const book = await Book.findByPk(id, { transaction });
        if (!book) {
            await transaction.rollback();
            return sendError(res, 'Book not found', 404);
        }

        const copiesCount = parseInt(totalCopies || 1, 10);
        const copiesToCreate = [];

        let currentAccession = startingAccessionNo;
        if (!currentAccession) {
            currentAccession = await getNextAccessionNumber(sequelize, transaction);
        }

        let match = String(currentAccession).match(/^([a-zA-Z_\-]*?)(\d+)$/);
        let prefix = match ? (match[1] || '') : '';
        let num = match ? parseInt(match[2], 10) : 1;

        for (let c = 0; c < copiesCount; c++) {
            let targetAcc = `${prefix}${num + c}`;
            let existing = await BookCopy.findOne({ where: { accessionNo: targetAcc }, transaction });
            while (existing) {
                num += 1;
                targetAcc = `${prefix}${num + c}`;
                existing = await BookCopy.findOne({ where: { accessionNo: targetAcc }, transaction });
            }

            copiesToCreate.push({
                bookId: book.id,
                accessionNo: targetAcc,
                shelfLocation: shelfLocation || null,
                issueType: issueType || 'Issuable',
                status: 'Available',
                purchaseDate: purchaseDate || null,
                timesIssued: 0
            });
        }

        const createdCopies = await BookCopy.bulkCreate(copiesToCreate, { transaction });
        await transaction.commit();

        return sendSuccess(res, createdCopies, `${copiesCount} copies added successfully`, 201);
    } catch (error) {
        await transaction.rollback();
        console.error('addCopies error:', error);
        return sendError(res, 'Error adding copies', 500);
    }
};

exports.getBookCopies = async (req, res) => {
    try {
        const { id } = req.params;
        const copies = await BookCopy.findAll({
            where: { bookId: id },
            order: [['accession_no', 'ASC']]
        });
        return sendSuccess(res, copies, 'Book copies fetched successfully');
    } catch (error) {
        console.error('getBookCopies error:', error);
        return sendError(res, 'Error fetching copies', 500);
    }
};
