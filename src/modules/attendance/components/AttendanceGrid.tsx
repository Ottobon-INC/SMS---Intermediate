import React, { useState } from 'react';
import { StudentAttendanceRecord, AttendanceStatus, NotificationStatus } from '../types';
import { Search } from 'lucide-react';

interface Props {
  students: StudentAttendanceRecord[];
  onStatusChange: (studentId: string, status: AttendanceStatus | null) => void;
  onNoteChange: (studentId: string, note: string) => void;
  readOnly?: boolean;
}

export const AttendanceGrid: React.FC<Props> = ({ students, onStatusChange, onNoteChange, readOnly = false }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LEAVE' | 'UNMARKED'>('ALL');

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.studentName.toLowerCase().includes(search.toLowerCase()) || 
                          s.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(search.toLowerCase());
                          
    let matchesFilter = true;
    if (filter === 'PRESENT') matchesFilter = s.status === 'PRESENT';
    if (filter === 'ABSENT') matchesFilter = s.status === 'ABSENT';
    if (filter === 'LEAVE') matchesFilter = s.status === 'LEAVE';
    if (filter === 'UNMARKED') matchesFilter = s.status === null;
    
    return matchesSearch && matchesFilter;
  });

  const getAlertBadge = (status?: NotificationStatus) => {
      if (!status) return null;
      
      const colors = {
          'PENDING': 'bg-slate-100 text-slate-600',
          'QUEUED': 'bg-blue-100 text-blue-700',
          'SENT': 'bg-indigo-100 text-indigo-700',
          'DELIVERED': 'bg-emerald-100 text-emerald-800',
          'FAILED': 'bg-rose-100 text-rose-800'
      };
      
      return (
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${colors[status]}`}>
              {status}
          </span>
      );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="flex-1 relative group">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Search by name, roll no, or admission no..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
            />
        </div>
        <div className="relative">
            <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-6 py-3.5 bg-white/50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm appearance-none"
            >
                <option value="ALL">All Students</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LEAVE">Leave</option>
                <option value="UNMARKED">Unmarked</option>
            </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-slate-200/60 bg-white/40 backdrop-blur-md custom-scrollbar">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50/80 backdrop-blur-md text-slate-500 font-semibold uppercase tracking-widest text-[10px] border-b border-slate-200/60">
            <tr>
              <th className="p-4 w-16 text-center font-bold">Roll</th>
              <th className="p-4 font-bold">Student</th>
              <th className="p-4 w-64 text-center font-bold">Status</th>
              <th className="p-4 min-w-[200px] font-bold">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {filteredStudents.map((student) => (
              <tr key={student.id} className={`hover:bg-white/80 transition-colors group ${student.previousStatus ? 'bg-amber-50/40' : ''}`}>
                <td className="p-4 text-center">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mx-auto group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {student.rollNumber}
                    </span>
                </td>
                <td className="p-4">
                    <div className="font-bold text-slate-900 tracking-tight">{student.studentName}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] font-semibold text-slate-400">{student.admissionNumber}</span>
                        {student.status === 'ABSENT' && getAlertBadge(student.notificationStatus)}
                    </div>
                    {student.previousStatus && (
                        <div className="mt-2 text-[10px] text-amber-700 bg-amber-100/60 inline-flex items-center px-2 py-1 rounded-md font-medium">
                            Corrected from: <strong className="ml-1 uppercase tracking-wider">{student.previousStatus}</strong>
                        </div>
                    )}
                </td>
                <td className="p-4">
                  {/* Premium Segmented Control for P/A/L */}
                  <div className="flex items-center justify-center p-1 bg-slate-100/80 rounded-2xl shadow-inner border border-slate-200/50">
                    <button
                      onClick={() => !readOnly && onStatusChange(student.id, 'PRESENT')}
                      disabled={readOnly}
                      className={`flex-1 py-2 px-3 rounded-[12px] font-black text-xs transition-all duration-300 ${
                        student.status === 'PRESENT'
                          ? 'bg-emerald-500 text-white premium-glow-emerald scale-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 scale-95 disabled:opacity-50'
                      }`}
                    >
                      P
                    </button>
                    <button
                      onClick={() => !readOnly && onStatusChange(student.id, 'ABSENT')}
                      disabled={readOnly}
                      className={`flex-1 py-2 px-3 rounded-[12px] font-black text-xs transition-all duration-300 ${
                        student.status === 'ABSENT'
                          ? 'bg-rose-500 text-white premium-glow-rose scale-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 scale-95 disabled:opacity-50'
                      }`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => !readOnly && onStatusChange(student.id, 'LEAVE')}
                      disabled={readOnly}
                      className={`flex-1 py-2 px-3 rounded-[12px] font-black text-xs transition-all duration-300 ${
                        student.status === 'LEAVE'
                          ? 'bg-amber-500 text-white premium-shadow scale-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 scale-95 disabled:opacity-50'
                      }`}
                    >
                      L
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={student.note}
                    onChange={(e) => onNoteChange(student.id, e.target.value)}
                    placeholder="Optional note..."
                    disabled={readOnly}
                    className="w-full px-4 py-2 bg-white/50 border border-slate-200/60 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white disabled:opacity-50 disabled:bg-transparent transition-all shadow-sm"
                  />
                  {student.correctionReason && (
                      <div className="mt-2 text-[10px] text-slate-500 font-medium">
                          <span className="font-bold text-slate-700">Reason:</span> {student.correctionReason}
                      </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500 font-medium">
                        No students match the current filter or search.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
