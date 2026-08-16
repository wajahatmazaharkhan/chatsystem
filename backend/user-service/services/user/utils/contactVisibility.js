const ALLOWED = [
  "ADMIN",
  "SUB_ADMIN",
  "HEAD_HR_PUBLISHING",
  "HEAD_HR_NON_PUBLISHING",
  "GROUP_MANAGER"
];

function canViewContact(role) {
  return ALLOWED.includes(role);
}

module.exports = {
  canViewContact
};