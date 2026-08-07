import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Megaphone,
  MessageSquare,
  Download,
  FileText,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { dbRepository } from '@/src/services/db';
import { WhatsAppModal } from '@/src/modules/notifications/components/WhatsAppModal';

interface ParentDashboardProps {
  onNavigate: (path: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const [selectedWaMsg, setSelectedWaMsg] = useState<string | null>(null);

  const student = dbRepository.getStudents().find((s) => s.id === 'student-1'); // Ravi Kumar
  const feeAssignments = dbRepository.getFeeAssignments().filter((f) => f.studentId === 'student-1');
  const payments = dbRepository.getFeePayments().filter((p) => p.studentId === 'student-1');
  const resultVersions = dbRepository.getResultVersions('student-1');
  const circulars = dbRepository.getCirculars().filter((c) => c.status === 'PUBLISHED');
  const notifEvents = dbRepository.getNotificationEvents().filter((n) => n.studentId === 'student-1');

  const totalAssigned = feeAssignments.reduce((acc, f) => acc + f.assignedAmount, 0);
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalBalance = totalAssigned - totalPaid;

  const latestResult = resultVersions[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Student Profile Card Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center border-2 border-emerald-400 shadow-md">
            RK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">{student?.firstName} {student?.lastName}</h1>
              <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active Enrolment
              </span>
            </div>
            <p className="text-xs text-teal-200 mt-1">
              Admission: <strong className="text-white">{student?.admissionNumber}</strong> • Roll No: <strong className="text-white">MPC-A-01</strong>
            </p>
            <p className="text-xs text-teal-300">
              Sri Vignan Intermediate College • First Year MPC (MPC-A)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1 text-xs text-slate-300 border-t sm:border-t-0 sm:border-l border-emerald-800 pt-3 sm:pt-0 sm:pl-4">
          <span className="text-[11px] text-slate-400">Guardian Account:</span>
          <strong className="text-white font-semibold">Mrs. Lakshmi Kumar</strong>
          <span className="text-[11px] text-teal-300">+91 90000 20001</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance Summary */}
        <div
          onClick={() => onNavigate('/parent/attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Finalized Attendance</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">85.7%</div>
          <p className="text-xs text-slate-500 mt-1">6 Present, 1 Absent (7 days logged)</p>
        </div>

        {/* Fee Position */}
        <div
          onClick={() => onNavigate('/parent/fees')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Outstanding Fee Balance</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-900">₹{totalBalance.toLocaleString('en-IN')}</div>
          <p className="text-xs text-slate-500 mt-1">
            Paid: ₹{totalPaid.toLocaleString('en-IN')} • Due: 15 Aug 2026
          </p>
        </div>

        {/* Latest Result */}
        <div
          onClick={() => onNavigate('/parent/results')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Monthly Test 1 Score</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-900">316 / 400</div>
          <p className="text-xs text-slate-500 mt-1">79% • Grade B • Result: Pass</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Published Exam Result Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> Latest Report Card
            </h3>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Pass (79%)
            </span>
          </div>

          {latestResult && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {latestResult.subjectResults.map((sub) => (
                  <div key={sub.subjectId} className="flex justify-between py-1 border-b border-slate-200/60 last:border-none">
                    <span className="text-slate-600 font-medium">{sub.subjectName}:</span>
                    <strong className="text-slate-900">{sub.marksObtained} / {sub.maximumMarks}</strong>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500">Official Report Card Version 1</span>
                <button
                  onClick={() => onNavigate('/parent/results')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Printable Report Card
                </button>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Mobile Notifications Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Message History
            </h3>
            <span className="text-xs text-slate-500">Delivered to +91 90000 20001</span>
          </div>

          <div className="space-y-2 text-xs">
            {notifEvents.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                onClick={() => setSelectedWaMsg(notif.resolvedMessage)}
              >
                <div>
                  <span className="font-semibold text-slate-900 block">{notif.eventType.replace(/_/g, ' ')}</span>
                  <span className="text-[11px] text-slate-500 truncate max-w-[220px] block">
                    {notif.resolvedMessage.substring(0, 45)}...
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200 block">
                    Delivered
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Tap to Preview</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* College Circulars */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-teal-600" /> Official College Circulars
          </h3>
          <button
            onClick={() => onNavigate('/parent/circulars')}
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            View All Circulars
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {circulars.slice(0, 2).map((circ) => (
            <div key={circ.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 text-xs">{circ.title}</span>
                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                  {circ.category}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">{circ.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Modal */}
      {selectedWaMsg && (
        <WhatsAppModal
          isOpen={!!selectedWaMsg}
          onClose={() => setSelectedWaMsg(null)}
          customMessage={selectedWaMsg}
          studentName="Ravi Kumar"
          guardianName="Mrs. Lakshmi Kumar"
        />
      )}
    </div>
  );
};
