module.exports = function requiredRole(roles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Authentication required' });
    if (!req.user.is_active) return res.status(403).json({ code: 'ERR_FORBIDDEN', message: 'Inactive account' });
    
    let allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (roles && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ code: 'ERR_FORBIDDEN', message: `Role ${allowedRoles.join(' or ')} required` });
    }
    return next();
  };
};
