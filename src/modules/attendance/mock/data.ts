import { AttendanceSession, StudentAttendanceRecord } from '../types';

export const mockStudents: StudentAttendanceRecord[] = [
  { id: 'stu-1', rollNumber: '01', admissionNumber: 'VEI-2026-1001', studentName: 'Rahul Kumar', status: null, note: '' },
  { id: 'stu-2', rollNumber: '02', admissionNumber: 'VEI-2026-1002', studentName: 'Priya Sharma', status: null, note: '' },
  { id: 'stu-3', rollNumber: '03', admissionNumber: 'VEI-2026-1003', studentName: 'Anil Reddy', status: null, note: '' },
  { id: 'stu-4', rollNumber: '04', admissionNumber: 'VEI-2026-1004', studentName: 'Kavya Singh', status: null, note: '' },
  { id: 'stu-5', rollNumber: '05', admissionNumber: 'VEI-2026-1005', studentName: 'Siddharth Varma', status: null, note: '' },
];

export const mockHistory: AttendanceSession[] = [
  {
    id: 'sess-1',
    context: {
        branch: 'Visakhapatnam Campus',
        academicYear: '2026-27',
        yearLevel: 'First Year',
        programme: 'MPC + JEE',
        batch: 'JEE Advanced A',
        section: 'A',
        date: '2026-08-01',
    },
    status: 'FINALIZED',
    summary: { totalStudents: 45, present: 40, absent: 3, leave: 2, unmarked: 0 },
    submittedBy: 'Office Staff',
    finalizedBy: 'Principal',
  },
  {
    id: 'sess-2',
    context: {
        branch: 'Visakhapatnam Campus',
        academicYear: '2026-27',
        yearLevel: 'First Year',
        programme: 'MPC + JEE',
        batch: 'JEE Advanced A',
        section: 'A',
        date: '2026-08-02',
    },
    status: 'SUBMITTED',
    summary: { totalStudents: 45, present: 41, absent: 4, leave: 0, unmarked: 0 },
    submittedBy: 'Office Staff',
  }
];

export const mockParentFinalizedRecords = [
    { date: '2026-08-01', status: 'PRESENT' },
    { date: '2026-08-02', status: 'PRESENT' },
    { date: '2026-08-03', status: 'ABSENT' },
    { date: '2026-08-04', status: 'PRESENT' },
    { date: '2026-08-05', status: 'LEAVE' },
    { date: '2026-08-06', status: 'PRESENT' },
];
