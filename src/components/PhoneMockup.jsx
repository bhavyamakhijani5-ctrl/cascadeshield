import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, ChevronLeft, Phone, MoreVertical } from 'lucide-react';

/**
 * PhoneMockup - Realistic smartphone chassis component
 * Displays child content within an authentic mobile bezel, notch, status bar, and home bar.
 */
export default function PhoneMockup({
  children,
  title = 'Emergency Alerts',
  subtitle = 'Broadcast Channel',
  senderNumber = 'GOV-DISASTER',
  className = '',
}) {
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative mx-auto w-full max-w-[340px] sm:max-w-[360px] h-[640px] sm:h-[680px] bg-slate-950 rounded-[44px] p-3 shadow-2xl ring-1 ring-white/15 border-4 border-slate-800 flex flex-col select-none overflow-hidden ${className}`}
      style={{
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 25px rgba(0, 212, 255, 0.1)',
      }}
    >
      {/* Outer Side Buttons Details */}
      <div className="absolute -left-[7px] top-24 w-[3px] h-10 bg-slate-700 rounded-l-sm" />
      <div className="absolute -left-[7px] top-38 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
      <div className="absolute -right-[7px] top-28 w-[3px] h-16 bg-slate-700 rounded-r-sm" />

      {/* Screen Container */}
      <div className="relative flex-1 bg-navy-950 rounded-[34px] overflow-hidden flex flex-col border border-white/5">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between px-3 h-5 w-28 bg-black rounded-full ring-1 ring-white/10 shadow-md">
          {/* Camera Lens */}
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900/60" />
          </div>
          {/* Speaker slit */}
          <div className="w-7 h-1 rounded-full bg-slate-800/80" />
        </div>

        {/* Status Bar */}
        <div className="h-10 pt-2 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-20">
          <span>{currentTime}</span>
          <div className="flex items-center space-x-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[9px] font-mono">88%</span>
              <Battery className="w-3.5 h-3.5 text-slate-200 fill-slate-200" />
            </div>
          </div>
        </div>

        {/* Messaging App Top Header */}
        <div className="px-3 py-2 bg-navy-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="text-cascade-cyan hover:text-cascade-cyan/80 p-0.5"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white text-[10px] font-bold shadow">
              ND
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1">
                <span>{senderNumber}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {title} • {subtitle}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <Phone className="w-3.5 h-3.5 hover:text-slate-200 cursor-pointer" />
            <MoreVertical className="w-3.5 h-3.5 hover:text-slate-200 cursor-pointer" />
          </div>
        </div>

        {/* Screen Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col space-y-3 text-slate-100 text-xs">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-6 flex items-center justify-center bg-navy-950 pb-1">
          <div className="w-28 h-1 bg-slate-500/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}
