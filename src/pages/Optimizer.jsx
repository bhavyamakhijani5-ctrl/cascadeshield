import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Users,
  Coins,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Gauge,
  Flame,
  Clock,
  Building,
} from 'lucide-react';
import useStore from '../store/useStore';
import ComparisonChart from '../components/ComparisonChart';
import AllocationTable from '../components/AllocationTable';
import RoutePlanner from '../components/RoutePlanner';
import ResourceEditor from '../components/ResourceEditor';
import {
  DEFAULT_INVENTORY,
  computeOptimizationResults,
} from '../utils/optimizerEngine';

// Smooth animated numeric counter component
function AnimatedCounter({ value, duration = 1000, prefix = '', suffix = '', formatLocale = false }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startValRef = useRef(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startValRef.current = displayValue;
    startTimeRef.current = null;

    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValRef.current + (value - startValRef.current) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = formatLocale ? displayValue.toLocaleString() : displayValue;
  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default function Optimizer() {
  // Zustand store
  const simulationResults = useStore((state) => state.simulation.results);
  const setResults = useStore((state) => state.setResults);
  const setAllocations = useStore((state) => state.setAllocations);
  const setOptimizerResult = useStore((state) => state.setOptimizerResult);
  const addBlockedAsset = useStore((state) => state.addBlockedAsset);
  const removeBlockedAsset = useStore((state) => state.removeBlockedAsset);

  // Local state for inventory & what-if scenarios
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY);
  const [whatIfs, setWhatIfs] = useState({
    extraTeams: false,
    bridgeClosed: false,
    substationFails: false,
    doublePumps: false,
  });
  const [isComputing, setIsComputing] = useState(false);

  // Compute optimization whenever inventory, whatIfs, or simulationResults change
  const optimizationData = useMemo(() => {
    return computeOptimizationResults({
      inventory,
      whatIfs,
      simulationResults,
    });
  }, [inventory, whatIfs, simulationResults]);

  // Sync with store on mount / change
  useEffect(() => {
    if (optimizationData) {
      setAllocations(optimizationData.allocations);
      setOptimizerResult(optimizationData);
    }
  }, [optimizationData, setAllocations, setOptimizerResult]);

  // Handle What-If button toggles
  const handleToggleWhatIf = (key) => {
    setIsComputing(true);
    setWhatIfs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Sync bridge blockage to store
      if (key === 'bridgeClosed') {
        if (next.bridgeClosed) {
          addBlockedAsset('bridge-x');
          addBlockedAsset('bridge-mithi');
        } else {
          removeBlockedAsset('bridge-x');
          removeBlockedAsset('bridge-mithi');
        }
      }
      return next;
    });

    setTimeout(() => {
      setIsComputing(false);
    }, 350);
  };

  // Re-optimize handler from ResourceEditor
  const handleReoptimizeInventory = (newInventory) => {
    setIsComputing(true);
    setInventory(newInventory);
    setTimeout(() => {
      setIsComputing(false);
    }, 350);
  };

  // Load sample simulation data if none exists
  const handleLoadSampleSimulation = () => {
    setResults({
      id: 'sim-mumbai-monsoon-cat4',
      name: 'Mumbai Severe Flood 150mm/hr',
      rainfallIntensity: 150,
      duration: 36,
      soilSaturation: 0.85,
      confidenceLevel: 94,
      generatedAt: new Date().toISOString(),
      zoneRisks: {
        'zone-dharavi': 1.15,
        'zone-kurla-w': 1.18,
        'zone-kalina': 1.1,
        'zone-sion': 1.08,
      },
    });
  };

  const { summary, allocations, strategiesData } = optimizationData;

  return (
    <div className="min-h-screen bg-navy-900 text-gray-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner: Simulation check notice if no results exist */}
      {!simulationResults && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-200">
                Simulation Results Not Loaded
              </h4>
              <p className="text-amber-300/80 mt-0.5">
                Run the hydraulic disaster simulator first to load live localized breach velocities, or load
                the preset 150mm/hr Mumbai flood vector below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              onClick={handleLoadSampleSimulation}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-medium transition-all"
            >
              Load Sample Flood Vector
            </button>
            <Link
              to="/simulator"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cascade-cyan text-navy-900 font-semibold hover:bg-cyan-300 transition-all shadow-[0_0_12px_rgba(0,212,255,0.4)]"
            >
              <span>Go to Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cascade-cyan/15 border border-cascade-cyan/30 text-cascade-cyan">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
                CascadeShield Rescue & Resource Optimizer
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Multi-objective emergency asset dispatch, before/after impact mitigation, and tactical evacuation routes
              </p>
            </div>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-3 bg-navy-800/80 px-4 py-2 rounded-xl border border-white/10 text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-gray-300">
            Optimizer Status:{' '}
            <strong className="text-emerald-400 font-mono">
              {isComputing ? 'Recalculating Pareto Front...' : 'Optimal Solution Active'}
            </strong>
          </span>
        </div>
      </div>

      {/* Summary Impact Section with Animated Counters */}
      <section className="glass-panel p-6 bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cascade-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-cascade-cyan" />
              <h2 className="text-base font-display font-bold text-white uppercase tracking-wider">
                Optimization Impact Summary
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              Confidence Index: <span className="text-emerald-400 font-bold">96.4%</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Metric 1: Damage Reduction */}
            <div className="bg-navy-900/70 border border-cascade-cyan/30 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Damage Reduction
                </span>
                <TrendingDown className="w-5 h-5 text-cascade-cyan" />
              </div>
              <div className="my-3">
                <div className="text-3xl sm:text-4xl font-display font-black text-cascade-cyan font-mono flex items-baseline">
                  <AnimatedCounter value={summary.damageReductionPercent} suffix="%" />
                </div>
                <span className="text-xs text-gray-300 mt-1 block">
                  Less infrastructure & structural loss
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Direct damage averted:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  -₹{summary.economicLossWithoutCr - summary.economicLossWithCr} Cr
                </span>
              </div>
            </div>

            {/* Metric 2: Lives Protected */}
            <div className="bg-navy-900/70 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Lives Protected
                </span>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="my-3">
                <div className="text-3xl sm:text-4xl font-display font-black text-emerald-400 font-mono flex items-baseline">
                  <AnimatedCounter value={summary.livesProtectedCount} formatLocale />
                </div>
                <span className="text-xs text-gray-300 mt-1 block">
                  Citizens safely evacuated / insulated
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Preventable casualties:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  90% drop ({summary.preventableCasualtiesWithout} → {summary.preventableCasualtiesWith})
                </span>
              </div>
            </div>

            {/* Metric 3: INR Saved */}
            <div className="bg-navy-900/70 border border-amber-500/30 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Economic Loss Prevented
                </span>
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <div className="my-3">
                <div className="text-3xl sm:text-4xl font-display font-black text-amber-400 font-mono flex items-baseline">
                  <AnimatedCounter value={summary.inrSavedCrore} prefix="₹" suffix=" Cr" />
                </div>
                <span className="text-xs text-gray-300 mt-1 block">
                  Municipal & private capital protected
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Response speedup:</span>
                <span className="font-mono text-amber-300 font-semibold">
                  {summary.responseTimeBefore}m → {summary.responseTimeAfter}m (69% faster)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What-If Controls Bar */}
      <section className="glass-panel p-5 bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Dynamic What-If Tactical Scenario Controls
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Simulate infrastructure failures or surge capacity to trigger instant Pareto re-optimization
            </p>
          </div>
          {Object.values(whatIfs).some(Boolean) && (
            <button
              onClick={() =>
                setWhatIfs({
                  extraTeams: false,
                  bridgeClosed: false,
                  substationFails: false,
                  doublePumps: false,
                })
              }
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Scenarios
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* What-If 1: +2 Rescue Teams */}
          <button
            onClick={() => handleToggleWhatIf('extraTeams')}
            className={`p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between ${
              whatIfs.extraTeams
                ? 'bg-cascade-cyan/20 border-cascade-cyan text-white shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                : 'bg-navy-900/60 border-white/10 text-gray-300 hover:border-white/25 hover:bg-navy-900'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-semibold text-xs">+2 Rescue Teams</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  whatIfs.extraTeams ? 'bg-cascade-cyan animate-pulse' : 'bg-gray-600'
                }`}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              Deploy NDRF reserve battalion to Mithi basin
            </span>
          </button>

          {/* What-If 2: Bridge X Closed */}
          <button
            onClick={() => handleToggleWhatIf('bridgeClosed')}
            className={`p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between ${
              whatIfs.bridgeClosed
                ? 'bg-rose-500/20 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-navy-900/60 border-white/10 text-gray-300 hover:border-white/25 hover:bg-navy-900'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-semibold text-xs">Bridge X Closed</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  whatIfs.bridgeClosed ? 'bg-rose-500 animate-pulse' : 'bg-gray-600'
                }`}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              Mithi River Bridge flooded; reroute via SCLR
            </span>
          </button>

          {/* What-If 3: Substation Y Fails */}
          <button
            onClick={() => handleToggleWhatIf('substationFails')}
            className={`p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between ${
              whatIfs.substationFails
                ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-navy-900/60 border-white/10 text-gray-300 hover:border-white/25 hover:bg-navy-900'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-semibold text-xs">Substation Y Fails</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  whatIfs.substationFails ? 'bg-amber-500 animate-pulse' : 'bg-gray-600'
                }`}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              Kalina 220kV blackout; surge generator priorities
            </span>
          </button>

          {/* What-If 4: Double Pumps */}
          <button
            onClick={() => handleToggleWhatIf('doublePumps')}
            className={`p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between ${
              whatIfs.doublePumps
                ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-navy-900/60 border-white/10 text-gray-300 hover:border-white/25 hover:bg-navy-900'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-semibold text-xs">Double Pumps</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  whatIfs.doublePumps ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'
                }`}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              Mobilize 120 dewatering units to Dharavi & Kurla
            </span>
          </button>
        </div>
      </section>

      {/* Top Split View: Without Optimization vs With Optimization */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cascade-cyan" />
            <h2 className="text-lg font-display font-bold text-white tracking-wide">
              Before / After Tactical Split View
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            Real-time heuristic comparison under current flood parameters
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Without Optimization */}
          <div className="bg-gradient-to-br from-rose-950/20 to-navy-900/80 border border-rose-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="font-display font-bold text-rose-200 text-sm tracking-wide">
                  Without Optimization (Legacy / Ad-Hoc Dispatch)
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                High Risk Exposure
              </span>
            </div>

            <p className="text-xs text-rose-200/80 leading-relaxed">
              Dispatch decisions occur reactively as distress calls arrive. Resources are clumped near easy
              access zones (Bandra West), while high-density lowlands (Dharavi, Kurla) experience severe
              resource starvation and gridlock.
            </p>

            {/* Legacy Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-navy-950/80 p-3 rounded-xl border border-rose-500/20">
                <span className="text-gray-400 block text-[10px]">Avg Response Delay</span>
                <span className="text-rose-400 font-mono font-bold text-base">
                  {summary.responseTimeBefore} mins
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Heavy congestion</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-rose-500/20">
                <span className="text-gray-400 block text-[10px]">Assets Protected</span>
                <span className="text-rose-400 font-mono font-bold text-base">
                  {summary.criticalAssetsSaved} / {summary.totalCriticalAssets}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">56% vulnerable</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-rose-500/20">
                <span className="text-gray-400 block text-[10px]">Projected Casualties</span>
                <span className="text-rose-400 font-mono font-bold text-base">
                  {summary.preventableCasualtiesWithout.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Severe trauma load</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-rose-500/20">
                <span className="text-gray-400 block text-[10px]">Direct Losses</span>
                <span className="text-rose-400 font-mono font-bold text-base">
                  ₹{summary.economicLossWithoutCr} Cr
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Critical damages</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-rose-500/20">
                <span className="text-gray-400 block text-[10px]">Hospital Overload</span>
                <span className="text-rose-400 font-mono font-bold text-base">145%</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Sion Hospital crash</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-rose-500/20">
                <span className="text-gray-400 block text-[10px]">Dewatering Status</span>
                <span className="text-rose-400 font-mono font-bold text-base">Delayed</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Pumps misallocated</span>
              </div>
            </div>

            {/* Visual warning bullet */}
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 flex items-center gap-3 text-xs text-rose-300">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                3 key transit bottlenecks unaddressed. Severe cascade propagation into BKC power stations.
              </span>
            </div>
          </div>

          {/* Right: With Optimization */}
          <div className="bg-gradient-to-br from-cascade-cyan/10 to-navy-900/80 border border-cascade-cyan/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-cascade-cyan/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cascade-cyan shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                <h3 className="font-display font-bold text-cascade-cyan text-sm tracking-wide">
                  With Optimization (CascadeShield AI Multi-Objective Dispatch)
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cascade-cyan/20 text-cascade-cyan font-bold border border-cascade-cyan/40">
                Pareto Optimal
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              AI pre-positions boats, high-capacity pumps, and rescue battalions ahead of flood waves. Routes
              dynamically bypass submerged bridges and distribute patient volume evenly across all regional hospitals.
            </p>

            {/* Optimized Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-navy-950/80 p-3 rounded-xl border border-cascade-cyan/30">
                <span className="text-gray-400 block text-[10px]">Avg Response Delay</span>
                <span className="text-cascade-cyan font-mono font-bold text-base">
                  {summary.responseTimeAfter} mins
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">69% acceleration</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-cascade-cyan/30">
                <span className="text-gray-400 block text-[10px]">Assets Protected</span>
                <span className="text-emerald-400 font-mono font-bold text-base">
                  {summary.criticalAssetsSaved} / {summary.totalCriticalAssets}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">91% protected</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-cascade-cyan/30">
                <span className="text-gray-400 block text-[10px]">Projected Casualties</span>
                <span className="text-emerald-400 font-mono font-bold text-base">
                  {summary.preventableCasualtiesWith.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">90% reduction</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-cascade-cyan/30">
                <span className="text-gray-400 block text-[10px]">Direct Losses</span>
                <span className="text-cascade-cyan font-mono font-bold text-base">
                  ₹{summary.economicLossWithCr} Cr
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">₹{summary.inrSavedCrore} Cr saved</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-cascade-cyan/30">
                <span className="text-gray-400 block text-[10px]">Hospital Overload</span>
                <span className="text-emerald-400 font-mono font-bold text-base">88%</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Triage load balanced</span>
              </div>
              <div className="bg-navy-950/80 p-3 rounded-xl border border-cascade-cyan/30">
                <span className="text-gray-400 block text-[10px]">Dewatering Status</span>
                <span className="text-emerald-400 font-mono font-bold text-base">Active</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Pre-staged at culverts</span>
              </div>
            </div>

            {/* Visual confirmation bullet */}
            <div className="bg-cascade-cyan/15 border border-cascade-cyan/30 rounded-xl p-3 flex items-center gap-3 text-xs text-cyan-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                All 6 high-density priority zones covered within 25 minutes. Zero substation catastrophic cascade.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Chart Section */}
      <section className="space-y-4">
        <ComparisonChart strategiesData={strategiesData} />
      </section>

      {/* Resource Inventory Editor Section */}
      <section className="space-y-4">
        <ResourceEditor
          currentInventory={inventory}
          onReoptimize={handleReoptimizeInventory}
          isLoading={isComputing}
        />
      </section>

      {/* Middle Section: Zone Allocation Table */}
      <section className="space-y-4">
        <AllocationTable allocations={allocations} />
      </section>

      {/* Bottom Section: Tactical Evacuation Route Planner */}
      <section className="space-y-4">
        <RoutePlanner bridgeClosedOverride={whatIfs.bridgeClosed} />
      </section>

      {/* Footer Info & Feedback */}
      <div className="pt-6 border-t border-white/10 text-center text-xs text-gray-500 space-y-1">
        <p>CascadeShield AI Emergency Resource Dispatcher • Mumbai Municipal Disaster Management System</p>
        <p className="text-[11px] text-gray-600">
          All data generated via predictive hydraulic cascading algorithms and synthetic civil infrastructure models.
        </p>
      </div>
    </div>
  );
}
