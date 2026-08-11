import React, { useEffect, useState } from 'react';
import { ImportHistoryRecord } from '../types';
import { StudentImportsService } from '../services/StudentImportsService';

export const ImportHistoryTable: React.FC = () => {
  const [history, setHistory] = useState<ImportHistoryRecord[]>([]);

  useEffect(() => {
    StudentImportsService.getHistory().then(setHistory);
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-900 text-sm">Import History</h3>
      
      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-3">Batch ID</th>
              <th className="p-3">Filename</th>
              <th className="p-3">Branch</th>
              <th className="p-3">Academic Year</th>
              <th className="p-3">Uploaded By</th>
              <th className="p-3">Uploaded At</th>
              <th className="p-3">Total Rows</th>
              <th className="p-3">Valid</th>
              <th className="p-3">Rejected</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-slate-900">{record.batchId}</td>
                <td className="p-3 font-semibold text-slate-800">{record.filename}</td>
                <td className="p-3 text-slate-600">{record.branch}</td>
                <td className="p-3 text-slate-600">{record.academicYear}</td>
                <td className="p-3 text-slate-600">{record.uploadedBy}</td>
                <td className="p-3 text-slate-600">{new Date(record.uploadedAt).toLocaleString()}</td>
                <td className="p-3 font-bold text-slate-700">{record.totalRows}</td>
                <td className="p-3 font-semibold text-emerald-600">{record.valid}</td>
                <td className="p-3 font-semibold text-rose-600">{record.rejected}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      record.status === 'IMPORTED' || record.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : record.status === 'VALIDATED' || record.status === 'SUBMITTED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
                <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500 font-medium">
                        No import history found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
