import React from 'react';
import { FileQuestion, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { ROLE_DEFAULT_DASHBOARD } from '@/src/App';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
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
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            The page or route you are attempting to access does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={handleGoBack}
            className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200"
            id="not-found-go-back"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>

          <button
            onClick={() => onNavigate(getDashboardPath())}
            className="flex-1 py-2.5 px-4 bg-teal-600 text-white hover:bg-teal-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            id="not-found-go-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" /> Go to My Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
