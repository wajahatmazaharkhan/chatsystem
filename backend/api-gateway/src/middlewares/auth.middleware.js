const axios = require('axios');
const config = require('../config/env');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Missing or invalid authorization token'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validate token by calling Module 1 (/auth/validate)
    const response = await axios.get(
      `${config.modules.auth}/auth/validate`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Extract user_id and role from Module 1's response
    const { user_id, role, roleType, permissions, hierarchyLevel } = response.data;

    // Attach to request for downstream services
    req.user = { user_id, role, roleType, permissions, hierarchyLevel };

    // Also inject them as headers to be forwarded
    req.headers['x-user-id'] = user_id;
    req.headers['x-user-role'] = role;
    req.headers['x-user-role-type'] = roleType || '';
    req.headers['x-user-permissions'] = JSON.stringify(permissions || []);
    req.headers['x-user-hierarchy-level'] = String(hierarchyLevel !== undefined && hierarchyLevel !== null ? hierarchyLevel : 6);

    next();
  } catch (error) {
    console.error(`[Auth Error] TraceID: ${req.traceId}`, error.message);
    
    // Return unauthorized if token is invalid or module 1 returns an error
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid token'
    });
  }
};

module.exports = authMiddleware;
