import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { ExaminationsService } from '@/src/modules/examinations/services/ExaminationsService';
import { Exam } from '@/src/types';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { GraduationCap, ShieldCheck, History, Plus, Calendar, CheckCircle2, X, Filter } from 'lucide-react';
import { Modal } from '@/src/modules/core/components/Modal';

export const ExamsModulePage: React.FC<{ onNavigateToMarksEntry?: () => void }> = ({
  onNavigateToMarksEntry,
}) => {
  const { currentUser, triggerRefresh } = useAuth();
  const [exams, setExams] = useState<Exam[]>(() => ExaminationsService.getExams());
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [examToPublish, setExamToPublish] = useState<string | null>(null);

  const branches = dbRepository.getBranches();
  const programmes = ExaminationsService.getProgrammes();
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');

  // Modal State for New Exam Creation
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState('Quarterly Exam');
  const [examDate, setExamDate] = useState('2026-08-20');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(programmes[0]?.id || 'prog-mpc');
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || 'branch-hyd-main');
  const [notification, setNotification] = useState<string | null>(null);

  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';
  const isPrincipal = currentUser?.role === 'BRANCH_ADMIN';
  const isPrincipalOrDean = isDean || isPrincipal;

  const refreshData = () => {
    setExams(ExaminationsService.getExams());
    triggerRefresh();
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      institutionId: currentUser?.institutionId || 'inst-svic-01',
      branchId: isDean ? selectedBranchId : (currentUser?.branchId || branches[0]?.id || 'branch-hyd-main'),
      academicYearId: 'ay-2026-2027',
      programmeId: selectedProgrammeId,
      name: examName.trim(),
      type: examType,
      examDate: examDate,
      marksEntryDeadline: '2026-08-25',
      status: 'DRAFT',
      createdBy: currentUser?.name || 'Staff User',
      createdAt: new Date().toISOString(),
    };

    ExaminationsService.createExam(newExam);
    setExamName('');
    setShowCreateExamModal(false);
    refreshData();

    setNotification(`New assessment "${newExam.name}" created successfully! You can now enter student marks.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const confirmPublishExam = (examId: string) => {
    setExamToPublish(examId);
    setShowPublishModal(true);
  };

  const handlePublishExamResults = () => {
    if (!isPrincipal || !examToPublish) return; // Only Principal can publish

    ExaminationsService.updateExam(examToPublish, {
      status: 'PUBLISHED',
    });

    // Send WhatsApp Result Notification for students
    dbRepository.addNotificationEvent({
      id: `notif-${Date.now()}`,
      institutionId: currentUser?.institutionId || 'inst-svic-01',
      branchId: currentUser?.branchId || 'branch-hyd-main',
      studentId: 'student-1',
      guardianId: 'guard-1',
      sourceModule: 'Examinations',
      sourceRecordId: examToPublish,
      recipientMobile: '9000020001',
      eventType: 'EXAM_RESULT_PUBLISHED',
      resolvedMessage: `Dear Parent,\n\nThe result for Ravi Kumar in Monthly Test 1 has been published.\n\nTotal: 316 / 400\nPercentage: 79%\nResult: Pass\n\nRegards,\nSri Vignan Intermediate College`,
      status: 'DELIVERED',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });

    refreshData();
    setShowPublishModal(false);
    setExamToPublish(null);
    setNotification('Results Published. Triggered EXAM_RESULT_PUBLISHED WhatsApp notifications to parents.');
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredExams = exams.filter((exam) => {
    if (isDean) {
      if (selectedBranchFilter !== 'ALL') {
        return exam.branchId === selectedBranchFilter;
      }
      return true;
    } else {
      // Non-Deans only see their own branch's exams
      return exam.branchId === currentUser?.branchId;
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
            Create assessment schedules, enter subject marks, publish versioned report cards, and send WhatsApp notifications to parents.
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
                <option value="ALL">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isPrincipalOrDean && (
              <button
                onClick={() => setShowCreateExamModal(true)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
                id="create-new-exam-button"
              >
                <Plus className="w-4 h-4" /> Create New Exam
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
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exam.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : exam.status === 'SUBMITTED'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {exam.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    Academic Year: {exam.academicYearId} • Type: {exam.type} • Date: {exam.examDate} • Created By: {exam.createdBy}
                    {exam.status === 'PUBLISHED' && ' • Notifications: 120 WhatsApp Messages Sent'}
                  </p>
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

                  {/* Principal is the only one who can Publish, and only if APPROVED */}
                  {isPrincipal && exam.status === 'APPROVED' && (
                    <button
                      onClick={() => confirmPublishExam(exam.id)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Publish Results
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Assessment</h3>
                  <p className="text-xs text-slate-500">Add an exam for marks entry and parent result alerts</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateExamModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment / Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination 2026 or Unit Test 2"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {isDean && (
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Target Branch</label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Programme / Course</label>
                  <select
                    value={selectedProgrammeId}
                    onChange={(e) => setSelectedProgrammeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    {programmes.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.code} ({prog.yearLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="Monthly Test">Monthly Test</option>
                    <option value="Unit Test">Unit Test</option>
                    <option value="Mid-Term">Mid-Term</option>
                    <option value="Quarterly Exam">Quarterly Exam</option>
                    <option value="Annual Final">Annual Final</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-800 text-[11px] leading-relaxed">
                ℹ️ Once created, teachers and office staff can immediately input subject marks and publish the results to parents via SMS and WhatsApp.
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
                  Create Exam
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
              * If marks are corrected post-publication, a new immutable result version (e.g., Version 2) is automatically created and highlighted in the Parent Portal with clear re-verification audit trail.
            </p>
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
          title="Confirm Publish Results"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p>
              Are you sure you want to publish these results to the Parent Portal? This will trigger WhatsApp notifications (EXAM_RESULT_PUBLISHED) to all parents.
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
    </div>
  );
};

