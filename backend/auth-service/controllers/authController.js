// controllers/authController.js
const authService = require('../services/authService');

class AuthController {
    
    async login(req, res) {
        try {
            console.log('🔐 [CONTROLLER] LOGIN REQUEST RECEIVED');
            console.log('Body:', req.body);
            
            const { email, password } = req.body;
            
            if (!email || !password) {
                console.log('⚠️ Missing email or password');
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }
            
            console.log(`📧 [CONTROLLER] Attempting login for: ${email}`);
            const result = await authService.login(email, password);
            console.log('✅ [CONTROLLER] Login successful');
            res.json(result);
            
        } catch (error) {
            console.error('❌ [CONTROLLER] Login error:', error.message);
            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }
    
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
            
            if (!result.valid) {
                return res.status(401).json(result);
            }
            
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