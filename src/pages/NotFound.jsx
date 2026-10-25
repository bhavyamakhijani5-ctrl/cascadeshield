import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
      {/* Background glowing aura */}
      <div className="absolute w-96 h-96 bg-cascade-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-80 h-80 bg-cascade-cyan/10 rounded-full blur-3xl pointer-events-none -top-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-8 sm:p-12 max-w-md w-full border-cascade-red/30 relative z-10 shadow-2xl"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cascade-red/10 border border-cascade-red/40 flex items-center justify-center text-cascade-red shadow-[0_0_20px_rgba(255,59,92,0.3)]">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-7xl sm:text-8xl font-display font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cascade-cyan via-white to-cascade-red drop-shadow-[0_0_25px_rgba(255,59,92,0.4)]"
        >
          404
        </motion.div>

        <h1 className="mt-4 text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm text-gray-300 leading-relaxed font-light">
          The emergency sector or telemetry coordinate you requested does not exist or has been cordoned off during cascade re-routing.
        </p>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-cascade-cyan/20 border border-cascade-cyan/50 text-cascade-cyan rounded-xl font-display font-semibold text-sm hover:bg-cascade-cyan/30 transition-all duration-300 shadow-[0_0_15px_rgba(0,212,255,0.25)] group"
          >
            <Home className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Base</span>
          </Link>
          <Link
            to="/simulator"
            className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-display font-medium text-sm hover:bg-white/10 hover:text-white transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Open Simulator</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
