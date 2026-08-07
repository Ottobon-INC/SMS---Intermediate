import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { ResultVersion } from '@/src/types';
import { GraduationCap, Save, ArrowLeft, MessageSquare, CheckCircle2, X, Send } from 'lucide-react';

export const ClassMarksEntryPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { currentUser, triggerRefresh } = useAuth();
  const students = dbRepository.getStudents();
  const exams = dbRepository.getExams();

  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || 'exam-1');
  const [selectedSection, setSelectedSection] = useState('MPC-A');

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const sectionStudents = students;

  // Marks state map: studentId -> { math: number, phy: number, chem: number, eng: number }
  const [marksState, setMarksState] = useState<
    Record<string, { math: number; phy: number; chem: number; eng: number }>
  >({
    'student-1': { math: 88, phy: 76, chem: 72, eng: 80 },
    'student-2': { math: 92, phy: 84, chem: 80, eng: 85 },
    'student-3': { math: 65, phy: 58, chem: 60, eng: 70 },
  });

  // Modal for WhatsApp Preview
  const [showWhatsAppPreviewModal, setShowWhatsAppPreviewModal] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<string>('');
  const [previewStudentName, setPreviewStudentName] = useState<string>('');

  const handleMarkChange = (studentId: string, subjectKey: 'math' | 'phy' | 'chem' | 'eng', val: number) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { math: 70, phy: 70, chem: 70, eng: 70 }),
        [subjectKey]: val,
      },
    }));
  };

  const handleSubmitAndPublishMarks = () => {
    const examTitle = selectedExam?.name || 'Academic Assessment';

    // 1. Mark exam as PUBLISHED
    dbRepository.updateExam(selectedExamId, {
      status: 'PUBLISHED',
    });

    // 2. Save Result Versions for students
    sectionStudents.forEach((st) => {
      const marks = marksState[st.id] || { math: 75, phy: 70, chem: 72, eng: 78 };
      const total = marks.math + marks.phy + marks.chem + marks.eng;
      const pct = Math.round((total / 400) * 100);
      const isPass = pct >= 35;

      const newVersion: ResultVersion = {
        id: `rv-${st.id}-${Date.now()}`,
        resultPublicationId: `pub-${selectedExamId}`,
        studentId: st.id,
        version: 1,
        subjectResults: [
          { subjectId: 'sub-m1a', subjectName: 'Mathematics-1A', marksObtained: marks.math, maximumMarks: 100, passMarks: 35, isPass: marks.math >= 35 },
          { subjectId: 'sub-phy', subjectName: 'Physics', marksObtained: marks.phy, maximumMarks: 100, passMarks: 35, isPass: marks.phy >= 35 },
          { subjectId: 'sub-chem', subjectName: 'Chemistry', marksObtained: marks.chem, maximumMarks: 100, passMarks: 35, isPass: marks.chem >= 35 },
          { subjectId: 'sub-eng', subjectName: 'English', marksObtained: marks.eng, maximumMarks: 100, passMarks: 35, isPass: marks.eng >= 35 },
        ],
        totalMarks: total,
        maximumMarks: 400,
        percentage: pct,
        grade: pct >= 75 ? 'Distinction' : pct >= 60 ? 'First Class' : 'Second Class',
        resultStatus: isPass ? 'Pass' : 'Fail',
        createdAt: new Date().toISOString(),
      };

      dbRepository.addResultVersion(newVersion);

      // 3. Queue WhatsApp Notification
      const waMsg = `Dear Parent,\n\nThe result for ${st.firstName} ${st.lastName} in ${examTitle} has been published.\n\n📊 Marks Breakdown:\n• Maths: ${marks.math}/100\n• Physics: ${marks.phy}/100\n• Chemistry: ${marks.chem}/100\n• English: ${marks.eng}/100\n\n🏆 Total: ${total} / 400 (${pct}%)\nStatus: ${isPass ? 'PASS ✅' : 'FAIL ❌'}\n\nView full digital report card in SVIC Parent Portal.\n\nRegards,\nSri Vignan Intermediate College`;

      dbRepository.addNotificationEvent({
        id: `notif-exam-${st.id}-${Date.now()}`,
        institutionId: 'inst-svic-01',
        branchId: 'branch-hyd-main',
        studentId: st.id,
        guardianId: 'guard-1',
        sourceModule: 'Examinations',
        sourceRecordId: selectedExamId,
        recipientMobile: '9000020001',
        eventType: 'EXAM_RESULT_PUBLISHED',
        resolvedMessage: waMsg,
        status: 'DELIVERED',
        createdAt: new Date().toISOString(),
        retryCount: 0,
      });

      if (st.id === 'student-1') {
        setPreviewStudentName(`${st.firstName} ${st.lastName}`);
        setPreviewMessage(waMsg);
      }
    });

    triggerRefresh();
    setShowWhatsAppPreviewModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Class Subject Marks Entry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Input assessment scores per subject for class students, calculate grades, publish to parent portal, and generate WhatsApp alerts.
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
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="MPC-A">MPC-A (First Year)</option>
            <option value="MPC-B">MPC-B (First Year)</option>
            <option value="BiPC-A">BiPC-A (First Year)</option>
            <option value="CEC-A">CEC-A (First Year)</option>
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
                <th className="p-3">Maths-1A (100)</th>
                <th className="p-3">Physics (100)</th>
                <th className="p-3">Chemistry (100)</th>
                <th className="p-3">English (100)</th>
                <th className="p-3 text-center">Total / 400</th>
                <th className="p-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectionStudents.map((st) => {
                const marks = marksState[st.id] || { math: 75, phy: 70, chem: 72, eng: 78 };
                const total = marks.math + marks.phy + marks.chem + marks.eng;
                const pct = Math.round((total / 400) * 100);
                const isPass = pct >= 35;

                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{st.admissionNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {st.firstName} {st.lastName}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        max={100}
                        min={0}
                        value={marks.math}
                        onChange={(e) => handleMarkChange(st.id, 'math', Number(e.target.value))}
                        className="w-16 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        max={100}
                        min={0}
                        value={marks.phy}
                        onChange={(e) => handleMarkChange(st.id, 'phy', Number(e.target.value))}
                        className="w-16 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        max={100}
                        min={0}
                        value={marks.chem}
                        onChange={(e) => handleMarkChange(st.id, 'chem', Number(e.target.value))}
                        className="w-16 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        max={100}
                        min={0}
                        value={marks.eng}
                        onChange={(e) => handleMarkChange(st.id, 'eng', Number(e.target.value))}
                        className="w-16 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs"
                      />
                    </td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-4 flex flex-wrap justify-between items-center gap-3">
          <div className="text-xs text-slate-500">
            💡 Submitting marks publishes digital report cards directly to the <strong>Parent Portal</strong> and triggers <strong>WhatsApp SMS notifications</strong>.
          </div>

          <button
            onClick={handleSubmitAndPublishMarks}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all"
            id="save-publish-marks-button"
          >
            <Save className="w-4 h-4 text-emerald-300" /> Save & Publish Marks to Parent Portal
          </button>
        </div>
      </div>

      {/* WHATSAPP MESSAGE PREVIEW MODAL */}
      {showWhatsAppPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Marks Published & WhatsApp Dispatched</h3>
                  <p className="text-xs text-slate-500">Live preview of automated parent WhatsApp notification</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp Chat Simulation Card */}
            <div className="bg-emerald-950/90 p-4 rounded-2xl border border-emerald-800 text-xs space-y-3 font-sans shadow-inner">
              <div className="flex justify-between items-center border-b border-emerald-800/60 pb-2">
                <div className="flex items-center gap-2 text-emerald-100 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  WhatsApp Official Alert Engine
                </div>
                <span className="text-[10px] text-emerald-300 font-mono">+91 90000 20001 (Parent)</span>
              </div>

              {/* Message Bubble */}
              <div className="bg-emerald-900/90 text-emerald-50 p-3.5 rounded-2xl border border-emerald-700/50 space-y-2 whitespace-pre-wrap font-mono leading-relaxed text-[11px] shadow-sm">
                {previewMessage}
                <div className="flex justify-end items-center gap-1 text-[9px] text-emerald-300 font-mono mt-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-teal-300 font-bold">✓✓ Delivered</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Report card for <strong>{selectedExam?.name}</strong> is now live in the Parent Portal!
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowWhatsAppPreviewModal(false);
                  if (onBack) onBack();
                }}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Done & Return to Exams
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
