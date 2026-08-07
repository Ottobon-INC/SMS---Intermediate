import React, { useState } from 'react';
import { School, Lock, Mail, ArrowLeft, CheckCircle2, Key, Users, Building, ShieldCheck } from 'lucide-react';
import { UserRole } from '@/src/types';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { dbRepository } from '@/src/services/db';

interface LoginPageProps {
  selectedPortal: UserRole | null;
  onBackToLanding: () => void;
  onSuccessLogin: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  selectedPortal,
  onBackToLanding,
  onSuccessLogin,
}) => {
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState(() => {
    switch (selectedPortal) {
      case 'INSTITUTION_ADMIN':
        return 'dean@demo-college.in';
      case 'BRANCH_ADMIN':
        return 'principal@demo-college.in';
      case 'OFFICE_STAFF':
        return 'office@demo-college.in';
      case 'PARENT_GUARDIAN':
        return 'parent@demo-college.in';
      default:
        return 'dean@demo-college.in';
    }
  });
  const [password, setPassword] = useState('Demo@123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getPortalTitle = () => {
    switch (selectedPortal) {
      case 'INSTITUTION_ADMIN':
        return 'Institution Admin / Dean Portal';
      case 'BRANCH_ADMIN':
        return 'Principal / Campus Admin Portal';
      case 'OFFICE_STAFF':
        return 'Office Staff / Class Teacher Portal';
      case 'PARENT_GUARDIAN':
        return 'Parent & Guardian Portal';
      default:
        return 'SMS Demonstration Login';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const users = dbRepository.getUsers();
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.status === 'ACTIVE'
    );

    if (matchedUser) {
      if (selectedPortal && matchedUser.role !== selectedPortal) {
        setErrorMsg(
          `Account role (${matchedUser.role.replace('_', ' ')}) does not match selected portal (${selectedPortal.replace('_', ' ')}). Please use a matching account or switch portal.`
        );
        return;
      }
      const ok = login(email, password);
      if (ok) {
        onSuccessLogin(matchedUser.role);
      } else {
        setErrorMsg('Invalid credentials or account is inactive.');
      }
    } else {
      setErrorMsg('Invalid credentials or account is inactive. Try using 1-click login below.');
    }
  };

  const handleQuickRole = (role: UserRole) => {
    loginAsRole(role);
    onSuccessLogin(role);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 relative overflow-hidden">
        {/* Header Branding */}
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Landing Page
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl text-white flex items-center justify-center mx-auto shadow-md">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{getPortalTitle()}</h2>
          <p className="text-xs text-slate-500">
            Sri Vignan Intermediate College Platform
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Demo Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            id="login-submit-button"
          >
            Sign In to {getPortalTitle().split(' ')[0]}
          </button>
        </form>

        {/* One Click Account Selection */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-teal-600" /> One-Click Instant Login
            </span>
            <span className="text-[10px] text-slate-400">No password needed</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickRole('INSTITUTION_ADMIN')}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-900 rounded-xl border border-slate-200 text-left text-xs font-semibold transition-colors"
            >
              Dean (Admin)
            </button>
            <button
              onClick={() => handleQuickRole('BRANCH_ADMIN')}
              className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 rounded-xl border border-slate-200 text-left text-xs font-semibold transition-colors"
            >
              Principal
            </button>
            <button
              onClick={() => handleQuickRole('OFFICE_STAFF')}
              className="p-2.5 bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 rounded-xl border border-slate-200 text-left text-xs font-semibold transition-colors"
            >
              Office Staff
            </button>
            <button
              onClick={() => handleQuickRole('PARENT_GUARDIAN')}
              className="p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 rounded-xl border border-slate-200 text-left text-xs font-semibold transition-colors"
            >
              Parent (Ravi)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
