import React from 'react';
import {
  Upload,
  CreditCard,
  CalendarCheck,
  GraduationCap,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { StatCard } from '@/src/modules/core/components/StatCard';
import { dbRepository } from '@/src/services/db';

interface StaffDashboardProps {
  onNavigate: (path: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigate }) => {
  const students = dbRepository.getStudents();
  const payments = dbRepository.getFeePayments();
  const attSessions = dbRepository.getAttendanceSessions();
  const importBatches = dbRepository.getImportBatches();

  const todayPayments = payments.filter((p) => p.paymentDate === '2026-08-06');
  const todayPaymentTotal = todayPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-teal-900 text-white p-6 rounded-3xl border border-teal-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs text-teal-300 font-bold uppercase tracking-wider block mb-1">
            Office Staff & Class Teacher Portal
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Main Campus – Hyderabad</h1>
          <p className="text-xs text-teal-200 mt-1">
            Data Uploads, Daily Attendance, Fee Collection Receipts & Class Marks Entry
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('/imports')}
            className="px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload Excel Data
          </button>
          <button
            onClick={() => onNavigate('/fees')}
            className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold border border-teal-700 transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" /> Collect Fee
          </button>
        </div>
      </div>

      {/* Primary Staff Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Students in Branch"
          value={students.length}
          subtitle="MPC-A & MPC-B First Year"
          icon={Users}
          color="navy"
          onClick={() => onNavigate('/students')}
        />
        <StatCard
          title="Payments Recorded Today"
          value={`₹${todayPaymentTotal.toLocaleString('en-IN')}`}
          subtitle={`${todayPayments.length} Receipt(s) issued`}
          icon={CreditCard}
          color="teal"
          onClick={() => onNavigate('/fees')}
        />
        <StatCard
          title="Today's Attendance"
          value="Submitted"
          subtitle="MPC-A Finalized • MPC-B Submitted"
          icon={CalendarCheck}
          color="emerald"
          onClick={() => onNavigate('/attendance')}
        />
        <StatCard
          title="Unit Test 2 Marks"
          value="Submitted"
          subtitle="Awaiting Principal Review"
          icon={GraduationCap}
          color="indigo"
          onClick={() => onNavigate('/marks-entry')}
        />
      </div>

      {/* Operational Workflows Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload & Import Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" /> Student Import Status
            </h3>
            <button
              onClick={() => onNavigate('/imports')}
              className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
            >
              Import Center <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {importBatches.slice(0, 2).map((batch) => (
              <div key={batch.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-900 block">{batch.fileName}</span>
                  <span className="text-[10px] text-slate-500">
                    {batch.totalRows} rows • Uploaded by {batch.uploadedBy}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {batch.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Attendance & Fee Shortcuts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Quick Operational Tasks</h3>
            <span className="text-[10px] text-slate-400">Class Teacher Workspace</span>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => onNavigate('/attendance')}
              className="w-full p-3 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-800 font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-teal-600" /> Record Daily Attendance (MPC-A)
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('/fees')}
              className="w-full p-3 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-800 font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" /> Issue Fee Receipt & Record Payment
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('/marks-entry')}
              className="w-full p-3 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-800 font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" /> Enter Unit Test Subject Marks
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
