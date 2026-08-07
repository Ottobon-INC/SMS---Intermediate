import React, { useState, useEffect } from 'react';
import { dbRepository } from '@/src/services/db';
import { ExaminationsService } from '@/src/modules/examinations/services/ExaminationsService';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { ResultVersion, Exam, Student, Section, Enrollment, Subject, Programme, Batch } from '@/src/types';
import { GraduationCap, Save, ArrowLeft, MessageSquare, CheckCircle2, X, Send, AlertTriangle, FileText } from 'lucide-react';
import { Modal } from '@/src/modules/core/components/Modal';

export const ClassMarksEntryPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { currentUser, triggerRefresh } = useAuth();
  
  const [exams, setExams] = useState<Exam[]>(() => ExaminationsService.getExams());
  const [allStudents] = useState<Student[]>(() => ExaminationsService.getStudents());
  const [sections] = useState<Section[]>(() => ExaminationsService.getSections());
  const [batches] = useState<Batch[]>(() => ExaminationsService.getBatches());
  const [enrollments] = useState<Enrollment[]>(() => ExaminationsService.getEnrollments());
  const [allSubjects] = useState<Subject[]>(() => ExaminationsService.getSubjects());
  const [programmes] = useState<Programme[]>(() => ExaminationsService.getProgrammes());
  
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || 'exam-1');
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id || 'sec-mpc-a-1');

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const relevantSections = sections.filter(sec => {
    const batch = batches.find(b => b.id === sec.batchId);
    return batch?.programmeId === selectedExam?.programmeId;
  });

  useEffect(() => {
    const currentValid = relevantSections.find(s => s.id === selectedSectionId);
    if (!currentValid && relevantSections.length > 0) {
      setSelectedSectionId(relevantSections[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId]);

  const sectionEnrollments = enrollments.filter(e => e.sectionId === selectedSectionId && e.academicYearId === 'ay-2026-2027');
  const sectionStudentIds = sectionEnrollments.map(e => e.studentId);
  const sectionStudents = allStudents.filter(s => sectionStudentIds.includes(s.id));

  const currentSection = sections.find(s => s.id === selectedSectionId);
  const currentBatch = batches.find(b => b.id === currentSection?.batchId);
  const currentProgramme = programmes.find(p => p.id === currentBatch?.programmeId);
  const sectionSubjects = allSubjects.filter(sub => sub.programmeId === currentProgramme?.id);

  const totalMaxMarks = sectionSubjects.reduce((sum, sub) => sum + sub.maxMarks, 0);

  // Marks state map: studentId -> { subjectId: number }
  const [marksState, setMarksState] = useState<Record<string, Record<string, number>>>({});

  // Initialize marks state from DB
  useEffect(() => {
    const existingMarks = ExaminationsService.getMarks(selectedExamId);
    const newState: Record<string, Record<string, number>> = {};
    
    // Default fallback if no marks exist
    sectionStudents.forEach(st => {
      newState[st.id] = {};
      sectionSubjects.forEach(sub => {
        newState[st.id][sub.id] = 0; 
      });
    });

    existingMarks.forEach(m => {
      if (newState[m.studentId]) {
        newState[m.studentId][m.subjectId] = m.marksObtained;
      }
    });

    setMarksState(newState);
  }, [selectedExamId, selectedSectionId]); // Refetch when exam or section changes

  // Modal for WhatsApp Preview
  const [showWhatsAppPreviewModal, setShowWhatsAppPreviewModal] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<string>('');
  const [previewStudentName, setPreviewStudentName] = useState<string>('');

  // Correction Mode Modal
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionData, setCorrectionData] = useState<{
    studentId: string;
    subjectId: string;
    oldVal: number;
    newVal: number;
  } | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');

  const [previewReportCardStudent, setPreviewReportCardStudent] = useState<Student | null>(null);

  const isStaff = currentUser?.role === 'OFFICE_STAFF' || currentUser?.role === 'TEACHER';
  const isPrincipal = currentUser?.role === 'BRANCH_ADMIN';
  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';

  const handleMarkChange = (studentId: string, subjectId: string, val: number, maxMarks: number) => {
    let finalVal = val;
    if (finalVal > maxMarks) finalVal = maxMarks;
    if (finalVal < 0) finalVal = 0;

    // If published, trigger correction mode instead of direct update
    if (selectedExam?.status === 'PUBLISHED') {
      const oldVal = marksState[studentId]?.[subjectId] || 0;
      if (oldVal !== finalVal) {
        setCorrectionData({ studentId, subjectId, oldVal, newVal: finalVal });
        setCorrectionReason('');
        setCorrectionModalOpen(true);
      }
      return;
    }

    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: finalVal,
      },
    }));
  };

  const handleApplyCorrection = () => {
    if (!correctionData || !correctionReason.trim()) return;

    const { studentId, subjectId, oldVal, newVal } = correctionData;

    // 1. Update Marks State
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: newVal,
      },
    }));

    // 2. Audit Log
    dbRepository.addAuditEvent({
      id: `audit-${Date.now()}`,
      institutionId: currentUser?.institutionId || 'inst-svic-01',
      branchId: currentUser?.branchId || 'branch-hyd-main',
      userId: currentUser?.id || 'user-1',
      action: 'UPDATE',
      resourceType: 'Mark',
      resourceId: `mark-${studentId}-${subjectId}`,
      details: `Corrected mark for ${subjectId} from ${oldVal} to ${newVal}. Reason: ${correctionReason}`,
      createdAt: new Date().toISOString()
    });

    setCorrectionModalOpen(false);
    setCorrectionData(null);
  };

  const handleSubmitMarks = (newStatus: 'SUBMITTED' | 'APPROVED') => {
    // 1. Update Exam Status
    ExaminationsService.updateExam(selectedExamId, {
      status: newStatus,
    });

    triggerRefresh();
    alert(`Marks have been ${newStatus.toLowerCase()} successfully!`);
    if (onBack) onBack();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Class Subject Marks Entry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Input assessment scores per subject for class students, calculate grades, and submit for approval.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Exams
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Assessment</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.type} • Status: {ex.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Section</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {relevantSections.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Admission No</th>
                <th className="p-3">Student Name</th>
                {sectionSubjects.map(sub => (
                  <th key={sub.id} className="p-3">{sub.name} ({sub.maxMarks})</th>
                ))}
                <th className="p-3 text-center">Total / {totalMaxMarks}</th>
                <th className="p-3 text-center">Result</th>
                <th className="p-3 text-center">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectionStudents.map((st) => {
                const marks = marksState[st.id] || {};
                const total = sectionSubjects.reduce((sum, sub) => sum + (marks[sub.id] || 0), 0);
                const pct = totalMaxMarks > 0 ? Math.round((total / totalMaxMarks) * 100) : 0;
                const isPass = pct >= 35; // Example passing criteria

                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{st.admissionNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {st.firstName} {st.lastName}
                    </td>
                    {sectionSubjects.map(sub => (
                      <td key={sub.id} className="p-3">
                        <input
                          type="number"
                          max={sub.maxMarks}
                          min={0}
                          value={marks[sub.id] !== undefined ? marks[sub.id] : ''}
                          onChange={(e) => handleMarkChange(st.id, sub.id, Number(e.target.value), sub.maxMarks)}
                          className="w-16 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs"
                        />
                      </td>
                    ))}
                    <td className="p-3 text-center font-bold text-slate-900">
                      {total} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPass ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setPreviewReportCardStudent(st)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 w-full"
                      >
                        <FileText className="w-3 h-3" /> Preview
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-4 flex flex-wrap justify-between items-center gap-3">
          <div className="text-xs text-slate-500">
            {selectedExam?.status === 'PUBLISHED' ? (
              <span>ℹ️ This exam is <strong>PUBLISHED</strong>. Editing a mark will require a correction reason.</span>
            ) : (
              <span>ℹ️ Ensure all marks are correct before submitting to the Principal.</span>
            )}
          </div>

          <div className="flex gap-2">
            {isStaff && selectedExam?.status === 'DRAFT' && (
              <button
                onClick={() => handleSubmitMarks('SUBMITTED')}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4 text-emerald-300" /> Submit to Principal
              </button>
            )}

            {isPrincipal && selectedExam?.status === 'SUBMITTED' && (
              <button
                onClick={() => handleSubmitMarks('APPROVED')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-300" /> Approve Marks
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CORRECTION MODE MODAL */}
      <Modal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        title="Marks Correction Mode"
        maxWidth="md"
      >
        {correctionData && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <strong>Warning:</strong> These results are already PUBLISHED. 
                Changing a mark will generate a new Result Version and log this action for auditing.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Old Mark</span>
                <span className="font-mono text-slate-900 font-bold">{correctionData.oldVal}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">New Mark</span>
                <span className="font-mono text-emerald-900 font-bold">{correctionData.newVal}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mandatory Reason for Correction *</label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="e.g., Revaluation request, totaling error, etc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none resize-none h-24"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCorrectionModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCorrection}
                disabled={!correctionReason.trim()}
                className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Correction
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* REPORT CARD PREVIEW MODAL */}
      <Modal
        isOpen={!!previewReportCardStudent}
        onClose={() => setPreviewReportCardStudent(null)}
        title="Report Card Preview"
        maxWidth="lg"
      >
        {previewReportCardStudent && (
          <div className="space-y-6">
            <div className="text-center space-y-1 border-b border-slate-200 pb-4">
              <h2 className="font-black text-xl text-slate-900">SRI VIGNAN INTERMEDIATE COLLEGE</h2>
              <p className="text-xs text-slate-500 font-bold uppercase">{selectedExam?.name} - {currentProgramme?.name}</p>
            </div>

            <div className="flex justify-between text-xs text-slate-700">
              <div>
                <p><strong>Student Name:</strong> {previewReportCardStudent.firstName} {previewReportCardStudent.lastName}</p>
                <p><strong>Admission No:</strong> {previewReportCardStudent.admissionNumber}</p>
              </div>
              <div className="text-right">
                <p><strong>Section:</strong> {currentSection?.name}</p>
                <p><strong>Date:</strong> {selectedExam?.examDate}</p>
              </div>
            </div>

            <table className="w-full text-left text-sm text-slate-700 border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="p-2 border-r border-slate-200">Subject</th>
                  <th className="p-2 border-r border-slate-200 text-center">Max Marks</th>
                  <th className="p-2 text-center">Marks Obtained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sectionSubjects.map(sub => {
                  const marks = marksState[previewReportCardStudent.id]?.[sub.id] || 0;
                  return (
                    <tr key={sub.id}>
                      <td className="p-2 border-r border-slate-200">{sub.name}</td>
                      <td className="p-2 border-r border-slate-200 text-center">{sub.maxMarks}</td>
                      <td className="p-2 text-center font-bold">{marks}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                <tr>
                  <td className="p-2 border-r border-slate-200">Total</td>
                  <td className="p-2 border-r border-slate-200 text-center">{totalMaxMarks}</td>
                  <td className="p-2 text-center text-teal-700">
                    {sectionSubjects.reduce((sum, sub) => sum + (marksState[previewReportCardStudent.id]?.[sub.id] || 0), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setPreviewReportCardStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

