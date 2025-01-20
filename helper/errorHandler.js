function errorHandler(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        return res.status(500).send('Unauthorization error');
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: err.message });
}

module.exports = errorHandler;
