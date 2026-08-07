import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { AuthenticatedLayout } from '@/src/modules/core/components/AuthenticatedLayout';

// Pages
import { 
  LandingPage, 
  LoginPage, 
  AccessDeniedPage, 
  NotFoundPage, 
  DeanDashboard, 
  PrincipalDashboard, 
  StaffDashboard, 
  ParentDashboard, 
  UserManagementPage 
} from '@/src/modules/auth-and-users';

import { StudentImportPage } from '@/src/modules/student-imports';
import { StudentDirectoryPage } from '@/src/modules/students';
import { FeesModulePage, ParentFeesPage } from '@/src/modules/fees';
import { AttendanceModulePage, ParentAttendancePage } from '@/src/modules/attendance';
import { ExamsModulePage, ClassMarksEntryPage, ParentResultsPage } from '@/src/modules/examinations';
import { CircularsModulePage, NotificationCenterPage } from '@/src/modules/notifications';
import { InstitutionSetupPage } from '@/src/modules/institution-and-branches';
import { AuditLogPage } from '@/src/modules/audit';


import { UserRole } from '@/src/types';

export const ROLE_ALLOWED_ROUTES: Record<UserRole, string[]> = {
  INSTITUTION_ADMIN: [
    '/dean/dashboard',
    '/institution',
    '/branches',
    '/users',
    '/academic-structure',
    '/imports',
    '/students',
    '/fees',
    '/attendance',
    '/exams',
    '/marks-entry',
    '/circulars',
    '/notifications',
    '/audit',
  ],
  BRANCH_ADMIN: [
    '/principal/dashboard',
    '/users',
    '/imports',
    '/students',
    '/fees',
    '/attendance',
    '/exams',
    '/marks-entry',
    '/circulars',
    '/notifications',
  ],
  OFFICE_STAFF: [
    '/staff/dashboard',
    '/imports',
    '/students',
    '/fees',
    '/attendance',
    '/exams',
    '/marks-entry',
    '/notifications',
  ],
  PARENT_GUARDIAN: [
    '/parent/dashboard',
    '/parent/attendance',
    '/parent/fees',
    '/parent/results',
    '/parent/circulars',
    '/parent/notifications',
    '/parent/documents',
  ],
};

export const ALL_KNOWN_ROUTES = Array.from(
  new Set(Object.values(ROLE_ALLOWED_ROUTES).flat())
);

export const ROLE_DEFAULT_DASHBOARD: Record<UserRole, string> = {
  INSTITUTION_ADMIN: '/dean/dashboard',
  BRANCH_ADMIN: '/principal/dashboard',
  OFFICE_STAFF: '/staff/dashboard',
  PARENT_GUARDIAN: '/parent/dashboard',
};

const getHashPath = (): string => {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '';
};

const MainAppRouter: React.FC = () => {
  const { currentUser, selectedPortal, setSelectedPortal, loginAsRole } = useAuth();
  
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = getHashPath();
    if (hash && hash !== '/' && hash !== '/login') return hash;
    const saved = localStorage.getItem('sms_current_path');
    if (saved && saved !== '/' && saved !== '/login') return saved;
    return currentUser ? ROLE_DEFAULT_DASHBOARD[currentUser.role] : '/';
  });

  const [isLoginPage, setIsLoginPage] = useState(false);

  // Sync window hash & localStorage whenever currentPath changes
  const navigate = (path: string) => {
    setCurrentPath(path);
    setIsLoginPage(false);
    localStorage.setItem('sms_current_path', path);
    window.location.hash = path;
  };

  // Listen for direct URL address bar edits & browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hp = getHashPath();
      if (hp && hp !== currentPath) {
        if (hp === '/login') {
          setIsLoginPage(true);
        } else if (hp === '/' || hp === '/landing') {
          setIsLoginPage(false);
          setCurrentPath('/');
        } else {
          setIsLoginPage(false);
          setCurrentPath(hp);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPath]);

  // Keep route synced if user changes login state
  useEffect(() => {
    if (currentUser) {
      if (currentPath === '/' || currentPath === '/landing' || currentPath === '/login' || !currentPath) {
        const defaultDash = ROLE_DEFAULT_DASHBOARD[currentUser.role];
        navigate(defaultDash);
      }
    }
  }, [currentUser]);

  const handleSelectPortal = (role: UserRole) => {
    setSelectedPortal(role);
    setIsLoginPage(true);
    window.location.hash = '/login';
  };

  const handleDirectLogin = (role: UserRole) => {
    loginAsRole(role);
    const targetPath = ROLE_DEFAULT_DASHBOARD[role];
    navigate(targetPath);
  };

  // If user is on Login Page
  if (isLoginPage) {
    return (
      <LoginPage
        selectedPortal={selectedPortal}
        onBackToLanding={() => {
          setIsLoginPage(false);
          window.location.hash = '/';
          setCurrentPath('/');
        }}
        onSuccessLogin={(role) => {
          setIsLoginPage(false);
          handleDirectLogin(role);
        }}
      />
    );
  }

  // If no logged in user, default to Public Landing Page
  if (!currentUser) {
    if (currentPath !== '/' && currentPath !== '/landing' && currentPath !== '') {
      // Direct access attempt while unauthenticated -> redirect to login
      return (
        <LoginPage
          selectedPortal={null}
          onBackToLanding={() => {
            setCurrentPath('/');
            window.location.hash = '/';
          }}
          onSuccessLogin={(role) => handleDirectLogin(role)}
        />
      );
    }

    return (
      <LandingPage
        onSelectPortal={handleSelectPortal}
        onDirectLogin={handleDirectLogin}
      />
    );
  }

  // Authenticated user path & permission checks
  const isKnownRoute = ALL_KNOWN_ROUTES.includes(currentPath);
  const allowedRoutes = ROLE_ALLOWED_ROUTES[currentUser.role] || [];
  const isAuthorized = allowedRoutes.includes(currentPath);

  // Render Page Component based on path
  const renderPageComponent = () => {
    if (!isKnownRoute) {
      return <NotFoundPage onNavigate={navigate} />;
    }

    if (!isAuthorized) {
      return <AccessDeniedPage onNavigate={navigate} />;
    }

    switch (currentPath) {
      case '/dean/dashboard':
        return <DeanDashboard onNavigate={navigate} />;
      case '/principal/dashboard':
        return <PrincipalDashboard onNavigate={navigate} />;
      case '/staff/dashboard':
        return <StaffDashboard onNavigate={navigate} />;
      case '/parent/dashboard':
        return <ParentDashboard onNavigate={navigate} />;

      case '/users':
        return <UserManagementPage />;
      case '/imports':
        return <StudentImportPage />;
      case '/students':
        return <StudentDirectoryPage />;
      case '/fees':
        return <FeesModulePage />;
      case '/attendance':
        return <AttendanceModulePage />;
      case '/exams':
        return <ExamsModulePage onNavigateToMarksEntry={() => navigate('/marks-entry')} />;
      case '/marks-entry':
        return <ClassMarksEntryPage onBack={() => navigate('/exams')} />;
      case '/circulars':
        return <CircularsModulePage />;
      case '/notifications':
        return <NotificationCenterPage />;
      case '/institution':
      case '/branches':
      case '/academic-structure':
        return <InstitutionSetupPage />;
      case '/audit':
        return <AuditLogPage />;

      // Parent subpages
      case '/parent/attendance':
        return <ParentAttendancePage />;
      case '/parent/fees':
      case '/parent/documents':
        return <ParentFeesPage />;
      case '/parent/results':
        return <ParentResultsPage />;
      case '/parent/circulars':
        return <CircularsModulePage />;
      case '/parent/notifications':
        return <NotificationCenterPage />;

      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <AuthenticatedLayout currentPath={currentPath} onNavigate={navigate}>
      {renderPageComponent()}
    </AuthenticatedLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppRouter />
    </AuthProvider>
  );
}
