// services/authService.js
const jwt = require('jsonwebtoken');
const axios = require('axios')
const { findUserByEmail } = require('../models/userModel');
const { addToBlacklist, isBlacklisted } = require('../utils/tokenBlacklist');

class AuthService {
    
    // ✅ TASK 1 & 2: LOGIN + JWT TOKEN GENERATION
    async login(email, password) {
        // Find user
        const user = findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        
        // Check password
        if (user.password !== password) {
            throw new Error('Invalid email or password');
        }
        
        // Generate JWT Token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        try {
                await axios.post(`${process.env.ACTIVITY_SERVICE_URL}/v1/activity/log`, {
                    user_id: user._id, 
                    activity_type: 'LOGIN',
                    source_timestamp: new Date()
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('✅ Activity logged successfully');
            } catch (activityError) {
                console.error('❌ Error logging activity:', activityError.message);
            }

        return {
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            }
        };
    }
    
    // ✅ TASK 4: LOGOUT API
    async logout(token) {
        if (!token) {
            throw new Error('No token provided');
        }
        
        addToBlacklist(token);
        
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }
    
    // Validate token for other modules
    validateToken(token) {
        if (isBlacklisted(token)) {
            return { valid: false, error: 'Token has been logged out' };
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return {
                valid: true,
                user_id: decoded.user_id,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}

module.exports = new AuthService();