import { ImportHistoryRecord, StudentListRecord } from '../types';

export const mockImportHistory: ImportHistoryRecord[] = [
  {
    id: 'hist-1',
    batchId: 'BATCH-2026-001',
    filename: 'MPC_Admissions_Batch1.xlsx',
    branch: 'Visakhapatnam Campus',
    academicYear: '2026-27',
    uploadedBy: 'office-staff-1',
    uploadedAt: '2026-08-01T10:30:00Z',
    totalRows: 120,
    valid: 118,
    rejected: 2,
    status: 'IMPORTED',
  },
  {
    id: 'hist-2',
    batchId: 'BATCH-2026-002',
    filename: 'BiPC_Admissions_Batch1.xlsx',
    branch: 'Visakhapatnam Campus',
    academicYear: '2026-27',
    uploadedBy: 'office-staff-1',
    uploadedAt: '2026-08-02T11:15:00Z',
    totalRows: 85,
    valid: 85,
    rejected: 0,
    status: 'IMPORTED',
  }
];

export const mockStudentList: StudentListRecord[] = [
  {
    id: 'stu-1',
    admissionNumber: 'SVI-2026-1001',
    studentName: 'Rahul Kumar',
    year: 'First Year',
    programme: 'MPC + JEE',
    batch: 'JEE Advanced A',
    section: 'A',
    guardianName: 'Srinivas Kumar',
    guardianMobile: '9876543210',
    status: 'ACTIVE',
  },
  {
    id: 'stu-2',
    admissionNumber: 'SVI-2026-1002',
    studentName: 'Priya Sharma',
    year: 'First Year',
    programme: 'BiPC + NEET',
    batch: 'NEET Long Term',
    section: 'B',
    guardianName: 'Rajesh Sharma',
    guardianMobile: '9876543211',
    status: 'ACTIVE',
  },
  {
    id: 'stu-3',
    admissionNumber: 'SVI-2026-1003',
    studentName: 'Anil Reddy',
    year: 'Second Year',
    programme: 'CEC',
    batch: 'Regular',
    section: 'C',
    guardianName: 'Venkat Reddy',
    guardianMobile: '9876543212',
    status: 'ACTIVE',
  }
];
