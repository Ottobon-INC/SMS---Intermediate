import React, { useState } from 'react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { Upload, FileSpreadsheet, Download, Sparkles, ChevronRight, Clock, FileWarning, AlertCircle } from 'lucide-react';
import { StudentExcelRow, ImportSummary, ImportResult, WorkflowState, StudentImportContext } from '../types';
import { StudentImportsService } from '../services/StudentImportsService';
import { ValidationPreviewTable } from '../components/ValidationPreviewTable';
import { ImportSummaryModal } from '../components/ImportSummaryModal';
import { ImportResultScreen } from '../components/ImportResultScreen';
import { ImportHistoryTable } from '../components/ImportHistoryTable';
import { StudentListPage } from './StudentListPage';
import { ModulePermissions } from '../permissions';
import * as XLSX from 'xlsx';

export const StudentImportPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [workflowState, setWorkflowState] = useState<WorkflowState>('SELECT_CONTEXT');
  const [viewState, setViewState] = useState<'MAIN' | 'LIST' | 'HISTORY'>('MAIN');
  
  const [context, setContext] = useState<StudentImportContext>({ branch: 'Visakhapatnam Campus', academicYear: '2026-27' });
  const [stagingRows, setStagingRows] = useState<StudentExcelRow[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Return Flow State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnedMessage, setReturnedMessage] = useState('');

  const role = currentUser?.role || 'OFFICE_STAFF';
  const canCreate = ModulePermissions.canCreateImport(role);
  const canReview = ModulePermissions.canReviewImport(role);
  const isDean = role === 'INSTITUTION_ADMIN';

  const handleDownloadTemplate = () => {
      const columns = [
          "Admission Number",
          "Student Full Name",
          "Date of Birth",
          "Gender",
          "Student Mobile",
          "Guardian Name",
          "Guardian Relationship",
          "Guardian Mobile",
          "Year Level",
          "Programme / Stream",
          "Batch",
          "Section",
          "Roll Number",
          "Joining Date"
      ];
      
      const ws = XLSX.utils.aoa_to_sheet([columns]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "Student_Import_Template_V1.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canCreate) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setCurrentFileName(file.name);
    setIsProcessing(true);
    
    try {
        const rows = await StudentImportsService.validateFile(file);
        setStagingRows(rows);
        setWorkflowState('VALIDATED');
        setReturnedMessage(''); // clear any return message on new upload
    } catch (err) {
        alert("Error parsing file.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSubmitForApproval = async () => {
      if (!canCreate || stagingRows.length === 0) return;
      setIsProcessing(true);
      const summ = await StudentImportsService.submitImport('batch-temp', context, stagingRows);
      setSummary(summ);
      setWorkflowState('SUBMITTED');
      setIsProcessing(false);
  };

  const handleReturnForCorrection = async () => {
      if (!canReview || !returnReason.trim()) return;
      setIsProcessing(true);
      await StudentImportsService.returnImport('batch-temp', returnReason);
      setReturnedMessage(returnReason);
      setWorkflowState('RETURNED');
      setShowReturnModal(false);
      setReturnReason('');
      setIsProcessing(false);
  };

  const handleApproveImport = async () => {
      if (!canReview || !summary) return;
      setIsProcessing(true);
      const res = await StudentImportsService.approveImport('BATCH-' + Date.now(), context, summary);
      setResult(res);
      setShowSummaryModal(false);
      setWorkflowState('COMPLETED');
      setIsProcessing(false);
  };
  
  const resetFlow = () => {
      setStagingRows([]);
      setCurrentFileName(null);
      setSummary(null);
      setResult(null);
      setReturnedMessage('');
      setWorkflowState('SELECT_CONTEXT');
      setViewState('MAIN');
  };

  if (viewState === 'LIST') return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
          <button onClick={() => setViewState('MAIN')} className="text-slate-500 font-medium text-sm hover:text-indigo-600 transition-colors flex items-center gap-1 group">
              <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Import Center
          </button>
          <StudentListPage />
      </div>
  );
  if (viewState === 'HISTORY') return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
          <button onClick={() => setViewState('MAIN')} className="text-slate-500 font-medium text-sm hover:text-indigo-600 transition-colors flex items-center gap-1 group">
              <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Import Center
          </button>
          <div className="glass-panel rounded-[2rem] p-8">
            <ImportHistoryTable />
          </div>
      </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Header */}
      <div className="glass-panel rounded-[2rem] p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white premium-glow-indigo">
                <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Student Import Center
            </h1>
          </div>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
            Upload and validate student admission records. The system will automatically detect duplicates and enforce data integrity before final approval.
          </p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
            <button 
                onClick={() => setViewState('HISTORY')}
                className="flex-1 sm:flex-none px-5 py-3 bg-white/50 hover:bg-white text-slate-700 rounded-2xl text-sm font-semibold transition-all border border-slate-200/50 hover:border-slate-300 hover:shadow-lg flex items-center justify-center gap-2"
            >
                <Clock className="w-4 h-4 text-slate-400" /> History
            </button>
            <button
                onClick={handleDownloadTemplate}
                className="flex-1 sm:flex-none px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-sm font-bold transition-all border border-indigo-100 flex items-center justify-center gap-2"
            >
                <Download className="w-4 h-4" /> Get Template
            </button>
        </div>
      </div>

      {workflowState === 'COMPLETED' && result ? (
          <ImportResultScreen 
              result={result}
              onViewList={() => setViewState('LIST')}
              onViewHistory={() => setViewState('HISTORY')}
              onNewImport={canCreate ? resetFlow : undefined}
          />
      ) : (
          <div className="space-y-6">
            
            {/* Step 1: Context */}
            <div className="glass-panel rounded-[24px] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
                    <h3 className="font-bold text-slate-900 tracking-tight">Import Context</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Branch</label>
                        <select
                            value={context.branch}
                            onChange={(e) => setContext({...context, branch: e.target.value})}
                            disabled={role === 'OFFICE_STAFF' || role === 'BRANCH_ADMIN' || (workflowState !== 'SELECT_CONTEXT' && workflowState !== 'RETURNED')}
                            className="w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl text-sm font-semibold text-slate-800 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 group-hover:bg-white"
                        >
                            <option value="Visakhapatnam Campus">Visakhapatnam Campus</option>
                            <option value="Hyderabad Campus">Hyderabad Campus</option>
                        </select>
                    </div>
                    <div className="relative group">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Academic Year</label>
                        <select
                            value={context.academicYear}
                            onChange={(e) => setContext({...context, academicYear: e.target.value})}
                            disabled={workflowState !== 'SELECT_CONTEXT' && workflowState !== 'RETURNED'}
                            className="w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl text-sm font-semibold text-slate-800 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 group-hover:bg-white"
                        >
                            <option value="2026-27">2026-27</option>
                            <option value="2025-26">2025-26</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {workflowState === 'RETURNED' && returnedMessage && canCreate && (
                <div className="glass-panel border-rose-200/60 bg-rose-50/50 rounded-[24px] p-6 sm:p-8 animate-in fade-in duration-300">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-rose-900 text-lg mb-2">Import Returned for Correction</h3>
                            <p className="text-rose-800 text-sm leading-relaxed font-medium bg-white/60 p-4 rounded-xl border border-rose-100">
                                <strong className="block mb-1 text-xs uppercase tracking-widest text-rose-500">Principal's Note:</strong>
                                {returnedMessage}
                            </p>
                            <p className="text-sm text-rose-600 mt-4 font-bold">Please correct the data in your Excel file and upload it again below.</p>
                        </div>
                    </div>
                </div>
            )}

            {workflowState === 'RETURNED' && canReview && (
                <div className="glass-panel border-rose-200/60 bg-rose-50/50 rounded-[24px] p-6 sm:p-8 animate-in fade-in duration-300">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-rose-900 text-lg mb-2">Returned for Correction</h3>
                            <p className="text-sm text-rose-600 font-bold">This batch was returned to Office Staff. Waiting for them to resubmit.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Upload (Only for Staff) */}
            {canCreate && (
                <div className="glass-panel rounded-[24px] p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
                            <h3 className="font-bold text-slate-900 tracking-tight">Upload Data File</h3>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold tracking-widest uppercase mb-1">Version</span>
                            <span className="text-xs font-mono font-semibold text-slate-600">STUDENT_IMPORT_V1</span>
                        </div>
                    </div>

                    <div className={`relative overflow-hidden border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 ease-out group ${
                        workflowState === 'SELECT_CONTEXT' || workflowState === 'UPLOAD' || workflowState === 'RETURNED'
                        ? 'border-indigo-300/50 hover:border-indigo-400 bg-gradient-to-b from-indigo-50/30 to-white/50 hover:bg-white cursor-pointer hover:shadow-xl' 
                        : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            disabled={workflowState !== 'SELECT_CONTEXT' && workflowState !== 'UPLOAD' && workflowState !== 'RETURNED'}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        
                        <div className={`absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full scale-150 transition-transform duration-700 group-hover:scale-110 ${
                            workflowState === 'SELECT_CONTEXT' || workflowState === 'UPLOAD' || workflowState === 'RETURNED' ? 'opacity-100' : 'opacity-0'
                        }`} />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2 ${
                                workflowState === 'SELECT_CONTEXT' || workflowState === 'UPLOAD' || workflowState === 'RETURNED' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'
                            }`}>
                                <Upload className="w-8 h-8" />
                            </div>
                            <span className="text-lg font-bold text-slate-900 tracking-tight mb-2">
                                {currentFileName ? `Uploaded: ${currentFileName}` : 'Drag & Drop Excel File Here'}
                            </span>
                            <p className="text-sm text-slate-500 font-medium">
                                {currentFileName ? 'Click to upload a different file' : 'or click to browse from your computer'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!canCreate && (workflowState === 'SELECT_CONTEXT' || workflowState === 'UPLOAD') && (
                <div className="glass-panel border-indigo-200/60 bg-indigo-50/30 rounded-[24px] p-12 text-center">
                    <Clock className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Waiting for Submission</h3>
                    <p className="text-sm text-slate-500 font-medium">Office Staff has not submitted a new import batch for review yet.</p>
                </div>
            )}

            {/* Step 3: Validation */}
            {(workflowState === 'VALIDATED' || workflowState === 'SUBMITTED' || workflowState === 'APPROVED' || (workflowState === 'RETURNED' && stagingRows.length > 0)) && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ValidationPreviewTable rows={stagingRows} academicYear={context.academicYear} />
                    
                    <div className="flex justify-end pt-6 pb-4 gap-4">
                        {workflowState === 'VALIDATED' && canCreate && (
                            <button
                                onClick={handleSubmitForApproval}
                                disabled={isProcessing || stagingRows.filter(r => r.validationStatus === 'VALID').length === 0}
                                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl text-sm font-bold premium-shadow transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 group"
                            >
                                {isProcessing ? 'Processing...' : (
                                    <>
                                        Submit for Approval 
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                            <ArrowRight className="w-3 h-3 text-white" />
                                        </div>
                                    </>
                                )}
                            </button>
                        )}
                        {workflowState === 'SUBMITTED' && canReview && (
                            <>
                                <button
                                    onClick={() => setShowReturnModal(true)}
                                    className="px-6 py-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-sm font-bold transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-2 border border-rose-200/50"
                                >
                                    <FileWarning className="w-5 h-5" /> Return for Correction
                                </button>
                                <button
                                    onClick={() => setShowSummaryModal(true)}
                                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold premium-glow-emerald transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
                                >
                                    <Sparkles className="w-5 h-5" /> Review & Approve Import
                                </button>
                            </>
                        )}
                        {workflowState === 'SUBMITTED' && canCreate && (
                            <div className="px-6 py-4 bg-amber-50/80 backdrop-blur-sm text-amber-800 rounded-2xl text-sm font-bold border border-amber-200 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-amber-500" /> Awaiting Principal Approval
                            </div>
                        )}
                        {workflowState === 'SUBMITTED' && isDean && (
                            <div className="px-6 py-4 bg-indigo-50/80 backdrop-blur-sm text-indigo-800 rounded-2xl text-sm font-bold border border-indigo-200 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-indigo-500" /> Currently Under Review by Principal
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Principal Return Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md glass-modal rounded-[2rem] overflow-hidden p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Return Student Import</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">Specify what needs to be corrected by the office staff before this batch can be approved.</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Reason for Return</label>
                            <textarea 
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="w-full bg-white/60 border border-slate-200/60 rounded-[1.5rem] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                                rows={4}
                                placeholder="e.g. Please correct the invalid guardian mobile numbers and re-upload the file."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowReturnModal(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-800 text-sm transition-colors">Cancel</button>
                            <button onClick={handleReturnForCorrection} className="px-6 py-2.5 bg-rose-500 text-white rounded-2xl font-bold text-sm premium-glow-rose hover:-translate-y-0.5 active:translate-y-0 transition-all">Return to Office Staff</button>
                        </div>
                    </div>
                </div>
            )}

            {showSummaryModal && summary && (
                <ImportSummaryModal 
                    summary={summary}
                    onCancel={() => setShowSummaryModal(false)}
                    onConfirm={handleApproveImport}
                />
            )}
          </div>
      )}
    </div>
  );
};

const ArrowRight = ({className}: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
