import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { Branch, Programme, Subject, User, BranchCourseOffering, BranchSubjectOffering } from '@/src/types';
import { Building, GitBranch, BookOpen, Plus, X, CheckCircle2, ShieldCheck, UserCircle, Layers, BookMarked } from 'lucide-react';

export const InstitutionSetupPage: React.FC = () => {
  const { currentUser } = useAuth();
  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';

  const institution = dbRepository.getInstitution();
  const [branches, setBranches] = useState<Branch[]>(() => dbRepository.getBranches());
  const [programmes, setProgrammes] = useState<Programme[]>(() => dbRepository.getProgrammes());
  const [subjects, setSubjects] = useState<Subject[]>(() => dbRepository.getSubjects());
  const [users, setUsers] = useState<User[]>(() => dbRepository.getUsers());

  // Modals
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAssignPrincipalModal, setShowAssignPrincipalModal] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Subject Form State (Dean Only)
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectProgrammeId, setSubjectProgrammeId] = useState(programmes[0]?.id || 'prog-mpc');
  const [subjectMaxMarks, setSubjectMaxMarks] = useState<number>(100);
  const [subjectPassMarks, setSubjectPassMarks] = useState<number>(35);

  // Branch Form
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  // Group / Programme Form
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [yearLevel, setYearLevel] = useState<'First Year' | 'Second Year'>('First Year');
  const [groupSubjectIds, setGroupSubjectIds] = useState<string[]>([]);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchCode.trim()) return;

    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      institutionId: institution.id,
      name: branchName.trim(),
      code: branchCode.trim().toUpperCase(),
      phone: branchPhone.trim() || '+91 9876543210',
      address: branchAddress.trim() || 'Hyderabad Campus, Telangana',
      status: 'ACTIVE',
    };

    dbRepository.addBranch(newBranch);
    setBranches(dbRepository.getBranches());
    setShowAddBranchModal(false);

    // Reset Form
    setBranchName('');
    setBranchCode('');
    setBranchPhone('');
    setBranchAddress('');

    triggerNotify(`New Branch "${newBranch.name}" created successfully!`);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !groupCode.trim()) return;

    const newGroup: Programme = {
      id: `prog-${Date.now()}`,
      institutionId: institution.id,
      name: groupName.trim(),
      code: groupCode.trim().toUpperCase(),
      yearLevel: yearLevel,
      subjectIds: groupSubjectIds,
      status: 'ACTIVE',
    };

    dbRepository.addProgramme(newGroup);
    setProgrammes(dbRepository.getProgrammes());
    setShowAddGroupModal(false);

    // Reset Form
    setGroupName('');
    setGroupCode('');
    setGroupSubjectIds([]);
    setYearLevel('First Year');

    triggerNotify(`New Academic Group "${newGroup.name}" added successfully!`);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectCode.trim()) return;

    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      institutionId: institution.id,
      programmeId: subjectProgrammeId,
      name: subjectName.trim(),
      code: subjectCode.trim().toUpperCase(),
      maxMarks: Number(subjectMaxMarks) || 100,
      passMarks: Number(subjectPassMarks) || 35,
      status: 'ACTIVE',
    };

    dbRepository.addSubject(newSubject);
    setSubjects(dbRepository.getSubjects());
    setShowAddSubjectModal(false);

    // Reset Form
    setSubjectName('');
    setSubjectCode('');
    setSubjectMaxMarks(100);
    setSubjectPassMarks(35);

    triggerNotify(`Master Subject "${newSubject.name}" created by Dean successfully!`);
  };

  const handleAssignPrincipal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !selectedUserId) return;
    const userToUpdate = users.find(u => u.id === selectedUserId);
    if (userToUpdate) {
      // Find if anyone else is principal of this branch, if so demote them to staff
      const currentPrincipal = users.find(u => u.role === 'BRANCH_ADMIN' && u.branchId === selectedBranchId);
      if (currentPrincipal && currentPrincipal.id !== userToUpdate.id) {
        const confirmDemotion = window.confirm(`A Principal (${currentPrincipal.firstName} ${currentPrincipal.lastName}) already exists for this branch. Assigning a new one will demote them to OFFICE STAFF. Do you want to proceed?`);
        if (!confirmDemotion) return;
        
        dbRepository.updateUser(currentPrincipal.id, { role: 'OFFICE_STAFF' });
      }
      
      dbRepository.updateUser(userToUpdate.id, { role: 'BRANCH_ADMIN', branchId: selectedBranchId });
      setUsers(dbRepository.getUsers());
      setShowAssignPrincipalModal(false);
      setSelectedBranchId(null);
      setSelectedUserId('');
      triggerNotify(`Principal assigned successfully.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Institution & Academic Structure Setup</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure campuses, academic terms, streams (MPC, BiPC, CEC), and Board of Intermediate Education guidelines.
          </p>
        </div>

        {isDean && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddBranchModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
              id="dean-add-branch-button"
            >
              <Plus className="w-4 h-4" /> Add Branch
            </button>
            <button
              onClick={() => setShowAddGroupModal(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
              id="dean-add-group-button"
            >
              <Plus className="w-4 h-4" /> Add Group
            </button>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
              id="dean-add-subject-button"
            >
              <Plus className="w-4 h-4" /> Add Master Subject
            </button>
          </div>
        )}
      </div>

      {/* Institution Info Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Building className="w-4 h-4 text-purple-600" /> Institution Metadata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px]">Institution Name:</span>
            <strong className="text-slate-900 font-sans">{institution.name}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Short Code:</span>
            <strong className="text-slate-900">{institution.code}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Board Affiliation:</span>
            <strong className="text-slate-900 font-sans">{institution.board}</strong>
          </div>
        </div>
      </div>

      {/* Active Campuses */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-600" /> Active Campus Branches ({branches.length})
          </h3>
          {isDean && (
            <button
              onClick={() => setShowAddBranchModal(true)}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Branch
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {branches.map((b) => {
            const assignedPrincipal = users.find(u => u.role === 'BRANCH_ADMIN' && u.branchId === b.id);
            return (
              <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-start text-xs space-y-1">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{b.name}</span>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Code: <strong className="text-slate-700">{b.code}</strong> • Phone: {b.phone}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Address: {b.address}</p>
                  <div className="mt-3 flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg border border-slate-200 w-fit">
                    <UserCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Principal:</span>
                    {assignedPrincipal ? (
                      <span className="text-xs font-bold text-indigo-700">{assignedPrincipal.id} - {assignedPrincipal.fullName}</span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600">Unassigned</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] shrink-0">
                    {b.status}
                  </span>
                  {isDean && (
                    <button
                      onClick={() => {
                        setSelectedBranchId(b.id);
                        setSelectedUserId(assignedPrincipal?.id || '');
                        setShowAssignPrincipalModal(true);
                      }}
                      className="text-[10px] px-2.5 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-bold transition-colors"
                    >
                      Assign
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Academic Groups / Streams */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" /> Academic Streams & Groups ({programmes.length})
          </h3>
          {isDean && (
            <button
              onClick={() => setShowAddGroupModal(true)}
              className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Group
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {programmes.map((p) => (
            <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 text-sm block">{p.name}</span>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 font-mono font-bold text-[10px] rounded">
                  {p.code}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">Level: {p.yearLevel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Master Subjects Catalog (Dean Only Setup) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-purple-600" /> Institutional Master Subjects Catalog ({subjects.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Master subjects defined by Dean & Management across programmes.</p>
          </div>
          {isDean && (
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1"
              id="dean-catalog-add-subject-button"
            >
              <Plus className="w-3.5 h-3.5" /> New Subject
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {subjects.map((sub) => {
            const prog = programmes.find(p => p.id === sub.programmeId);
            return (
              <div key={sub.id} className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 text-sm block">{sub.name}</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-mono font-bold text-[10px] rounded">
                    {sub.code}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">Programme: <strong className="text-slate-700">{prog?.code || sub.programmeId}</strong></p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600 font-mono">
                  <span>Default Max: <strong>{sub.maxMarks}</strong></span>
                  <span>Pass: <strong>{sub.passMarks}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD BRANCH */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Campus Branch</h3>
                  <p className="text-xs text-slate-500">Add a new college campus under {institution.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBranchModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VEI - Gachibowli Campus"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Short Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VEI-GC"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus Address</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Plot No 42, Gachibowli Main Road, Hyderabad"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ACADEMIC GROUP / COMBINATION */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Academic Group / Stream</h3>
                  <p className="text-xs text-slate-500">Define a subject group or specialization</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Group Name / Subjects *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MPC (Maths, Physics, Chemistry)"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Group Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MPC or CEC"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year Level</label>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value as 'First Year' | 'Second Year')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                  </select>
                </div>
              </div>

              {/* Bottom-Up Master Subject Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Master Subjects from Catalog</label>
                <p className="text-[11px] text-slate-500 mb-2">Select master subjects that form this stream/combination.</p>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 max-h-44 overflow-y-auto space-y-1.5">
                  {subjects.map((sub) => {
                    const isSelected = groupSubjectIds.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isSelected ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGroupSubjectIds([...groupSubjectIds, sub.id]);
                              } else {
                                setGroupSubjectIds(groupSubjectIds.filter((id) => id !== sub.id));
                              }
                            }}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span>{sub.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{sub.code}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 shadow-sm"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN PRINCIPAL */}
      {showAssignPrincipalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assign Principal</h3>
                  <p className="text-xs text-slate-500">Select a user to act as BRANCH_ADMIN</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignPrincipalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPrincipal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select User *</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="" disabled>-- Select a user --</option>
                  {users.filter(u => u.role !== 'INSTITUTION_ADMIN' && u.role !== 'STUDENT' && u.role !== 'GUARDIAN').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.role})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-2">
                  Selecting a user will promote them to BRANCH_ADMIN for this campus and demote the current principal (if any) to STAFF.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignPrincipalModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MASTER SUBJECT (DEAN ONLY) */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Master Subject</h3>
                  <p className="text-xs text-slate-500">Dean / Higher-Up governance setup</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics 1A or Physics Practical"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MATH-1A"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Programme *</label>
                  <select
                    value={subjectProgrammeId}
                    onChange={(e) => setSubjectProgrammeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {programmes.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} ({p.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Max Marks</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={subjectMaxMarks}
                    onChange={(e) => setSubjectMaxMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Pass Marks</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={subjectPassMarks}
                    onChange={(e) => setSubjectPassMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
                👑 <strong>Dean Governance:</strong> Subject created here becomes part of the institutional master catalog and can be assigned to campus offerings.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-sm"
                >
                  Create Master Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


