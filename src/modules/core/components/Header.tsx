import React from 'react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { LogOut, User as UserIcon, Building2, ShieldCheck, Database, Layers } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onOpenMobileMenu }) => {
  const { currentUser, logout, dataMode } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'INSTITUTION_ADMIN':
        return <span className="bg-purple-100 text-purple-800 border-purple-200 text-[11px] font-bold px-2 py-0.5 rounded-full border">Dean</span>;
      case 'BRANCH_ADMIN':
        return <span className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[11px] font-bold px-2 py-0.5 rounded-full border">Principal</span>;
      case 'OFFICE_STAFF':
        return <span className="bg-teal-100 text-teal-800 border-teal-200 text-[11px] font-bold px-2 py-0.5 rounded-full border">Office Staff</span>;
      case 'PARENT_GUARDIAN':
        return <span className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full border">Parent / Guardian</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 shrink-0 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
        {/* Left branding & page title */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              <Layers className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base lg:text-lg">
                Sri Vignan Intermediate College
              </span>
              <span className="hidden sm:inline-block bg-teal-900/60 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-700/60">
                {currentUser?.branchId === 'branch-vja-city'
                  ? 'VJA-CITY'
                  : currentUser?.branchId === 'branch-vizag-coast'
                  ? 'VIZAG-COAST'
                  : 'HYD-MAIN'}
              </span>
            </div>
            {title && <p className="text-xs text-teal-400 font-medium">{title}</p>}
          </div>
        </div>

        {/* Right User & Mode Bar */}
        <div className="flex items-center gap-3">
          {/* Data Mode Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-medium text-[11px]">
              {dataMode === 'FIREBASE' ? 'Firebase Mode' : 'Demo Local Mode'}
            </span>
          </div>

          {/* User Profile info */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-100">{currentUser.fullName}</span>
                  {getRoleBadge(currentUser.role)}
                </div>
                <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">{currentUser.email}</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
                title="Logout"
                id="header-logout-button"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
