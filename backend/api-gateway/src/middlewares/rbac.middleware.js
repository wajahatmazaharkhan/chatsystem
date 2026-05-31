/**
 * Role-Based Access Control Middleware.
 * Ensure this is used AFTER auth.middleware.js.
 * 
 * @param {string[]} allowedRoles - Array of allowed roles (e.g. ['ADMIN', 'MANAGER'])
 */
const rbacMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: No user role found in request'
      });
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      console.warn(`[RBAC] TraceID: ${req.traceId} - Access denied for role: ${role}. Requires one of: ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You do not have the required permissions to access this resource.'
      });
    }

    next();
  };
};

module.exports = rbacMiddleware;
