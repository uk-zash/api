const { expressjwt } = require("express-jwt");

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressjwt({
        secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked,
    }).unless({
        path: [
            { url: /\/api\/v1\/products(.*)/i, methods: ["GET", "OPTIONS"] },
            { url: /\/api\/v1\/categories(.*)/i, methods: ["GET", "OPTIONS"] },
            { url: /\/public\/uploads(.*)/i, methods: ["GET", "OPTIONS"] },
            "/api/v1/users/login",
            "/api/v1/users/register",
        ]
    });
}

function isRevoked(req, payload) {
    try {
        // Log the decoded payload
        console.log("Decoded Payload in isRevoked:", payload);

        // Ensure that the payload contains 'isAdmin' and is true
        if (!payload.payload || !payload.payload.isAdmin) {
            console.log("Token revoked because user is not an admin.");
            return true;  // Token is revoked
        }

        // If the user is an admin, allow the request
        return false;  // Token is not revoked, access allowed
    } catch (err) {
        console.error("Error in isRevoked:", err);
        return true;  // Default to revoked in case of error
    }
}

module.exports = authJwt;
