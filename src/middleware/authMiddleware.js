const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// NOTE: During development, JWT is verified locally.
// For integration with Module 1 (Auth), swap this out with the axios call to /auth/validate.
const validateAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            user_id: decoded.user_id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({ error: "Authentication failed: Invalid or expired token" });
    }
};

module.exports = validateAuth;