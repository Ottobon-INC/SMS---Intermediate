import React, { useEffect, useState } from 'react';
import { AttendanceService } from '../services/AttendanceService';
import { AttendanceSession } from '../types';
import { Users, UserCheck, UserMinus, UserX, Clock, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { AttendanceHistoryTable } from '../components/AttendanceHistoryTable';

interface Props {
  onStartSession: () => void;
}

export const AttendanceOverviewPage: React.FC<Props> = ({ onStartSession }) => {
  const { currentUser } = useAuth();
  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';
  const [history, setHistory] = useState<AttendanceSession[]>([]);
  const [branch, setBranch] = useState('All Branches');
  const [yearLevel, setYearLevel] = useState('All Years');

  useEffect(() => {
    AttendanceService.getHistory().then(setHistory);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Header */}
      <div className="glass-panel rounded-[2rem] p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white premium-glow-indigo">
                <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Attendance Center
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed">
            Monitor real-time daily attendance, track pending reviews, and view historical sessions across the institution.
          </p>
        </div>
        
        <div className="relative z-10 w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          {isDean && (
             <>
               <select 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="px-6 py-4 bg-white/60 hover:bg-white text-slate-700 rounded-2xl text-sm font-bold transition-all border border-slate-200/50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
               >
                  <option value="All Branches">All Branches</option>
                  <option value="Visakhapatnam Campus">Visakhapatnam Campus</option>
                  <option value="Hyderabad Campus">Hyderabad Campus</option>
               </select>
               <select 
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="px-6 py-4 bg-white/60 hover:bg-white text-slate-700 rounded-2xl text-sm font-bold transition-all border border-slate-200/50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
               >
                  <option value="All Years">All Years</option>
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
               </select>
             </>
          )}
          <button
            onClick={onStartSession}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold premium-shadow transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group"
          >
            Open Daily Session
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-3 h-3 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-panel rounded-[1.5rem] p-6 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Users className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Total</h3>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">120</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-400/10 to-emerald-500/5 backdrop-blur-xl border border-emerald-100 rounded-[1.5rem] p-6 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 mb-4 text-emerald-600">
            <UserCheck className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Present</h3>
          </div>
          <p className="text-4xl font-black text-emerald-700 tracking-tight">104</p>
        </div>
        <div className="bg-gradient-to-br from-rose-400/10 to-rose-500/5 backdrop-blur-xl border border-rose-100 rounded-[1.5rem] p-6 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 mb-4 text-rose-600">
            <UserMinus className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Absent</h3>
          </div>
          <p className="text-4xl font-black text-rose-700 tracking-tight">9</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400/10 to-amber-500/5 backdrop-blur-xl border border-amber-100 rounded-[1.5rem] p-6 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 mb-4 text-amber-600">
            <UserX className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Leave</h3>
          </div>
          <p className="text-4xl font-black text-amber-700 tracking-tight">4</p>
        </div>
        <div className="bg-slate-100/50 backdrop-blur-xl border border-white/50 rounded-[1.5rem] p-6 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <Clock className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Unmarked</h3>
          </div>
          <p className="text-4xl font-black text-slate-700 tracking-tight">3</p>
        </div>
      </div>

      {/* Workflow Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-[24px] p-6 flex justify-between items-center group cursor-pointer hover:bg-white/80 transition-colors">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Draft Sessions</p>
                <p className="text-3xl font-black text-slate-700">2</p>
            </div>
            <div className="w-14 h-14 rounded-[1rem] bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-slate-400" />
            </div>
        </div>
        <div className="bg-amber-50/60 backdrop-blur-xl border border-white rounded-[24px] p-6 flex justify-between items-center group cursor-pointer hover:bg-amber-50/90 transition-colors">
            <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Awaiting Review</p>
                <p className="text-3xl font-black text-amber-700">1</p>
            </div>
            <div className="w-14 h-14 rounded-[1rem] bg-amber-100/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-amber-500" />
            </div>
        </div>
        <div className="bg-emerald-50/60 backdrop-blur-xl border border-white rounded-[24px] p-6 flex justify-between items-center group cursor-pointer hover:bg-emerald-50/90 transition-colors">
            <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Finalized Today</p>
                <p className="text-3xl font-black text-emerald-700">4</p>
            </div>
            <div className="w-14 h-14 rounded-[1rem] bg-emerald-100/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Sessions</h3>
        <AttendanceHistoryTable history={history} />
      </div>
    </div>
  );
};
