// middlewares/authMiddleware.js
const authService = require('../services/authService');

function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const result = authService.validateToken(token);
    
    if (!result.valid) {
        return res.status(401).json({ error: result.error });
    }
    
    req.user = {
        user_id: result.user_id,
        email: result.email,
        role: result.role
    };
    
    next();
}

module.exports = { authenticate };