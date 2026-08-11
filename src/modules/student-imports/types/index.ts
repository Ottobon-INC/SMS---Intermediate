export type ValidationStatus = 'VALID' | 'WARNING' | 'REJECTED';
export type WorkflowState = 'SELECT_CONTEXT' | 'UPLOAD' | 'VALIDATED' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED';

export interface StudentImportContext {
  branch: string;
  academicYear: string;
}

export interface StudentExcelRow {
  rowNumber: number;
  admissionNumber: string;
  studentFullName: string;
  dateOfBirth: string;
  gender: string;
  studentMobile?: string;
  guardianName: string;
  guardianRelationship: string;
  guardianMobile: string;
  yearLevel: string;
  programme: string;
  batch: string;
  section: string;
  rollNumber?: string;
  joiningDate: string;
  
  validationStatus: ValidationStatus;
  validationIssues: string[];
  suggestedAction: string;
}

export interface ImportSummary {
  totalRows: number;
  valid: number;
  warnings: number;
  rejected: number;
  studentsReady: number;
  guardiansReady: number;
  enrolmentsReady: number;
  existingMatched: number;
}

export interface ImportResult {
  branch: string;
  academicYear: string;
  importedBy: string;
  approvedBy: string;
  completedAt: string;
  batchId: string;
  
  studentsCreated: number;
  studentsMatched: number;
  guardiansCreated: number;
  guardianLinksCreated: number;
  enrolmentsCreated: number;
  rowsRejected: number;
}

export interface ImportHistoryRecord {
  id: string;
  batchId: string;
  filename: string;
  branch: string;
  academicYear: string;
  uploadedBy: string;
  uploadedAt: string;
  totalRows: number;
  valid: number;
  rejected: number;
  status: 'VALIDATED' | 'SUBMITTED' | 'APPROVED' | 'IMPORTED' | 'FAILED' | 'RETURNED';
}

export interface StudentListRecord {
  id: string;
  admissionNumber: string;
  studentName: string;
  year: string;
  programme: string;
  batch: string;
  section: string;
  guardianName: string;
  guardianMobile: string;
  status: 'ACTIVE' | 'INACTIVE';
}
