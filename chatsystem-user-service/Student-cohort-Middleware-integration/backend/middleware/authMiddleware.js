const jwt = require("jsonwebtoken");

const { SECRET } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {

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
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

module.exports = authMiddleware;