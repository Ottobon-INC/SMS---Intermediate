import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { FeeAssignment, FeePayment, Student } from '@/src/types';
import { Modal } from '@/src/modules/core/components/Modal';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { CreditCard, Plus, Receipt, Printer, CheckCircle2, MessageSquare, Download, Filter } from 'lucide-react';
import { WhatsAppModal } from '@/src/modules/notifications/components/WhatsAppModal';

export const FeesModulePage: React.FC = () => {
  const { currentUser, triggerRefresh } = useAuth();
  const [feeAssignments, setFeeAssignments] = useState<FeeAssignment[]>(() => dbRepository.getFeeAssignments());
  const [payments, setPayments] = useState<FeePayment[]>(() => dbRepository.getFeePayments());
  const students = dbRepository.getStudents();
  const branches = dbRepository.getBranches();

  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';
  const isPrincipal = currentUser?.role === 'BRANCH_ADMIN';
  const [branchFilter, setBranchFilter] = useState<string>('ALL');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);
  const [showWaPreview, setShowWaPreview] = useState(false);
  const [waMessageText, setWaMessageText] = useState('');

  // Payment Form state
  const [payStudentId, setPayStudentId] = useState('student-1');
  const [payAmount, setPayAmount] = useState<number>(10000);
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI' | 'NET_BANKING' | 'CHEQUE'>('UPI');
  const [payRefNo, setPayRefNo] = useState('UPI-2026-991823');

  // Assign Fee Form state
  const [feeTitle, setFeeTitle] = useState('Term 2 Tuition Fee');
  const [feeAmount, setFeeAmount] = useState<number>(15000);
  const [feeDueDate, setFeeDueDate] = useState('2026-09-15');
  const [assignTarget, setAssignTarget] = useState<'SECTION' | 'STUDENT'>('SECTION');
  const [targetSection, setTargetSection] = useState('MPC-A');

  const refreshData = () => {
    setFeeAssignments(dbRepository.getFeeAssignments());
    setPayments(dbRepository.getFeePayments());
    triggerRefresh();
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === payStudentId);
    if (!student) return;

    const receiptNo = `SVI-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPayment: FeePayment = {
      id: `pay-${Date.now()}`,
      institutionId: 'inst-svic-01',
      branchId: 'branch-hyd-main',
      feeAssignmentId: 'fee-1',
      studentId: student.id,
      amount: payAmount,
      paymentMode: 'UPI',
      referenceNumber: payRefNo,
      receiptNumber: receiptNo,
      recordedBy: currentUser?.id || 'office-1',
      paymentDate: '2026-08-06',
      notes: 'Fee payment received at college accounts desk',
      createdAt: new Date().toISOString(),
    };

    dbRepository.addFeePayment(newPayment);

    // Audit Event
    dbRepository.addAuditEvent({
      id: `audit-${Date.now()}`,
      institutionId: 'inst-svic-01',
      branchId: 'branch-hyd-main',
      actorUserId: currentUser?.id || 'office-1',
      actorRole: currentUser?.role || 'OFFICE_STAFF',
      action: 'FEE_PAYMENT_RECORDED',
      recordType: 'FeePayment',
      recordId: newPayment.id,
      reason: `Recorded payment of ₹${payAmount} for ${student.firstName} ${student.lastName} (Receipt ${receiptNo})`,
      createdAt: new Date().toISOString(),
    });

    // Enqueue WhatsApp notification
    const waText = `Dear Parent,\n\nA payment of ₹${payAmount.toLocaleString(
      'en-IN'
    )} has been recorded for ${student.firstName} ${
      student.lastName
    }.\n\nReceipt: ${receiptNo}\nMethod: UPI\n\nRegards,\nSri Vignan Intermediate College`;

    dbRepository.addNotificationEvent({
      id: `notif-${Date.now()}`,
      institutionId: 'inst-svic-01',
      branchId: 'branch-hyd-main',
      studentId: student.id,
      guardianId: 'guard-1',
      sourceModule: 'Fees',
      sourceRecordId: newPayment.id,
      recipientMobile: '9000020001',
      eventType: 'PAYMENT_CONFIRMATION',
      resolvedMessage: waText,
      status: 'DELIVERED',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });

    refreshData();
    setShowPaymentModal(false);
    setSelectedReceipt(newPayment);
    setWaMessageText(waText);
  };

  const handleAssignFee = (e: React.FormEvent) => {
    e.preventDefault();
    let targetStudents = students;

    targetStudents.forEach((st) => {
      const assignment: FeeAssignment = {
        id: `fee-${Date.now()}-${st.id}`,
        institutionId: 'inst-svic-01',
        branchId: 'branch-hyd-main',
        enrollmentId: `enr-${st.id}`,
        studentId: st.id,
        feeStructureId: 'struct-1',
        description: feeTitle,
        assignedAmount: feeAmount,
        paidAmount: 0,
        balanceAmount: feeAmount,
        dueDate: feeDueDate,
        createdBy: currentUser?.id || 'dean-1',
        status: 'UNPAID',
        createdAt: new Date().toISOString(),
      };
      dbRepository.addFeeAssignment(assignment);
    });

    refreshData();
    setShowAssignModal(false);
    alert(`Assigned fee "${feeTitle}" (₹${feeAmount}) to ${targetStudents.length} student(s).`);
  };

  const filteredFeeAssignments = feeAssignments.filter((f) => {
    if (isDean && branchFilter !== 'ALL') {
      return f.branchId === branchFilter;
    } else if (!isDean && currentUser?.branchId) {
      return f.branchId === currentUser.branchId;
    }
    return true;
  });

  const filteredPayments = payments.filter((p) => {
    if (isDean && branchFilter !== 'ALL') {
      return p.branchId === branchFilter;
    } else if (!isDean && currentUser?.branchId) {
      return p.branchId === currentUser.branchId;
    }
    return true;
  });

  const totalAssigned = filteredFeeAssignments.reduce((acc, f) => acc + f.assignedAmount, 0);
  const totalCollected = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fee Ledgers & Receipts Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign tuition fees, record offline/digital payments, generate official receipts, and trigger WhatsApp notifications.
          </p>
        </div>

        <div className="flex gap-2">
          {isDean && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 mr-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-600" /> Assign Fee Structure
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            id="collect-fee-button"
          >
            <CreditCard className="w-4 h-4 text-teal-400" /> Collect Fee & Issue Receipt
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Assigned Fees</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹{totalAssigned.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Academic Year 2026–2027</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Collected Amount</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">
            {filteredPayments.length} Receipts Issued
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Outstanding Balance</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            ₹{(totalAssigned - totalCollected).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-amber-600 font-semibold mt-0.5 block">Pending Collection</span>
        </div>
      </div>

      {/* Payment Receipts History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800">Recent Payment Receipts ({filteredPayments.length})</span>
          <span className="text-slate-400">Official Institution Receipts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Receipt No</th>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Amount Paid</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Ref No</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const st = students.find((s) => s.id === p.studentId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{p.receiptNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {st?.firstName} {st?.lastName} ({st?.admissionNumber})
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{p.transactionRef}</td>
                    <td className="p-3.5 text-slate-500">{p.paymentDate}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium flex items-center gap-1 inline-flex"
                      >
                        <Printer className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Fee Payment & Issue Receipt">
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Enrolled Student</label>
            <select
              value={payStudentId}
              onChange={(e) => setPayStudentId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName} ({st.admissionNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹)</label>
            <input
              type="number"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="CASH">Cash Desk</option>
                <option value="NET_BANKING">Net Banking / NEFT</option>
                <option value="CHEQUE">Cheque / DD</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Cheque No</label>
              <input
                type="text"
                required
                value={payRefNo}
                onChange={(e) => setPayRefNo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl leading-relaxed">
            ✨ Submitting this payment automatically generates an official receipt and triggers a WhatsApp payment confirmation alert to the parent's mobile number.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-xs hover:bg-slate-800"
            >
              Confirm Payment & Issue Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Fee Structure Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign New Fee Structure">
        <form onSubmit={handleAssignFee} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fee Title / Head</label>
            <input
              type="text"
              required
              value={feeTitle}
              onChange={(e) => setFeeTitle(e.target.value)}
              placeholder="e.g. Term 2 Tuition Fee"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Amount (₹)</label>
              <input
                type="number"
                required
                value={feeAmount}
                onChange={(e) => setFeeAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={feeDueDate}
                onChange={(e) => setFeeDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assignment Target</label>
            <select
              value={assignTarget}
              onChange={(e) => setAssignTarget(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              <option value="SECTION">Entire Academic Section</option>
              <option value="STUDENT">Single Student</option>
            </select>
          </div>

          {assignTarget === 'SECTION' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Section</label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="MPC-A">MPC-A</option>
                <option value="MPC-B">MPC-B</option>
                <option value="BiPC-A">BiPC-A</option>
                <option value="CEC-A">CEC-A</option>
              </select>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
            >
              Assign Fee Head
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Fee Receipt Printable Modal */}
      {selectedReceipt && (
        <Modal isOpen={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} title="Official College Fee Receipt" maxWidth="lg">
          <div className="space-y-4 p-4 bg-white border border-slate-300 rounded-2xl font-sans text-xs">
            <div className="text-center border-b border-slate-300 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">SRI VIGNAN INTERMEDIATE COLLEGE</h2>
              <p className="text-[10px] text-slate-500">Main Campus, Hyderabad • Tel: +91 40 2345 6789</p>
              <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-300 inline-block mt-2">
                FEE PAYMENT RECEIPT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Receipt No:</span>
                <strong className="text-slate-900">{selectedReceipt.receiptNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Date:</span>
                <strong className="text-slate-900">{selectedReceipt.paymentDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Method:</span>
                <strong className="text-slate-900">{selectedReceipt.paymentMethod}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Txn Ref:</span>
                <strong className="text-slate-900">{selectedReceipt.transactionRef}</strong>
              </div>
            </div>

            <div className="border-t border-b border-slate-200 py-3 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-700">Total Paid Amount:</span>
              <strong className="text-xl font-extrabold text-emerald-800">
                ₹{selectedReceipt.amount.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setShowWaPreview(true)}
                className="px-3 py-2 bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Mobile Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Official Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* WhatsApp Modal */}
      {showWaPreview && (
        <WhatsAppModal
          isOpen={showWaPreview}
          onClose={() => setShowWaPreview(false)}
          customMessage={waMessageText}
          studentName="Ravi Kumar"
          guardianName="Mrs. Lakshmi Kumar"
        />
      )}
    </div>
  );
};
