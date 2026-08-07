import React, { useState } from 'react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { dbRepository } from '@/src/services/db';
import { User, UserRole } from '@/src/types';
import { Modal } from '@/src/modules/core/components/Modal';
import { UserPlus, Key, ShieldCheck, CheckCircle2, Lock, UserX, UserCheck } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { currentUser, triggerRefresh } = useAuth();
  const [users, setUsers] = useState<User[]>(() => dbRepository.getUsers());
  const [students] = useState(() => dbRepository.getStudents());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdUserCreds, setCreatedUserCreds] = useState<{ user: User; pass: string } | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<UserRole>('OFFICE_STAFF');
  const [selectedStudentId, setSelectedStudentId] = useState('student-1');

  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';
  const isPrincipal = currentUser?.role === 'BRANCH_ADMIN';

  // Branch filtering for Principal
  const displayedUsers = isPrincipal
    ? users.filter((u) => u.branchId === currentUser?.branchId)
    : users;

  const refreshUsers = () => {
    setUsers(dbRepository.getUsers());
    triggerRefresh();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tempPass = 'Demo@123';
      const newUser: User = {
        id: `user-${Date.now()}`,
        institutionId: currentUser?.institutionId || 'inst-svic-01',
        branchId: currentUser?.branchId || 'branch-hyd-main',
        fullName,
        email,
        mobile,
        role,
        status: 'ACTIVE',
        temporaryPassword: tempPass,
        linkedGuardianId: role === 'PARENT_GUARDIAN' ? 'guard-1' : undefined,
        createdBy: currentUser?.id || 'SYSTEM',
        createdAt: new Date().toISOString(),
      };

      dbRepository.addUser(newUser, currentUser?.role, currentUser?.branchId);

      // Audit Event
      dbRepository.addAuditEvent({
        id: `audit-${Date.now()}`,
        institutionId: newUser.institutionId,
        branchId: newUser.branchId,
        actorUserId: currentUser?.id || 'SYSTEM',
        actorRole: currentUser?.role || 'INSTITUTION_ADMIN',
        action: 'USER_CREATED',
        recordType: 'User',
        recordId: newUser.id,
        newStatus: 'ACTIVE',
        reason: `Created ${role} account for ${fullName}`,
        createdAt: new Date().toISOString(),
      });

      refreshUsers();
      setShowCreateModal(false);
      setCreatedUserCreds({ user: newUser, pass: tempPass });

      // Reset Form
      setFullName('');
      setEmail('');
      setMobile('');
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = (user: User) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      dbRepository.updateUser(user.id, { status: newStatus }, currentUser?.role, currentUser?.branchId);
      refreshUsers();
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const handleResetPassword = (user: User) => {
    try {
      const newPass = 'Demo@123';
      dbRepository.updateUser(user.id, { temporaryPassword: newPass }, currentUser?.role, currentUser?.branchId);
      refreshUsers();
      alert(`Temporary password for ${user.fullName} reset to: ${newPass}`);
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User & Account Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Dean, Principal, Office Staff, and Parent Portal logins with role-based permissions.
          </p>
        </div>

        {(isDean || isPrincipal) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
            id="create-user-button"
          >
            <UserPlus className="w-4 h-4 text-teal-400" /> Create Account
          </button>
        )}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">Total System Users ({displayedUsers.length})</span>
          <span className="text-slate-400">Main Campus – Hyderabad</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Email / Mobile</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Temporary Pass</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{u.fullName}</td>
                  <td className="p-3.5">
                    <span className="block text-slate-800 font-mono text-[11px]">{u.email}</span>
                    <span className="text-[10px] text-slate-400">{u.mobile}</span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === 'INSTITUTION_ADMIN'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : u.role === 'BRANCH_ADMIN'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : u.role === 'OFFICE_STAFF'
                          ? 'bg-teal-100 text-teal-800 border-teal-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">
                    {u.temporaryPassword || '••••••••'}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleResetPassword(u)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium"
                      title="Reset Temporary Password"
                    >
                      Reset Pass
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Application Account">
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@demo-college.in"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
            <input
              type="text"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 90000 12345"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              {isDean && <option value="BRANCH_ADMIN">Principal / Campus Admin</option>}
              <option value="OFFICE_STAFF">Office Staff / Class Teacher</option>
              <option value="PARENT_GUARDIAN">Parent / Guardian</option>
            </select>
          </div>

          {role === 'PARENT_GUARDIAN' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Link to Enrolled Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.firstName} {st.lastName} ({st.admissionNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-xs hover:bg-slate-800"
            >
              Create Demo Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Account Confirmation Modal */}
      {createdUserCreds && (
        <Modal
          isOpen={!!createdUserCreds}
          onClose={() => setCreatedUserCreds(null)}
          title="Account Creation Confirmation"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Account created successfully! Credentials display once for confirmation.</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <strong className="text-slate-900">{createdUserCreds.user.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Login Email:</span>
                <strong className="text-slate-900">{createdUserCreds.user.email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role:</span>
                <strong className="text-teal-700">{createdUserCreds.user.role}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Temporary Password:</span>
                <strong className="text-rose-700 bg-white px-2 py-0.5 rounded border border-slate-300">
                  {createdUserCreds.pass}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setCreatedUserCreds(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl"
            >
              Done & Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
