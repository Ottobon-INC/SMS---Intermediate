import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { AuditEvent } from '@/src/types';
import { ShieldCheck, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [auditEvents] = useState<AuditEvent[]>(() => dbRepository.getAuditEvents());
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = auditEvents.filter((a) =>
    `${a.action} ${a.recordType} ${a.reason}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Institution System Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of user creation, fee receipts, student import approvals, attendance finalization, and result publishing.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit actions, user actors, or records..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Record Type</th>
                <th className="p-3.5">Actor Role</th>
                <th className="p-3.5">Reason / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50 font-mono text-xs">
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {new Date(ev.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">{ev.action}</td>
                  <td className="p-3.5 text-slate-600">{ev.recordType}</td>
                  <td className="p-3.5">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[10px]">
                      {ev.actorRole}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans text-slate-700 text-xs">{ev.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
