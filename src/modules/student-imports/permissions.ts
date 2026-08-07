import { UserRole } from '@/src/types';

export const ModulePermissions = {
  // Office Staff Actions
  canCreateImport: (role: UserRole) => role === 'OFFICE_STAFF',
  canUpload: (role: UserRole) => role === 'OFFICE_STAFF',
  canSubmit: (role: UserRole) => role === 'OFFICE_STAFF',

  // Principal Actions
  canReviewImport: (role: UserRole) => role === 'BRANCH_ADMIN',
  canReturnImport: (role: UserRole) => role === 'BRANCH_ADMIN',
  canApproveImport: (role: UserRole) => role === 'BRANCH_ADMIN',

  // Dean / Oversight Actions
  canViewImportOversight: (role: UserRole) => role === 'INSTITUTION_ADMIN' || role === 'BRANCH_ADMIN' || role === 'OFFICE_STAFF',
};
