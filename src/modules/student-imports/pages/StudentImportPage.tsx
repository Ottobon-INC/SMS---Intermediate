import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { dbRepository } from '@/src/services/db';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { ImportRow, ImportBatch } from '@/src/types';

export const StudentImportPage: React.FC = () => {
  const { currentUser, triggerRefresh } = useAuth();
  const [batches, setBatches] = useState<ImportBatch[]>(() => dbRepository.getImportBatches());
  const [stagingRows, setStagingRows] = useState<ImportRow[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VALID' | 'ERROR' | 'DUPLICATE'>('ALL');

  const isPrincipalOrDean =
    currentUser?.role === 'INSTITUTION_ADMIN' || currentUser?.role === 'BRANCH_ADMIN';

  const refreshData = () => {
    setBatches(dbRepository.getImportBatches());
    triggerRefresh();
  };

  const parseAndValidateData = (data: any[]) => {
    const existingStudents = dbRepository.getStudents();
    const existingAdmissionNumbers = new Set(existingStudents.map((s) => s.admissionNumber.trim().toUpperCase()));

    const rows: ImportRow[] = data.map((row, index) => {
      const admissionNum = (row['admission_number'] || row['Admission Number'] || `SVI-2026-${1010 + index}`).toString().trim();
      const firstName = (row['student_first_name'] || row['First Name'] || '').toString().trim();
      const lastName = (row['student_last_name'] || row['Last Name'] || '').toString().trim();
      const guardianName = (row['guardian_name'] || row['Guardian Name'] || '').toString().trim();
      const guardianMobile = (row['guardian_mobile'] || row['Guardian Mobile'] || '').toString().trim();
      const programme = (row['programme'] || row['Programme'] || 'MPC').toString().trim();
      const section = (row['section'] || row['Section'] || 'MPC-A').toString().trim();

      const validationErrors: string[] = [];

      if (!admissionNum) validationErrors.push('Missing admission number');
      if (!firstName) validationErrors.push('Missing first name');
      if (!guardianName) validationErrors.push('Missing guardian name');
      if (!guardianMobile) validationErrors.push('Missing guardian mobile');

      let rowStatus: 'VALID' | 'WARNING' | 'REJECTED' = 'VALID';

      if (validationErrors.length > 0) {
        rowStatus = 'REJECTED';
      } else if (existingAdmissionNumbers.has(admissionNum.toUpperCase())) {
        rowStatus = 'WARNING';
        validationErrors.push('Duplicate admission number already enrolled in database');
      }

      return {
        id: `imp-row-${index + 1}`,
        importBatchId: 'batch-temp',
        rowNumber: index + 1,
        rawData: row,
        status: rowStatus,
        errors: validationErrors.map((msg) => ({ field: 'admissionNumber', code: 'INVALID', message: msg, suggestedCorrection: '' })),
        warnings: [],
      };
    });

    setStagingRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCurrentFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        parseAndValidateData(data);
      } catch (err) {
        alert('Failed to parse Excel file. Ensure standard format.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleLoadSampleDemoSpreadsheet = () => {
    setCurrentFileName('svic_first_year_admissions_2026.xlsx');
    const sampleData = [
      {
        admission_number: 'SVI-2026-1026',
        student_first_name: 'Kavya',
        student_last_name: 'Reddy',
        gender: 'Female',
        guardian_name: 'Venkat Reddy',
        guardian_mobile: '9000020026',
        programme: 'BiPC',
        section: 'BiPC-A',
      },
      {
        admission_number: 'SVI-2026-1027',
        student_first_name: 'Siddharth',
        student_last_name: 'Varma',
        gender: 'Male',
        guardian_name: 'Srinivas Varma',
        guardian_mobile: '9000020027',
        programme: 'CEC',
        section: 'CEC-A',
      },
      {
        admission_number: 'SVI-2026-1001', // Duplicate row
        student_first_name: 'Ravi',
        student_last_name: 'Kumar',
        gender: 'Male',
        guardian_name: 'Lakshmi Kumar',
        guardian_mobile: '9000020001',
        programme: 'MPC',
        section: 'MPC-A',
      },
      {
        admission_number: 'SVI-2026-1028',
        student_first_name: 'Ananya',
        student_last_name: '', // Missing last name (Valid)
        gender: 'Female',
        guardian_name: '', // Error missing guardian
        guardian_mobile: '9000020028',
        programme: 'MPC',
        section: 'MPC-A',
      },
    ];
    parseAndValidateData(sampleData);
  };

  const handleSaveImportBatch = () => {
    if (stagingRows.length === 0) return;

    const validCount = stagingRows.filter((r) => r.status === 'VALID').length;
    const errorCount = stagingRows.filter((r) => r.status === 'REJECTED').length;
    const dupCount = stagingRows.filter((r) => r.status === 'WARNING').length;

    const newBatch: ImportBatch = {
      id: `batch-${Date.now()}`,
      institutionId: 'inst-svic-01',
      branchId: 'branch-hyd-main',
      academicYearId: 'year-2026',
      fileName: currentFileName || 'uploaded_students.xlsx',
      fileChecksum: 'md5-abc123xyz',
      templateVersion: 'v1.0',
      uploadedBy: currentUser?.fullName || 'Office Staff',
      createdAt: new Date().toISOString(),
      totalRows: stagingRows.length,
      validRows: validCount,
      warningRows: 0,
      rejectedRows: errorCount + dupCount,
      status: 'SUBMITTED',
    };

    dbRepository.addImportBatch(newBatch);
    refreshData();
    setStagingRows([]);
    setCurrentFileName(null);
    alert('Student Excel batch submitted for Principal / Dean confirmation!');
  };

  const handleConfirmBatch = (batchId: string) => {
    dbRepository.confirmImportBatch(batchId, currentUser?.id || 'SYSTEM');
    refreshData();
    alert('Import batch confirmed! Valid student records have been inserted into the Student Directory.');
  };

  const validCount = stagingRows.filter((r) => r.status === 'VALID').length;
  const errorCount = stagingRows.filter((r) => r.status === 'REJECTED').length;
  const dupCount = stagingRows.filter((r) => r.status === 'WARNING').length;

  const filteredStaging = stagingRows.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === (filterStatus === 'ERROR' ? 'REJECTED' : filterStatus === 'DUPLICATE' ? 'WARNING' : filterStatus);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Excel Import Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload admission spreadsheets, review header mappings, check row-by-row validation, and confirm records.
          </p>
        </div>

        <button
          onClick={handleLoadSampleDemoSpreadsheet}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" /> Load Demo Spreadsheet
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Step 1: Upload Student Admission File</h3>

        <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 text-center bg-slate-50 transition-colors relative cursor-pointer">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-10 h-10 text-teal-600 mx-auto mb-2" />
          <span className="font-bold text-slate-900 text-sm block">
            Click to Browse or Drag & Drop Excel File
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Supports .xlsx and .xls formats with standard column headers.
          </p>
        </div>
      </div>

      {/* Staging Validation Preview Table */}
      {stagingRows.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Step 2: File Staging & Validation Results ({currentFileName})
              </h3>
              <p className="text-xs text-slate-500">
                Review valid rows, duplicate admissions, and missing data errors.
              </p>
            </div>

            <button
              onClick={handleSaveImportBatch}
              disabled={validCount === 0}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" /> Submit Batch for Approval ({validCount} Valid)
            </button>
          </div>

          {/* Validation Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`p-3 rounded-xl border font-semibold text-left transition-colors ${
                filterStatus === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'
              }`}
            >
              Total Rows: {stagingRows.length}
            </button>
            <button
              onClick={() => setFilterStatus('VALID')}
              className={`p-3 rounded-xl border font-semibold text-left transition-colors ${
                filterStatus === 'VALID' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}
            >
              Valid Rows: {validCount}
            </button>
            <button
              onClick={() => setFilterStatus('ERROR')}
              className={`p-3 rounded-xl border font-semibold text-left transition-colors ${
                filterStatus === 'ERROR' ? 'bg-rose-600 text-white border-rose-600' : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              Missing Info: {errorCount}
            </button>
            <button
              onClick={() => setFilterStatus('DUPLICATE')}
              className={`p-3 rounded-xl border font-semibold text-left transition-colors ${
                filterStatus === 'DUPLICATE' ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              Duplicates: {dupCount}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Admission No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Guardian Name</th>
                  <th className="p-3">Guardian Mobile</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Validation Status</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaging.map((row) => (
                  <tr key={row.rowNumber} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-400">{row.rowNumber}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{row.admissionNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {row.studentFirstName} {row.studentLastName}
                    </td>
                    <td className="p-3 text-slate-600">{row.guardianName || '—'}</td>
                    <td className="p-3 font-mono text-slate-600">{row.guardianMobile || '—'}</td>
                    <td className="p-3 text-slate-600">{row.section}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.validationStatus === 'VALID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.validationStatus === 'DUPLICATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.validationStatus}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-500 max-w-xs truncate">
                      {row.validationReason || 'Row valid and ready for import'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Previous Import Batches History */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Submitted Import Batches History</h3>

        <div className="space-y-3">
          {batches.map((b) => (
            <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{b.fileName}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Uploaded by {b.uploadedBy} on {new Date(b.uploadedAt).toLocaleString('en-IN')} • {b.validRows} valid students
                </p>
              </div>

              {b.status === 'SUBMITTED' && isPrincipalOrDean && (
                <button
                  onClick={() => handleConfirmBatch(b.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-4 h-4" /> Confirm & Insert Records
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
