function errorHandler(err, req, res, next) {
    // Unauthorized error - redirect to login page
    if (err.name === "UnauthorizedError") {
        // Redirect to login page
        return res.redirect('/login');
    }

    // Validation error - send a 400 status and a message
    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }

    // For any other errors, send a 500 status
    return res.status(500).json({ message: err.message });
}

module.exports = errorHandler;
