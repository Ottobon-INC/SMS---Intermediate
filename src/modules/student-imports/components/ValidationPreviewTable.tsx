import React, { useState } from 'react';
import { StudentExcelRow } from '../types';
import { Download, ChevronRight } from 'lucide-react';
import { RowDetailsDrawer } from './RowDetailsDrawer';
import * as XLSX from 'xlsx';

interface Props {
  rows: StudentExcelRow[];
  academicYear: string;
}

export const ValidationPreviewTable: React.FC<Props> = ({ rows, academicYear }) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VALID' | 'WARNING' | 'REJECTED'>('ALL');
  const [selectedRow, setSelectedRow] = useState<StudentExcelRow | null>(null);

  const validCount = rows.filter((r) => r.validationStatus === 'VALID').length;
  const errorCount = rows.filter((r) => r.validationStatus === 'REJECTED').length;
  const dupCount = rows.filter((r) => r.validationStatus === 'WARNING').length;

  const filteredStaging = rows.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.validationStatus === filterStatus;
  });

  const handleDownloadErrorCsv = () => {
    const errorRows = rows.filter(r => r.validationStatus === 'REJECTED' || r.validationStatus === 'WARNING');
    
    // Flatten validation issues into rows
    const reportData: any[] = [];
    errorRows.forEach(row => {
        row.validationIssues.forEach(issue => {
            let field = "Unknown";
            let suggested = "Correct the data in this row and re-upload";
            
            if (issue.toLowerCase().includes("mobile")) { field = "Mobile Number"; suggested = "Enter a valid 10-digit mobile number"; }
            else if (issue.toLowerCase().includes("admission number")) { field = "Admission Number"; }
            else if (issue.toLowerCase().includes("name")) { field = "Name"; }
            else if (issue.toLowerCase().includes("date")) { field = "Date"; }
            else if (issue.toLowerCase().includes("gender")) { field = "Gender"; }
            else if (issue.toLowerCase().includes("year")) { field = "Year Level"; }
            else if (issue.toLowerCase().includes("programme")) { field = "Programme / Stream"; }
            else if (issue.toLowerCase().includes("batch")) { field = "Batch"; }
            else if (issue.toLowerCase().includes("section")) { field = "Section"; }
            else if (issue.toLowerCase().includes("relationship")) { field = "Relationship"; }

            reportData.push({
                "Row Number": row.rowNumber,
                "Admission Number": row.admissionNumber,
                "Field": field,
                "Error": issue,
                "Suggested Correction": suggested
            });
        });
    });

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Error Report");
    XLSX.writeFile(wb, "Student_Import_Error_Report.xlsx");
  };

  return (
    <div className="glass-panel rounded-[24px] p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
            <h3 className="font-bold text-slate-900 tracking-tight">Validation Results</h3>
        </div>
        
        {(errorCount > 0 || dupCount > 0) && (
          <button 
            onClick={handleDownloadErrorCsv}
            className="px-5 py-2.5 bg-rose-50/80 text-rose-600 hover:bg-rose-100/80 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-rose-200/50 hover:shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Error Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`p-4 rounded-[1.25rem] border font-bold text-left transition-all duration-300 ${
            filterStatus === 'ALL' ? 'bg-slate-900 text-white border-slate-900 premium-shadow scale-105 z-10' : 'bg-slate-50/50 text-slate-500 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'
          }`}
        >
          <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Total</div>
          <div className="text-xl tracking-tight">{rows.length}</div>
        </button>
        <button
          onClick={() => setFilterStatus('VALID')}
          className={`p-4 rounded-[1.25rem] border font-bold text-left transition-all duration-300 ${
            filterStatus === 'VALID' ? 'bg-emerald-500 text-white border-emerald-500 premium-glow-emerald scale-105 z-10' : 'bg-emerald-50/30 text-emerald-700 border-transparent hover:bg-emerald-50/80 hover:border-emerald-200/50 hover:shadow-sm'
          }`}
        >
          <div className="text-[10px] uppercase tracking-widest opacity-80 mb-1">Valid</div>
          <div className="text-xl tracking-tight">{validCount}</div>
        </button>
        <button
          onClick={() => setFilterStatus('WARNING')}
          className={`p-4 rounded-[1.25rem] border font-bold text-left transition-all duration-300 ${
            filterStatus === 'WARNING' ? 'bg-amber-500 text-white border-amber-500 premium-shadow scale-105 z-10' : 'bg-amber-50/30 text-amber-700 border-transparent hover:bg-amber-50/80 hover:border-amber-200/50 hover:shadow-sm'
          }`}
        >
          <div className="text-[10px] uppercase tracking-widest opacity-80 mb-1">Warnings</div>
          <div className="text-xl tracking-tight">{dupCount}</div>
        </button>
        <button
          onClick={() => setFilterStatus('REJECTED')}
          className={`p-4 rounded-[1.25rem] border font-bold text-left transition-all duration-300 ${
            filterStatus === 'REJECTED' ? 'bg-rose-500 text-white border-rose-500 premium-glow-rose scale-105 z-10' : 'bg-rose-50/30 text-rose-700 border-transparent hover:bg-rose-50/80 hover:border-rose-200/50 hover:shadow-sm'
          }`}
        >
          <div className="text-[10px] uppercase tracking-widest opacity-80 mb-1">Rejected</div>
          <div className="text-xl tracking-tight">{errorCount}</div>
        </button>
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200/60 bg-white/40 backdrop-blur-md custom-scrollbar">
        <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap">
          <thead className="bg-slate-50/80 backdrop-blur-md text-slate-500 font-semibold uppercase tracking-wider text-[9px] border-b border-slate-200/60">
            <tr>
              <th className="p-3 font-bold">#</th>
              <th className="p-3 font-bold">Admission No</th>
              <th className="p-3 font-bold">Student Name</th>
              <th className="p-3 font-bold">Year</th>
              <th className="p-3 font-bold">Programme</th>
              <th className="p-3 font-bold">Batch</th>
              <th className="p-3 font-bold">Section</th>
              <th className="p-3 font-bold">Guardian Name</th>
              <th className="p-3 font-bold">Guardian Mobile</th>
              <th className="p-3 font-bold">Status</th>
              <th className="p-3 font-bold text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {filteredStaging.map((row) => (
              <tr key={row.rowNumber} className="hover:bg-white transition-colors group">
                <td className="p-3 font-bold text-slate-400">{row.rowNumber}</td>
                <td className="p-3 font-mono font-bold text-slate-900">{row.admissionNumber}</td>
                <td className="p-3 font-bold text-slate-800 truncate max-w-[150px]">{row.studentFullName}</td>
                <td className="p-3 text-slate-500 font-medium">{row.yearLevel}</td>
                <td className="p-3 text-slate-500 font-medium">{row.programme}</td>
                <td className="p-3 text-slate-500 font-medium">{row.batch}</td>
                <td className="p-3 text-slate-500 font-medium">{row.section}</td>
                <td className="p-3 text-slate-500 font-medium truncate max-w-[120px]">{row.guardianName}</td>
                <td className="p-3 text-slate-500 font-mono">{row.guardianMobile}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                      row.validationStatus === 'VALID'
                        ? 'bg-emerald-100/80 text-emerald-800'
                        : row.validationStatus === 'WARNING'
                        ? 'bg-amber-100/80 text-amber-800'
                        : 'bg-rose-100/80 text-rose-800'
                    }`}
                  >
                    {row.validationStatus}
                  </span>
                </td>
                <td className="p-3 text-right pr-4">
                  <button 
                    onClick={() => setSelectedRow(row)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-[9px] tracking-wider uppercase transition-colors"
                  >
                    Details <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredStaging.length === 0 && (
              <tr>
                <td colSpan={11} className="p-12 text-center text-slate-500 font-medium text-sm">
                  No records match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRow && (
        <RowDetailsDrawer row={selectedRow} academicYear={academicYear} onClose={() => setSelectedRow(null)} />
      )}
    </div>
  );
};
