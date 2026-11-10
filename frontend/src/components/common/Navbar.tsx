import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
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

  const navTrackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pillStyle, setPillStyle] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
  }>({ x: 0, y: 0, width: 0, height: 0, opacity: 0 });

  // Exact 5 modules without numbers or taglines
  const navModules = [
    { name: 'Resume builder (ATS friendly)', path: '/builder', icon: FileText },
    { name: 'Resume tailoring', path: '/tailor', icon: Sparkles },
    { name: 'Career Options', path: '/jobs', icon: Briefcase },
    { name: 'AI interactive Mock Interview', path: '/interview', icon: Video },
    { name: 'Tech News', path: '/news', icon: Newspaper, badge: 'Public' },
  ];

  const updateActivePill = () => {
    const activeMod = navModules.find(m => location.pathname.startsWith(m.path));
    if (!activeMod) {
      setPillStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }
    const el = itemRefs.current[activeMod.path];
    if (el) {
      setPillStyle({
        x: el.offsetLeft,
        y: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        opacity: 1
      });
    }
  };

  useLayoutEffect(() => {
    updateActivePill();
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => updateActivePill();
    window.addEventListener('resize', handleResize);
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && navTrackRef.current) {
      observer = new ResizeObserver(handleResize);
      observer.observe(navTrackRef.current);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-2xl border-b border-purple-200/80 shadow-[0_6px_24px_-4px_rgba(124,58,237,0.07),inset_0_-1px_0_0_rgba(255,255,255,0.9)] transition-all">
      {/* Top Radiant Gradient Ambient Line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-brand-600 via-purple-500 to-indigo-600 shadow-[0_1px_8px_rgba(124,58,237,0.35)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Slogan */}
          <Link to="/" className="flex items-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]">
            <Logo size="md" sloganText="AI Career Intelligence" />
          </Link>

          {/* Desktop Navigation Track with Gliding Active Module Pill */}
          <div
            ref={navTrackRef}
            className="hidden lg:flex relative items-center gap-1.5 p-1.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 backdrop-blur-xl shadow-[inset_0_1.5px_3px_0_rgba(124,58,237,0.05),0_2px_8px_-2px_rgba(124,58,237,0.04)]"
          >
            {/* Gliding Active Gradient Pill Backdrop */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 rounded-xl bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 shadow-[0_4px_16px_rgba(109,40,217,0.38),inset_0_1px_1px_rgba(255,255,255,0.35)] ring-2 ring-brand-300/60 pointer-events-none"
              style={{
                width: `${pillStyle.width}px`,
                height: `${pillStyle.height}px`,
                transform: `translate3d(${pillStyle.x}px, ${pillStyle.y}px, 0)`,
                opacity: pillStyle.opacity,
                transition:
                  'transform 380ms cubic-bezier(0.22, 1, 0.36, 1), width 380ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease'
              }}
            />

            {navModules.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  ref={(el) => { itemRefs.current[item.path] = el; }}
                  to={item.path}
                  className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-colors duration-250 active:scale-[0.97] ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-white/75 font-semibold'
                  }`}
                >
                  {/* Glowing Pulse Dot for Active Module */}
                  {isActive && (
                    <span className="relative flex h-2 w-2 shrink-0 animate-fadeIn">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    </span>
                  )}

                  <Icon className={`w-3.5 h-3.5 transition-colors duration-250 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-xs transition-colors duration-250 ${
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
        <div className="lg:hidden px-4 pt-3 pb-6 bg-white/95 backdrop-blur-2xl border-b border-purple-100 space-y-1.5 shadow-2xl animate-drawerSlideDown">
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
