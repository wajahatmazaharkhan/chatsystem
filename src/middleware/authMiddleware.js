const axios = require('axios');

// Validates the JWT by calling the Module 1 (Auth) validation endpoint.
const validateAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    try {
        // Module 1 Integration Point: /auth/validate  
        const response = await axios.post('http://auth-service/auth/validate', {}, {
            headers: { Authorization: authHeader }
        });

        req.user = {
            user_id: response.data.user_id,
            role: response.data.role
        };
        
        next();
    } catch (error) {
        return res.status(401).json({ error: "Authentication failed: Invalid Token" });
    }
};

module.exports = validateAuth;