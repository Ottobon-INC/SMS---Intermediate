import React, { useState } from 'react';
import {
  Database,
  RotateCcw,
  Users,
  Download,
  Key,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Layers,
  Check,
} from 'lucide-react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { Modal } from '@/src/modules/core/components/Modal';
import { UserRole } from '@/src/types';
import * as XLSX from 'xlsx';

export const DemoUtilities: React.FC<{ onNavigateToImport?: () => void }> = ({ onNavigateToImport }) => {
  const { currentUser, loginAsRole, resetAllDemoData, dataMode } = useAuth();
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'admission_number',
      'student_first_name',
      'student_last_name',
      'gender',
      'date_of_birth',
      'mobile_number',
      'guardian_name',
      'guardian_relationship',
      'guardian_mobile',
      'guardian_email',
      'branch_code',
      'academic_year',
      'year_level',
      'programme',
      'batch',
      'section',
      'roll_number',
      'admission_status',
    ];

    const sampleRows = [
      [
        'VEI-2026-1001',
        'Ravi',
        'Kumar',
        'Male',
        '15-06-2009',
        '9000010001',
        'Lakshmi Kumar',
        'Mother',
        '9000020001',
        'parent@demo-college.in',
        'HYD-MAIN',
        '2026-2027',
        'First Year',
        'MPC',
        'MPC First Year',
        'MPC-A',
        'MPC-A-01',
        'ACTIVE',
      ],
      [
        'VEI-2026-1002',
        'Priya',
        'Sharma',
        'Female',
        '02-09-2009',
        '9000010002',
        'Meena Sharma',
        'Mother',
        '9000020002',
        'meena@example.in',
        'HYD-MAIN',
        '2026-2027',
        'First Year',
        'MPC',
        'MPC First Year',
        'MPC-A',
        'MPC-A-02',
        'ACTIVE',
      ],
      [
        'VEI-2026-1003',
        'Arun',
        'Teja',
        'Male',
        '21-11-2008',
        '9000010003',
        'Ramesh Teja',
        'Father',
        '9000020003',
        'ramesh@example.in',
        'HYD-MAIN',
        '2026-2027',
        'First Year',
        'MPC',
        'MPC First Year',
        'MPC-A',
        'MPC-A-03',
        'ACTIVE',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StudentTemplate');
    XLSX.writeFile(wb, 'svic_student_import_template_v1.xlsx');
    showToast('Student Excel Template downloaded successfully!');
  };

  const handleRoleSwitch = (role: UserRole) => {
    loginAsRole(role);
    setIsOpenMenu(false);
    showToast(`Switched account to ${role.replace('_', ' ')}`);
  };

  const handleReset = () => {
    resetAllDemoData();
    setShowResetModal(false);
    showToast('Demo data successfully restored to default state.');
  };

  return (
    <>
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm border border-slate-700 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Demo Control Button */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        {isOpenMenu && (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 w-72 mb-2 space-y-2 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-teal-600" />
                Demo Tools & Utilities
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {dataMode === 'FIREBASE' ? 'Firebase' : 'Demo Local Mode'}
              </span>
            </div>

            {/* Account Switcher */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                One-Click Account Switcher
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleRoleSwitch('INSTITUTION_ADMIN')}
                  className={`px-2.5 py-1.5 rounded-lg border text-left font-medium transition-all ${
                    currentUser?.role === 'INSTITUTION_ADMIN'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Dean
                </button>
                <button
                  onClick={() => handleRoleSwitch('BRANCH_ADMIN')}
                  className={`px-2.5 py-1.5 rounded-lg border text-left font-medium transition-all ${
                    currentUser?.role === 'BRANCH_ADMIN'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Principal
                </button>
                <button
                  onClick={() => handleRoleSwitch('OFFICE_STAFF')}
                  className={`px-2.5 py-1.5 rounded-lg border text-left font-medium transition-all ${
                    currentUser?.role === 'OFFICE_STAFF'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Office Staff
                </button>
                <button
                  onClick={() => handleRoleSwitch('PARENT_GUARDIAN')}
                  className={`px-2.5 py-1.5 rounded-lg border text-left font-medium transition-all ${
                    currentUser?.role === 'PARENT_GUARDIAN'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Parent
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <button
                onClick={() => {
                  setIsOpenMenu(false);
                  setShowCredsModal(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium text-left"
              >
                <Key className="w-3.5 h-3.5 text-indigo-600" /> View Predefined Credentials
              </button>
              <button
                onClick={() => {
                  setIsOpenMenu(false);
                  handleDownloadTemplate();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium text-left"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" /> Download Student Excel Template
              </button>
              {onNavigateToImport && (
                <button
                  onClick={() => {
                    setIsOpenMenu(false);
                    onNavigateToImport();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium text-left"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-600" /> Load Sample Student Import
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpenMenu(false);
                  setShowResetModal(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-medium text-left"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" /> Reset Demo Data
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpenMenu(!isOpenMenu)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold border border-slate-700 transition-all hover:scale-105"
          id="demo-tools-button"
        >
          <Layers className="w-4 h-4 text-teal-400" />
          <span>Demo Utilities</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      </div>

      {/* Credentials Modal */}
      <Modal isOpen={showCredsModal} onClose={() => setShowCredsModal(false)} title="Predefined Demo Credentials">
        <div className="space-y-4 text-sm text-slate-700">
          <p className="text-xs text-slate-500">
            Use any of these demo accounts to test institution role-based workflows:
          </p>
          <div className="space-y-2">
            {[
              { role: 'Dean / Institution Admin', email: 'dean@demo-college.in', name: 'Dr. Ananya Rao' },
              { role: 'Principal / Campus Admin', email: 'principal@demo-college.in', name: 'Mr. Raghav Reddy' },
              { role: 'Office Staff / Class Teacher', email: 'office@demo-college.in', name: 'Ms. Sushma Devi' },
              { role: 'Parent / Guardian', email: 'parent@demo-college.in', name: 'Mrs. Lakshmi Kumar (Child: Ravi Kumar)' },
            ].map((c) => (
              <div key={c.email} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-semibold block text-slate-900">{c.role}</span>
                  <span className="text-xs text-slate-500">{c.name}</span>
                  <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono block mt-1">
                    {c.email}
                  </code>
                </div>
                <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-300">
                  Password: Demo@123
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Demo Data">
        <div className="space-y-4 text-sm text-slate-700">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Confirm Reset Action</span>
              <p className="text-xs mt-0.5">
                This will reset all students, fees, attendance, marks, circulars, and notifications back to the initial pre-seeded demo state.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium shadow-xs"
            >
              Reset All Demo Data
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
