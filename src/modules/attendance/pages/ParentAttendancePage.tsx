import React from 'react';
import { Calendar, UserCheck, UserMinus, Clock } from 'lucide-react';
import { mockParentFinalizedRecords } from '../mock/data';

export const ParentAttendancePage: React.FC = () => {

  const totalDays = mockParentFinalizedRecords.length;
  const presentDays = mockParentFinalizedRecords.filter(r => r.status === 'PRESENT').length;
  const absentDays = mockParentFinalizedRecords.filter(r => r.status === 'ABSENT').length;
  const leaveDays = mockParentFinalizedRecords.filter(r => r.status === 'LEAVE').length;

  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Attendance</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">View the official finalized attendance records and statistics.</p>
            
            <div className="mt-8 p-6 bg-white/50 backdrop-blur-md rounded-[1.5rem] border border-white flex flex-wrap gap-8 shadow-sm">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Student Name</p>
                    <p className="font-black text-slate-900 text-lg">Rahul Kumar</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Academic Year</p>
                    <p className="font-bold text-slate-700 text-lg">2026-27</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year Level</p>
                    <p className="font-bold text-slate-700 text-lg">First Year</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Programme</p>
                    <p className="font-bold text-slate-700 text-lg">MPC + JEE</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Section</p>
                    <p className="font-black text-indigo-600 text-xl text-center">A</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-[2rem] p-8 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-14 h-14 bg-indigo-50 rounded-[1.25rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Attendance %</p>
            <p className="text-4xl font-black text-indigo-900 tracking-tight">{attendancePercentage}%</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 backdrop-blur-md rounded-[2rem] border border-emerald-100/50 p-8 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-14 h-14 bg-emerald-100 rounded-[1.25rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 mb-1">Present Days</p>
            <p className="text-4xl font-black text-emerald-700 tracking-tight">{presentDays}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50/80 to-rose-100/30 backdrop-blur-md rounded-[2rem] border border-rose-100/50 p-8 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-14 h-14 bg-rose-100 rounded-[1.25rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserMinus className="w-6 h-6 text-rose-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600/70 mb-1">Absent Days</p>
            <p className="text-4xl font-black text-rose-700 tracking-tight">{absentDays}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/30 backdrop-blur-md rounded-[2rem] border border-amber-100/50 p-8 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-14 h-14 bg-amber-100 rounded-[1.25rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70 mb-1">Leave Days</p>
            <p className="text-4xl font-black text-amber-700 tracking-tight">{leaveDays}</p>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 space-y-6">
          <h3 className="font-bold text-slate-900 text-lg tracking-tight border-b border-slate-200/50 pb-4">Recent Attendance History</h3>
          <div className="space-y-3">
              {mockParentFinalizedRecords.map((record, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-white/50 backdrop-blur-sm rounded-[1.5rem] border border-white hover:bg-white transition-colors group shadow-sm">
                      <div className="font-bold text-slate-900 group-hover:translate-x-1 transition-transform">{record.date}</div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                          record.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                      }`}>
                          {record.status}
                      </span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
