export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE';
export type AttendanceWorkflowState = 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'FINALIZED' | 'REOPENED';
export type NotificationStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface AttendanceContext {
  branch: string;
  academicYear: string;
  yearLevel: string;
  programme: string;
  batch: string;
  section: string;
  date: string;
}

export interface StudentAttendanceRecord {
  id: string;
  rollNumber: string;
  admissionNumber: string;
  studentName: string;
  status: AttendanceStatus | null;
  note: string;
  previousStatus?: AttendanceStatus | null;
  correctionReason?: string;
  notificationStatus?: NotificationStatus;
}

export interface AttendanceSessionSummary {
  totalStudents: number;
  present: number;
  absent: number;
  leave: number;
  unmarked: number;
}

export interface AttendanceSession {
  id: string;
  context: AttendanceContext;
  status: AttendanceWorkflowState;
  summary: AttendanceSessionSummary;
  submittedBy?: string;
  submittedAt?: string;
  finalizedBy?: string;
  finalizedAt?: string;
  returnReason?: string;
  reopenReason?: string;
  lastSavedAt?: string;
}
