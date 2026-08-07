import React from 'react';
import {
  School,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Users,
  Building,
  UserCheck,
  CheckCircle,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '@/src/types';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';

interface LandingPageProps {
  onSelectPortal: (role: UserRole) => void;
  onDirectLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectPortal, onDirectLogin }) => {
  const { loginAsRole } = useAuth();

  const portals = [
    {
      role: 'INSTITUTION_ADMIN' as UserRole,
      title: 'Dean / Institution Admin',
      description: 'Overview across all campus branches, staff account management, institution circulars & overall financial health.',
      icon: Building,
      color: 'bg-purple-600 text-white',
      badge: 'Institution Scope',
    },
    {
      role: 'BRANCH_ADMIN' as UserRole,
      title: 'Principal / Campus Admin',
      description: 'Branch student import approvals, finalization of attendance, exam result publishing, and branch staff control.',
      icon: School,
      color: 'bg-indigo-600 text-white',
      badge: 'Branch Scope',
    },
    {
      role: 'OFFICE_STAFF' as UserRole,
      title: 'Office Staff / Class Teacher',
      description: 'Excel student data upload, fee collection & instant receipts, daily attendance recording, and subject marks entry.',
      icon: UserCheck,
      color: 'bg-teal-600 text-white',
      badge: 'Daily Operations',
    },
    {
      role: 'PARENT_GUARDIAN' as UserRole,
      title: 'Parent / Guardian Portal',
      description: 'Mobile-first portal for parents to track finalized attendance, fee payments, receipts, exam report cards, and WhatsApp alerts.',
      icon: Users,
      color: 'bg-emerald-600 text-white',
      badge: 'Parent Access',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-600 rounded-xl text-white shadow-md">
            <School className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight block leading-none">
              SMS for Intermediate
            </span>
            <span className="text-[11px] text-teal-400 font-medium">
              Sri Vignan Intermediate College Platform
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loginAsRole('INSTITUTION_ADMIN');
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            id="landing-quick-demo-login"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6 lg:px-12 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Tailored for Intermediate Colleges in Andhra Pradesh & Telangana</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Replace Paper Registers & Disconnected Excel Files in One Simple System
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Manage student admissions, fee ledgers, daily attendance, examination marks, and WhatsApp parent communications with role-based access control.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => loginAsRole('INSTITUTION_ADMIN')}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-2xl shadow-lg transition-all hover:scale-105 text-sm flex items-center gap-2"
            >
              <span>Explore as Dean</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => loginAsRole('PARENT_GUARDIAN')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all text-sm flex items-center gap-2"
            >
              <span>View Parent Portal (Ravi Kumar)</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-12 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl w-fit">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Excel-First Student Upload</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload your existing admission spreadsheets. Intelligent header validation detects invalid rows, branch mismatches, and duplicate admission numbers before final confirmation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">WhatsApp Mobile Previews</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Keep parents informed automatically. Preview realistic WhatsApp mobile messages for student absences, fee reminders, payment receipts, exam results, and circulars.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Strict Role-Based Access</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Separate capabilities for Deans, Principals, Office Staff, and Parents. Parents see only approved, finalized child data with zero access to staff draft records.
          </p>
        </div>
      </section>

      {/* Select Portal Section */}
      <section className="py-12 px-6 bg-slate-100 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Select a Portal to Experience</h2>
            <p className="text-xs text-slate-500">
              Click any portal card to log in with predefined demo credentials:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.role}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  id={`portal-card-${p.role.toLowerCase()}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${p.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                        {p.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="pt-6 space-y-2">
                    <button
                      onClick={() => onSelectPortal(p.role)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Open Portal Login</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDirectLogin(p.role)}
                      className="w-full py-2 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-xl text-[11px] font-semibold transition-colors text-center"
                    >
                      Instant 1-Click Entry
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Disclaimer Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-6 mt-auto border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="font-semibold text-slate-200">
            SMS for Intermediate — Sri Vignan Intermediate College Sales Demonstration MVP
          </p>
          <p className="text-[11px] leading-relaxed text-slate-400">
            This demonstration application uses fictional student records and simulated WhatsApp message previews. No real WhatsApp messages or payment gateway charges are executed.
          </p>
        </div>
      </footer>
    </div>
  );
};
