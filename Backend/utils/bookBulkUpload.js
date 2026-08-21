/**
 * Normalize a book row from CSV, Excel, or frontend upload.
 *
 * Fields belonging to the `books` table are normalized here.
 *
 * Copy-level fields such as:
 * - accessionNumber
 * - numberOfCopies
 * - rackLocation
 * - issueType
 * - purchaseDate
 *
 * are included for upload processing but should be stored in
 * the `book_copies` table where applicable.
 */

function normalizeBookUploadRow(row = {}) {

    // =========================
    // YEAR
    // =========================

    const yearValue =
        row.year ??
        row.publicationYear ??
        row['Publication Year'] ??
        row['Year of Publishing'] ??
        row.Year ??
        null;


    const numberOfCopiesValue =
        row.numberOfCopies ??
        row.totalCopies ??
        row.total ??
        row.copies ??
        row['Number of Copies'] ??
        row['Total Copies'] ??
        1;

    const numberOfCopies =
        Number.parseInt(numberOfCopiesValue, 10);

    // Allow 0 copies
    if (
        !Number.isInteger(numberOfCopies) ||
        numberOfCopies < 0
    ) {
        throw new Error(
            'Number of copies must be a non-negative number'
        );
    }


    // =========================
    // PRICE
    // =========================

    const priceValue =
        row.price ??
        row['Price'] ??
        null;


    // =========================
    // PURCHASE COST
    // =========================

    const purchaseCostValue =
        row.purchaseCost ??
        row['Purchase Cost'] ??
        null;


    // =========================
    // CONTENT PAGES
    // =========================

    const contentPagesValue =
        row.contentPages ??
        row.content_pages ??
        row['Content Pages'] ??
        null;


    // =========================
    // TEXT PAGES
    // =========================

    const textPagesValue =
        row.textPages ??
        row.text_pages ??
        row['Text Pages'] ??
        null;


    return {

        // =====================================================
        // BOOK BASIC INFORMATION
        // =====================================================

        id:
            row.id ??
            row.Id ??
            row.ID ??
            row.book_id ??
            row.bookId ??
            row['Book Id'] ??
            null,

        isbn:
            row.isbn ??
            row.ISBN ??
            row.Isbn ??
            row['Isbn'] ??
            '',

        title:
            row.title ??
            row.bookTitle ??
            row['Book Title'] ??
            row.Title ??
            '',

        subtitle:
            row.subtitle ??
            row.Subtitle ??
            row['Sub Title'] ??
            row.SubTitle ??
            '',

        author:
            row.author ??
            row.Author ??
            '',

        publisher:
            row.publisher ??
            row.Publisher ??
            row['Publisher Name'] ??
            '',

        edition:
            row.edition ??
            row.Edition ??
            '',

        year:
            yearValue !== null &&
                yearValue !== undefined &&
                yearValue !== ''
                ? Number.parseInt(yearValue, 10)
                : null,


        // =====================================================
        // ADDITIONAL BOOK INFORMATION
        // =====================================================

        controlNumber:
            row.controlNumber ??
            row.control_number ??
            row['Control Number'] ??
            '',

        keyword:
            row.keyword ??
            row.Keyword ??
            '',

        releaseInfo:
            row.releaseInfo ??
            row.release_info ??
            row.release ??
            row.Release ??
            '',

        foreignEdition:
            row.foreignEdition ??
            row.foreign_edition ??
            row['Foreign Edition'] ??
            '',

        library:
            row.library ??
            row.Library ??
            '',

        purchaseDetails:
            row.purchaseDetails ??
            row.purchase_details ??
            row['Purchase Details'] ??
            '',


        // =====================================================
        // CLASSIFICATION
        // =====================================================

        department:
            row.department ??
            row.Department ??
            '',

        subject:
            row.subject ??
            row.Subject ??
            '',

        language:
            row.language ??
            row.Language ??
            '',

        category:
            row.category ??
            row.Category ??
            row.academicCategory ??
            row['Academic Category'] ??
            '',

        academicCategory:
            row.academicCategory ??
            row.academic_category ??
            row['Academic Category'] ??
            '',

        callNumber:
            row.callNumber ??
            row.call_number ??
            row['Call Number'] ??
            '',


        // =====================================================
        // PUBLICATION DETAILS
        // =====================================================

        publicationPlace:
            row.publicationPlace ??
            row.publication_place ??
            row['Publication Place'] ??
            '',

        indianEdition:
            normalizeBoolean(
                row.indianEdition ??
                row.indian_edition ??
                row['Indian Edition']
            ),

        bindingType:
            row.bindingType ??
            row.binding_type ??
            row['Binding Type'] ??
            '',

        contentPages:
            contentPagesValue !== null &&
                contentPagesValue !== undefined &&
                contentPagesValue !== ''
                ? Number.parseInt(
                    contentPagesValue,
                    10
                )
                : null,

        textPages:
            textPagesValue !== null &&
                textPagesValue !== undefined &&
                textPagesValue !== ''
                ? Number.parseInt(
                    textPagesValue,
                    10
                )
                : null,


        // =====================================================
        // PURCHASE INFORMATION
        // =====================================================

        price:
            priceValue !== null &&
                priceValue !== undefined &&
                priceValue !== ''
                ? Number.parseFloat(priceValue)
                : null,

        purchaseCost:
            purchaseCostValue !== null &&
                purchaseCostValue !== undefined &&
                purchaseCostValue !== ''
                ? Number.parseFloat(
                    purchaseCostValue
                )
                : null,

        vendor:
            row.vendor ??
            row.Vendor ??
            '',

        invoiceNumber:
            row.invoiceNumber ??
            row.invoice_number ??
            row['Invoice Number'] ??
            '',

        fundSource:
            row.fundSource ??
            row.fund_source ??
            row['Fund Source'] ??
            '',

        purchaseDate:
            row.purchaseDate ??
            row.purchase_date ??
            row['Purchase Date'] ??
            null,


        // =====================================================
        // GIFT BOOK INFORMATION
        // =====================================================

        giftBook:
            normalizeBoolean(
                row.giftBook ??
                row.gift_book ??
                row['Gift Book']
            ),

        giftNote:
            row.giftNote ??
            row.gift_note ??
            row['Gift Note'] ??
            '',


        // =====================================================
        // OTHER BOOK DETAILS
        // =====================================================

        remarks:
            row.remarks ??
            row.Remarks ??
            '',


        // =====================================================
        // COPY-LEVEL INFORMATION
        // These should be processed into `book_copies`.
        // =====================================================

        accessionNumber:
            row.accessionNumber ??
            row.accession_no ??
            row['Accession Number'] ??
            '',

        numberOfCopies,

        rackLocation:
            row.rackLocation ??
            row.shelfLocation ??
            row.shelf_location ??
            row['Rack Location'] ??
            row['Shelf Location'] ??
            '',

        issueType:
            row.issueType ??
            row.issue_type ??
            row['Issue Type'] ??
            'Issuable'
    };
}


/**
 * Convert common Excel/CSV boolean values
 * into true / false.
 */
function normalizeBoolean(value) {
    if (value === null || value === undefined || value === '') {
        return false;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value === 1;
    }

    const normalized = value
        .toString()
        .trim()
        .toLowerCase();

    return [
        'true',
        '1',
        'yes',
        'y',
        'on'
    ].includes(normalized);
}


/**
 * Generate a series of numeric accession numbers.
 *
 * Example:
 *
 * generateAccessionSeries(1, 3)
 *
 * Result:
 * 1
 * 2
 * 3
 */
function generateAccessionSeries(startingNumber, count) {
    const start = Number.parseInt(startingNumber, 10);
    const total = Number.parseInt(count, 10);

    if (!Number.isInteger(start) || start < 1) {
        throw new Error(
            'Starting accession number must be a positive number'
        );
    }

    if (!Number.isInteger(total) || total < 1) {
        throw new Error(
            'Accession count must be a positive number'
        );
    }

    return Array.from(
        { length: total },
        (_, index) => String(start + index)
    );
}


/**
 * Parse an accession number.
 *
 * Examples:
 *
 * 1001 -> { number: 1001 }
 * 25   -> { number: 25 }
 */
function parseAccessionNumber(accessionNo) {
    if (
        accessionNo === null ||
        accessionNo === undefined
    ) {
        return null;
    }

    const value = accessionNo
        .toString()
        .trim();

    if (!value) {
        return null;
    }

    // Allow only numeric accession numbers
    if (!/^\d+$/.test(value)) {
        return null;
    }

    return {
        number: Number.parseInt(value, 10)
    };
}


/**
 * Get the next available numeric accession number.
 *
 * Example:
 *
 * Existing:
 * 1
 * 2
 * 3
 *
 * Returns:
 * 4
 *
 * If no accession number exists:
 * 1
 */
/**
 * Get the next available accession details (prefix and number).
 */
async function getNextAccessionDetails(
    sequelizeInstance,
    transaction = null
) {
    const rows = await sequelizeInstance.query(
        `
        SELECT accession_no
        FROM book_copies
        WHERE accession_no REGEXP '^[0-9]+$'
        `,
        {
            transaction,
            type: sequelizeInstance.QueryTypes.SELECT
        }
    );

    let maxNum = 0;

    for (const row of rows) {
        const num = Number.parseInt(row.accession_no, 10);

        if (!isNaN(num) && num > maxNum) {
            maxNum = num;
        }
    }

    return {
        prefix: '',
        number: maxNum + 1
    };
}
/**
 * Get the next available numeric or prefixed accession number.
 */
async function getNextAccessionNumber(
    sequelizeInstance,
    transaction = null
) {
    const details = await getNextAccessionDetails(
        sequelizeInstance,
        transaction
    );

    return details.number.toString();
}


/**
 * Generate accession numbers starting
 * from the next available number.
 */
async function generateNextAccessionSeries(
    sequelizeInstance,
    count,
    transaction = null
) {
    const nextAccession =
        await getNextAccessionNumber(
            sequelizeInstance,
            transaction
        );

    const start =
        Number.parseInt(
            nextAccession,
            10
        );

    if (!Number.isInteger(start)) {
        throw new Error(
            'Unable to determine next accession number'
        );
    }

    return generateAccessionSeries(
        start,
        count
    );
}

module.exports = {
    normalizeBookUploadRow,
    normalizeBoolean,
    generateAccessionSeries,
    parseAccessionNumber,
    getNextAccessionDetails,
    getNextAccessionNumber,
    generateNextAccessionSeries
};
