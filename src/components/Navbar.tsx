import React, { useState } from 'react';
import { Shield, Sparkles, Menu, X, CheckCircle2, Lock } from 'lucide-react';
import { TesterRegistration } from '../types';

interface NavbarProps {
  userRegistrations: TesterRegistration[];
  onOpenStatus: () => void;
  onOpenAdmin: () => void;
  onSelectAppClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRegistrations,
  onOpenStatus,
  onOpenAdmin,
  onSelectAppClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const approvedCount = userRegistrations.filter(r => r.status === 'approved').length;
  const pendingCount = userRegistrations.filter(r => r.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/90 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-['Outfit']">
                  Beta Testing <span className="text-cyan-400">Hub</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  TZ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Majaribio ya Apps 6 za Android
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#apps" className="hover:text-cyan-400 transition-colors">
              Programu Zetu
            </a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
              Jinsi ya Kujaribu
            </a>
            <a href="#tester-guide" className="hover:text-cyan-400 transition-colors">
              Mwongozo
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">
              Maswali (FAQ)
            </a>
            <a href="#privacy" className="hover:text-cyan-400 transition-colors">
              Faragha
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* If user has registrations, show status badge */}
            {userRegistrations.length > 0 && (
              <button
                id="btn-nav-status"
                onClick={onOpenStatus}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm"
              >
                {approvedCount > 0 ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{approvedCount} Imeidhinishwa</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>{pendingCount} Inasubiri</span>
                  </span>
                )}
                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                  Hali
                </span>
              </button>
            )}

            {/* Main CTA */}
            <button
              id="btn-nav-join"
              onClick={onSelectAppClick}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Jiunge na Beta
            </button>

            {/* Admin Portal Trigger */}
            <button
              id="btn-nav-admin"
              onClick={onOpenAdmin}
              title="Msimamizi (Admin)"
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="btn-nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700 cursor-pointer"
              aria-label="Fungua menyu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-300">
            <a
              href="#apps"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-cyan-400"
            >
              Programu Zetu (Apps 6)
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-cyan-400"
            >
              Jinsi ya Kujaribu
            </a>
            <a
              href="#tester-guide"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-cyan-400"
            >
              Mwongozo wa Tester
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-cyan-400"
            >
              Maswali Yanayoulizwa Mara kwa Mara
            </a>
            <a
              href="#privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-cyan-400"
            >
              Sera ya Faragha
            </a>
          </nav>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectAppClick();
              }}
              className="w-full py-2.5 rounded-xl text-center font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md"
            >
              Chagua App ya Kujaribu
            </button>
            {userRegistrations.length > 0 && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenStatus();
                }}
                className="w-full py-2 rounded-xl text-center text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700"
              >
                Angalia Hali ya Maombi Yangu ({userRegistrations.length})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
