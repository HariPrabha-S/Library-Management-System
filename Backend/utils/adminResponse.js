/**
 * Sends a successful API response
 * @param {Object} res - Express response object
 * @param {Any} data - Data to send back
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Sends an error API response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default 500)
 * @param {Any} errors - Detailed errors array/object (optional)
 */
const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
    const payload = {
        success: false,
        message,
    };
    
    if (errors) {
        payload.errors = errors;
    }

    return res.status(statusCode).json(payload);
};

module.exports = {
    sendSuccess,
    sendError
};
