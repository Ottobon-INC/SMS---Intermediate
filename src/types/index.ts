export type UserRole = 'INSTITUTION_ADMIN' | 'BRANCH_ADMIN' | 'OFFICE_STAFF' | 'PARENT_GUARDIAN';

export interface User {
  id: string;
  institutionId: string;
  branchId?: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  temporaryPassword?: string;
  linkedGuardianId?: string;
  createdBy: string;
  createdAt: string;
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  board: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Branch {
  id: string;
  institutionId: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AcademicYear {
  id: string;
  institutionId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Programme {
  id: string;
  institutionId: string;
  code: string;
  name: string;
  yearLevel: 'First Year' | 'Second Year';
  subjectIds?: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Batch {
  id: string;
  institutionId: string;
  branchId: string;
  academicYearId: string;
  programmeId: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Section {
  id: string;
  institutionId: string;
  branchId: string;
  batchId: string;
  code: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Subject {
  id: string;
  institutionId: string;
  programmeId?: string;
  code: string;
  name: string;
  maxMarks: number;
  passMarks: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BranchCourseOffering {
  id: string;
  institutionId: string;
  branchId: string;
  academicYearId: string;
  programmeId: string;
  status: 'ACTIVE' | 'DISCONTINUED';
  createdBy: string;
  createdAt: string;
}

export interface BranchSubjectOffering {
  id: string;
  branchCourseOfferingId: string;
  subjectId: string;
  maxMarks: number;
  passMarks: number;
  isOptional: boolean;
  status: 'ACTIVE' | 'DISCONTINUED';
}

export interface Student {
  id: string;
  institutionId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  mobile?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Guardian {
  id: string;
  institutionId: string;
  name: string;
  relationship: 'Mother' | 'Father' | 'Guardian';
  mobile: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StudentGuardianLink {
  id: string;
  institutionId: string;
  studentId: string;
  guardianId: string;
  isPrimary: boolean;
  portalEnabled: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Enrollment {
  id: string;
  institutionId: string;
  branchId: string;
  studentId: string;
  academicYearId: string;
  programmeId: string;
  batchId: string;
  sectionId: string;
  rollNumber: string;
  yearLevel: 'First Year' | 'Second Year';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ImportBatch {
  id: string;
  institutionId: string;
  branchId: string;
  academicYearId: string;
  fileName: string;
  fileChecksum: string;
  templateVersion: string;
  status: 'UPLOADED' | 'VALIDATED' | 'SUBMITTED' | 'CONFIRMED' | 'RETURNED';
  totalRows: number;
  validRows: number;
  warningRows: number;
  rejectedRows: number;
  uploadedBy: string;
  submittedBy?: string;
  confirmedBy?: string;
  createdAt: string;
  confirmedAt?: string;
  returnReason?: string;
}

export interface ImportRow {
  id: string;
  importBatchId: string;
  rowNumber: number;
  rawData: Record<string, string>;
  status: 'VALID' | 'WARNING' | 'REJECTED';
  errors: { field: string; code: string; message: string; suggestedCorrection: string }[];
  warnings: { field: string; code: string; message: string; userAction: string }[];
  matchedStudentId?: string;
  matchedGuardianId?: string;
}

export interface FeeCategory {
  id: string;
  institutionId: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FeeStructure {
  id: string;
  institutionId: string;
  branchId: string;
  academicYearId: string;
  programmeId: string;
  yearLevel: 'First Year' | 'Second Year';
  feeCategoryId: string;
  amount: number;
  dueDate: string;
  instalmentName?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type FeeStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'WAIVED' | 'CANCELLED';

export interface FeeAssignment {
  id: string;
  institutionId: string;
  branchId: string;
  enrollmentId: string;
  studentId: string;
  feeStructureId: string;
  description: string;
  assignedAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  status: FeeStatus;
  createdBy: string;
  createdAt: string;
}

export interface FeePayment {
  id: string;
  institutionId: string;
  branchId: string;
  feeAssignmentId: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';
  referenceNumber: string;
  receiptNumber: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface FeeAdjustment {
  id: string;
  institutionId: string;
  branchId: string;
  feeAssignmentId: string;
  type: 'Discount' | 'Waiver' | 'Correction' | 'Cancellation';
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  approvedBy?: string;
  requestedAt: string;
  approvedAt?: string;
  beforeValue: number;
  afterValue: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE';

export interface AttendanceSession {
  id: string;
  institutionId: string;
  branchId: string;
  academicYearId: string;
  programmeId: string;
  batchId: string;
  sectionId: string;
  attendanceDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'FINALIZED';
  submittedBy?: string;
  submittedAt?: string;
  finalizedBy?: string;
  finalizedAt?: string;
  reopenReason?: string;
  version: number;
}

export interface AttendanceEntry {
  id: string;
  attendanceSessionId: string;
  enrollmentId: string;
  studentId: string;
  status: AttendanceStatus;
  internalNote?: string;
  previousStatus?: AttendanceStatus;
  correctionReason?: string;
}

export interface Exam {
  id: string;
  institutionId: string;
  scope: 'ALL_BRANCHES' | 'SELECTED_BRANCHES' | 'SINGLE_BRANCH';
  branchId: string;
  branchIds: string[];
  excludedBranchIds?: string[];
  exemptionReasons?: Record<string, string>;
  academicYearId: string;
  programmeId: string;
  programmeIds?: string[];
  batchIds?: string[];
  sectionIds?: string[];
  name: string;
  type: string;
  examDate: string;
  marksEntryDeadline: string;
  status: 'DRAFT' | 'SUBMITTED' | 'RETURNED_FOR_CORRECTION' | 'APPROVED' | 'PUBLISHED';
  createdBy: string;
  createdAt: string;
  returnReason?: string;
}

export interface ExamSubject {
  id: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  maximumMarks: number;
  passMarks: number;
  exemptedBranchIds?: string[];
  exemptedBatchIds?: string[];
}

export interface ExamSection {
  id: string;
  examId: string;
  batchId: string;
  sectionId: string;
}

export interface StudentExamRecord {
  id: string;
  examId: string;
  enrollmentId: string;
  studentId: string;
  sectionId?: string;
  subjectMarks: Record<string, number>; // subjectId -> mark (-1: ABSENT, -2: EXEMPTED, -3: MALPRACTICE)
  totalMarks?: number;
  maxTotalMarks?: number;
  percentage?: number;
  resultStatus?: 'Pass' | 'Fail';
  grade?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'RETURNED_FOR_CORRECTION' | 'APPROVED' | 'PUBLISHED';
  enteredBy: string;
  updatedAt: string;
}

export interface Mark {
  id: string;
  examId: string;
  examSubjectId: string;
  enrollmentId: string;
  studentId: string;
  marksObtained: number | 'ABSENT';
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';
  enteredBy: string;
  updatedAt: string;
}

export interface ResultPublication {
  id: string;
  examId: string;
  sectionId: string;
  status: 'APPROVED' | 'PUBLISHED';
  approvedBy: string;
  approvedAt: string;
  publishedBy?: string;
  publishedAt?: string;
  version: number;
}

export interface ResultVersion {
  id: string;
  resultPublicationId: string;
  studentId: string;
  version: number;
  subjectResults: {
    subjectId: string;
    subjectName: string;
    marksObtained: number | 'ABSENT';
    maximumMarks: number;
    passMarks: number;
    isPass: boolean;
  }[];
  totalMarks: number;
  maximumMarks: number;
  percentage: number;
  grade: string;
  resultStatus: 'Pass' | 'Fail';
  correctionReason?: string;
  createdAt: string;
}

export interface Circular {
  id: string;
  institutionId: string;
  branchId?: string;
  batchId?: string;
  sectionId?: string;
  title: string;
  message: string;
  category: 'General' | 'Academic' | 'Holiday' | 'Fee Notice' | 'Exam Notice';
  audienceType: 'All' | 'Branch' | 'Batch' | 'Section' | 'Parent';
  attachmentUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  institutionId: string;
  templateCode: string;
  eventType: NotificationEventType;
  language: string;
  messageBody: string;
  requiredVariables: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export type NotificationEventType =
  | 'ATTENDANCE_ABSENCE'
  | 'ATTENDANCE_CORRECTION'
  | 'FEE_ASSIGNED'
  | 'FEE_DUE_REMINDER'
  | 'FEE_OVERDUE'
  | 'PAYMENT_CONFIRMATION'
  | 'EXAM_RESULT_PUBLISHED'
  | 'EXAM_RESULT_CORRECTED'
  | 'CIRCULAR_PUBLISHED';

export interface NotificationEvent {
  id: string;
  institutionId: string;
  branchId: string;
  studentId: string;
  enrollmentId?: string;
  guardianId: string;
  sourceModule: 'Attendance' | 'Fees' | 'Examinations' | 'Circulars';
  sourceRecordId: string;
  eventType: NotificationEventType;
  templateId?: string;
  recipientMobile: string;
  resolvedMessage: string;
  status: 'CREATED' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  providerMessageId?: string;
  failureReason?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  retryCount: number;
}

export interface AuditEvent {
  id: string;
  institutionId: string;
  branchId?: string;
  actorUserId: string;
  actorRole: UserRole;
  action: string;
  recordType: string;
  recordId: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  createdAt: string;
}

export interface AppSetting {
  id: string;
  institutionId: string;
  key: string;
  value: string;
}
