function getHierarchyLevel(role) {
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

function getDefaultPermissions(role, roleType) {
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

module.exports = {
  getHierarchyLevel,
  getDefaultPermissions
};
