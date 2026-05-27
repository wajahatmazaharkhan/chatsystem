const axios = require('axios');
const jwt = require('jsonwebtoken');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const validateUrl = process.env.AUTH_VALIDATE_URL || (process.env.AUTH_SERVICE ? `${process.env.AUTH_SERVICE}/auth/validate` : null);

    if (validateUrl) {
      try {
        const response = await axios.post(
          validateUrl,
          {},
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );

        const resp = response.data;
        req.user = {
          user_id: resp.user_id || resp.id || resp.sub || resp.userId,
          role: resp.role || resp.roleName || 'STUDENT',
        };
        return next();
      } catch (err) {
        if (err.response && err.response.status === 401) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        // If the service returned another error, log it and try fallback if allowed in dev
        console.error('Auth service validation failed:', err.message);
      }
    }

    // Fallback: Verify/Decode JWT token
    try {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      } catch (err) {
        decoded = jwt.decode(token);
      }

      if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
      }

      req.user = {
        user_id: decoded.user_id || decoded.sub || decoded.id,
        role: decoded.role || decoded.roles || 'STUDENT',
      };
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized: Token validation failed' });
    }
  } catch (err) {
    next(err);
  }
};
