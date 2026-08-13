import React, { useState } from 'react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { dbRepository } from '@/src/services/db';
import { Student } from '@/src/types';
import { Modal } from '@/src/modules/core/components/Modal';
import { Users, Search, Filter, Phone, Mail, UserCheck, CalendarCheck, CreditCard, GraduationCap } from 'lucide-react';

export const StudentDirectoryPage: React.FC = () => {
  const students = dbRepository.getStudents();
  const guardians = dbRepository.getGuardians();
  const links = dbRepository.getStudentGuardianLinks();
  const enrollments = dbRepository.getEnrollments();
  const branches = dbRepository.getBranches();

  const { currentUser } = useAuth();
  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';
  const isPrincipal = currentUser?.role === 'BRANCH_ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [branchFilter, setBranchFilter] = useState<string>('ALL');

  const filteredStudents = students.filter((s) => {
    // 1. Filter by branch
    const enrollment = enrollments.find(e => e.studentId === s.id); // For MVP, assume latest enrollment
    if (isDean && branchFilter !== 'ALL') {
      if (enrollment?.branchId !== branchFilter) return false;
    } else if (!isDean && currentUser?.branchId) {
      if (enrollment?.branchId !== currentUser.branchId) return false;
    }

    // 2. Filter by search
    return `${s.firstName} ${s.lastName} ${s.admissionNumber}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const getGuardianForStudent = (st: Student) => {
    const link = links.find((l) => l.studentId === st.id);
    if (link) {
      return guardians.find((g) => g.id === link.guardianId);
    }
    return guardians[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Directory & Profiles</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enrolled student list, guardian contact info, programme allocations, and individual student ledgers.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <span className="text-xs bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200">
            Total Enrolled: {filteredStudents.length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student name, admission no..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Admission No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Gender</th>
                <th className="p-3.5">Guardian Info</th>
                <th className="p-3.5">Guardian Mobile</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const g = getGuardianForStudent(s);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{s.admissionNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="p-3.5 text-slate-600">{s.gender}</td>
                    <td className="p-3.5 text-slate-600">{g?.name || '—'}</td>
                    <td className="p-3.5 font-mono text-slate-600">{g?.mobile || '—'}</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Student Comprehensive Record" maxWidth="2xl">
          <div className="space-y-4 text-xs text-slate-700">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-xs text-teal-300 mt-0.5">
                  Admission: {selectedStudent.admissionNumber} • DOB: {selectedStudent.dateOfBirth}
                </p>
              </div>
              <span className="bg-teal-500 text-slate-950 font-bold px-3 py-1 rounded-full text-xs">
                MPC-A First Year
              </span>
            </div>

            {/* Guardian & Contact */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                Guardian Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Guardian Name:</span>
                  <strong className="text-slate-900">{getGuardianForStudent(selectedStudent)?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Relationship:</span>
                  <strong className="text-slate-900">{getGuardianForStudent(selectedStudent)?.relationship}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Mobile:</span>
                  <strong className="text-slate-900 font-mono">{getGuardianForStudent(selectedStudent)?.mobile}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Email:</span>
                  <strong className="text-slate-900 font-mono">{getGuardianForStudent(selectedStudent)?.email || '—'}</strong>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
