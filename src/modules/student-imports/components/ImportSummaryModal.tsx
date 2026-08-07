import React from 'react';
import { ImportSummary } from '../types';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  summary: ImportSummary;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ImportSummaryModal: React.FC<Props> = ({ summary, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg glass-modal rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-8 pb-6 border-b border-white/20">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Import Summary</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Review the final changes before applying them to the institution's database.</p>
        </div>

        <div className="p-8 space-y-6 bg-slate-50/50">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Total Rows</p>
                <p className="text-3xl font-black text-slate-900">{summary.totalRows}</p>
            </div>
            <div className="bg-emerald-50/60 backdrop-blur-sm p-5 rounded-2xl border border-emerald-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 mb-1">Valid Rows</p>
                <p className="text-3xl font-black text-emerald-700">{summary.valid}</p>
            </div>
            <div className="bg-amber-50/60 backdrop-blur-sm p-5 rounded-2xl border border-amber-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600 mb-1">Warnings</p>
                <p className="text-3xl font-black text-amber-700">{summary.warnings}</p>
            </div>
            <div className="bg-rose-50/60 backdrop-blur-sm p-5 rounded-2xl border border-rose-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold text-rose-600 mb-1">Rejected</p>
                <p className="text-3xl font-black text-rose-700">{summary.rejected}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] border border-white shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Entity Creation</h3>
              
              <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold">Students Ready</span>
                  <span className="font-black text-slate-900 text-lg">+{summary.studentsReady}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold">Existing Matched</span>
                  <span className="font-black text-slate-900 text-lg">{summary.existingMatched}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold">Guardians Ready</span>
                  <span className="font-black text-slate-900 text-lg">+{summary.guardiansReady}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-4 mt-2 border-t border-slate-100">
                  <span className="text-slate-900 font-bold">Total Enrolments</span>
                  <span className="font-black text-indigo-600 text-xl">+{summary.enrolmentsReady}</span>
              </div>
          </div>

          {summary.rejected > 0 && (
              <div className="bg-rose-50/80 backdrop-blur-sm p-5 rounded-2xl border border-rose-200/50 flex items-start gap-4 text-rose-800">
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">
                      <strong>{summary.rejected} rejected records</strong> will be skipped. You can download the error report later to fix and re-import them.
                  </p>
              </div>
          )}

        </div>

        <div className="p-6 bg-white/80 border-t border-white flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-8 py-3 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all text-sm premium-shadow flex items-center gap-2 group"
          >
            Confirm Import
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
