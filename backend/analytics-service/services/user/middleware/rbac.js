module.exports = function requiredRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Authentication required' });
    if (!req.user.is_active) return res.status(403).json({ code: 'ERR_FORBIDDEN', message: 'Inactive account' });
    if (role === 'ADMIN' && req.user.role !== 'ADMIN') return res.status(403).json({ code: 'ERR_FORBIDDEN', message: 'Admin role required' });
    return next();
  };
};
