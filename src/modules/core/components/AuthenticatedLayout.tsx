import React, { useState } from 'react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { Header } from '@/src/modules/core/components/Header';
import { Sidebar } from '@/src/modules/core/components/Sidebar';
import { DemoUtilities } from '@/src/modules/core/components/DemoUtilities';
import { ROLE_DEFAULT_DASHBOARD } from '@/src/App';
import {
  ArrowLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  MessageSquare,
  ShieldAlert,
  Building,
  GitBranch,
  BookOpen,
  Upload,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { UserRole } from '@/src/types';

interface AuthenticatedLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

interface BreadcrumbItem {
  label: string;
  path: string;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const { currentUser, loginAsRole, selectedPortal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);

  const role = currentUser?.role || 'INSTITUTION_ADMIN';
  const defaultDashboard = ROLE_DEFAULT_DASHBOARD[role] || '/dean/dashboard';
  const isMainDashboard = currentPath === defaultDashboard || currentPath.endsWith('/dashboard');

  // Compute safe parent path for fallback back button
  const getParentPath = (path: string): string => {
    switch (path) {
      case '/marks-entry':
        return '/exams';
      case '/parent/attendance':
      case '/parent/fees':
      case '/parent/results':
      case '/parent/circulars':
      case '/parent/notifications':
      case '/parent/documents':
        return '/parent/dashboard';
      case '/institution':
      case '/branches':
      case '/academic-structure':
      case '/audit':
        return defaultDashboard;
      default:
        return defaultDashboard;
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      const parent = getParentPath(currentPath);
      onNavigate(parent);
    }
  };

  // Generate breadcrumb items
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', path: defaultDashboard },
    ];

    if (isMainDashboard) return items;

    const pathLabels: Record<string, string> = {
      '/institution': 'Institution',
      '/branches': 'Branches',
      '/users': 'Users',
      '/academic-structure': 'Academic Structure',
      '/imports': 'Student Imports',
      '/students': 'Students',
      '/fees': 'Fees',
      '/attendance': 'Attendance',
      '/exams': 'Examinations',
      '/marks-entry': 'Marks Entry',
      '/circulars': 'Circulars',
      '/notifications': 'Notifications',
      '/audit': 'Audit',

      // Parent routes
      '/parent/attendance': 'Attendance',
      '/parent/fees': 'Fees',
      '/parent/results': 'Results',
      '/parent/circulars': 'Circulars',
      '/parent/notifications': 'Notifications',
      '/parent/documents': 'Documents',
    };

    if (currentPath === '/marks-entry') {
      items.push({ label: 'Examinations', path: '/exams' });
      items.push({ label: 'Marks Entry', path: '/marks-entry' });
    } else if (pathLabels[currentPath]) {
      items.push({ label: pathLabels[currentPath], path: currentPath });
    } else {
      items.push({ label: 'View Details', path: currentPath });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSwitchRole = (targetRole: UserRole) => {
    loginAsRole(targetRole);
    const dash = ROLE_DEFAULT_DASHBOARD[targetRole];
    onNavigate(dash);
    setIsSwitchAccountOpen(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        title={
          role === 'INSTITUTION_ADMIN'
            ? 'Dean & Management Portal'
            : role === 'BRANCH_ADMIN'
            ? 'Campus Principal Portal'
            : role === 'OFFICE_STAFF'
            ? 'Office & Class Teacher Desk'
            : 'Parent Mobile Portal'
        }
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {/* Top Context & Breadcrumb Bar */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
            <div className="flex items-center gap-3 overflow-x-auto py-0.5">
              {/* Back Button (hidden on main dashboard) */}
              {!isMainDashboard && (
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-200 shadow-2xs shrink-0"
                  id="layout-back-button"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Back</span>
                </button>
              )}

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-1.5 text-xs text-slate-600 font-medium shrink-0">
                <button
                  onClick={() => onNavigate(defaultDashboard)}
                  className="hover:text-teal-600 flex items-center gap-1"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {breadcrumbs.map((item, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={item.path + idx}>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      {isLast ? (
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {item.label}
                        </span>
                      ) : (
                        <button
                          onClick={() => onNavigate(item.path)}
                          className="hover:text-teal-600 transition-colors"
                        >
                          {item.label}
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Menu: Dashboard Link & Switch Account */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate(defaultDashboard)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                id="layout-dashboard-link"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Dashboard</span>
              </button>

              {/* Switch Demo Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSwitchAccountOpen(!isSwitchAccountOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors border border-teal-200 shadow-2xs"
                  id="layout-switch-account-button"
                >
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span className="hidden md:inline">Switch Account</span>
                </button>

                {isSwitchAccountOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Demo Role
                    </div>
                    <button
                      onClick={() => handleSwitchRole('INSTITUTION_ADMIN')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        role === 'INSTITUTION_ADMIN'
                          ? 'bg-purple-50 text-purple-900 border border-purple-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>Dean (Dr. R.K. Prasad)</span>
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Dean</span>
                    </button>
                    <button
                      onClick={() => handleSwitchRole('BRANCH_ADMIN')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        role === 'BRANCH_ADMIN'
                          ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>Principal (K. Srinivas)</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Principal</span>
                    </button>
                    <button
                      onClick={() => handleSwitchRole('OFFICE_STAFF')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        role === 'OFFICE_STAFF'
                          ? 'bg-teal-50 text-teal-900 border border-teal-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>Office Staff (V. Murali)</span>
                      <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">Staff</span>
                    </button>
                    <button
                      onClick={() => handleSwitchRole('PARENT_GUARDIAN')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        role === 'PARENT_GUARDIAN'
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>Parent (Suresh Kumar)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Parent</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Body Wrapper */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>

      {/* Demo Utilities Bar */}
      <DemoUtilities onNavigateToImport={() => onNavigate('/imports')} />
    </div>
  );
};
