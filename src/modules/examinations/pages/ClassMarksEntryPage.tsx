import React, { useState, useEffect } from 'react';
import { dbRepository } from '@/src/services/db';
import { ExaminationsService, calculateStudentGrade } from '@/src/modules/examinations/services/ExaminationsService';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { Exam, Student, Section, Enrollment, ExamSubject, StudentExamRecord, Batch, Programme } from '@/src/types';
import { GraduationCap, Save, ArrowLeft, CheckCircle2, X, AlertTriangle, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/src/modules/core/components/Modal';

export const ClassMarksEntryPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { currentUser, triggerRefresh } = useAuth();
  
  const [exams, setExams] = useState<Exam[]>(() => ExaminationsService.getExams());
  const [allStudents] = useState<Student[]>(() => ExaminationsService.getStudents());
  const [sections] = useState<Section[]>(() => ExaminationsService.getSections());
  const [batches] = useState<Batch[]>(() => ExaminationsService.getBatches());
  const [programmes] = useState<Programme[]>(() => dbRepository.getProgrammes());
  const [enrollments] = useState<Enrollment[]>(() => ExaminationsService.getEnrollments());

  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || 'exam-1');
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id || 'sec-mpc-a');

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  let examSubjects: ExamSubject[] = ExaminationsService.getExamSubjects(selectedExamId);
  if ((!examSubjects || examSubjects.length === 0) && selectedExam) {
    const defaultSubs = ExaminationsService.getSubjectsForProgrammes(
      selectedExam.programmeIds && selectedExam.programmeIds.length > 0
        ? selectedExam.programmeIds
        : [selectedExam.programmeId]
    );
    examSubjects = defaultSubs.map(s => ({
      id: `exsub-auto-${selectedExamId}-${s.id}`,
      examId: selectedExamId,
      subjectId: s.id,
      subjectName: s.name,
      subjectCode: s.code,
      maximumMarks: s.maxMarks || 100,
      passMarks: s.passMarks || 35,
    }));
  }

  const targetProgIds = selectedExam?.programmeIds && selectedExam.programmeIds.length > 0
    ? selectedExam.programmeIds
    : selectedExam?.programmeId ? [selectedExam.programmeId] : [];

  const relevantSections = sections.filter(sec => {
    if (!selectedExam) return true;
    if (targetProgIds.length === 0) return true;
    const batch = batches.find(b => b.id === sec.batchId);
    return targetProgIds.includes(batch?.programmeId || '');
  });
  const activeSections = relevantSections.length > 0 ? relevantSections : sections;

  useEffect(() => {
    const currentValid = activeSections.find(s => s.id === selectedSectionId);
    if (!currentValid && activeSections.length > 0) {
      setSelectedSectionId(activeSections[0].id);
    }
  }, [selectedExamId]);

  const sectionEnrollments = enrollments.filter(e => e.sectionId === selectedSectionId && e.academicYearId === 'ay-2026-2027');
  const sectionStudentIds = sectionEnrollments.map(e => e.studentId);
  const sectionStudents = allStudents.filter(s => sectionStudentIds.includes(s.id));

  // JSON Records Map: studentId -> StudentExamRecord
  const [recordsMap, setRecordsMap] = useState<Record<string, StudentExamRecord>>({});
  const [notification, setNotification] = useState<string | null>(null);

  // Load records from DB on exam/section change
  useEffect(() => {
    const existingRecords = ExaminationsService.getStudentExamRecords(selectedExamId, selectedSectionId);
    const newMap: Record<string, StudentExamRecord> = {};

    sectionEnrollments.forEach(en => {
      const existing = existingRecords.find(r => r.studentId === en.studentId);
      if (existing) {
        newMap[en.studentId] = existing;
      } else {
        newMap[en.studentId] = {
          id: `ser-${selectedExamId}-${en.studentId}`,
          examId: selectedExamId,
          enrollmentId: en.id,
          studentId: en.studentId,
          sectionId: selectedSectionId,
          subjectMarks: {},
          status: 'DRAFT',
          enteredBy: currentUser?.fullName || 'Staff User',
          updatedAt: new Date().toISOString(),
        };
      }
    });

    setRecordsMap(newMap);
  }, [selectedExamId, selectedSectionId]);

  // Modal for Report Card Preview
  const [previewReportCardStudent, setPreviewReportCardStudent] = useState<Student | null>(null);

  const isStaff = currentUser?.role === 'OFFICE_STAFF' || currentUser?.role === 'TEACHER';
  const isPrincipalOrDean = currentUser?.role === 'BRANCH_ADMIN' || currentUser?.role === 'INSTITUTION_ADMIN';

  const isSubmitted = selectedExam?.status === 'SUBMITTED';
  const isPublished = selectedExam?.status === 'PUBLISHED';
  const isReturned = selectedExam?.status === 'RETURNED_FOR_CORRECTION';
  const isDraft = selectedExam?.status === 'DRAFT';

  // Strict Locking Logic: Published is locked for everyone. Submitted is locked for staff.
  const isLocked = isPublished || (isStaff && isSubmitted);

  // Handler for setting a mark (numeric or status code: -1 = ABSENT, -2 = EXEMPTED)
  const handleMarkInput = (studentId: string, subjectId: string, value: number, maxMarks: number) => {
    let finalVal = value;
    if (finalVal >= 0 && finalVal > maxMarks) finalVal = maxMarks;

    setRecordsMap((prev) => {
      const currentRecord = prev[studentId] || {
        id: `ser-${selectedExamId}-${studentId}`,
        examId: selectedExamId,
        enrollmentId: sectionEnrollments.find(e => e.studentId === studentId)?.id || '',
        studentId: studentId,
        sectionId: selectedSectionId,
        subjectMarks: {},
        status: 'DRAFT',
        enteredBy: currentUser?.fullName || 'Staff User',
        updatedAt: new Date().toISOString(),
      };

      const updatedSubjectMarks = {
        ...currentRecord.subjectMarks,
        [subjectId]: finalVal,
      };

      const calc = calculateStudentGrade(updatedSubjectMarks, examSubjects);

      return {
        ...prev,
        [studentId]: {
          ...currentRecord,
          subjectMarks: updatedSubjectMarks,
          totalMarks: calc.totalMarks,
          maxTotalMarks: calc.maxTotalMarks,
          percentage: calc.percentage,
          resultStatus: calc.resultStatus,
          grade: calc.grade,
        },
      };
    });
  };

  const currentSection = sections.find(s => s.id === selectedSectionId);
  const currentBatch = batches.find(b => b.id === currentSection?.batchId);
  const currentProgramme = programmes.find(p => p.id === currentBatch?.programmeId);
  const sectionSubjects = ExaminationsService.getSubjectsForProgramme(currentProgramme?.id || '');
  const sectionSubjectIds = sectionSubjects.map(s => s.id);

  // Filter exam subjects to ONLY those belonging to the selected Section's Stream (e.g. MPC)
  let displaySubjects = examSubjects.filter(sub =>
    sectionSubjectIds.length > 0 ? sectionSubjectIds.includes(sub.subjectId) : true
  );

  // Ultimate fallback to sectionSubjects if displaySubjects is empty
  if (displaySubjects.length === 0 && sectionSubjects.length > 0) {
    displaySubjects = sectionSubjects.map(s => ({
      id: `exsub-fallback-${selectedExamId}-${s.id}`,
      examId: selectedExamId,
      subjectId: s.id,
      subjectName: s.name,
      subjectCode: s.code,
      maximumMarks: s.maxMarks || 100,
      passMarks: s.passMarks || 35,
    }));
  }

  // State for highlighting unmarked cells
  const [highlightUnmarked, setHighlightUnmarked] = useState(false)  // Loading & Debounce States
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveDraft = async () => {
    if (isSavingDraft || isSubmitting) return;
    setIsSavingDraft(true);

    await new Promise(res => setTimeout(res, 400));

    (Object.values(recordsMap) as StudentExamRecord[]).forEach((rec) => {
      ExaminationsService.saveStudentExamRecord({ ...rec, status: 'DRAFT' }, displaySubjects);
    });
    triggerRefresh();
    setNotification('Draft marks saved successfully!');
    setIsSavingDraft(false);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmitForReview = async () => {
    if (isSavingDraft || isSubmitting) return;

    if (totalUnmarked > 0) {
      setHighlightUnmarked(true);
      setNotification(`⚠️ Cannot Submit to Principal: ${totalUnmarked} unmarked student cell(s) remaining. Enter a score or assign [A] (Absent) / [E] (Exempt) for all students.`);
      setTimeout(() => setNotification(null), 6000);
      return;
    }

    setIsSubmitting(true);
    await new Promise(res => setTimeout(res, 500));

    (Object.values(recordsMap) as StudentExamRecord[]).forEach((rec) => {
      ExaminationsService.saveStudentExamRecord({ ...rec, status: 'SUBMITTED' }, displaySubjects);
    });
    ExaminationsService.updateExam(selectedExamId, { status: 'SUBMITTED' });
    triggerRefresh();
    setNotification('Class marks submitted to Principal for review & publishing!');
    setIsSubmitting(false);
    setTimeout(() => setNotification(null), 4000);
  };

  // Compute live class statistics
  const totalStudents = sectionStudents.length;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalAbsentees = 0;
  let totalUnmarked = 0;

  const displaySubjectIds = displaySubjects.map(s => s.subjectId);

  sectionStudents.forEach((st) => {
    const rec = recordsMap[st.id];
    if (!rec) {
      totalUnmarked++;
      return;
    }
    const marks = rec.subjectMarks || {};
    const filledCount = displaySubjectIds.filter(id => marks[id] !== undefined && marks[id] !== null && marks[id] >= -2).length;
    if (filledCount < displaySubjects.length) {
      totalUnmarked++;
    }
    if (rec.resultStatus === 'Pass') totalPassed++;
    if (rec.resultStatus === 'Fail') totalFailed++;
    if (Object.values(marks).some(v => v === -1)) totalAbsentees++;
  });

  return (
    <div className="space-y-6 relative">
      {/* Bottom-Right Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold max-w-md animate-bounce-short">
          <div className="p-2 bg-teal-600/30 rounded-xl text-teal-400 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <span className="flex-1 leading-snug">{notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Class Subject Marks Matrix Entry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Input assessment scores with 1-click status pills ([P], [A], [E]), auto-calculate grades, and submit.
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

      {/* Selector & Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
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
              {activeSections.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons in Selector Bar */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {(!isLocked && (isDraft || isReturned)) && (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isSubmitting}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSavingDraft ? (
                  <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
              </button>

              <button
                onClick={handleSubmitForReview}
                disabled={isSavingDraft || isSubmitting}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{isSubmitting ? 'Submitting...' : 'Submit to Principal'}</span>
              </button>
            </>
          )}

          {isPrincipalOrDean && (isSubmitted || isDraft) && (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Principal Review Mode ({selectedExam?.status})
            </span>
          )}
        </div>
      </div>

      {/* Status Context Banners */}
      {isSubmitted && isStaff && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Submitted to Principal for review. Inputs are currently locked while under review.</span>
          </div>
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">SUBMITTED</span>
        </div>
      )}

      {isReturned && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span><strong>Returned for Correction by Principal:</strong> "{selectedExam?.returnReason || 'Please verify student marks'}". Inputs are unlocked for edits.</span>
          </div>
          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">RETURNED</span>
        </div>
      )}

      {isPublished && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Results Approved & Published to Parent Portal. Marks records are finalized.</span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">PUBLISHED</span>
        </div>
      )}

      {/* Live Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div className="p-3 bg-slate-50 rounded-xl text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Total Enrolled</span>
          <strong className="text-base text-slate-900 font-black">{totalStudents}</strong>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
          <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">Passed</span>
          <strong className="text-base text-emerald-700 font-black">{totalPassed}</strong>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl text-center border border-rose-100">
          <span className="text-[10px] font-bold uppercase text-rose-600 block mb-1">Failed</span>
          <strong className="text-base text-rose-700 font-black">{totalFailed}</strong>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
          <span className="text-[10px] font-bold uppercase text-amber-600 block mb-1">Absentees (-1)</span>
          <strong className="text-base text-amber-700 font-black">{totalAbsentees}</strong>
        </div>
        <div className="p-3 bg-purple-50 rounded-xl text-center border border-purple-100">
          <span className="text-[10px] font-bold uppercase text-purple-600 block mb-1">Unmarked Cells</span>
          <strong className="text-base text-purple-700 font-black">{totalUnmarked}</strong>
        </div>
      </div>

      {/* Marks Matrix Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3 shrink-0">Adm No</th>
                <th className="p-3">Student Name</th>
                {displaySubjects.map(sub => {
                  const isSubjectExemptForBatch = sub.exemptedBatchIds?.includes(currentBatch?.id || '') || sub.exemptedBranchIds?.includes(currentUser?.branchId || '');
                  return (
                    <th key={sub.id} className="p-3 text-center min-w-[140px]">
                      <div>{sub.subjectName}</div>
                      {isSubjectExemptForBatch ? (
                        <div className="text-[9px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          EXEMPTED FOR BATCH
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-400 font-mono normal-case">
                          Max: {sub.maximumMarks} • Pass: {sub.passMarks}
                        </div>
                      )}
                    </th>
                  );
                })}
                <th className="p-3 text-center">Total Score</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectionStudents.map((st) => {
                const rec = recordsMap[st.id] || { subjectMarks: {} };
                const marks = rec.subjectMarks || {};

                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{st.admissionNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {st.firstName} {st.lastName}
                    </td>

                    {displaySubjects.map(sub => {
                      const val = marks[sub.subjectId];
                      const isAbsent = val === -1;
                      const isExempt = val === -2;

                      return (
                        <td key={sub.id} className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={sub.maximumMarks}
                              placeholder="Score"
                              disabled={isLocked}
                              value={val !== undefined && val >= 0 ? val : ''}
                              onChange={(e) => {
                                if (isLocked) return;
                                const v = e.target.value === '' ? -99 : Number(e.target.value);
                                if (v >= 0) {
                                  handleMarkInput(st.id, sub.subjectId, v, sub.maximumMarks);
                                }
                              }}
                              className={`w-14 p-1.5 border rounded-lg text-center font-bold text-xs outline-none ${
                                isLocked
                                  ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                                  : isAbsent
                                  ? 'bg-rose-100 text-rose-800 border-rose-300 font-black'
                                  : isExempt
                                  ? 'bg-slate-200 text-slate-700 border-slate-300'
                                  : highlightUnmarked && (val === undefined || val === null || val < -2)
                                  ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300 animate-pulse font-bold'
                                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500'
                              }`}
                            />
                            {/* Quick Action Pills: [A] Absent (-1), [E] Exempt (-2) */}
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <button
                                type="button"
                                title="Mark Absent (-1)"
                                disabled={isLocked}
                                onClick={() => !isLocked && handleMarkInput(st.id, sub.subjectId, isAbsent ? 0 : -1, sub.maximumMarks)}
                                className={`px-1.5 py-0.5 text-[9px] rounded font-bold transition-colors ${
                                  isLocked
                                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                                    : isAbsent ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-700'
                                }`}
                              >
                                A
                              </button>
                              <button
                                type="button"
                                title="Mark Exempt (-2)"
                                disabled={isLocked}
                                onClick={() => !isLocked && handleMarkInput(st.id, sub.subjectId, isExempt ? 0 : -2, sub.maximumMarks)}
                                className={`px-1.5 py-0.5 text-[9px] rounded font-bold transition-colors ${
                                  isLocked
                                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                                    : isExempt ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                E
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    <td className="p-3 text-center font-bold text-slate-900">
                      {rec.totalMarks !== undefined ? (
                        <>
                          {rec.totalMarks} / {rec.maxTotalMarks}
                          <span className="text-[10px] text-slate-400 font-normal block">({rec.percentage}%)</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>

                    <td className="p-3 text-center font-black text-xs">
                      {rec.grade ? (
                        <span className={`px-2 py-0.5 rounded font-mono ${
                          rec.grade === 'A+' || rec.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          rec.grade === 'B' || rec.grade === 'C' ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rec.grade}
                        </span>
                      ) : '—'}
                    </td>

                    <td className="p-3 text-center">
                      {rec.resultStatus ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.resultStatus === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.resultStatus.toUpperCase()}
                        </span>
                      ) : '—'}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setPreviewReportCardStudent(st)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-slate-500" /> Card
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-wrap justify-between items-center gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            ℹ️ Quick Tip: Use <strong>[A]</strong> for Absent (-1) and <strong>[E]</strong> for Exempted (-2). Total & Grade auto-update live.
          </div>

          <div className="flex gap-3">
            {(!isLocked && (isDraft || isReturned)) && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSavingDraft ? (
                    <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
                </button>

                <button
                  onClick={handleSubmitForReview}
                  disabled={isSavingDraft || isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit to Principal'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* REPORT CARD PREVIEW MODAL */}
      <Modal
        isOpen={!!previewReportCardStudent}
        onClose={() => setPreviewReportCardStudent(null)}
        title="Official Report Card Preview"
        maxWidth="lg"
      >
        {previewReportCardStudent && (
          <div className="space-y-6 text-xs text-slate-700">
            <div className="text-center space-y-1 border-b border-slate-200 pb-4">
              <h2 className="font-black text-xl text-slate-900 tracking-wide">SRI VIGNAN INTERMEDIATE COLLEGE</h2>
              <p className="text-xs text-teal-700 font-bold uppercase">{selectedExam?.name} - Report Card</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
              <div>
                <p><span className="text-slate-400">Student:</span> <strong>{previewReportCardStudent.firstName} {previewReportCardStudent.lastName}</strong></p>
                <p><span className="text-slate-400">Admission No:</span> <strong className="font-mono">{previewReportCardStudent.admissionNumber}</strong></p>
              </div>
              <div className="text-right">
                <p><span className="text-slate-400">Exam Date:</span> <strong>{selectedExam?.examDate}</strong></p>
                <p><span className="text-slate-400">Overall Result:</span> <strong className={recordsMap[previewReportCardStudent.id]?.resultStatus === 'Pass' ? 'text-emerald-700' : 'text-rose-700'}>{recordsMap[previewReportCardStudent.id]?.resultStatus || 'N/A'}</strong></p>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5 text-center">Max Marks</th>
                  <th className="p-2.5 text-center">Pass Marks</th>
                  <th className="p-2.5 text-center">Marks Obtained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {examSubjects.map(sub => {
                  const m = recordsMap[previewReportCardStudent.id]?.subjectMarks?.[sub.subjectId];
                  return (
                    <tr key={sub.id}>
                      <td className="p-2.5 font-semibold text-slate-800">{sub.subjectName}</td>
                      <td className="p-2.5 text-center font-mono">{sub.maximumMarks}</td>
                      <td className="p-2.5 text-center font-mono">{sub.passMarks}</td>
                      <td className="p-2.5 text-center font-bold font-mono">
                        {m === -1 ? <span className="text-rose-600">ABSENT</span> :
                         m === -2 ? <span className="text-slate-500">EXEMPTED</span> :
                         m !== undefined && m >= 0 ? m : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end pt-2">
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
