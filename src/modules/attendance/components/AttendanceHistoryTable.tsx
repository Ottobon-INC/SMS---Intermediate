import React from 'react';
import { AttendanceSession } from '../types';

interface Props {
  history: AttendanceSession[];
  onView?: (session: AttendanceSession) => void;
}

export const AttendanceHistoryTable: React.FC<Props> = ({ history, onView }) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
      <table className="w-full text-left text-xs text-slate-700">
        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Year</th>
            <th className="p-3">Programme</th>
            <th className="p-3">Batch</th>
            <th className="p-3">Section</th>
            <th className="p-3 text-emerald-600">Present</th>
            <th className="p-3 text-rose-600">Absent</th>
            <th className="p-3 text-amber-600">Leave</th>
            <th className="p-3">Status</th>
            <th className="p-3">Finalized By</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {history.map((session) => (
            <tr key={session.id} className="hover:bg-slate-50">
              <td className="p-3 font-bold text-slate-900">{session.context.date}</td>
              <td className="p-3 text-slate-600">{session.context.yearLevel}</td>
              <td className="p-3 text-slate-600">{session.context.programme}</td>
              <td className="p-3 text-slate-600">{session.context.batch}</td>
              <td className="p-3 text-slate-600 text-center font-bold">{session.context.section}</td>
              <td className="p-3 font-semibold text-emerald-600">{session.summary.present}</td>
              <td className="p-3 font-semibold text-rose-600">{session.summary.absent}</td>
              <td className="p-3 font-semibold text-amber-600">{session.summary.leave}</td>
              <td className="p-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    session.status === 'FINALIZED' ? 'bg-emerald-100 text-emerald-800' :
                    session.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                }`}>
                    {session.status}
                </span>
              </td>
              <td className="p-3 text-slate-500">{session.finalizedBy || '—'}</td>
              <td className="p-3">
                  <button 
                    onClick={() => onView && onView(session)}
                    className="text-indigo-600 font-semibold text-[11px] hover:underline"
                  >
                      View
                  </button>
              </td>
            </tr>
          ))}
          {history.length === 0 && (
              <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 font-medium">
                      No attendance history found.
                  </td>
              </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
