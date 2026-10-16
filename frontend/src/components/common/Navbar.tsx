import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { Logo } from './Logo';
import { 
  FileText, 
  Sparkles, 
  Briefcase, 
  Video, 
  Newspaper, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact 5 modules without numbers or taglines
  const navModules = [
    { name: 'Resume builder (ATS friendly)', path: '/builder', icon: FileText },
    { name: 'Resume tailoring', path: '/tailor', icon: Sparkles },
    { name: 'Career Options', path: '/jobs', icon: Briefcase },
    { name: 'AI interactive Mock Interview', path: '/interview', icon: Video },
    { name: 'Tech News', path: '/news', icon: Newspaper, badge: 'Public' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-2xl border-b border-purple-200/80 shadow-[0_6px_24px_-4px_rgba(124,58,237,0.07),inset_0_-1px_0_0_rgba(255,255,255,0.9)] transition-all">
      {/* Top Radiant Gradient Ambient Line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-brand-600 via-purple-500 to-indigo-600 shadow-[0_1px_8px_rgba(124,58,237,0.35)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Slogan */}
          <Link to="/" className="flex items-center transition-transform hover:scale-[1.02]">
            <Logo size="md" sloganText="AI Career Intelligence" />
          </Link>

          {/* Desktop Navigation Track & Prominent Active Module */}
          <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 backdrop-blur-xl shadow-[inset_0_1.5px_3px_0_rgba(124,58,237,0.05),0_2px_8px_-2px_rgba(124,58,237,0.04)]">
            {navModules.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 text-white font-bold shadow-[0_4px_16px_rgba(109,40,217,0.38),inset_0_1px_1px_rgba(255,255,255,0.35)] ring-2 ring-brand-300/60 scale-[1.02]'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-white/90 border border-transparent font-semibold'
                  }`}
                >
                  {/* Glowing Pulse Dot for Active Module */}
                  {isActive && (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    </span>
                  )}

                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-xs ${
                      isActive 
                        ? 'bg-white/25 text-white border border-white/40' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth State Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-brand-700 hover:bg-brand-50 hover:border-brand-200 border border-transparent">
                    <LayoutDashboard className="w-3.5 h-3.5 text-brand-600" />
                    Dashboard
                  </Button>
                </Link>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-xs text-slate-800 shadow-xs">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <span className="max-w-[120px] truncate font-semibold">{user.fullName}</span>
                </div>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuthModal('Sign in to access your saved profile and documents')}
                  className="text-xs text-slate-700 hover:text-brand-700 font-semibold"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openAuthModal('Create an account to save your work across all career tools')}
                  className="text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  Get Started Free
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-purple-50 border border-purple-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 bg-white/95 backdrop-blur-2xl border-b border-purple-100 space-y-1.5 shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
            Platform Modules
          </div>
          {navModules.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold shadow-md shadow-brand-500/25 border border-brand-400/40'
                    : 'text-slate-600 hover:bg-purple-50/70 hover:text-brand-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-600'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive 
                      ? 'bg-white/25 text-white border border-white/40' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-700 font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard ({user.fullName})
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
                >
                  Get Started Free
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
