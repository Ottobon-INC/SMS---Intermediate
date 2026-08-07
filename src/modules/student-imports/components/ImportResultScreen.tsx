import React from 'react';
import { ImportResult } from '../types';
import { CheckCircle2, Users, FileText, ArrowRight } from 'lucide-react';

interface Props {
  result: ImportResult;
  onViewList: () => void;
  onViewHistory: () => void;
  onNewImport: () => void;
}

export const ImportResultScreen: React.FC<Props> = ({ result, onViewList, onViewHistory, onNewImport }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-8">
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-emerald-600 p-8 text-center text-white">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-200" />
            <h1 className="text-2xl font-bold">Import Completed Successfully</h1>
            <p className="text-emerald-100 mt-2 font-medium">
                The student batch has been processed and saved to the database.
            </p>
        </div>
        
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-slate-100 pb-8">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Import Details</h3>
                    <div>
                        <p className="text-xs text-slate-500">Batch ID</p>
                        <p className="font-mono font-bold text-slate-900">{result.batchId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Branch & Academic Year</p>
                        <p className="font-semibold text-slate-900">{result.branch} • {result.academicYear}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Approved By</p>
                        <p className="font-semibold text-slate-900">{result.approvedBy}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Completed At</p>
                        <p className="font-semibold text-slate-900">{new Date(result.completedAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Record Creation Summary</h3>
                    
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Students Created</span>
                        <span className="font-bold text-emerald-600">+{result.studentsCreated}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Students Matched</span>
                        <span className="font-bold text-amber-600">{result.studentsMatched}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Guardians Created</span>
                        <span className="font-bold text-slate-900">+{result.guardiansCreated}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Guardian Links Created</span>
                        <span className="font-bold text-slate-900">+{result.guardianLinksCreated}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Enrolments Created</span>
                        <span className="font-bold text-slate-900">+{result.enrolmentsCreated}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-slate-200">
                        <span className="text-slate-600 font-medium">Rows Skipped / Rejected</span>
                        <span className="font-bold text-rose-600">{result.rowsRejected}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                    onClick={onViewList}
                    className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold transition-colors"
                >
                    <Users className="w-5 h-5" /> View Student List
                </button>
                <button 
                    onClick={onViewHistory}
                    className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                    <FileText className="w-5 h-5" /> View Import History
                </button>
            </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <button 
                onClick={onNewImport}
                className="text-slate-600 font-semibold text-sm hover:text-slate-900 transition-colors flex justify-center items-center gap-2 mx-auto"
            >
                Start New Import <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};
