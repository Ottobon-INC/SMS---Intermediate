import React, { useState } from 'react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { AttendanceOverviewPage } from './AttendanceOverviewPage';
import { AttendanceGrid } from '../components/AttendanceGrid';
import { AttendanceService } from '../services/AttendanceService';
import { AttendanceContext, AttendanceWorkflowState, StudentAttendanceRecord } from '../types';
import { ModulePermissions } from '../permissions';
import { Save, Check, FileWarning, ArrowLeft, RefreshCw, ArrowRight, Clock, AlertCircle, CalendarCheck, CheckCircle2, ShieldCheck, MessageSquare, Filter } from 'lucide-react';
import { WhatsAppModal } from '@/src/modules/notifications/components/WhatsAppModal';
import { dbRepository } from '@/src/services/db';

export const AttendanceModulePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState<'OVERVIEW' | 'SESSION' | 'REVIEW'>('OVERVIEW');
  const [sessionState, setSessionState] = useState<AttendanceWorkflowState>('DRAFT');
  
  const [context, setContext] = useState<AttendanceContext>({
      branch: 'Visakhapatnam Campus',
      academicYear: '2026-27',
      yearLevel: 'First Year',
      programme: 'MPC + JEE',
      batch: 'JEE Advanced A',
      section: 'A',
      date: new Date().toISOString().split('T')[0]
  });

  const [students, setStudents] = useState<StudentAttendanceRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnedMessage, setReturnedMessage] = useState('');
  
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  const role = currentUser?.role || 'OFFICE_STAFF';
  const canMark = ModulePermissions.canMarkAttendance(role);
  const canSave = ModulePermissions.canSaveDraft(role);
  const canSubmit = ModulePermissions.canSubmitAttendance(role);
  const canReview = ModulePermissions.canReviewAttendance(role);
  const canReturn = ModulePermissions.canReturnAttendance(role);
  const canFinalize = ModulePermissions.canFinalizeAttendance(role);
  const canReopen = ModulePermissions.canReopenAttendance(role);
  const isDean = role === 'INSTITUTION_ADMIN';

  // Computed Summary
  const summary = {
      totalStudents: students.length,
      present: students.filter(s => s.status === 'PRESENT').length,
      absent: students.filter(s => s.status === 'ABSENT').length,
      leave: students.filter(s => s.status === 'LEAVE').length,
      unmarked: students.filter(s => s.status === null).length,
  };

  const loadStudents = async () => {
      setIsProcessing(true);
      const data = await AttendanceService.getEligibleStudents(context);
      setStudents(data);
      setIsProcessing(false);
  };

  const handleStartSession = () => {
      setView('SESSION');
      setSessionState('DRAFT');
      loadStudents();
  };

  const handleStatusChange = (id: string, status: any) => {
      if (!canMark && sessionState !== 'REOPENED') return;
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };
  
  const handleNoteChange = (id: string, note: string) => {
      if (!canMark && sessionState !== 'REOPENED') return;
      setStudents(prev => prev.map(s => s.id === id ? { ...s, note } : s));
  };

  const handleMarkAll = () => setStudents(prev => prev.map(s => ({ ...s, status: 'PRESENT' })));
  const handleClearAll = () => setStudents(prev => prev.map(s => ({ ...s, status: null })));

  const handleSaveDraft = async () => {
      if (!canSave) return;
      setIsProcessing(true);
      await AttendanceService.saveDraft(context, students);
      setLastSaved(new Date().toLocaleTimeString());
      setIsProcessing(false);
  };

  const handleSubmit = async () => {
      if (!canSubmit) return;
      if (summary.unmarked > 0) {
          alert(`${summary.unmarked} students are still unmarked. Resolve all students before submitting.`);
          return;
      }
      setIsProcessing(true);
      await AttendanceService.submitForReview(context, students);
      setSessionState('SUBMITTED');
      setIsProcessing(false);
  };

  const handleReturn = async () => {
      if (!canReturn || !returnReason.trim()) return;
      setIsProcessing(true);
      await AttendanceService.returnForCorrection('temp-id', returnReason);
      setReturnedMessage(returnReason);
      setSessionState('RETURNED');
      setShowReturnModal(false);
      setReturnReason('');
      setIsProcessing(false);
  };

  const handleFinalize = async () => {
      if (!canFinalize) return;
      setIsProcessing(true);
      await AttendanceService.finalize('temp-id');
      setSessionState('FINALIZED');
      setShowFinalizeModal(false);
      setIsProcessing(false);
  };

  const handleReopen = async () => {
      if (!canReopen || !reopenReason.trim()) return;
      setIsProcessing(true);
      await AttendanceService.reopen('temp-id', reopenReason);
      setStudents(prev => prev.map(s => ({...s, previousStatus: s.status, correctionReason: reopenReason})));
      setSessionState('REOPENED');
      setShowReopenModal(false);
      setReopenReason('');
      setIsProcessing(false);
  };

  if (view === 'OVERVIEW') {
      return <AttendanceOverviewPage onStartSession={handleStartSession} />;
  }

  // Determine if grid is read-only based on role and workflow state
  const isGridReadOnly = 
      sessionState === 'SUBMITTED' || 
      sessionState === 'FINALIZED' || 
      (sessionState === 'DRAFT' && !canMark) || 
      (sessionState === 'RETURNED' && !canMark) ||
      (sessionState === 'REOPENED' && !canReview);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="glass-panel rounded-[2rem] p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
            <button onClick={() => setView('OVERVIEW')} className="text-slate-500 font-medium text-sm hover:text-indigo-600 transition-colors flex items-center gap-1 group mb-4">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Overview
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {sessionState === 'SUBMITTED' ? 'Attendance Review' : 'Daily Attendance Session'}
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200">
                <div className={`w-2 h-2 rounded-full ${
                    sessionState === 'DRAFT' ? 'bg-slate-400' :
                    sessionState === 'SUBMITTED' ? 'bg-amber-500' :
                    sessionState === 'RETURNED' ? 'bg-rose-500' :
                    sessionState === 'FINALIZED' ? 'bg-emerald-500' :
                    'bg-indigo-500'
                }`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    {sessionState}
                </span>
            </div>
        </div>
      </div>

      <div className="glass-panel rounded-[24px] p-8 space-y-6">
        <h3 className="font-bold text-slate-900 tracking-tight text-lg border-b border-slate-100 pb-4">Session Context</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Branch</label>
                {isDean ? (
                    <select
                        value={context.branch}
                        onChange={async (e) => {
                            const newContext = { ...context, branch: e.target.value };
                            setContext(newContext);
                            setIsProcessing(true);
                            const data = await AttendanceService.getEligibleStudents(newContext);
                            setStudents(data);
                            setIsProcessing(false);
                        }}
                        className="w-full bg-transparent text-sm font-bold text-slate-800 cursor-pointer focus:outline-none"
                    >
                        {dbRepository.getBranches().map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                    </select>
                ) : (
                    <div className="text-sm font-bold text-slate-800 leading-tight">{context.branch}</div>
                )}
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Academic Year</label>
                <select
                    value={context.academicYear}
                    onChange={async (e) => {
                        const newContext = { ...context, academicYear: e.target.value };
                        setContext(newContext);
                        setIsProcessing(true);
                        const data = await AttendanceService.getEligibleStudents(newContext);
                        setStudents(data);
                        setIsProcessing(false);
                    }}
                    disabled={sessionState !== 'DRAFT' && sessionState !== 'RETURNED'}
                    className="w-full bg-transparent text-sm font-bold text-slate-800 cursor-pointer focus:outline-none disabled:opacity-50"
                >
                    <option value="2026-27">2026-27</option>
                    <option value="2025-26">2025-26</option>
                </select>
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Year Level</label>
                <select
                    value={context.yearLevel}
                    onChange={async (e) => {
                        const newContext = { ...context, yearLevel: e.target.value };
                        setContext(newContext);
                        setIsProcessing(true);
                        const data = await AttendanceService.getEligibleStudents(newContext);
                        setStudents(data);
                        setIsProcessing(false);
                    }}
                    className="w-full bg-transparent text-sm font-bold text-slate-800 cursor-pointer focus:outline-none"
                >
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                </select>
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Programme</label>
                <select
                    value={context.programme}
                    onChange={async (e) => {
                        const newContext = { ...context, programme: e.target.value };
                        setContext(newContext);
                        setIsProcessing(true);
                        const data = await AttendanceService.getEligibleStudents(newContext);
                        setStudents(data);
                        setIsProcessing(false);
                    }}
                    disabled={sessionState !== 'DRAFT' && sessionState !== 'RETURNED'}
                    className="w-full bg-transparent text-sm font-bold text-slate-800 cursor-pointer focus:outline-none disabled:opacity-50"
                >
                    <option value="MPC + JEE">MPC + JEE</option>
                    <option value="BiPC + NEET">BiPC + NEET</option>
                    <option value="CEC">CEC</option>
                </select>
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Batch</label>
                <select
                    value={context.batch}
                    onChange={async (e) => {
                        const newContext = { ...context, batch: e.target.value };
                        setContext(newContext);
                        setIsProcessing(true);
                        const data = await AttendanceService.getEligibleStudents(newContext);
                        setStudents(data);
                        setIsProcessing(false);
                    }}
                    disabled={sessionState !== 'DRAFT' && sessionState !== 'RETURNED'}
                    className="w-full bg-transparent text-sm font-bold text-slate-800 cursor-pointer focus:outline-none disabled:opacity-50"
                >
                    <option value="JEE Advanced A">JEE Advanced A</option>
                    <option value="JEE Mains B">JEE Mains B</option>
                    <option value="NEET A">NEET A</option>
                    <option value="CEC General">CEC General</option>
                </select>
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Section</label>
                <select
                    value={context.section}
                    onChange={async (e) => {
                        const newContext = { ...context, section: e.target.value };
                        setContext(newContext);
                        setIsProcessing(true);
                        const data = await AttendanceService.getEligibleStudents(newContext);
                        setStudents(data);
                        setIsProcessing(false);
                    }}
                    disabled={sessionState !== 'DRAFT' && sessionState !== 'RETURNED'}
                    className="w-full bg-transparent text-sm font-black text-indigo-600 text-center cursor-pointer focus:outline-none disabled:opacity-50"
                >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                </select>
            </div>
            <div className="col-span-2 lg:col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-1">Date</label>
                <input 
                    type="date" 
                    value={context.date}
                    onChange={(e) => setContext({...context, date: e.target.value})}
                    disabled={sessionState !== 'DRAFT' && sessionState !== 'RETURNED'}
                    className="w-full px-4 py-3 bg-white/80 border border-slate-200/60 rounded-xl text-sm font-bold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                />
            </div>
        </div>
      </div>

      {workflowStateMessage()}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sticky top-4 z-40 bg-white/70 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/60 shadow-lg shadow-slate-200/50">
        <div className="text-center p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-black text-slate-900">{summary.totalStudents}</p>
        </div>
        <div className="text-center p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Present</p>
          <p className="text-2xl font-black text-emerald-700">{summary.present}</p>
        </div>
        <div className="text-center p-3 rounded-2xl bg-rose-50/80 border border-rose-100/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-1">Absent</p>
          <p className="text-2xl font-black text-rose-700">{summary.absent}</p>
        </div>
        <div className="text-center p-3 rounded-2xl bg-amber-50/80 border border-amber-100/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Leave</p>
          <p className="text-2xl font-black text-amber-700">{summary.leave}</p>
        </div>
        <div className={`text-center p-3 rounded-2xl border transition-colors ${summary.unmarked > 0 ? 'bg-slate-900 text-white border-slate-900 premium-shadow scale-105' : 'bg-transparent border-transparent'}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Unmarked</p>
          <p className="text-2xl font-black">{summary.unmarked}</p>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-6 sm:p-8 space-y-6">
        
        {!isGridReadOnly && (
            <div className="flex gap-3">
                <button 
                    onClick={handleMarkAll}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold premium-shadow hover:scale-105 active:scale-95 transition-all"
                >
                    Mark All Present
                </button>
                <button 
                    onClick={handleClearAll}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                    Clear All
                </button>
            </div>
        )}

        <AttendanceGrid 
            students={students} 
            onStatusChange={handleStatusChange} 
            onNoteChange={handleNoteChange}
            readOnly={isGridReadOnly}
        />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-6 border-t border-slate-100 gap-4">
            <div>
                {lastSaved && <p className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-full inline-flex items-center gap-2"><Clock className="w-3 h-3" /> Last saved at {lastSaved}</p>}
            </div>
            
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                {(sessionState === 'DRAFT' || sessionState === 'RETURNED') && canSave && (
                    <button 
                        onClick={handleSaveDraft}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold shadow-sm transition-all flex justify-center items-center gap-2 active:scale-95"
                    >
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                )}
                
                {(sessionState === 'DRAFT' || sessionState === 'RETURNED') && canSubmit && (
                    <button 
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold premium-shadow transition-all flex justify-center items-center gap-2 active:scale-95 group"
                    >
                        Submit for Review
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <ArrowRight className="w-3 h-3 text-white" />
                        </div>
                    </button>
                )}

                {sessionState === 'SUBMITTED' && canReturn && (
                    <button 
                        onClick={() => setShowReturnModal(true)}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-6 py-3.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-2xl text-sm font-bold border border-rose-200/50 transition-all flex justify-center items-center gap-2 active:scale-95"
                    >
                        <FileWarning className="w-4 h-4" /> Return for Correction
                    </button>
                )}
                
                {sessionState === 'SUBMITTED' && canFinalize && (
                    <button 
                        onClick={() => setShowFinalizeModal(true)}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold premium-glow-emerald transition-all flex justify-center items-center gap-2 active:scale-95 group"
                    >
                        <Check className="w-5 h-5" /> Finalize Attendance
                    </button>
                )}

                {sessionState === 'FINALIZED' && canReopen && (
                     <button 
                        onClick={() => setShowReopenModal(true)}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-6 py-3.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50 rounded-2xl text-sm font-bold transition-all flex justify-center items-center gap-2 active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" /> Reopen Attendance
                    </button>
                )}
                
                {sessionState === 'REOPENED' && canFinalize && (
                     <button 
                        onClick={() => setShowFinalizeModal(true)}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold premium-glow-emerald transition-all flex justify-center items-center gap-2 active:scale-95 group"
                    >
                        <Check className="w-5 h-5" /> Re-finalize Attendance
                    </button>
                )}
            </div>
        </div>

      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md glass-modal rounded-[2rem] overflow-hidden p-8 space-y-6 animate-in zoom-in-95 duration-300">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Return Session</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Specify what needs to be corrected by the office staff.</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Reason for Return</label>
                    <textarea 
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-white/60 border border-slate-200/60 rounded-[1.5rem] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                        rows={4}
                        placeholder="Explain what needs to be corrected..."
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setShowReturnModal(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-800 text-sm transition-colors">Cancel</button>
                    <button onClick={handleReturn} className="px-6 py-2.5 bg-rose-500 text-white rounded-2xl font-bold text-sm premium-glow-rose hover:-translate-y-0.5 active:translate-y-0 transition-all">Return to Staff</button>
                </div>
            </div>
        </div>
      )}
      
      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md glass-modal rounded-[2rem] overflow-hidden p-8 space-y-6 animate-in zoom-in-95 duration-300">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Reopen Attendance</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">This allows you to modify records that were already finalized.</p>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Reason for Reopening</label>
                    <textarea 
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                        className="w-full bg-white/60 border border-slate-200/60 rounded-[1.5rem] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                        rows={4}
                        placeholder="Explain why you are modifying a finalized record..."
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setShowReopenModal(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-800 text-sm transition-colors">Cancel</button>
                    <button onClick={handleReopen} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm premium-glow-indigo hover:-translate-y-0.5 active:translate-y-0 transition-all">Reopen Session</button>
                </div>
            </div>
        </div>
      )}

      {/* Finalize Modal */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg glass-modal rounded-[2rem] overflow-hidden p-8 space-y-6 animate-in zoom-in-95 duration-300">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Finalize Attendance?</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">After finalization, this attendance becomes official and can be displayed to parents.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total</p>
                        <p className="text-xl font-black text-slate-900">{summary.totalStudents}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Present</p>
                        <p className="text-xl font-black text-emerald-700">{summary.present}</p>
                    </div>
                    <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-1">Absent</p>
                        <p className="text-xl font-black text-rose-700">{summary.absent}</p>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Leave</p>
                        <p className="text-xl font-black text-amber-700">{summary.leave}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setShowFinalizeModal(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-800 text-sm transition-colors">Cancel</button>
                    <button onClick={handleFinalize} className="px-6 py-2.5 bg-emerald-500 text-white rounded-2xl font-bold text-sm premium-glow-emerald hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
                        <Check className="w-4 h-4" /> Finalize Attendance
                    </button>
                </div>
            </div>
        </div>
      )}
      
    </div>
  );

  function workflowStateMessage() {
      if (sessionState === 'RETURNED' && returnedMessage && canSubmit) {
          return (
              <div className="glass-panel border-rose-200/60 bg-rose-50/50 rounded-[24px] p-6 sm:p-8 animate-in fade-in duration-300">
                  <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                          <h3 className="font-bold text-rose-900 text-lg mb-2">Attendance Returned for Correction</h3>
                          <p className="text-rose-800 text-sm leading-relaxed font-medium bg-white/60 p-4 rounded-xl border border-rose-100">
                              <strong className="block mb-1 text-xs uppercase tracking-widest text-rose-500">Principal's Note:</strong>
                              {returnedMessage}
                          </p>
                          <p className="text-sm text-rose-600 mt-4 font-bold">Please correct the entries and submit again.</p>
                      </div>
                  </div>
              </div>
          );
      }
      
      if (sessionState === 'RETURNED' && canReview) {
          return (
              <div className="glass-panel border-rose-200/60 bg-rose-50/50 rounded-[24px] p-6 sm:p-8 animate-in fade-in duration-300">
                  <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                          <Clock className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                          <h3 className="font-bold text-rose-900 text-lg mb-2">Returned for Correction</h3>
                          <p className="text-sm text-rose-600 font-bold">This session was returned to Office Staff. Waiting for them to resubmit.</p>
                      </div>
                  </div>
              </div>
          );
      }

      if (sessionState === 'SUBMITTED' && !canReview && !isDean) {
          return (
              <div className="glass-panel border-amber-200/60 bg-amber-50/30 rounded-[24px] p-12 text-center">
                  <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Awaiting Principal Review</h3>
                  <p className="text-sm text-slate-500 font-medium">This session has been submitted and is currently locked.</p>
              </div>
          );
      }

      if (sessionState === 'SUBMITTED' && isDean) {
          return (
              <div className="glass-panel border-indigo-200/60 bg-indigo-50/30 rounded-[24px] p-12 text-center">
                  <Clock className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Currently Under Review by Principal</h3>
                  <p className="text-sm text-slate-500 font-medium">This session is awaiting branch-level finalization.</p>
              </div>
          );
      }
      
      if (sessionState === 'DRAFT' && !canMark) {
          return (
              <div className="glass-panel border-slate-200/60 bg-slate-50/50 rounded-[24px] p-12 text-center">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Draft Session</h3>
                  <p className="text-sm text-slate-500 font-medium">Office Staff is currently preparing this attendance session.</p>
              </div>
          );
      }

      return null;
  }
};
