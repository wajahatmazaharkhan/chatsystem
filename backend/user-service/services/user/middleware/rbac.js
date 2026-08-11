const { ROLE_LEVELS } = require('../../../constants/roles');

module.exports = function(requiredRoleOrPermission) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        code: 'ERR_UNAUTHORIZED'
      });
    }

    const { role, permissions } = req.user;

    // ADMIN always gets access
    if (role === 'ADMIN') {
      return next();
    }

    const isPermission = [
      "VIEW_USERS",
      "CREATE_USERS",
      "EDIT_USERS",
      "DELETE_USERS",
      "VIEW_CONTACTS",
      "ASSIGN_GROUPS",
      "MANAGE_GROUPS",
      "PUBLISH_CONTENT"
    ].includes(requiredRoleOrPermission);

    if (isPermission) {
      if (permissions && permissions.includes(requiredRoleOrPermission)) {
        return next();
      }
    } else {
      // Map role names for backward compatibility
      const getRoleKey = (r) => {
        if (!r) return '';
        const upper = r.toUpperCase();
        if (upper === 'GROUP_MANAGER') return 'GROUP_MANAGER';
        if (upper === 'MANAGER') return 'GROUP_MANAGER'; // map MANAGER to GROUP_MANAGER level
        return upper;
      };

      const userRoleKey = getRoleKey(role);
      const reqRoleKey = getRoleKey(requiredRoleOrPermission);

      // Map roles to numeric levels (from constants/roles)
      const userLevel = ROLE_LEVELS[userRoleKey] || ROLE_LEVELS[role] || 0;
      const requiredLevel = ROLE_LEVELS[reqRoleKey] || ROLE_LEVELS[requiredRoleOrPermission] || 0;

      if (userLevel >= requiredLevel) {
        return next();
      }
    }

    return res.status(403).json({
      code: 'ERR_FORBIDDEN',
      message: 'Forbidden: You do not have the required permissions to access this resource.'
    });
  };
};