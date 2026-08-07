import React, { useState, useEffect } from 'react';
import {
  School,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Users,
  Building,
  UserCheck,
  Sparkles,
  ChevronRight,
  Globe,
  Zap,
  Lock
} from 'lucide-react';
import { UserRole } from '@/src/types';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';

interface LandingPageProps {
  onSelectPortal: (role: UserRole) => void;
  onDirectLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectPortal, onDirectLogin }) => {
  const { loginAsRole } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const portals = [
    {
      role: 'INSTITUTION_ADMIN' as UserRole,
      title: 'Institution Admin',
      description: 'Global oversight, financial health, and multi-branch management.',
      icon: Building,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-cyan-400',
      badge: 'Dean Scope',
    },
    {
      role: 'BRANCH_ADMIN' as UserRole,
      title: 'Campus Principal',
      description: 'Branch-level approvals, attendance finalization, and staff control.',
      icon: School,
      gradient: 'from-slate-500/20 to-blue-500/20',
      iconColor: 'text-blue-400',
      badge: 'Branch Scope',
    },
    {
      role: 'OFFICE_STAFF' as UserRole,
      title: 'Office Staff',
      description: 'Daily operations, fee collection, student uploads, and marks entry.',
      icon: UserCheck,
      gradient: 'from-teal-500/20 to-emerald-500/20',
      iconColor: 'text-teal-400',
      badge: 'Operations',
    },
    {
      role: 'PARENT_GUARDIAN' as UserRole,
      title: 'Parent Portal',
      description: 'Real-time attendance, fee receipts, report cards, and live alerts.',
      icon: Users,
      gradient: 'from-orange-500/20 to-amber-500/20',
      iconColor: 'text-orange-400',
      badge: 'Parent Access',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#0A0A0B]/80 backdrop-blur-xl border-white/10 py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">
                Student Operations Hub
              </span>
            </div>
          </div>
          <button
            onClick={() => loginAsRole('INSTITUTION_ADMIN')}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-full backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 hover:scale-105"
          >
            <span>Live Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-40 pb-24 px-6 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-blue-300 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Next-Generation Education Management</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 tracking-tight leading-[1.1] mb-8">
            Manage your entire institution with absolute precision.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
            The definitive operating system for intermediate colleges. Unify admissions, fee ledgers, daily attendance, and parent communications into one impossibly fast, beautifully designed platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
            <button
              onClick={() => loginAsRole('INSTITUTION_ADMIN')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-bold rounded-full shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Explore as Dean</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => loginAsRole('PARENT_GUARDIAN')}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-blue-400" />
              <span>Preview Parent Portal</span>
            </button>
          </div>

          {/* Dashboard Image Component - Borderless */}
          <div className="relative mx-auto max-w-5xl transition-transform duration-700 hover:scale-[1.02]">
            {/* Raw Image */}
            <img
              src="/dashboard_mockup.png"
              alt="SMS Dashboard Preview"
              className="w-full h-auto rounded-lg object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            />
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast Imports',
                desc: 'Upload thousands of student records via Excel in seconds. Smart validation catches duplicates and errors instantly.',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
              },
              {
                icon: Globe,
                title: 'Live Parent Sync',
                desc: 'Instantly notify parents via simulated WhatsApp alerts for attendance, fee dues, and exam results without manual effort.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
              {
                icon: Lock,
                title: 'Bank-Grade RBAC',
                desc: 'Strict role-based access ensures Deans, Principals, Staff, and Parents only see exactly what they are authorized to.',
                color: 'text-rose-400',
                bg: 'bg-rose-500/10',
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                <div className={`p-4 rounded-2xl w-fit ${feature.bg} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Portal Selection */}
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Experience Every Perspective</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Select a portal below to instantly log in as a specific role and explore the customized dashboard and workflows available to them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.role}
                  className="relative group bg-[#111114] rounded-3xl p-1 overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                >
                  {/* Animated Border Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

                  <div className="relative h-full bg-[#111114] rounded-[22px] border border-white/10 p-6 flex flex-col z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${p.iconColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-grow">
                      {p.description}
                    </p>

                    <div className="space-y-3 mt-auto">
                      <button
                        onClick={() => onSelectPortal(p.role)}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-white/5"
                      >
                        <span>Open Login Page</span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>
                      <button
                        onClick={() => onDirectLogin(p.role)}
                        className="w-full py-3 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
                      >
                        Instant Access
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0A0A0B] py-12 text-center px-6">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <School className="w-5 h-5 text-white" />
          <span className="text-sm font-bold text-white tracking-wider uppercase">Ottobon SMS</span>
        </div>
        <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
          This is a demonstration application. All data, including student records and simulated WhatsApp messages, is entirely fictional.
        </p>
      </footer>
    </div>
  );
};
