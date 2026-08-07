import React from 'react';
import {
  Users,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  Megaphone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { StatCard } from '@/src/modules/core/components/StatCard';
import { dbRepository } from '@/src/services/db';

interface PrincipalDashboardProps {
  onNavigate: (path: string) => void;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ onNavigate }) => {
  const students = dbRepository.getStudents();
  const feeAssignments = dbRepository.getFeeAssignments();
  const payments = dbRepository.getFeePayments();
  const importBatches = dbRepository.getImportBatches();
  const attSessions = dbRepository.getAttendanceSessions();
  const exams = dbRepository.getExams();
  const notifEvents = dbRepository.getNotificationEvents();

  const totalAssigned = feeAssignments.reduce((acc, f) => acc + f.assignedAmount, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const pendingImports = importBatches.filter((b) => b.status === 'SUBMITTED').length;
  const pendingAtt = attSessions.filter((s) => s.status === 'SUBMITTED').length;
  const pendingExams = exams.filter((e) => e.status === 'SUBMITTED').length;
  const failedNotifs = notifEvents.filter((n) => n.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-indigo-900 text-white p-6 rounded-3xl border border-indigo-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block mb-1">
            Principal Control Center
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Main Campus – Hyderabad</h1>
          <p className="text-xs text-indigo-200 mt-1">
            Approvals, Attendance Finalization, Result Publications & Fee Controls
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('/attendance')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <CalendarCheck className="w-4 h-4" /> Finalize Attendance
          </button>
          <button
            onClick={() => onNavigate('/exams')}
            className="px-3.5 py-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold border border-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4 text-indigo-300" /> Publish Results
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Branch Student Total"
          value={students.length}
          subtitle="Enrolled in First Year"
          icon={Users}
          color="navy"
          onClick={() => onNavigate('/students')}
        />
        <StatCard
          title="Attendance Finalization"
          value={pendingAtt > 0 ? `${pendingAtt} Session Pending` : 'All Finalized'}
          subtitle="MPC First Year Section B"
          icon={CalendarCheck}
          color={pendingAtt > 0 ? 'amber' : 'emerald'}
          onClick={() => onNavigate('/attendance')}
        />
        <StatCard
          title="Fee Collection Total"
          value={`₹${(totalCollected / 100000).toFixed(2)} Lakhs`}
          subtitle={`Balance: ₹${((totalAssigned - totalCollected) / 100000).toFixed(2)}L`}
          icon={CreditCard}
          color="teal"
          onClick={() => onNavigate('/fees')}
        />
        <StatCard
          title="Exam Result Approval"
          value={pendingExams > 0 ? 'Unit Test 2 Ready' : 'Published'}
          subtitle="Submitted by Class Teacher"
          icon={GraduationCap}
          color={pendingExams > 0 ? 'indigo' : 'emerald'}
          onClick={() => onNavigate('/exams')}
        />
      </div>

      {/* Actionable Pending Approvals Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" /> Pending Branch Approvals & Reviews
          </h3>
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
            Action Required
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Import Review */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-teal-600" /> Student Import
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                {pendingImports > 0 ? 'Submitted' : 'None Pending'}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Office Staff submitted 25 student records from spreadsheet upload.
            </p>
            <button
              onClick={() => onNavigate('/imports')}
              className="w-full py-2 bg-slate-900 text-white rounded-lg font-semibold flex items-center justify-center gap-1 hover:bg-slate-800"
            >
              Review & Confirm Import <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Attendance Review */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-indigo-600" /> Section Attendance
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                {pendingAtt} Session
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              MPC-B today attendance submitted by class teacher Ms. Sushma Devi.
            </p>
            <button
              onClick={() => onNavigate('/attendance')}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold flex items-center justify-center gap-1 hover:bg-indigo-700"
            >
              Finalize Attendance <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Exam Result Review */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" /> Exam Marks Submission
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
                {pendingExams} Assessment
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Unit Test 2 marks entered and submitted for review & publication.
            </p>
            <button
              onClick={() => onNavigate('/exams')}
              className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-1 hover:bg-purple-700"
            >
              Approve & Publish <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
