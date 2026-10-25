import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, SkipForward, Sparkles, Volume2 } from 'lucide-react';
import useStore from '../store/useStore';

const DEMO_STEPS = [
  {
    step: 1,
    title: 'Phase 1: Extreme Monsoon Cloudburst Alert',
    caption: 'Rainfall intensity spikes to 165 mm/hr in Mumbai. Soil saturation reaches 85% capacity, triggering initial water accumulation along the Mithi River channel.',
    path: '/simulator',
    action: (store) => {
      store.setRainfallIntensity(165);
      store.setSoilSaturation(0.85);
      store.setCurrentHour(4);
    },
    duration: 16,
  },
  {
    step: 2,
    title: 'Phase 2: Cascading Infrastructure Failure Simulation',
    caption: 'Flooding breaches floodwalls at Kurla Substation SUB1. Dependency BFS engine triggers cascading shutdown of Water Pump Station PS2 and blocks Sion-Kurla Link Road.',
    path: '/simulator',
    action: (store) => {
      store.setCurrentHour(12);
      store.setShowExplainPanel(true);
      store.setSelectedZone('Z01'); // Kurla West
    },
    duration: 18,
  },
  {
    step: 3,
    title: 'Phase 3: Multi-Hazard Vulnerability & Causal Chain',
    caption: 'System surfaces explainable failure chains: Rainfall -> River Overspill -> Substation Trip -> Pump Station Offline -> Drinking Water Contamination -> Hospital Critical Surge.',
    path: '/simulator',
    action: (store) => {
      store.setCurrentHour(18);
    },
    duration: 18,
  },
  {
    step: 4,
    title: 'Phase 4: Multi-Objective Rescue Optimizer',
    caption: 'AI Pareto optimizer calculates optimal staging of 12 rescue teams, 8 boats, and 10 high-flow pumps. Compared to nearest-first heuristics, damage drops by 68% and ₹1,270 Cr is saved.',
    path: '/optimizer',
    action: () => {},
    duration: 20,
  },
  {
    step: 5,
    title: 'Phase 5: Real-time Multi-lingual Emergency Reports & SMS Broadcast',
    caption: 'Automated executive briefs generated for District Collectors in English, Hindi, and Marathi with localized evacuation route advisories and SMS broadcast templates.',
    path: '/reports',
    action: () => {},
    duration: 18,
  },
];

export default function DemoTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore();
  const isDemoMode = store.ui.isDemoMode;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const currentStep = DEMO_STEPS[currentStepIndex];

  // Presenter shortcuts (Space = play/pause, 1-5 = jump to section)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const targetIndex = parseInt(e.key) - 1;
        if (targetIndex < DEMO_STEPS.length) {
          if (!isDemoMode) store.startDemo();
          setCurrentStepIndex(targetIndex);
          setElapsed(0);
        }
      } else if (e.key === 'Escape' && isDemoMode) {
        store.stopDemo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDemoMode, store]);

  // Execute step action & navigation when step changes
  useEffect(() => {
    if (!isDemoMode) return;
    if (location.pathname !== currentStep.path) {
      navigate(currentStep.path);
    }
    currentStep.action(store);
  }, [currentStepIndex, isDemoMode]);

  // Timer loop for automatic walkthrough
  useEffect(() => {
    if (!isDemoMode || !isPlaying) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= currentStep.duration) {
          if (currentStepIndex + 1 < DEMO_STEPS.length) {
            setCurrentStepIndex((idx) => idx + 1);
            return 0;
          } else {
            // Finished tour
            store.stopDemo();
            return 0;
          }
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isDemoMode, isPlaying, currentStepIndex, currentStep]);

  if (!isDemoMode) return null;

  const progressPercent = ((elapsed / currentStep.duration) * 100).toFixed(0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] w-[95%] max-w-2xl"
      >
        <div className="relative overflow-hidden rounded-2xl bg-navy-950/95 border-2 border-cascade-cyan/60 shadow-[0_0_50px_rgba(0,212,255,0.35)] backdrop-blur-2xl p-4 sm:p-5 text-white">
          {/* Progress line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cascade-cyan via-cascade-blue to-cascade-violet transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cascade-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cascade-cyan" />
              </span>
              <span className="font-display font-bold text-xs uppercase tracking-widest text-cascade-cyan flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Guided Demo Walkthrough ({currentStepIndex + 1} / {DEMO_STEPS.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                title={isPlaying ? 'Pause Demo (Space)' : 'Play Demo (Space)'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-cascade-cyan" />}
              </button>

              <button
                onClick={() => {
                  if (currentStepIndex + 1 < DEMO_STEPS.length) {
                    setCurrentStepIndex((idx) => idx + 1);
                    setElapsed(0);
                  } else {
                    store.stopDemo();
                  }
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                title="Next Step"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => store.stopDemo()}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Exit Demo (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-2.5">
            <h4 className="font-display font-semibold text-sm sm:text-base text-white">
              {currentStep.title}
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
              {currentStep.caption}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono">
              Shortcuts: <kbd className="px-1 py-0.5 rounded bg-white/10 text-cyan-300">Space</kbd> Pause &bull;{' '}
              <kbd className="px-1 py-0.5 rounded bg-white/10 text-cyan-300">1-5</kbd> Jump &bull;{' '}
              <kbd className="px-1 py-0.5 rounded bg-white/10 text-cyan-300">Esc</kbd> Exit
            </span>
            <div className="flex gap-1.5">
              {DEMO_STEPS.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setElapsed(0);
                  }}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'bg-cascade-cyan w-8'
                      : idx < currentStepIndex
                      ? 'bg-cyan-500/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
