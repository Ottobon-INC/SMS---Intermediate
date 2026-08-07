import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { AttendanceEntry, AttendanceSession, Student } from '@/src/types';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { CalendarCheck, CheckCircle2, AlertCircle, Clock, ShieldCheck, Check, MessageSquare, Filter } from 'lucide-react';
import { WhatsAppModal } from '@/src/modules/notifications/components/WhatsAppModal';

export const AttendanceModulePage: React.FC = () => {
  const { currentUser, triggerRefresh } = useAuth();
  const [students] = useState(() => dbRepository.getStudents());
  const [sessions, setSessions] = useState(() => dbRepository.getAttendanceSessions());
  const [records, setRecords] = useState(() => dbRepository.getAttendanceRecords());

  const [selectedSection, setSelectedSection] = useState('MPC-A');
  const [selectedDate, setSelectedDate] = useState('2026-08-06');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE'>>({});

  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';
  const isPrincipalOrDean = isDean || currentUser?.role === 'BRANCH_ADMIN';
  const branches = dbRepository.getBranches();
  const [branchFilter, setBranchFilter] = useState<string>('ALL');

  const sectionStudents = students;

  const currentSession = sessions.find(
    (s) => s.attendanceDate === selectedDate
  );

  const refreshData = () => {
    setSessions(dbRepository.getAttendanceSessions());
    setRecords(dbRepository.getAttendanceRecords());
    triggerRefresh();
  };

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const map: Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE'> = {};
    sectionStudents.forEach((s) => {
      map[s.id] = 'PRESENT';
    });
    setAttendanceMap(map);
  };

  const handleSubmitAttendance = () => {
    const expectedBranchId = isDean && branchFilter !== 'ALL' ? branchFilter : (currentUser?.branchId || 'branch-hyd-main');

    const session: AttendanceSession = {
      id: `att-session-${Date.now()}`,
      institutionId: 'inst-svic-01',
      branchId: expectedBranchId,
      academicYearId: 'year-2026',
      programmeId: 'prog-mpc',
      batchId: 'batch-mpc-2026',
      sectionId: 'sec-mpc-a',
      attendanceDate: selectedDate,
      submittedBy: currentUser?.id || 'office-1',
      status: 'SUBMITTED',
      version: 1,
    };

    dbRepository.addAttendanceSession(session);

    // Add individual records
    const entries: AttendanceEntry[] = sectionStudents.map((st) => ({
      id: `att-rec-${Date.now()}-${st.id}`,
      attendanceSessionId: session.id,
      enrollmentId: `enr-${st.id}`,
      studentId: st.id,
      status: attendanceMap[st.id] || 'PRESENT',
    }));

    dbRepository.setAttendanceEntries(session.id, entries);

    refreshData();
    alert(`Attendance for ${selectedSection} on ${selectedDate} submitted to Principal for finalization.`);
  };

  const handleFinalizeAttendance = () => {
    if (!currentSession) return;

    dbRepository.updateAttendanceSession(currentSession.id, {
      status: 'FINALIZED',
      finalizedBy: currentUser?.id || 'principal-1',
      finalizedAt: new Date().toISOString(),
    });

    // Check absent students and enqueue WhatsApp notification
    const absents = records.filter(
      (r) => r.attendanceSessionId === currentSession.id && r.status === 'ABSENT'
    );

    absents.forEach((abs) => {
      const student = students.find((s) => s.id === abs.studentId);
      if (student) {
        const waText = `Dear Parent,\n\n${student.firstName} ${student.lastName} was marked absent on ${selectedDate} at Sri Vignan Intermediate College, Main Campus.\n\nPlease contact the college office if clarification is required.`;

        dbRepository.addNotificationEvent({
          id: `notif-${Date.now()}-${student.id}`,
          institutionId: 'inst-svic-01',
          branchId: 'branch-hyd-main',
          studentId: student.id,
          guardianId: 'guard-1',
          sourceModule: 'Attendance',
          sourceRecordId: abs.id,
          recipientMobile: '9000020001',
          eventType: 'ATTENDANCE_ABSENCE',
          resolvedMessage: waText,
          status: 'DELIVERED',
          createdAt: new Date().toISOString(),
          retryCount: 0,
        });
      }
    });

    refreshData();
    alert(
      `Attendance for ${selectedSection} finalized! WhatsApp absence notifications queued for ${absents.length} absent student(s).`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Daily Attendance Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Record class section attendance, submit for review, finalize records, and send instant parent WhatsApp absence alerts.
          </p>
        </div>

        {isDean && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
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

        {currentSession?.status === 'SUBMITTED' && isPrincipalOrDean && (
          <button
            onClick={handleFinalizeAttendance}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            id="finalize-attendance-button"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-200" /> Finalize Attendance & Alert Parents
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
            >
              <option value="MPC-A">MPC-A (First Year)</option>
              <option value="MPC-B">MPC-B (First Year)</option>
              <option value="BiPC-A">BiPC-A (First Year)</option>
              <option value="CEC-A">CEC-A (First Year)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Session Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              currentSession?.status === 'FINALIZED'
                ? 'bg-emerald-100 text-emerald-800'
                : currentSession?.status === 'SUBMITTED'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {currentSession?.status || 'DRAFT (NOT SUBMITTED)'}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">
            Attendance Grid for {selectedSection} ({selectedDate})
          </h3>
          <button
            onClick={handleMarkAllPresent}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Mark All Present
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Admission No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectionStudents.map((s) => {
                const currentStatus = attendanceMap[s.id] || 'PRESENT';
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{s.admissionNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleStatusChange(s.id, 'PRESENT')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          PRESENT
                        </button>
                        <button
                          onClick={() => handleStatusChange(s.id, 'ABSENT')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          ABSENT
                        </button>
                        <button
                          onClick={() => handleStatusChange(s.id, 'LEAVE')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            currentStatus === 'LEAVE'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          LEAVE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSubmitAttendance}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Submit Class Attendance for Review
          </button>
        </div>
      </div>
    </div>
  );
};
