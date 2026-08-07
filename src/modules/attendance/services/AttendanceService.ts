import { AttendanceContext, AttendanceSession, StudentAttendanceRecord } from '../types';
import { mockStudents, mockHistory } from '../mock/data';

export class AttendanceService {
  static async getEligibleStudents(context: AttendanceContext): Promise<StudentAttendanceRecord[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(mockStudents)));
      }, 300);
    });
  }

  static async getHistory(): Promise<AttendanceSession[]> {
    return new Promise((resolve) => resolve([...mockHistory]));
  }

  static async saveDraft(context: AttendanceContext, records: StudentAttendanceRecord[]): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }

  static async submitForReview(context: AttendanceContext, records: StudentAttendanceRecord[]): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  static async returnForCorrection(sessionId: string, reason: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }

  static async finalize(sessionId: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  static async reopen(sessionId: string, reason: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
}
