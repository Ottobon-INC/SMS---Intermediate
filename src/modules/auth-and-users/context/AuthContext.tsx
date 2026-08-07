import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/src/types';
import { dbRepository } from '@/src/services/db';

interface AuthContextType {
  currentUser: User | null;
  selectedPortal: UserRole | null;
  dataMode: 'DEMO_LOCAL' | 'FIREBASE';
  refreshTrigger: number;
  setSelectedPortal: (role: UserRole | null) => void;
  login: (email: string, pass: string) => boolean;
  loginAsRole: (role: UserRole) => boolean;
  logout: () => void;
  resetAllDemoData: () => void;
  triggerRefresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sms_inter_auth_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const dataMode = dbRepository.getDataMode();

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    // Restore session on mount only if a valid session ID exists in localStorage
    const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUserId) {
      const users = dbRepository.getUsers();
      const found = users.find((u) => u.id === savedUserId && u.status === 'ACTIVE');
      if (found) {
        setCurrentUser(found);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [refreshTrigger]);

  const login = (email: string, pass: string): boolean => {
    const users = dbRepository.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.status === 'ACTIVE'
    );

    if (user) {
      setCurrentUser(user);
      setSelectedPortal(user.role);
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
      triggerRefresh();
      return true;
    }
    return false;
  };

  const loginAsRole = (role: UserRole): boolean => {
    const users = dbRepository.getUsers();
    const user = users.find((u) => u.role === role && u.status === 'ACTIVE');
    if (user) {
      setCurrentUser(user);
      setSelectedPortal(role);
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
      triggerRefresh();
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedPortal(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('sms_current_path');
    window.location.hash = '/';
    triggerRefresh();
  };

  const resetAllDemoData = () => {
    dbRepository.resetDemoData();
    // Do NOT automatically log in as Dean. Keep existing session if still valid, otherwise null.
    const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUserId) {
      const users = dbRepository.getUsers();
      const found = users.find((u) => u.id === savedUserId && u.status === 'ACTIVE');
      if (found) {
        setCurrentUser(found);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    triggerRefresh();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        selectedPortal,
        dataMode,
        refreshTrigger,
        setSelectedPortal,
        login,
        loginAsRole,
        logout,
        resetAllDemoData,
        triggerRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
