import React from 'react';
import { dbRepository } from '@/src/services/db';
import { CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';

export const ParentAttendancePage: React.FC = () => {
  const records = dbRepository.getAttendanceRecords();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Finalized Attendance History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Child: <strong>Ravi Kumar</strong> (SVI-2026-1001) • MPC-A First Year
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-emerald-700 block">85.7%</span>
          <span className="text-[10px] text-slate-400">Approved Attendance Rate</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Attendance Log Calendar</h3>

        <div className="divide-y divide-slate-100 text-xs">
          {[
            { date: '6 Aug 2026', status: 'PRESENT', session: 'Morning & Afternoon Classes' },
            { date: '5 Aug 2026', status: 'PRESENT', session: 'Morning & Afternoon Classes' },
            { date: '4 Aug 2026', status: 'ABSENT', session: 'Unexcused Absence (WhatsApp Alert Sent)' },
            { date: '3 Aug 2026', status: 'PRESENT', session: 'Morning & Afternoon Classes' },
            { date: '2 Aug 2026', status: 'PRESENT', session: 'Morning & Afternoon Classes' },
            { date: '1 Aug 2026', status: 'PRESENT', session: 'Morning & Afternoon Classes' },
            { date: '31 Jul 2026', status: 'PRESENT', session: 'Morning & Afternoon Classes' },
          ].map((item, idx) => (
            <div key={idx} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">{item.date}</span>
                <span className="text-[11px] text-slate-500">{item.session}</span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.status === 'PRESENT'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
