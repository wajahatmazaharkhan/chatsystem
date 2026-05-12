// controllers/authController.js
const authService = require('../services/authService');

class AuthController {
    
    // POST /auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }
            
            const result = await authService.login(email, password);
            res.json(result);
            
        } catch (error) {
            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // POST /auth/logout
    async logout(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'No token provided'
                });
            }
            
            const result = await authService.logout(token);
            res.json(result);
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // GET /auth/validate
    async validate(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({
                    valid: false,
                    error: 'No token provided'
                });
            }
            
            const result = authService.validateToken(token);
            res.json(result);
            
        } catch (error) {
            res.status(401).json({
                valid: false,
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();