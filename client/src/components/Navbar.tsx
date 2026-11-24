import React from 'react';
import { User } from '../types';
import { Activity, User as UserIcon, LogOut, Globe, FolderOpen, MessageSquare, CheckCircle, Sparkles, Shield, ArrowUpRight } from 'lucide-react';
import { formatDisplayPhone } from '../utils/phone';

interface NavbarProps {
  user: User | null;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
  activeTab: 'records' | 'chat';
  onTabChange: (tab: 'records' | 'chat') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentLang,
  onLanguageChange,
  onLogout,
  activeTab,
  onTabChange,
}) => {
  return (
    <>
      <header className="sticky top-0 z-50 px-3 py-2.5 sm:px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full border border-white/80 bg-white/75 px-4 shadow-[0_8px_30px_rgb(14,165,233,0.08)] backdrop-blur-xl sm:px-6">
          {/* Brand Logo & Clinical Badge */}
          <div 
            onClick={() => onTabChange('chat')}
            className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 via-cyan-400 to-teal-400 text-white shadow-md shadow-sky-500/25 ring-2 ring-white">
              <Activity className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-base sm:text-lg">
                  Electropathy<span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 ring-1 ring-sky-500/20">
                  v2026 Engine
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Pills (Inspired by modern med-tech header) */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1 rounded-full bg-slate-100/80 p-1 ring-1 ring-slate-200/60">
              <button
                onClick={() => onTabChange('chat')}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-white text-sky-700 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>AI Consultations</span>
              </button>

              <button
                onClick={() => onTabChange('records')}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'records'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>Health Records</span>
              </button>
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100/70 px-3.5 py-1.5 ring-1 ring-slate-200/50">
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                <span>Dual-Table Materia Medica</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100/70 px-3.5 py-1.5 ring-1 ring-slate-200/50">
                <Shield className="h-3.5 w-3.5 text-teal-500" />
                <span>4-Bottle Mattei Optimizer</span>
              </span>
            </div>
          )}

          {/* Right Action Elements: Language Selector & User Profile */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <div className="flex items-center rounded-full bg-slate-100/90 p-0.5 ring-1 ring-slate-200/70">
              <button
                onClick={() => onLanguageChange('en')}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                  currentLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                  currentLang === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                हिं
              </button>
              <button
                onClick={() => onLanguageChange('mr')}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                  currentLang === 'mr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                मरा
              </button>
            </div>

            {/* User Profile Pill or Status Pill */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 py-1 pl-1 pr-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-xs font-bold text-white shadow-xs">
                    {user.fullName ? user.fullName[0]?.toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-xs font-bold text-slate-800">
                      {user.fullName || formatDisplayPhone(user.mobileNumber)}
                    </div>
                    <div className="text-[10px] font-medium text-emerald-600">
                      Verified Patient
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <a
                href="#login"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
              >
                <span>Access Portal</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Dynamic Mobile Bottom Navigation Bar (Visible on mobile when logged in) */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200/80 bg-white/95 px-6 py-2.5 backdrop-blur-lg md:hidden justify-around">
          <button
            onClick={() => onTabChange('chat')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
              activeTab === 'chat' ? 'text-sky-600' : 'text-slate-500'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Consultations</span>
          </button>

          <button
            onClick={() => onTabChange('records')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
              activeTab === 'records' ? 'text-sky-600' : 'text-slate-500'
            }`}
          >
            <FolderOpen className="h-5 w-5" />
            <span>Health Records</span>
          </button>
        </nav>
      )}
    </>
  );
};
