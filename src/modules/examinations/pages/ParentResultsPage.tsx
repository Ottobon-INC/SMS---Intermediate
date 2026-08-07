import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { GraduationCap, Printer, CheckCircle2, MessageSquare, Award } from 'lucide-react';

export const ParentResultsPage: React.FC = () => {
  const versions = dbRepository.getResultVersions('student-1');
  const exams = dbRepository.getExams().filter((e) => e.status === 'PUBLISHED');
  const notifications = dbRepository.getNotificationEvents().filter((n) => n.studentId === 'student-1' && n.sourceModule === 'Examinations');

  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const currentVersion = versions[selectedVersionIndex] || versions[0];
  const relatedNotif = notifications[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" /> Published Academic Report Cards
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Child: <strong>Ravi Kumar</strong> (SVI-2026-1001) • Class: <strong>MPC-A First Year</strong>
          </p>
        </div>

        {currentVersion && (
          <div className="text-right bg-indigo-50/70 px-4 py-2.5 rounded-2xl border border-indigo-100">
            <span className="text-2xl font-bold text-indigo-900 block">{currentVersion.percentage}%</span>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              {currentVersion.resultStatus} ({currentVersion.grade})
            </span>
          </div>
        )}
      </div>

      {/* Select Assessment if multiple versions exist */}
      {versions.length > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 text-xs">
          <label className="font-bold text-slate-700">Select Exam Report:</label>
          <select
            value={selectedVersionIndex}
            onChange={(e) => setSelectedVersionIndex(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {versions.map((v, idx) => (
              <option key={v.id} value={idx}>
                Report Card v{v.version} — Score: {v.totalMarks}/{v.maximumMarks} ({v.percentage}%)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Detailed Report Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" /> Assessment Marks Breakdown
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Report Card Version {currentVersion?.version || 1}
          </span>
        </div>

        {currentVersion ? (
          <div className="space-y-4 text-xs">
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Subject Name</th>
                    <th className="p-3">Marks Obtained</th>
                    <th className="p-3">Max Marks</th>
                    <th className="p-3">Pass Marks</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentVersion.subjectResults.map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">{sub.subjectName}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{sub.marksObtained}</td>
                      <td className="p-3 font-mono text-slate-500">{sub.maximumMarks}</td>
                      <td className="p-3 font-mono text-slate-400">{sub.passMarks}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${sub.isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {sub.isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <td className="p-3">Overall Assessment Total</td>
                    <td className="p-3 font-mono text-indigo-800 text-sm">{currentVersion.totalMarks}</td>
                    <td className="p-3 font-mono text-slate-500">{currentVersion.maximumMarks}</td>
                    <td className="p-3 font-mono text-slate-400">-</td>
                    <td className="p-3 text-center font-bold text-indigo-800">
                      {currentVersion.percentage}% ({currentVersion.resultStatus})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified by Principal & Dean Desk
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" /> Print Full Report Card
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No published results found yet.
          </div>
        )}
      </div>

      {/* WHATSAPP MESSAGE DISPATCHED PREVIEW CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dispatched WhatsApp Parent Alert</h3>
              <p className="text-[11px] text-slate-500">Sent to registered guardian number: +91 90000 20001</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
            DELIVERED ✓✓
          </span>
        </div>

        <div className="bg-emerald-950/90 p-4 rounded-2xl border border-emerald-800 text-xs font-sans shadow-inner">
          <div className="bg-emerald-900/90 text-emerald-50 p-3.5 rounded-2xl border border-emerald-700/50 space-y-2 whitespace-pre-wrap font-mono leading-relaxed text-[11px]">
            {relatedNotif?.resolvedMessage ||
              `Dear Parent,\n\nThe result for Ravi Kumar in Monthly Test 1 has been published.\n\n📊 Marks Breakdown:\n• Maths: 88/100\n• Physics: 76/100\n• Chemistry: 72/100\n• English: 80/100\n\n🏆 Total: 316 / 400 (79%)\nStatus: PASS ✅\n\nView full digital report card in SVIC Parent Portal.\n\nRegards,\nSri Vignan Intermediate College`}
            <div className="flex justify-end items-center gap-1 text-[9px] text-emerald-300 font-mono mt-1">
              <span>Today at 02:15 PM</span>
              <span className="text-teal-300 font-bold">✓✓ Read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
