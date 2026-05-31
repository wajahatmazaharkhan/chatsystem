const axios = require('axios');

const authMiddleware = async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    if (typeof token === 'string' && token.toLowerCase().startsWith('bearer ')) {
        token = token.slice(7).trim();
    }

    try {
        const AUTH_VALIDATE_URL = process.env.AUTH_VALIDATE_URL || 'http://localhost:3002/auth/validate';
        const response = await axios.get(AUTH_VALIDATE_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data && response.data.valid) {
            req.user = response.data; // Store validated user data
            next();
        } else {
            return res.status(401).json({
                message: "Invalid token"
            });
        }
    } catch (error) {
        return res.status(401).json({
            message: "Authentication failed",
            error: error.message
        });
    }
};

module.exports = authMiddleware;
