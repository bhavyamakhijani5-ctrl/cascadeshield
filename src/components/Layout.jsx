import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  BarChart3,
  Navigation,
  FileText,
  Info,
  Radio,
  Users,
  Wrench,
  Menu,
  X,
  Wifi,
  WifiOff,
  Globe,
  ChevronDown,
  Sparkles,
  Zap,
  Gauge,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import DemoTour from './DemoTour';
import CustomCursor from './reactbits/CustomCursor';
import ChatAssistant from './ChatAssistant';

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Store state and actions
  const isOnline = useStore((state) => state.ui.isOnline);
  const activeView = useStore((state) => state.ui.activeView);
  const language = useStore((state) => state.ui.language);
  const isLowBandwidth = useStore((state) => state.ui.isLowBandwidth);
  const isDemoMode = useStore((state) => state.ui.isDemoMode);
  const setOnlineStatus = useStore((state) => state.setOnlineStatus);
  const setActiveView = useStore((state) => state.setActiveView);
  const setLanguage = useStore((state) => state.setLanguage);
  const toggleLowBandwidth = useStore((state) => state.toggleLowBandwidth);
  const startDemo = useStore((state) => state.startDemo);

  const navLinks = [
    { name: 'Dashboard', path: '/simulator', icon: BarChart3 },
    { name: 'Optimizer', path: '/optimizer', icon: Wrench },
    { name: 'Validation', path: '/validation', icon: Navigation },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'About', path: '/about', icon: Info },
  ];

  const viewOptions = [
    { id: 'control-room', label: 'Control Room', icon: Radio },
    { id: 'field-team', label: 'Field Team', icon: Users },
    { id: 'citizen', label: 'Citizen View', icon: Navigation },
  ];

  const languages = [
    { code: 'en', label: 'EN', fullName: 'English' },
    { code: 'hi', label: 'HI', fullName: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'MR', fullName: 'मराठी (Marathi)' },
  ];

  const currentViewLabel =
    viewOptions.find((v) => v.id === activeView)?.label || 'Control Room';

  const toggleOnline = () => {
    setOnlineStatus(!isOnline);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-gray-100 flex flex-col selection:bg-cascade-cyan/30 selection:text-white">
      {/* Top Fixed Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel-dark border-b border-white/10 px-4 lg:px-8 h-16 flex items-center justify-between transition-all">
        {/* Left: Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="flex items-center space-x-2.5 group focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cascade-cyan/20 to-cascade-blue/20 border border-cascade-cyan/40 text-cascade-cyan shadow-[0_0_15px_rgba(0,212,255,0.25)] group-hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all">
              <Shield className="w-5 h-5 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 rounded-lg border border-cascade-cyan/30 animate-pulse pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-cascade-cyan transition-colors">
                Cascade<span className="text-cascade-cyan">Shield</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 -mt-1 hidden sm:inline">
                Disaster Cascade Matrix
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 pl-4 border-l border-white/10">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                location.pathname === link.path ||
                (link.path === '/simulator' && location.pathname.startsWith('/simulator'));

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive: exactActive }) => {
                    const active = isActive || exactActive;
                    return `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-cascade-cyan bg-cascade-cyan/15 border border-cascade-cyan/40 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                        : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`;
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Online / Offline status badge */}
          <button
            onClick={toggleOnline}
            title={isOnline ? 'System Live (Click to test offline mode)' : 'System Offline (Click to go live)'}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all duration-200 border ${
              isOnline
                ? 'bg-cascade-green/10 border-cascade-green/30 text-cascade-green hover:bg-cascade-green/20'
                : 'bg-cascade-amber/10 border-cascade-amber/30 text-cascade-amber hover:bg-cascade-amber/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline
                  ? 'bg-cascade-green shadow-[0_0_8px_#22c55e] animate-pulse'
                  : 'bg-cascade-amber shadow-[0_0_8px_#ffb020]'
              }`}
            />
            <span className="font-semibold">{isOnline ? 'Live' : 'Offline'}</span>
            {isOnline ? (
              <Wifi className="w-3 h-3 ml-0.5 opacity-70 hidden sm:inline" />
            ) : (
              <WifiOff className="w-3 h-3 ml-0.5 opacity-70 hidden sm:inline" />
            )}
          </button>

          {/* Low-Bandwidth Mode Toggle */}
          <button
            onClick={toggleLowBandwidth}
            title={
              isLowBandwidth
                ? 'Low-Bandwidth Mode Active (Built for when the internet drops during disasters)'
                : 'Switch to Low-Bandwidth Mode (Built for when the internet drops during disasters)'
            }
            className={`hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono transition-all duration-200 border ${
              isLowBandwidth
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            <Gauge className="w-3 h-3" />
            <span>{isLowBandwidth ? 'Low-BW ON' : 'Low-BW'}</span>
          </button>

          {/* Guided Demo Walkthrough CTA */}
          <button
            onClick={() => {
              if (isDemoMode) useStore.getState().stopDemo();
              else startDemo();
            }}
            title="Launch 90-second guided presenter demo"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-cascade-cyan/20 to-cascade-blue/20 border border-cascade-cyan/40 text-cascade-cyan hover:bg-cascade-cyan/30 transition-all duration-200 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Tour</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setViewDropdownOpen(false);
              }}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-navy-800/90 border border-white/10 hover:border-cascade-cyan/40 text-gray-200 transition-colors"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-cascade-cyan" />
              <span className="font-mono uppercase font-bold text-xs">{language}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 py-1 glass-panel-dark shadow-xl border border-white/15 rounded-lg z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                      language === lang.code
                        ? 'text-cascade-cyan bg-cascade-cyan/15 font-semibold'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{lang.fullName}</span>
                    <span className="font-mono text-[10px] text-gray-400">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Toggle Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setViewDropdownOpen(!viewDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-navy-800/90 border border-white/10 hover:border-cascade-cyan/40 text-gray-200 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-cascade-cyan" />
              <span>{currentViewLabel}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {viewDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 py-1 glass-panel-dark shadow-xl border border-white/15 rounded-lg z-50">
                <div className="px-3 py-1 text-[10px] font-mono text-gray-400 uppercase tracking-wider border-b border-white/5">
                  Operating Mode
                </div>
                {viewOptions.map((v) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setActiveView(v.id);
                        setViewDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 transition-colors ${
                        activeView === v.id
                          ? 'text-cascade-cyan bg-cascade-cyan/15 font-semibold'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 md:hidden glass-panel-dark border-b border-white/10 p-4 shadow-2xl animate-in">
          <div className="flex flex-col space-y-1 mb-4">
            <span className="text-[11px] font-mono uppercase text-gray-400 tracking-wider px-2 py-1">
              Navigation
            </span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-cascade-cyan bg-cascade-cyan/15 border border-cascade-cyan/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* View Mode in Mobile Menu */}
          <div className="border-t border-white/10 pt-3">
            <span className="text-[11px] font-mono uppercase text-gray-400 tracking-wider px-2 block mb-2">
              Operational View
            </span>
            <div className="grid grid-cols-3 gap-2">
              {viewOptions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveView(v.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2 py-2 rounded-lg text-xs font-medium text-center border transition-all ${
                    activeView === v.id
                      ? 'bg-cascade-cyan/20 border-cascade-cyan text-cascade-cyan'
                      : 'bg-navy-800/80 border-white/10 text-gray-300'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pt-16 md:pt-16 pb-20 md:pb-6 flex flex-col relative overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Dock Navigation for Mobile (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
              isActive && location.pathname === '/'
                ? 'text-cascade-cyan font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/simulator"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
              isActive
                ? 'text-cascade-cyan font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Simulator</span>
        </NavLink>

        <NavLink
          to="/optimizer"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
              isActive
                ? 'text-cascade-cyan font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <Wrench className="w-5 h-5 mb-0.5" />
          <span>Optimizer</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
              isActive
                ? 'text-cascade-cyan font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>Reports</span>
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
              isActive
                ? 'text-cascade-cyan font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <Info className="w-5 h-5 mb-0.5" />
          <span>About</span>
        </NavLink>
      </nav>

      {/* Interactive Global Overlays */}
      <CustomCursor isLowBandwidth={isLowBandwidth} />
      <DemoTour />
      <ChatAssistant />
    </div>
  );
}
