import { dbRepository } from '@/src/services/db';
import {
  Exam,
  Mark,
  ResultVersion,
  ResultPublication,
  ExamSubject,
  ExamSection,
  Programme,
  Section,
  Enrollment,
  Subject,
  Student,
  Batch,
  StudentExamRecord,
} from '@/src/types';

export interface GradeCalculation {
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  resultStatus: 'Pass' | 'Fail';
  grade: string;
}

export function calculateStudentGrade(
  subjectMarks: Record<string, number>,
  examSubjects: ExamSubject[]
): GradeCalculation {
  let totalMarks = 0;
  let maxTotalMarks = 0;
  let isPass = true;
  let hasScoredAnySubject = false;

  examSubjects.forEach((es) => {
    const markVal = subjectMarks[es.subjectId];
    if (markVal !== undefined && markVal !== null && markVal >= 0) {
      hasScoredAnySubject = true;
      totalMarks += markVal;
      maxTotalMarks += es.maximumMarks;
      if (markVal < es.passMarks) {
        isPass = false;
      }
    } else if (markVal === -1) {
      // ABSENT
      maxTotalMarks += es.maximumMarks;
      isPass = false;
    } else if (markVal === -2) {
      // EXEMPTED
    } else if (markVal === -3) {
      // MALPRACTICE
      maxTotalMarks += es.maximumMarks;
      isPass = false;
    }
  });

  if (!hasScoredAnySubject && examSubjects.length > 0) {
    isPass = false;
  }

  const percentage = maxTotalMarks > 0 ? Math.round((totalMarks / maxTotalMarks) * 100 * 10) / 10 : 0;

  let grade = 'F';
  if (isPass) {
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 35) grade = 'D';
    else grade = 'F';
  }

  return {
    totalMarks,
    maxTotalMarks,
    percentage,
    resultStatus: isPass ? 'Pass' : 'Fail',
    grade,
  };
}

export class ExaminationsService {
  // Master Data
  static getProgrammes(): Programme[] {
    return dbRepository.getProgrammes();
  }

  static getBatches(): Batch[] {
    return dbRepository.getBatches();
  }

  static getSections(): Section[] {
    return dbRepository.getSections();
  }

  static getSubjects(): Subject[] {
    return dbRepository.getSubjects();
  }

  static getSubjectsForProgramme(programmeId: string): Subject[] {
    const prog = dbRepository.getProgrammes().find(p => p.id === programmeId);
    const allSubjects = dbRepository.getSubjects();
    if (prog?.subjectIds && prog.subjectIds.length > 0) {
      return allSubjects.filter(s => prog.subjectIds?.includes(s.id));
    }
    return allSubjects.filter(s => s.programmeId === programmeId);
  }

  static getSubjectsForProgrammes(programmeIds: string[]): Subject[] {
    if (!programmeIds || programmeIds.length === 0) return [];
    const progs = dbRepository.getProgrammes().filter(p => programmeIds.includes(p.id));
    const allSubjects = dbRepository.getSubjects();
    const collectedSubjectIds = new Set<string>();

    progs.forEach(p => {
      if (p.subjectIds) {
        p.subjectIds.forEach(id => collectedSubjectIds.add(id));
      }
    });

    if (collectedSubjectIds.size > 0) {
      return allSubjects.filter(s => collectedSubjectIds.has(s.id));
    }

    return allSubjects.filter(s => s.programmeId && programmeIds.includes(s.programmeId));
  }

  static getEnrollments(): Enrollment[] {
    return dbRepository.getEnrollments();
  }

  static getStudents(): Student[] {
    return dbRepository.getStudents();
  }

  // Overlap Lock Validation
  static checkExamDateOverlap(
    examDate: string,
    targetBranchIds: string[],
    programmeId: string,
    sectionIds?: string[],
    excludeExamId?: string
  ): { hasOverlap: boolean; conflictingExam?: Exam } {
    const exams = dbRepository.getExams();
    const conflict = exams.find((e) => {
      if (excludeExamId && e.id === excludeExamId) return false;
      if (e.status === 'RETURNED_FOR_CORRECTION') return false; // Allowed to edit
      if (e.examDate !== examDate) return false;
      if (e.programmeId !== programmeId) return false;

      // Check branch overlap
      const hasBranchMatch = e.scope === 'ALL_BRANCHES' || e.branchIds?.some((b) => targetBranchIds.includes(b)) || targetBranchIds.includes(e.branchId);
      if (!hasBranchMatch) return false;

      // Check section overlap if specified
      if (sectionIds && sectionIds.length > 0 && e.sectionIds && e.sectionIds.length > 0) {
        const hasSectionMatch = e.sectionIds.some((s) => sectionIds.includes(s));
        if (!hasSectionMatch) return false;
      }

      return true;
    });

    return {
      hasOverlap: !!conflict,
      conflictingExam: conflict,
    };
  }

  // Exams
  static getExams(): Exam[] {
    return dbRepository.getExams();
  }

  static getExamById(id: string): Exam | undefined {
    return dbRepository.getExams().find((e) => e.id === id);
  }

  static exemptBranchFromExam(examId: string, branchId: string, reason: string): Exam | null {
    const exam = this.getExamById(examId);
    if (!exam) return null;

    const excluded = exam.excludedBranchIds || [];
    if (!excluded.includes(branchId)) {
      excluded.push(branchId);
    }

    const reasons = exam.exemptionReasons || {};
    reasons[branchId] = reason;

    return this.updateExam(examId, {
      excludedBranchIds: excluded,
      exemptionReasons: reasons,
    });
  }

  static createExam(exam: Exam, examSubjects: ExamSubject[]): Exam {
    const created = dbRepository.addExam(exam);
    examSubjects.forEach((es) => {
      dbRepository.addExamSubject({
        ...es,
        examId: created.id,
      });
    });
    return created;
  }

  static updateExam(id: string, patch: Partial<Exam>): Exam | null {
    return dbRepository.updateExam(id, patch);
  }

  static getExamSubjects(examId: string): ExamSubject[] {
    return dbRepository.getExamSubjects(examId);
  }

  static getExamSections(examId: string): ExamSection[] {
    return dbRepository.getExamSections(examId);
  }

  // Student Exam Records (JSON Storage)
  static getStudentExamRecords(examId?: string, sectionId?: string): StudentExamRecord[] {
    return dbRepository.getStudentExamRecords(examId, sectionId);
  }

  static saveStudentExamRecord(record: StudentExamRecord, examSubjects: ExamSubject[]): StudentExamRecord {
    const calc = calculateStudentGrade(record.subjectMarks, examSubjects);
    const enrichedRecord: StudentExamRecord = {
      ...record,
      totalMarks: calc.totalMarks,
      maxTotalMarks: calc.maxTotalMarks,
      percentage: calc.percentage,
      resultStatus: calc.resultStatus,
      grade: calc.grade,
      updatedAt: new Date().toISOString(),
    };
    return dbRepository.setStudentExamRecord(enrichedRecord);
  }

  // Legacy Marks compatibility
  static getMarks(examId: string): Mark[] {
    return dbRepository.getMarks(examId);
  }

  static saveMarks(examId: string, newMarks: Mark[]): void {
    dbRepository.saveMarks(examId, newMarks);
  }

  // Publications & Versions
  static getResultPublications(): ResultPublication[] {
    return dbRepository.getResultPublications();
  }

  static addResultPublication(pub: ResultPublication): ResultPublication {
    return dbRepository.addResultPublication(pub);
  }

  static updateResultPublication(id: string, patch: Partial<ResultPublication>): ResultPublication | null {
    return dbRepository.updateResultPublication(id, patch);
  }

  static getResultVersions(studentId?: string): ResultVersion[] {
    return dbRepository.getResultVersions(studentId);
  }

  static addResultVersion(ver: ResultVersion): ResultVersion {
    return dbRepository.addResultVersion(ver);
  }
}
