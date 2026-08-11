import React from 'react';
import { StudentExcelRow } from '../types';
import { X, AlertCircle } from 'lucide-react';

interface Props {
  row: StudentExcelRow;
  academicYear: string;
  onClose: () => void;
}

export const RowDetailsDrawer: React.FC<Props> = ({ row, academicYear, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-900">Row {row.rowNumber} Details</h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Validation Status */}
          <div className={`p-4 rounded-xl border ${
            row.validationStatus === 'VALID' ? 'bg-emerald-50 border-emerald-200' :
            row.validationStatus === 'WARNING' ? 'bg-amber-50 border-amber-200' :
            'bg-rose-50 border-rose-200'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              row.validationStatus === 'VALID' ? 'text-emerald-800' :
              row.validationStatus === 'WARNING' ? 'text-amber-800' :
              'text-rose-800'
            }`}>Validation: {row.validationStatus}</h3>
            {row.validationIssues.length > 0 ? (
                <ul className="list-disc pl-5 text-sm space-y-1 text-slate-700">
                    {row.validationIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                            {issue}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-emerald-700">Row is valid and ready for import.</p>
            )}
            
            {row.suggestedAction && (
                <div className="mt-3 pt-3 border-t border-black/10">
                    <p className="text-xs font-semibold">Suggested Action:</p>
                    <p className="text-sm">{row.suggestedAction}</p>
                </div>
            )}
          </div>

          {/* Student Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Student Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-slate-500 text-xs">Admission Number</p>
                    <p className="font-semibold text-slate-900">{row.admissionNumber || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Full Name</p>
                    <p className="font-semibold text-slate-900">{row.studentFullName || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Date of Birth</p>
                    <p className="font-semibold text-slate-900">{row.dateOfBirth || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Gender</p>
                    <p className="font-semibold text-slate-900">{row.gender || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Student Mobile</p>
                    <p className="font-semibold text-slate-900">{row.studentMobile || '—'}</p>
                </div>
            </div>
          </div>

          {/* Academic Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-t pt-4">Academic Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-slate-500 text-xs">Academic Year</p>
                    <p className="font-semibold text-slate-900">{academicYear || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Year Level</p>
                    <p className="font-semibold text-slate-900">{row.yearLevel || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Programme / Stream</p>
                    <p className="font-semibold text-slate-900">{row.programme || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Batch</p>
                    <p className="font-semibold text-slate-900">{row.batch || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Section</p>
                    <p className="font-semibold text-slate-900">{row.section || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Roll Number</p>
                    <p className="font-semibold text-slate-900">{row.rollNumber || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Joining Date</p>
                    <p className="font-semibold text-slate-900">{row.joiningDate || '—'}</p>
                </div>
            </div>
          </div>

          {/* Guardian Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-t pt-4">Guardian Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-slate-500 text-xs">Guardian Name</p>
                    <p className="font-semibold text-slate-900">{row.guardianName || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Relationship</p>
                    <p className="font-semibold text-slate-900">{row.guardianRelationship || '—'}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Guardian Mobile</p>
                    <p className="font-semibold text-slate-900">{row.guardianMobile || '—'}</p>
                </div>
            </div>
          </div>
          
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button onClick={onClose} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm">
                Close Details
            </button>
        </div>
      </div>
    </div>
  );
};
