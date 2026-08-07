import { dbRepository } from '@/src/services/db';
import { Exam, Mark, ResultVersion, ResultPublication, ExamSubject, ExamSection, Programme, Section, Enrollment, Subject, Student, Batch } from '@/src/types';

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

  static getEnrollments(): Enrollment[] {
    return dbRepository.getEnrollments();
  }

  static getStudents(): Student[] {
    return dbRepository.getStudents();
  }

  // Exams
  static getExams(): Exam[] {
    return dbRepository.getExams();
  }

  static getExamById(id: string): Exam | undefined {
    return dbRepository.getExams().find(e => e.id === id);
  }

  static createExam(exam: Exam): Exam {
    return dbRepository.addExam(exam);
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

  // Marks
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
