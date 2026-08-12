import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { ExaminationsService } from '@/src/modules/examinations/services/ExaminationsService';
import { Exam, ExamSubject, Subject } from '@/src/types';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { GraduationCap, ShieldCheck, History, Plus, Calendar, CheckCircle2, X, Filter, AlertTriangle, FileWarning } from 'lucide-react';
import { Modal } from '@/src/modules/core/components/Modal';

export const ExamsModulePage: React.FC<{ onNavigateToMarksEntry?: () => void }> = ({
  onNavigateToMarksEntry,
}) => {
  const { currentUser, triggerRefresh } = useAuth();
  const [exams, setExams] = useState<Exam[]>(() => ExaminationsService.getExams());
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExemptBranchModal, setShowExemptBranchModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [examToPublish, setExamToPublish] = useState<string | null>(null);
  const [examToReturn, setExamToReturn] = useState<string | null>(null);
  const [examToExempt, setExamToExempt] = useState<string | null>(null);
  const [exemptBranchId, setExemptBranchId] = useState<string>('branch-hyd-main');
  const [exemptReason, setExemptReason] = useState('');

  const branches = dbRepository.getBranches();
  const programmes = ExaminationsService.getProgrammes();
  const allSubjects = ExaminationsService.getSubjects();
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');

  // Modal State for New Exam Creation
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState('Quarterly Exam');
  const [examDate, setExamDate] = useState('2026-08-20');
  const [examScope, setExamScope] = useState<'ALL_BRANCHES' | 'SELECTED_BRANCHES' | 'SINGLE_BRANCH'>('SINGLE_BRANCH');
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || 'branch-hyd-main');
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([branches[0]?.id || 'branch-hyd-main']);
  const [selectedProgrammeIds, setSelectedProgrammeIds] = useState<string[]>([programmes[0]?.id || 'prog-mpc']);
  const [notification, setNotification] = useState<string | null>(null);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  // Subject mark overrides and opt-out list for the exam being created
  const [subjectConfigs, setSubjectConfigs] = useState<Record<string, { maxMarks: number; passMarks: number }>>({});
  const [optedOutSubjectIds, setOptedOutSubjectIds] = useState<string[]>([]);

  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';
  const isPrincipal = currentUser?.role === 'BRANCH_ADMIN';
  const isPrincipalOrDean = isDean || isPrincipal;

  const refreshData = () => {
    setExams(ExaminationsService.getExams());
    triggerRefresh();
  };

  // Deduplicated master subjects across all selected streams
  const availableProgrammeSubjects = ExaminationsService.getSubjectsForProgrammes(selectedProgrammeIds);

  const handleProgrammeToggle = (progId: string) => {
    let nextIds: string[];
    if (selectedProgrammeIds.includes(progId)) {
      if (selectedProgrammeIds.length === 1) return; // Must keep at least one
      nextIds = selectedProgrammeIds.filter(id => id !== progId);
    } else {
      nextIds = [...selectedProgrammeIds, progId];
    }
    setSelectedProgrammeIds(nextIds);
    const subList = ExaminationsService.getSubjectsForProgrammes(nextIds);
    const initialConfigs: Record<string, { maxMarks: number; passMarks: number }> = {};
    subList.forEach(s => {
      initialConfigs[s.id] = subjectConfigs[s.id] || { maxMarks: s.maxMarks || 100, passMarks: s.passMarks || 35 };
    });
    setSubjectConfigs(initialConfigs);
  };

  const handleToggleOptOutSubject = (subId: string) => {
    if (optedOutSubjectIds.includes(subId)) {
      setOptedOutSubjectIds(optedOutSubjectIds.filter(id => id !== subId));
    } else {
      setOptedOutSubjectIds([...optedOutSubjectIds, subId]);
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    setOverlapError(null);
    if (!examName.trim()) return;

    const targetBranchIds = examScope === 'ALL_BRANCHES'
      ? branches.map(b => b.id)
      : examScope === 'SELECTED_BRANCHES'
      ? selectedBranchIds
      : [selectedBranchId];

    // Check Overlap Lock (Date Collision Check)
    const overlapResult = ExaminationsService.checkExamDateOverlap(
      examDate,
      targetBranchIds,
      selectedProgrammeIds[0] || 'prog-mpc'
    );

    if (overlapResult.hasOverlap) {
      setOverlapError(
        `Overlap Lock Triggered: Exam "${overlapResult.conflictingExam?.name}" is already scheduled on ${examDate} for this course stream. Please choose a different date.`
      );
      return;
    }

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      institutionId: currentUser?.institutionId || 'inst-svic-01',
      scope: examScope,
      branchId: isDean ? (targetBranchIds[0] || 'branch-hyd-main') : (currentUser?.branchId || branches[0]?.id || 'branch-hyd-main'),
      branchIds: targetBranchIds,
      academicYearId: 'ay-2026-2027',
      programmeId: selectedProgrammeIds[0] || 'prog-mpc',
      programmeIds: selectedProgrammeIds,
      name: examName.trim(),
      type: examType,
      examDate: examDate,
      marksEntryDeadline: '2026-08-25',
      status: 'DRAFT',
      createdBy: currentUser?.fullName || 'Staff User',
      createdAt: new Date().toISOString(),
    };

    const activeProgrammeSubjects = availableProgrammeSubjects.filter(s => !optedOutSubjectIds.includes(s.id));
    if (activeProgrammeSubjects.length === 0) {
      setOverlapError('Please include at least one subject for this assessment.');
      return;
    }

    // Prepare ExamSubject snapshots
    const examSubjects: ExamSubject[] = activeProgrammeSubjects.map(sub => {
      const cfg = subjectConfigs[sub.id] || { maxMarks: sub.maxMarks, passMarks: sub.passMarks };
      return {
        id: `exsub-${Date.now()}-${sub.id}`,
        examId: newExam.id,
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        maximumMarks: Number(cfg.maxMarks) || 100,
        passMarks: Number(cfg.passMarks) || 35,
      };
    });

    ExaminationsService.createExam(newExam, examSubjects);
    setExamName('');
    setShowCreateExamModal(false);
    refreshData();

    setNotification(`New assessment "${newExam.name}" created with custom max marks & scope! Staff can now enter marks.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const confirmPublishExam = (examId: string) => {
    setExamToPublish(examId);
    setShowPublishModal(true);
  };

  const handlePublishExamResults = () => {
    if (!isPrincipalOrDean || !examToPublish) return;

    ExaminationsService.updateExam(examToPublish, {
      status: 'PUBLISHED',
    });

    refreshData();
    setShowPublishModal(false);
    setExamToPublish(null);
    setNotification('Results Published successfully! Parent portal version updated.');
    setTimeout(() => setNotification(null), 5000);
  };

  const handleReturnExam = () => {
    if (!isPrincipalOrDean || !examToReturn || !returnReason.trim()) return;

    ExaminationsService.updateExam(examToReturn, {
      status: 'RETURNED_FOR_CORRECTION',
      returnReason: returnReason.trim(),
    });

    refreshData();
    setShowReturnModal(false);
    setExamToReturn(null);
    setReturnReason('');
    setNotification('Exam returned to staff for correction with feedback notes.');
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExemptBranch = () => {
    if (!examToExempt || !exemptReason.trim()) return;

    const targetBranch = branches.find(b => b.id === exemptBranchId);
    ExaminationsService.exemptBranchFromExam(examToExempt, exemptBranchId, exemptReason.trim());

    refreshData();
    setShowExemptBranchModal(false);
    setExamToExempt(null);
    setExemptReason('');
    setNotification(`Campus "${targetBranch?.name}" exempted from assessment successfully!`);
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredExams = exams.filter((exam) => {
    if (isDean) {
      if (selectedBranchFilter !== 'ALL') {
        return exam.branchIds?.includes(selectedBranchFilter) || exam.branchId === selectedBranchFilter;
      }
      return true;
    } else {
      // Non-Deans only see exams targeting their branch or ALL_BRANCHES
      const myBranch = currentUser?.branchId || 'branch-hyd-main';
      return exam.scope === 'ALL_BRANCHES' || exam.branchIds?.includes(myBranch) || exam.branchId === myBranch;
    }
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Examinations & Result Publishing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure audience scopes, custom subject max marks, enter class mark matrices, and publish report cards.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          {/* Branch Filter for Dean */}
          {isDean && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">All Campus Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isPrincipalOrDean && (
              <button
                onClick={() => {
                  handleProgrammeToggle(selectedProgrammeIds[0] || 'prog-mpc');
                  setShowCreateExamModal(true);
                }}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
                id="create-new-exam-button"
              >
                <Plus className="w-4 h-4" /> Create New Assessment
              </button>
            )}

            {onNavigateToMarksEntry && (
              <button
                onClick={onNavigateToMarksEntry}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
                id="enter-class-marks-button"
              >
                <GraduationCap className="w-4 h-4 text-teal-400" /> Enter Class Marks
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Examinations List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-xs flex justify-between items-center">
          <span>Academic Term Assessments (2026–2027)</span>
          <span className="text-slate-400 font-normal">Total: {filteredExams.length} Exams</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredExams.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No exams found for the selected criteria.
            </div>
          ) : (
            filteredExams.map((exam) => (
              <div key={exam.id} className="p-5 hover:bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{exam.name}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        exam.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : exam.status === 'SUBMITTED'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : exam.status === 'RETURNED_FOR_CORRECTION'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {exam.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold border border-slate-200">
                      Scope: {exam.scope || 'SINGLE_BRANCH'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    Academic Year: {exam.academicYearId} • Type: {exam.type} • Date: {exam.examDate} • Created By: {exam.createdBy}
                  </p>
                  {exam.excludedBranchIds && exam.excludedBranchIds.length > 0 && (
                    <div className="mt-1.5 p-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-[11px] font-semibold flex items-center gap-1.5">
                      <span>🚫 <strong>Campus Exemptions:</strong> {exam.excludedBranchIds.map(id => {
                        const bName = branches.find(b => b.id === id)?.name || id;
                        const r = exam.exemptionReasons?.[id];
                        return `${bName}${r ? ` (${r})` : ''}`;
                      }).join(', ')}</span>
                    </div>
                  )}
                  {exam.status === 'RETURNED_FOR_CORRECTION' && exam.returnReason && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-medium flex items-center gap-2">
                      <FileWarning className="w-4 h-4 text-rose-600 shrink-0" />
                      <span><strong>Principal's Return Note:</strong> {exam.returnReason}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onNavigateToMarksEntry && (
                    <button
                      onClick={onNavigateToMarksEntry}
                      className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
                    >
                      <GraduationCap className="w-4 h-4 text-teal-600" /> Enter Marks
                    </button>
                  )}

                  {isPrincipalOrDean && (exam.scope === 'ALL_BRANCHES' || exam.scope === 'SELECTED_BRANCHES') && (
                    <button
                      onClick={() => {
                        setExamToExempt(exam.id);
                        setShowExemptBranchModal(true);
                      }}
                      className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold text-xs flex items-center gap-1"
                    >
                      <AlertTriangle className="w-4 h-4 text-purple-600" /> Exempt Campus
                    </button>
                  )}

                  {isPrincipalOrDean && exam.status === 'SUBMITTED' && (
                    <button
                      onClick={() => {
                        setExamToReturn(exam.id);
                        setShowReturnModal(true);
                      }}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1"
                    >
                      <FileWarning className="w-4 h-4 text-rose-600" /> Return for Correction
                    </button>
                  )}

                  {isPrincipalOrDean && (exam.status === 'SUBMITTED' || exam.status === 'DRAFT') && (
                    <button
                      onClick={() => confirmPublishExam(exam.id)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Approve & Publish Results
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowHistoryModal(true);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1"
                  >
                    <History className="w-4 h-4" /> Version History
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE NEW EXAM MODAL */}
      {showCreateExamModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Assessment</h3>
                  <p className="text-xs text-slate-500">Configure scope, schedule, and custom max/pass marks</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateExamModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {overlapError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{overlapError}</span>
              </div>
            )}

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment / Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 1 or Mid-Term Exam 2026"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* Audience Scope */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Audience Scope & Campuses</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setExamScope('SINGLE_BRANCH')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
                      examScope === 'SINGLE_BRANCH'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Single Campus
                  </button>
                  {isDean && (
                    <button
                      type="button"
                      onClick={() => setExamScope('ALL_BRANCHES')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
                        examScope === 'ALL_BRANCHES'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      All Campuses (Dean)
                    </button>
                  )}
                  {isDean && (
                    <button
                      type="button"
                      onClick={() => setExamScope('SELECTED_BRANCHES')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
                        examScope === 'SELECTED_BRANCHES'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Selected Campuses
                    </button>
                  )}
                </div>

                {examScope === 'SINGLE_BRANCH' && isDean && (
                  <div className="pt-2">
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {examScope === 'SELECTED_BRANCHES' && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {branches.map(b => {
                      const isSelected = selectedBranchIds.includes(b.id);
                      return (
                        <label key={b.id} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBranchIds([...selectedBranchIds, b.id]);
                              } else {
                                setSelectedBranchIds(selectedBranchIds.filter(id => id !== b.id));
                              }
                            }}
                          />
                          <span className="font-semibold text-slate-800">{b.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Course Streams Multi-Select */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Target Course Streams (Multi-Stream Assessment)</label>
                <p className="text-[11px] text-slate-500">Select streams taking this assessment. Shared subjects will aggregate automatically.</p>
                <div className="flex flex-wrap gap-2">
                  {programmes.map((prog) => {
                    const isSelected = selectedProgrammeIds.includes(prog.id);
                    const progBatches = ExaminationsService.getBatches().filter(b => b.programmeId === prog.id);
                    const progBatchIds = progBatches.map(b => b.id);
                    const progSections = ExaminationsService.getSections().filter(s => progBatchIds.includes(s.batchId));
                    const secCount = progSections.length;

                    return (
                      <button
                        key={prog.id}
                        type="button"
                        onClick={() => handleProgrammeToggle(prog.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{prog.code}</span>
                        <span className="text-[10px] opacity-80 font-normal">
                          ({prog.yearLevel} • {secCount > 0 ? `${secCount} Section${secCount === 1 ? '' : 's'}` : 'No sections'})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Monthly Test">Monthly Test</option>
                    <option value="Mid-Term">Mid-Term</option>
                    <option value="Quarterly Exam">Quarterly Exam</option>
                    <option value="Grand Test">Grand Test</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Date (Lock)</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => {
                      setExamDate(e.target.value);
                      setOverlapError(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Subject Max / Pass Marks Config List with Opt-Out Support */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Exam Subject Marks Override & Opt-Out</label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {availableProgrammeSubjects.length - optedOutSubjectIds.length} of {availableProgrammeSubjects.length} subjects included
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  {availableProgrammeSubjects.map(sub => {
                    const isOptedOut = optedOutSubjectIds.includes(sub.id);
                    const cfg = subjectConfigs[sub.id] || { maxMarks: sub.maxMarks, passMarks: sub.passMarks };
                    return (
                      <div
                        key={sub.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all gap-3 ${
                          isOptedOut
                            ? 'bg-slate-100/70 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleOptOutSubject(sub.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              isOptedOut
                                ? 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            }`}
                          >
                            {isOptedOut ? '🚫 Opted Out' : '✓ Included'}
                          </button>
                          <div>
                            <span className={`font-bold block ${isOptedOut ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Code: {sub.code}</span>
                          </div>
                        </div>

                        {!isOptedOut && (
                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold">Max</span>
                              <input
                                type="number"
                                min={1}
                                value={cfg.maxMarks}
                                onChange={(e) => {
                                  const maxM = Number(e.target.value);
                                  setSubjectConfigs({
                                    ...subjectConfigs,
                                    [sub.id]: { ...cfg, maxMarks: maxM }
                                  });
                                }}
                                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center font-bold text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold">Pass</span>
                              <input
                                type="number"
                                min={0}
                                value={cfg.passMarks}
                                onChange={(e) => {
                                  const passM = Number(e.target.value);
                                  setSubjectConfigs({
                                    ...subjectConfigs,
                                    [sub.id]: { ...cfg, passMarks: passM }
                                  });
                                }}
                                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center font-bold text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-sm"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Version History Modal */}
      {selectedExam && (
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title={`Version History — ${selectedExam.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Published Version:</span>
                <strong className="text-emerald-700">Version 1 (Original Publication)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Published Date:</span>
                <strong className="text-slate-900">06 Aug 2026</strong>
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">
              * If marks are corrected post-publication, a new immutable result version (Version 2) is created with clear re-verification audit trail.
            </p>
          </div>
        </Modal>
      )}

      {/* Return for Correction Modal */}
      {showReturnModal && (
        <Modal
          isOpen={showReturnModal}
          onClose={() => {
            setShowReturnModal(false);
            setExamToReturn(null);
          }}
          title="Return Exam for Correction"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p>
              Provide clear feedback notes for office staff explaining what needs to be corrected in the class marks entry:
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Physics marks for Section A were entered out of 100 instead of 25. Please re-check."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowReturnModal(false);
                  setExamToReturn(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnExam}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-sm"
              >
                Return to Staff
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <Modal
          isOpen={showPublishModal}
          onClose={() => {
            setShowPublishModal(false);
            setExamToPublish(null);
          }}
          title="Confirm Approve & Publish Results"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p>
              Are you sure you want to approve and publish these results to the Parent Portal?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPublishModal(false);
                  setExamToPublish(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishExamResults}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm"
              >
                Yes, Publish Results
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Exempt Campus Modal */}
      {showExemptBranchModal && (
        <Modal
          isOpen={showExemptBranchModal}
          onClose={() => {
            setShowExemptBranchModal(false);
            setExamToExempt(null);
          }}
          title="Exempt Campus from Assessment"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p>
              Exempt a specific campus branch from this assessment (e.g., local emergency, cyclone holiday, or branch-specific syllabus adjustment).
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Campus Branch to Exempt *</label>
              <select
                value={exemptBranchId}
                onChange={(e) => setExemptBranchId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mandatory Exemption Reason *</label>
              <input
                type="text"
                required
                placeholder="e.g. Coastal cyclone alert local holiday or Local practical lab lag"
                value={exemptReason}
                onChange={(e) => setExemptReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
              ℹ️ <strong>Campus Exemption Effect:</strong> The exempted branch will not see this assessment in their active mark entry queue. The assessment remains 100% active for all other campuses.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExemptBranchModal(false);
                  setExamToExempt(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExemptBranch}
                disabled={!exemptReason.trim()}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-sm disabled:opacity-50"
              >
                Exempt Campus
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
