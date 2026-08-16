export function getHierarchyLevel(role) {
  if (!role) return 6;
  const r = role.toUpperCase();
  switch (r) {
    case 'ADMIN':
      return 1;
    case 'SUB_ADMIN':
      return 2;
    case 'HEAD_HR':
    case 'HEAD_HR_PUBLISHING':
    case 'HEAD_HR_NON_PUBLISHING':
      return 3;
    case 'GROUP_MANAGER':
    case 'MANAGER':
      return 4;
    case 'SUB_GROUP_MANAGER':
      return 5;
    case 'STUDENT':
    default:
      return 6;
  }
}

export function getDefaultPermissions(role, roleType) {
  if (!role) return [];
  const r = role.toUpperCase();
  const rt = roleType ? roleType.toUpperCase() : '';

  const ALL_PERMISSIONS = [
    "VIEW_USERS",
    "CREATE_USERS",
    "EDIT_USERS",
    "DELETE_USERS",
    "VIEW_CONTACTS",
    "ASSIGN_GROUPS",
    "MANAGE_GROUPS",
    "PUBLISH_CONTENT"
  ];

  switch (r) {
    case 'ADMIN':
      return ALL_PERMISSIONS;
    case 'SUB_ADMIN':
      return [
        "VIEW_USERS",
        "CREATE_USERS",
        "EDIT_USERS",
        "VIEW_CONTACTS",
        "ASSIGN_GROUPS",
        "PUBLISH_CONTENT"
      ];
    case 'HEAD_HR_PUBLISHING':
      return [
        "VIEW_USERS",
        "CREATE_USERS",
        "EDIT_USERS",
        "VIEW_CONTACTS",
        "PUBLISH_CONTENT"
      ];
    case 'HEAD_HR_NON_PUBLISHING':
      return [
        "VIEW_USERS",
        "CREATE_USERS",
        "EDIT_USERS",
        "VIEW_CONTACTS"
      ];
    case 'HEAD_HR':
      if (rt === 'PUBLISHING') {
        return [
          "VIEW_USERS",
          "CREATE_USERS",
          "EDIT_USERS",
          "VIEW_CONTACTS",
          "PUBLISH_CONTENT"
        ];
      } else {
        return [
          "VIEW_USERS",
          "CREATE_USERS",
          "EDIT_USERS",
          "VIEW_CONTACTS"
        ];
      }
    case 'GROUP_MANAGER':
    case 'MANAGER':
      return [
        "VIEW_USERS",
        "VIEW_CONTACTS",
        "MANAGE_GROUPS"
      ];
    case 'SUB_GROUP_MANAGER':
      return [
        "VIEW_USERS",
        "EDIT_USERS"
      ];
    case 'STUDENT':
    default:
      return [];
  }
}

export function canAccess(user, targetResource) {
  if (!user || !targetResource) return false;

  const userRole = user.role?.toUpperCase();
  if (userRole === 'ADMIN') return true;

  const targetUserId = targetResource.user_id || targetResource._id || targetResource.id;
  const currentUserId = user.user_id || user.id || user._id;

  // A user can always access themselves
  if (currentUserId && targetUserId && String(currentUserId) === String(targetUserId)) {
    return true;
  }

  const userLevel = user.hierarchyLevel || getHierarchyLevel(user.role);
  const targetLevel = targetResource.hierarchyLevel || getHierarchyLevel(targetResource.role);

  // Hierarchy rule: cannot access users with higher/equal hierarchy level (lower/equal number)
  if (userLevel >= targetLevel) {
    return false;
  }

  // Creator or Parent check
  const targetCreatedBy = targetResource.createdBy || targetResource.created_by;
  const targetParentUser = targetResource.parentUser || targetResource.parent_user;
  if (currentUserId && (String(targetCreatedBy) === String(currentUserId) || String(targetParentUser) === String(currentUserId))) {
    return true;
  }

  // Group Manager check: target must be in managed groups
  if ((userRole === 'GROUP_MANAGER' || userRole === 'MANAGER') && user.managedGroups && targetResource.groups) {
    const hasCommonGroup = user.managedGroups.some(g => targetResource.groups.includes(g));
    if (hasCommonGroup) return true;
  }

  // Default permission-based lookup
  const userPermissions = user.permissions || getDefaultPermissions(user.role, user.roleType);
  if (userPermissions.includes('VIEW_USERS') && userLevel < targetLevel) {
    return true;
  }

  return false;
}
