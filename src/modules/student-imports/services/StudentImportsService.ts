import { ImportHistoryRecord, StudentExcelRow, ImportResult, ImportSummary } from '../types';
import { mockImportHistory, mockStudentList } from '../mock/data';
import * as XLSX from 'xlsx';

export class StudentImportsService {
  static async getHistory(): Promise<ImportHistoryRecord[]> {
    return Promise.resolve([...mockImportHistory]);
  }

  static async getStudentList() {
    return Promise.resolve([...mockStudentList]);
  }

  static async validateFile(file: File): Promise<StudentExcelRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          const rows: StudentExcelRow[] = data.map((row: any, index: number) => {
            const admissionNumber = (row['Admission Number'] || '').toString().trim();
            const studentFullName = (row['Student Full Name'] || '').toString().trim();
            const dateOfBirth = (row['Date of Birth'] || '').toString().trim();
            const gender = (row['Gender'] || '').toString().trim();
            const studentMobile = (row['Student Mobile'] || '').toString().trim();
            const guardianName = (row['Guardian Name'] || '').toString().trim();
            const guardianRelationship = (row['Guardian Relationship'] || '').toString().trim();
            const guardianMobile = (row['Guardian Mobile'] || '').toString().trim();
            const yearLevel = (row['Year Level'] || '').toString().trim();
            const programme = (row['Programme / Stream'] || '').toString().trim();
            const batch = (row['Batch'] || '').toString().trim();
            const section = (row['Section'] || '').toString().trim();
            const rollNumber = (row['Roll Number'] || '').toString().trim();
            const joiningDate = (row['Joining Date'] || '').toString().trim();

            const validationIssues: string[] = [];
            
            if (!admissionNumber) validationIssues.push('Missing Admission Number');
            if (!studentFullName) validationIssues.push('Missing Student Full Name');
            if (!dateOfBirth) validationIssues.push('Missing Date of Birth');
            else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) && !/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth)) {
                // simple check for mock
            }
            
            if (!gender) validationIssues.push('Missing Gender');
            if (!guardianName) validationIssues.push('Missing Guardian Name');
            if (!guardianRelationship) validationIssues.push('Missing Guardian Relationship');
            if (!guardianMobile) validationIssues.push('Missing Guardian Mobile');
            else if (guardianMobile.length < 10) validationIssues.push('Invalid Guardian Mobile');
            
            if (!yearLevel) validationIssues.push('Missing Year Level');
            if (!programme) validationIssues.push('Missing Programme');
            if (!batch) validationIssues.push('Missing Batch');
            if (!section) validationIssues.push('Missing Section');
            if (!joiningDate) validationIssues.push('Missing Joining Date');

            // Mock existing check
            if (admissionNumber && admissionNumber.includes('1001')) {
                validationIssues.push('Duplicate admission number already enrolled in database');
            }

            let validationStatus: 'VALID' | 'WARNING' | 'REJECTED' = 'VALID';
            if (validationIssues.length > 0) {
              if (validationIssues.some(i => i.includes('Duplicate'))) {
                  validationStatus = 'WARNING';
              } else {
                  validationStatus = 'REJECTED';
              }
            }

            return {
              rowNumber: index + 1,
              admissionNumber,
              studentFullName,
              dateOfBirth,
              gender,
              studentMobile,
              guardianName,
              guardianRelationship,
              guardianMobile,
              yearLevel,
              programme,
              batch,
              section,
              rollNumber,
              joiningDate,
              validationStatus,
              validationIssues,
              suggestedAction: validationStatus === 'VALID' ? '' : 'Please correct the issues in the row before importing.',
            };
          });
          
          resolve(rows);
        } catch (err) {
          reject(new Error('Failed to parse Excel file. Ensure standard format.'));
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsBinaryString(file);
    });
  }

  static async submitImport(batchId: string, context: any, rows: StudentExcelRow[]): Promise<ImportSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalRows: rows.length,
          valid: rows.filter(r => r.validationStatus === 'VALID').length,
          warnings: rows.filter(r => r.validationStatus === 'WARNING').length,
          rejected: rows.filter(r => r.validationStatus === 'REJECTED').length,
          studentsReady: rows.filter(r => r.validationStatus === 'VALID').length,
          guardiansReady: rows.filter(r => r.validationStatus === 'VALID').length,
          enrolmentsReady: rows.filter(r => r.validationStatus === 'VALID').length,
          existingMatched: rows.filter(r => r.validationStatus === 'WARNING').length,
        });
      }, 500);
    });
  }

  static async approveImport(batchId: string, context: any, summary: ImportSummary): Promise<ImportResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          branch: context.branch,
          academicYear: context.academicYear,
          importedBy: 'Office Staff',
          approvedBy: 'Principal',
          completedAt: new Date().toISOString(),
          batchId,
          studentsCreated: summary.studentsReady,
          studentsMatched: summary.existingMatched,
          guardiansCreated: summary.guardiansReady,
          guardianLinksCreated: summary.studentsReady,
          enrolmentsCreated: summary.enrolmentsReady,
          rowsRejected: summary.rejected,
        });
      }, 500);
    });
  }

  static async returnImport(batchId: string, reason: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }
}
