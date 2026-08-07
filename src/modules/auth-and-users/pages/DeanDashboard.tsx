import React from 'react';
import {
  Users,
  Building,
  CreditCard,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '@/src/modules/core/components/StatCard';
import { dbRepository } from '@/src/services/db';

interface DeanDashboardProps {
  onNavigate: (path: string) => void;
}

export const DeanDashboard: React.FC<DeanDashboardProps> = ({ onNavigate }) => {
  const students = dbRepository.getStudents();
  const users = dbRepository.getUsers();
  const feeAssignments = dbRepository.getFeeAssignments();
  const payments = dbRepository.getFeePayments();
  const attSessions = dbRepository.getAttendanceSessions();
  const exams = dbRepository.getExams();
  const circulars = dbRepository.getCirculars();
  const notifEvents = dbRepository.getNotificationEvents();
  const auditEvents = dbRepository.getAuditEvents();

  const totalAssigned = feeAssignments.reduce((acc, f) => acc + f.assignedAmount, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalBalance = totalAssigned - totalCollected;

  const pendingAtt = attSessions.filter((s) => s.status === 'SUBMITTED').length;
  const pendingExams = exams.filter((e) => e.status === 'SUBMITTED').length;
  const failedNotifs = notifEvents.filter((n) => n.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs text-teal-400 font-bold uppercase tracking-wider block mb-1">
            Institution Overview
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Sri Vignan Intermediate College</h1>
          <p className="text-xs text-slate-300 mt-1">
            All Campuses • Academic Year 2026–2027 • Board of Intermediate Education
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('/users')}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Create User
          </button>
          <button
            onClick={() => onNavigate('/circulars')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Megaphone className="w-4 h-4 text-teal-400" /> Publish Circular
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students Enrolled"
          value={students.length}
          subtitle="Across First Year programmes"
          icon={Users}
          color="navy"
          onClick={() => onNavigate('/students')}
        />
        <StatCard
          title="Total Fees Assigned"
          value={`₹${(totalAssigned / 100000).toFixed(2)} Lakhs`}
          subtitle={`Collected: ₹${(totalCollected / 100000).toFixed(2)}L`}
          icon={CreditCard}
          color="teal"
          onClick={() => onNavigate('/fees')}
        />
        <StatCard
          title="Outstanding Fee Balance"
          value={`₹${(totalBalance / 100000).toFixed(2)} Lakhs`}
          subtitle="Pending collection"
          icon={TrendingUp}
          color="amber"
          onClick={() => onNavigate('/fees')}
        />
        <StatCard
          title="Active Campuses"
          value="1"
          subtitle="Main Campus – Hyderabad"
          icon={Building}
          color="indigo"
          onClick={() => onNavigate('/branches')}
        />
      </div>

      {/* Operational Task Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Pending Attendance Finalizations</span>
            <span className="text-xl font-bold text-slate-900">{pendingAtt} Sessions</span>
          </div>
          <button
            onClick={() => onNavigate('/attendance')}
            className="p-2 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 text-xs font-semibold flex items-center gap-1"
          >
            Review <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Exams Pending Publication</span>
            <span className="text-xl font-bold text-slate-900">{pendingExams} Assessment</span>
          </div>
          <button
            onClick={() => onNavigate('/exams')}
            className="p-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1"
          >
            Publish <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Failed Parent Notifications</span>
            <span className="text-xl font-bold text-rose-700">{failedNotifs} Alerts</span>
          </div>
          <button
            onClick={() => onNavigate('/notifications')}
            className="p-2 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 text-xs font-semibold flex items-center gap-1"
          >
            Retry <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Activities & Branch Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Branch Performance Comparison</h3>
            <span className="text-xs text-teal-700 bg-teal-50 px-2 py-1 rounded font-medium">HYD-MAIN</span>
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Main Campus – Hyderabad</span>
                <span className="text-emerald-700">Active</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-600">
                <div>
                  <span className="block text-[10px] text-slate-400">Students</span>
                  <strong className="text-slate-900 font-bold">{students.length}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Fee Paid %</span>
                  <strong className="text-slate-900 font-bold">
                    {Math.round((totalCollected / totalAssigned) * 100)}%
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Attendance</span>
                  <strong className="text-slate-900 font-bold">96%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Institution Audit Log</h3>
            <button
              onClick={() => onNavigate('/audit')}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              View Full Audit
            </button>
          </div>
          <div className="space-y-2 text-xs">
            {auditEvents.slice(0, 4).map((ev) => (
              <div key={ev.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-900 block">{ev.action}</span>
                  <span className="text-[10px] text-slate-500">{ev.reason || ev.recordType}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(ev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
