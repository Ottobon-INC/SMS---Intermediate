import {
  User,
  UserRole,
  Institution,
  Branch,
  AcademicYear,
  Programme,
  Batch,
  Section,
  Subject,
  Student,
  Guardian,
  StudentGuardianLink,
  Enrollment,
  FeeCategory,
  FeeStructure,
  FeeAssignment,
  FeePayment,
  FeeAdjustment,
  AttendanceSession,
  AttendanceEntry,
  Exam,
  ExamSubject,
  ExamSection,
  Mark,
  ResultPublication,
  ResultVersion,
  Circular,
  NotificationTemplate,
  NotificationEvent,
  AuditEvent,
  ImportBatch,
  ImportRow,
} from '@/src/types';

import {
  seedInstitution,
  seedBranch,
  seedAcademicYear,
  seedProgrammes,
  seedBatches,
  seedSections,
  seedSubjects,
  seedUsers,
  seedStudents,
  seedGuardians,
  seedStudentGuardianLinks,
  seedEnrollments,
  seedFeeCategories,
  seedFeeStructures,
  seedFeeAssignments,
  seedFeePayments,
  seedFeeAdjustments,
  seedAttendanceSessions,
  seedAttendanceEntries,
  seedExams,
  seedExamSubjects,
  seedExamSections,
  seedMarks,
  seedResultPublications,
  seedResultVersions,
  seedCirculars,
  seedNotificationTemplates,
  seedNotificationEvents,
  seedAuditEvents,
  seedImportBatches,
} from '@/src/data/seedData';

import { initFirebase } from './firebase';

const STORAGE_PREFIX = 'sms_inter_v1_';

function getStorage<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error('Error reading localStorage for key', key, err);
    return defaultData;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving localStorage for key', key, err);
  }
}

class DataRepository {
  private mode: 'DEMO_LOCAL' | 'FIREBASE' = 'DEMO_LOCAL';

  constructor() {
    const fb = initFirebase();
    if (fb.isConfigured) {
      this.mode = 'FIREBASE';
    }
  }

  public getDataMode(): 'DEMO_LOCAL' | 'FIREBASE' {
    return this.mode;
  }

  // RESET
  public resetDemoData(): void {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(k);
      }
    });

    // Seed defaults
    setStorage('institution', seedInstitution);
    setStorage('branch', seedBranch);
    setStorage('branches', [seedBranch]);
    setStorage('academicYear', seedAcademicYear);
    setStorage('programmes', seedProgrammes);
    setStorage('batches', seedBatches);
    setStorage('sections', seedSections);
    setStorage('subjects', seedSubjects);
    setStorage('users', seedUsers);
    setStorage('students', seedStudents);
    setStorage('guardians', seedGuardians);
    setStorage('studentGuardianLinks', seedStudentGuardianLinks);
    setStorage('enrollments', seedEnrollments);
    setStorage('feeCategories', seedFeeCategories);
    setStorage('feeStructures', seedFeeStructures);
    setStorage('feeAssignments', seedFeeAssignments);
    setStorage('feePayments', seedFeePayments);
    setStorage('feeAdjustments', seedFeeAdjustments);
    setStorage('attendanceSessions', seedAttendanceSessions);
    setStorage('attendanceEntries', seedAttendanceEntries);
    setStorage('exams', seedExams);
    setStorage('examSubjects', seedExamSubjects);
    setStorage('examSections', seedExamSections);
    setStorage('marks', seedMarks);
    setStorage('resultPublications', seedResultPublications);
    setStorage('resultVersions', seedResultVersions);
    setStorage('circulars', seedCirculars);
    setStorage('notificationTemplates', seedNotificationTemplates);
    setStorage('notificationEvents', seedNotificationEvents);
    setStorage('auditEvents', seedAuditEvents);
    setStorage('importBatches', seedImportBatches);
    setStorage('importRows', []);
  }

  // INSTITUTION & SETUP
  public getInstitution(): Institution {
    return getStorage('institution', seedInstitution);
  }

  public getBranches(): Branch[] {
    const branches = getStorage<Branch[]>('branches', [seedBranch]);
    if (!Array.isArray(branches)) {
      const single = getStorage('branch', seedBranch);
      return [single];
    }
    return branches;
  }

  public addBranch(branch: Branch): Branch {
    const list = this.getBranches();
    list.unshift(branch);
    setStorage('branches', list);
    return branch;
  }

  public addProgramme(programme: Programme): Programme {
    const list = this.getProgrammes();
    list.unshift(programme);
    setStorage('programmes', list);
    return programme;
  }

  public getAcademicYears(): AcademicYear[] {
    return [getStorage('academicYear', seedAcademicYear)];
  }

  public confirmImportBatch(batchId: string, confirmedByUserId: string): void {
    const list = this.getImportBatches();
    const idx = list.findIndex((b) => b.id === batchId);
    if (idx !== -1) {
      list[idx].status = 'CONFIRMED';
      setStorage('importBatches', list);
    }
  }

  public getAttendanceRecords(sessionId?: string): AttendanceEntry[] {
    return this.getAttendanceEntries(sessionId);
  }

  public addAttendanceRecord(entry: AttendanceEntry): void {
    const list = this.getAttendanceEntries();
    list.unshift(entry);
    setStorage('attendanceEntries', list);
  }

  public updateNotificationStatus(eventId: string, status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED'): void {
    this.updateNotificationEvent(eventId, { status });
  }

  public getAcademicYear(): AcademicYear {
    return getStorage('academicYear', seedAcademicYear);
  }

  public getProgrammes(): Programme[] {
    return getStorage('programmes', seedProgrammes);
  }

  public getBatches(): Batch[] {
    return getStorage('batches', seedBatches);
  }

  public getSections(): Section[] {
    return getStorage('sections', seedSections);
  }

  public getSubjects(): Subject[] {
    return getStorage('subjects', seedSubjects);
  }

  // USERS
  public getUsers(): User[] {
    return getStorage('users', seedUsers);
  }

  public addUser(user: User, executorRole?: UserRole, executorBranchId?: string): User {
    if (executorRole === 'BRANCH_ADMIN') {
      if (user.role === 'INSTITUTION_ADMIN' || user.role === 'BRANCH_ADMIN') {
        throw new Error('Branch Admin / Principal is not authorized to create Dean or Principal accounts.');
      }
      if (executorBranchId && user.branchId !== executorBranchId) {
        throw new Error('Branch Admin / Principal can only create accounts within their assigned branch.');
      }
    }
    const users = this.getUsers();
    users.unshift(user);
    setStorage('users', users);
    return user;
  }

  public updateUser(userId: string, patch: Partial<User>, executorRole?: UserRole, executorBranchId?: string): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const targetUser = users[idx];
    if (executorRole === 'BRANCH_ADMIN') {
      if (targetUser.role === 'INSTITUTION_ADMIN' || targetUser.role === 'BRANCH_ADMIN') {
        throw new Error('Branch Admin / Principal is not authorized to modify Dean or Principal accounts.');
      }
      if (executorBranchId && targetUser.branchId !== executorBranchId) {
        throw new Error('Branch Admin / Principal cannot modify accounts belonging to another branch.');
      }
      if (patch.role && (patch.role === 'INSTITUTION_ADMIN' || patch.role === 'BRANCH_ADMIN')) {
        throw new Error('Branch Admin / Principal cannot assign Dean or Principal roles.');
      }
    }

    users[idx] = { ...users[idx], ...patch };
    setStorage('users', users);
    return users[idx];
  }

  // STUDENTS & GUARDIANS
  public getStudents(): Student[] {
    return getStorage('students', seedStudents);
  }

  public addStudent(student: Student): Student {
    const list = this.getStudents();
    list.unshift(student);
    setStorage('students', list);
    return student;
  }

  public getGuardians(): Guardian[] {
    return getStorage('guardians', seedGuardians);
  }

  public addGuardian(guardian: Guardian): Guardian {
    const list = this.getGuardians();
    list.unshift(guardian);
    setStorage('guardians', list);
    return guardian;
  }

  public getStudentGuardianLinks(): StudentGuardianLink[] {
    return getStorage('studentGuardianLinks', seedStudentGuardianLinks);
  }

  public addStudentGuardianLink(link: StudentGuardianLink): StudentGuardianLink {
    const list = this.getStudentGuardianLinks();
    list.unshift(link);
    setStorage('studentGuardianLinks', list);
    return link;
  }

  public getEnrollments(): Enrollment[] {
    return getStorage('enrollments', seedEnrollments);
  }

  public addEnrollment(enrollment: Enrollment): Enrollment {
    const list = this.getEnrollments();
    list.unshift(enrollment);
    setStorage('enrollments', list);
    return enrollment;
  }

  // IMPORTS
  public getImportBatches(): ImportBatch[] {
    return getStorage('importBatches', seedImportBatches);
  }

  public addImportBatch(batch: ImportBatch): ImportBatch {
    const list = this.getImportBatches();
    list.unshift(batch);
    setStorage('importBatches', list);
    return batch;
  }

  public updateImportBatch(batchId: string, patch: Partial<ImportBatch>): ImportBatch | null {
    const list = this.getImportBatches();
    const idx = list.findIndex((b) => b.id === batchId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    setStorage('importBatches', list);
    return list[idx];
  }

  public getImportRows(batchId?: string): ImportRow[] {
    const list = getStorage<ImportRow[]>('importRows', []);
    if (batchId) return list.filter((r) => r.importBatchId === batchId);
    return list;
  }

  public addImportRows(rows: ImportRow[]): void {
    const list = this.getImportRows();
    list.push(...rows);
    setStorage('importRows', list);
  }

  // FEES
  public getFeeCategories(): FeeCategory[] {
    return getStorage('feeCategories', seedFeeCategories);
  }

  public getFeeStructures(): FeeStructure[] {
    return getStorage('feeStructures', seedFeeStructures);
  }

  public addFeeStructure(struct: FeeStructure): FeeStructure {
    const list = this.getFeeStructures();
    list.unshift(struct);
    setStorage('feeStructures', list);
    return struct;
  }

  public getFeeAssignments(): FeeAssignment[] {
    return getStorage('feeAssignments', seedFeeAssignments);
  }

  public addFeeAssignment(assignment: FeeAssignment): FeeAssignment {
    const list = this.getFeeAssignments();
    list.unshift(assignment);
    setStorage('feeAssignments', list);
    return assignment;
  }

  public updateFeeAssignment(id: string, patch: Partial<FeeAssignment>): FeeAssignment | null {
    const list = this.getFeeAssignments();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    setStorage('feeAssignments', list);
    return list[idx];
  }

  public getFeePayments(): FeePayment[] {
    return getStorage('feePayments', seedFeePayments);
  }

  public addFeePayment(payment: FeePayment): FeePayment {
    const list = this.getFeePayments();
    list.unshift(payment);
    setStorage('feePayments', list);
    return payment;
  }

  public getFeeAdjustments(): FeeAdjustment[] {
    return getStorage('feeAdjustments', seedFeeAdjustments);
  }

  public addFeeAdjustment(adjustment: FeeAdjustment): FeeAdjustment {
    const list = this.getFeeAdjustments();
    list.unshift(adjustment);
    setStorage('feeAdjustments', list);
    return adjustment;
  }

  public updateFeeAdjustment(id: string, patch: Partial<FeeAdjustment>): FeeAdjustment | null {
    const list = this.getFeeAdjustments();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    setStorage('feeAdjustments', list);
    return list[idx];
  }

  // ATTENDANCE
  public getAttendanceSessions(): AttendanceSession[] {
    return getStorage('attendanceSessions', seedAttendanceSessions);
  }

  public addAttendanceSession(session: AttendanceSession): AttendanceSession {
    const list = this.getAttendanceSessions();
    list.unshift(session);
    setStorage('attendanceSessions', list);
    return session;
  }

  public updateAttendanceSession(id: string, patch: Partial<AttendanceSession>): AttendanceSession | null {
    const list = this.getAttendanceSessions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    setStorage('attendanceSessions', list);
    return list[idx];
  }

  public getAttendanceEntries(sessionId?: string): AttendanceEntry[] {
    const list = getStorage('attendanceEntries', seedAttendanceEntries);
    if (sessionId) return list.filter((e) => e.attendanceSessionId === sessionId);
    return list;
  }

  public setAttendanceEntries(sessionId: string, entries: AttendanceEntry[]): void {
    const list = this.getAttendanceEntries().filter((e) => e.attendanceSessionId !== sessionId);
    list.push(...entries);
    setStorage('attendanceEntries', list);
  }

  // EXAMS & MARKS
  public getExams(): Exam[] {
    return getStorage('exams', seedExams);
  }

  public addExam(exam: Exam): Exam {
    const list = this.getExams();
    list.unshift(exam);
    setStorage('exams', list);
    return exam;
  }

  public updateExam(id: string, patch: Partial<Exam>): Exam | null {
    const list = this.getExams();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    setStorage('exams', list);
    return list[idx];
  }

  public getExamSubjects(examId?: string): ExamSubject[] {
    const list = getStorage('examSubjects', seedExamSubjects);
    if (examId) return list.filter((es) => es.examId === examId);
    return list;
  }

  public addExamSubject(es: ExamSubject): ExamSubject {
    const list = this.getExamSubjects();
    list.push(es);
    setStorage('examSubjects', list);
    return es;
  }

  public getExamSections(examId?: string): ExamSection[] {
    const list = getStorage('examSections', seedExamSections);
    if (examId) return list.filter((es) => es.examId === examId);
    return list;
  }

  public addExamSection(es: ExamSection): ExamSection {
    const list = this.getExamSections();
    list.push(es);
    setStorage('examSections', list);
    return es;
  }

  public getMarks(examId?: string): Mark[] {
    const list = getStorage('marks', seedMarks);
    if (examId) return list.filter((m) => m.examId === examId);
    return list;
  }

  public saveMarks(examId: string, newMarks: Mark[]): void {
    const list = this.getMarks().filter((m) => m.examId !== examId);
    list.push(...newMarks);
    setStorage('marks', list);
  }

  public getResultPublications(): ResultPublication[] {
    return getStorage('resultPublications', seedResultPublications);
  }

  public addResultPublication(pub: ResultPublication): ResultPublication {
    const list = this.getResultPublications();
    list.unshift(pub);
    setStorage('resultPublications', list);
    return pub;
  }

  public updateResultPublication(id: string, patch: Partial<ResultPublication>): ResultPublication | null {
    const list = this.getResultPublications();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    setStorage('resultPublications', list);
    return list[idx];
  }

  public getResultVersions(studentId?: string): ResultVersion[] {
    const list = getStorage('resultVersions', seedResultVersions);
    if (studentId) return list.filter((v) => v.studentId === studentId);
    return list;
  }

  public addResultVersion(ver: ResultVersion): ResultVersion {
    const list = this.getResultVersions();
    list.unshift(ver);
    setStorage('resultVersions', list);
    return ver;
  }

  // CIRCULARS
  public getCirculars(): Circular[] {
    return getStorage('circulars', seedCirculars);
  }

  public addCircular(circular: Circular): Circular {
    const list = this.getCirculars();
    list.unshift(circular);
    setStorage('circulars', list);
    return circular;
  }

  public updateCircular(id: string, patch: Partial<Circular>): Circular | null {
    const list = this.getCirculars();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    setStorage('circulars', list);
    return list[idx];
  }

  // NOTIFICATIONS
  public getNotificationTemplates(): NotificationTemplate[] {
    return getStorage('notificationTemplates', seedNotificationTemplates);
  }

  public updateNotificationTemplate(id: string, patch: Partial<NotificationTemplate>): NotificationTemplate | null {
    const list = this.getNotificationTemplates();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    setStorage('notificationTemplates', list);
    return list[idx];
  }

  public getNotificationEvents(): NotificationEvent[] {
    return getStorage('notificationEvents', seedNotificationEvents);
  }

  public addNotificationEvent(event: NotificationEvent): NotificationEvent {
    const list = this.getNotificationEvents();
    list.unshift(event);
    setStorage('notificationEvents', list);
    return event;
  }

  public updateNotificationEvent(id: string, patch: Partial<NotificationEvent>): NotificationEvent | null {
    const list = this.getNotificationEvents();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    setStorage('notificationEvents', list);
    return list[idx];
  }

  // AUDIT LOG
  public getAuditEvents(): AuditEvent[] {
    return getStorage('auditEvents', seedAuditEvents);
  }

  public addAuditEvent(event: AuditEvent): AuditEvent {
    const list = this.getAuditEvents();
    list.unshift(event);
    setStorage('auditEvents', list);
    return event;
  }
}

export const dbRepository = new DataRepository();
