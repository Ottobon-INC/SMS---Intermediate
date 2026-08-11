import { UserRole } from '@/src/types';

export const ModulePermissions = {
  // Office Staff Actions
  canMarkAttendance: (role: UserRole) => role === 'OFFICE_STAFF',
  canSaveDraft: (role: UserRole) => role === 'OFFICE_STAFF',
  canSubmitAttendance: (role: UserRole) => role === 'OFFICE_STAFF',

  // Principal Actions
  canReviewAttendance: (role: UserRole) => role === 'BRANCH_ADMIN',
  canReturnAttendance: (role: UserRole) => role === 'BRANCH_ADMIN',
  canFinalizeAttendance: (role: UserRole) => role === 'BRANCH_ADMIN',
  canReopenAttendance: (role: UserRole) => role === 'BRANCH_ADMIN',
  canRefinalizeAttendance: (role: UserRole) => role === 'BRANCH_ADMIN',

  // Dean / Oversight Actions
  canViewAttendanceOversight: (role: UserRole) => role === 'INSTITUTION_ADMIN' || role === 'BRANCH_ADMIN' || role === 'OFFICE_STAFF',
};
