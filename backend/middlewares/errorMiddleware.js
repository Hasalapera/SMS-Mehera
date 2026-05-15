/**
 * Global Error Handler Middleware
 * 1. Catches any error passed through next(err) from the routes.
 * 2. Ensures the HTTP status code is correct (defaults to 500 if not set).
 * 3. Sends a clean JSON response with the error message to the client.
 * 4. Prevents the server from crashing and provides a consistent error format.
 */

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message
    });
};

module.exports = errorHandler;