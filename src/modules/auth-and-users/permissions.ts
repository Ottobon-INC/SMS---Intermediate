import { UserRole } from '@/src/types';

export const MODULE_ROLES: UserRole[] = ['INSTITUTION_ADMIN', 'BRANCH_ADMIN'];

export const ModulePermissions = {
  canView: (role: UserRole) => MODULE_ROLES.includes(role),
  canEdit: (role: UserRole) => ['INSTITUTION_ADMIN', 'BRANCH_ADMIN'].includes(role),
};
