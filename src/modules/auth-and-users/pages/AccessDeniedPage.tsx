import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { ROLE_DEFAULT_DASHBOARD } from '@/src/App';

export const AccessDeniedPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const getDashboardPath = () => {
    if (currentUser?.role && ROLE_DEFAULT_DASHBOARD[currentUser.role]) {
      return ROLE_DEFAULT_DASHBOARD[currentUser.role];
    }
    return '/';
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onNavigate(getDashboardPath());
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Your current account role (<strong>{currentUser?.role ? currentUser.role.replace('_', ' ') : 'Guest'}</strong>) is not authorized to access this route.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={handleGoBack}
            className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200"
            id="access-denied-go-back"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>

          <button
            onClick={() => onNavigate(getDashboardPath())}
            className="flex-1 py-2.5 px-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            id="access-denied-go-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" /> Go to My Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

