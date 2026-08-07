import React from 'react';
import { dbRepository } from '@/src/services/db';
import { CreditCard, Printer, CheckCircle2 } from 'lucide-react';

export const ParentFeesPage: React.FC = () => {
  const payments = dbRepository.getFeePayments().filter((p) => p.studentId === 'student-1');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Fee Ledger & Receipts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Child: <strong>Ravi Kumar</strong> (SVI-2026-1001) • MPC-A First Year
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-amber-800 block">₹12,500</span>
          <span className="text-[10px] text-slate-400">Balance Due on 15 Aug 2026</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Payment Receipts History</h3>

        <div className="divide-y divide-slate-100 text-xs">
          {payments.map((p) => (
            <div key={p.id} className="py-4 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block text-sm">{p.receiptNumber}</span>
                <span className="text-[11px] text-slate-500">
                  Paid via {p.paymentMode} ({p.referenceNumber}) on {p.paymentDate}
                </span>
              </div>

              <div className="text-right space-y-1">
                <strong className="text-base font-extrabold text-emerald-700 block">
                  ₹{p.amount.toLocaleString('en-IN')}
                </strong>
                <button
                  onClick={() => alert(`Receipt ${p.receiptNumber} printed.`)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                >
                  <Printer className="w-3 h-3" /> Download Receipt PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
