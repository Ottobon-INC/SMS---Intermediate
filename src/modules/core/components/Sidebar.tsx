import React from 'react';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import {
  LayoutDashboard,
  Building,
  GitBranch,
  Users,
  BookOpen,
  Upload,
  CreditCard,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  FileText,
  ChevronRight,
  School,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'INSTITUTION_ADMIN';

  interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
  }

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'INSTITUTION_ADMIN':
        return [
          { label: 'Dashboard', path: '/dean/dashboard', icon: LayoutDashboard },
          { label: 'Institution', path: '/institution', icon: Building },
          { label: 'Branches', path: '/branches', icon: GitBranch },
          { label: 'Users', path: '/users', icon: Users, badge: 'Dean' },
          { label: 'Academic Structure', path: '/academic-structure', icon: BookOpen },
          { label: 'Student Imports', path: '/imports', icon: Upload },
          { label: 'Students', path: '/students', icon: UserCheck },
          { label: 'Fees', path: '/fees', icon: CreditCard },
          { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
          { label: 'Examinations', path: '/exams', icon: GraduationCap },
          { label: 'Circulars', path: '/circulars', icon: Megaphone },
          { label: 'Notifications', path: '/notifications', icon: MessageSquare },
          { label: 'Audit', path: '/audit', icon: ShieldAlert },
        ];

      case 'BRANCH_ADMIN':
        return [
          { label: 'Dashboard', path: '/principal/dashboard', icon: LayoutDashboard },
          { label: 'Users', path: '/users', icon: Users },
          { label: 'Import Review', path: '/imports', icon: Upload, badge: 'Review' },
          { label: 'Students', path: '/students', icon: UserCheck },
          { label: 'Fees', path: '/fees', icon: CreditCard },
          { label: 'Attendance Review', path: '/attendance', icon: CalendarCheck, badge: 'Finalize' },
          { label: 'Examinations', path: '/exams', icon: GraduationCap },
          { label: 'Marks Entry', path: '/marks-entry', icon: GraduationCap, badge: 'Entry' },
          { label: 'Circulars', path: '/circulars', icon: Megaphone },
          { label: 'Notifications', path: '/notifications', icon: MessageSquare },
          { label: 'Failed Notifications', path: '/failed-notifications', icon: ShieldAlert, badge: 'Retry' },
        ];

      case 'OFFICE_STAFF':
        return [
          { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
          { label: 'Student Imports', path: '/imports', icon: Upload },
          { label: 'Students', path: '/students', icon: UserCheck },
          { label: 'Fees', path: '/fees', icon: CreditCard },
          { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
          { label: 'Marks Entry', path: '/marks-entry', icon: GraduationCap },
          { label: 'Notifications', path: '/notifications', icon: MessageSquare },
        ];

      case 'PARENT_GUARDIAN':
        return [
          { label: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
          { label: 'Attendance', path: '/parent/attendance', icon: CalendarCheck },
          { label: 'Fees', path: '/parent/fees', icon: CreditCard },
          { label: 'Results', path: '/parent/results', icon: GraduationCap },
          { label: 'Circulars', path: '/parent/circulars', icon: Megaphone },
          { label: 'Notification History', path: '/parent/notifications', icon: MessageSquare },
          { label: 'Documents', path: '/parent/documents', icon: FileText },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      {/* Brand Badge */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-teal-600 rounded-xl text-white shadow-sm">
          <School className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm tracking-wide">SMS Intermediate</h2>
          <span className="text-[10px] text-teal-400 font-semibold block">
            AP & Telangana Portal
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleItemClick(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              id={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="text-[9px] bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded font-bold border border-slate-700">
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Role Note */}
      <div className="p-3 m-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 leading-snug">
        <span className="font-semibold text-slate-200 block mb-0.5">Role Context</span>
        Active as <strong className="text-teal-300">{role.replace('_', ' ')}</strong>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-full shrink-0">{sidebarContent}</aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
