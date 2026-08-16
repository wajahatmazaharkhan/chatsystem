export const ROLES = [
  { id: 'admin', label: 'Admin' },
  { id: 'sub-admin', label: 'Sub-Admin' },
  { id: 'head-hr', label: 'Head HR' },
  { id: 'group-manager', label: 'Group Manager' },
  { id: 'sub-group-manager', label: 'Sub Group Manager' },
  { id: 'student', label: 'Student' },
];

export const HEAD_HR_TYPES = [
  { id: 'publishing', label: 'Publishing' },
  { id: 'non-publishing', label: 'Non-Publishing' },
];

export const GROUPS = [
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `pub-group-${i + 1}`,
    name: `Publishing Group ${i + 1}`,
    type: 'publishing',
  })),
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `non-pub-group-${i + 1}`,
    name: `Non-Publishing Group ${i + 1}`,
    type: 'non-publishing',
  })),
];
