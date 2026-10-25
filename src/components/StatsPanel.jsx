import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Coins,
  CheckCircle,
  AlertTriangle,
  Zap,
  Droplets,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function StatsPanel({ infrastructure = null }) {
  const {
    simulation,
    ui,
    setSelectedZone,
    setShowExplainPanel,
  } = useStore();

  const {
    results,
    currentHour,
    confidenceLevel,
  } = simulation;

  // Extract current simulation step
  const currentStep = useMemo(() => {
    if (!results?.timeline || results.timeline.length === 0) return null;
    const clampedHour = Math.min(currentHour, results.timeline.length - 1);
    return results.timeline[clampedHour];
  }, [results, currentHour]);

  // Derived metrics
  const resilienceScore = currentStep?.resilienceScore ?? 85;
  const totalPopAtRisk = currentStep?.totalPopAtRisk ?? 0;
  const totalDamageCrore = currentStep?.totalDamageCrore ?? 0;
  const failedInfraCount = currentStep?.failedInfra?.length ?? 0;

  // Infrastructure health breakdown
  const infraStatus = useMemo(() => {
    const failedSet = new Set(currentStep?.failedInfra || []);
    
    const substations = infrastructure?.substations || [];
    const totalSubs = substations.length || 5;
    const activeSubs = totalSubs - substations.filter(s => failedSet.has(s.id)).length;

    const pumpStations = infrastructure?.pumpStations || [];
    const totalPumps = pumpStations.length || 4;
    const activePumps = totalPumps - pumpStations.filter(p => failedSet.has(p.id) || failedSet.has(p.powered_by)).length;

    const hospitals = infrastructure?.hospitals || [];
    const totalHosp = hospitals.length || 8;
    const activeHosp = totalHosp - hospitals.filter(h => failedSet.has(h.powered_by)).length;

    return {
      substations: { active: Math.max(0, activeSubs), total: totalSubs },
      pumps: { active: Math.max(0, activePumps), total: totalPumps },
      hospitals: { active: Math.max(0, activeHosp), total: totalHosp },
    };
  }, [currentStep, infrastructure]);

  // Top 5 Most Vulnerable Zones
  const topVulnerableZones = useMemo(() => {
    if (!currentStep?.zoneStates) return [];
    
    return Object.entries(currentStep.zoneStates)
      .map(([id, state]) => ({
        id,
        name: state.name || id,
        overallRisk: state.overallRisk || 0,
        floodDepth: state.floodDepth || 0,
        populationAtRisk: state.populationAtRisk || 0,
        powerAvailable: state.powerAvailable !== false,
      }))
      .sort((a, b) => b.overallRisk - a.overallRisk)
      .slice(0, 5);
  }, [currentStep]);

  // Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (resilienceScore / 100) * circumference;

  const getGaugeColor = (score) => {
    if (score >= 75) return '#22c55e'; // green
    if (score >= 45) return '#ffb020'; // yellow/amber
    return '#ff3b5c'; // red
  };

  const gaugeColor = getGaugeColor(resilienceScore);

  return (
    <div className="glass-panel p-4 flex flex-col gap-4 text-sm text-gray-200 overflow-y-auto max-h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cascade-cyan" />
          <h2 className="font-display font-semibold text-white tracking-wide text-base">
            Impact Diagnostics
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-cascade-cyan">
          <Percent className="w-3 h-3" />
          <span>{confidenceLevel || 90}% Confidence</span>
        </div>
      </div>

      {/* Resilience Circular Gauge & High Level Summary */}
      <div className="bg-navy-800/90 border border-white/10 rounded-xl p-3.5 flex items-center justify-between shadow-inner">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-mono">
            Basin Resilience
          </span>
          <div className="flex items-baseline gap-1.5 font-display">
            <span
              className="text-2xl font-bold"
              style={{ color: gaugeColor }}
            >
              {Math.round(resilienceScore)}
            </span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
          <span className="text-[11px] text-gray-400">
            {resilienceScore >= 75
              ? 'Operational stability maintained'
              : resilienceScore >= 45
              ? 'Severe cascade degradation'
              : 'Critical system-wide collapse'}
          </span>
        </div>

        {/* Circular SVG Gauge */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={gaugeColor}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Shield className="w-6 h-6" style={{ color: gaugeColor }} />
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Population at Risk */}
        <div className="bg-navy-800/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-cascade-red" />
              Pop. At Risk
            </span>
          </div>
          <div className="mt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={totalPopAtRisk}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold font-display text-white tracking-tight"
              >
                {totalPopAtRisk.toLocaleString()}
              </motion.div>
            </AnimatePresence>
            <div className="text-[11px] text-gray-400 mt-0.5">
              People needing shelter/relief
            </div>
          </div>
        </div>

        {/* Estimated Damage */}
        <div className="bg-navy-800/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="flex items-center gap-1 font-medium">
              <Coins className="w-3.5 h-3.5 text-cascade-amber" />
              Est. Damage
            </span>
          </div>
          <div className="mt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={totalDamageCrore}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold font-display text-cascade-amber tracking-tight"
              >
                ₹{totalDamageCrore.toFixed(1)} <span className="text-xs font-normal">Cr</span>
              </motion.div>
            </AnimatePresence>
            <div className="text-[11px] text-gray-400 mt-0.5">
              Cumulative infrastructure + civil
            </div>
          </div>
        </div>
      </div>

      {/* Critical Infrastructure Health Matrix */}
      <div className="bg-navy-800/70 border border-white/10 rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
          <span>Lifeline Infrastructure Online</span>
          <span className="text-[11px] font-mono text-gray-400">
            {failedInfraCount > 0 ? (
              <span className="text-cascade-red font-semibold">{failedInfraCount} Down</span>
            ) : (
              <span className="text-cascade-green">Nominal</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Substations */}
          <div className="bg-navy-900/80 p-2 rounded-lg border border-white/5 flex flex-col gap-1 items-center text-center">
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Power</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  infraStatus.substations.active === infraStatus.substations.total
                    ? 'bg-cascade-green'
                    : 'bg-cascade-red animate-pulse'
                }`}
              />
              <span>{infraStatus.substations.active}/{infraStatus.substations.total}</span>
            </div>
          </div>

          {/* Pump Stations */}
          <div className="bg-navy-900/80 p-2 rounded-lg border border-white/5 flex flex-col gap-1 items-center text-center">
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Droplets className="w-3 h-3 text-teal-400" />
              <span>Pumps</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  infraStatus.pumps.active === infraStatus.pumps.total
                    ? 'bg-cascade-green'
                    : 'bg-cascade-red animate-pulse'
                }`}
              />
              <span>{infraStatus.pumps.active}/{infraStatus.pumps.total}</span>
            </div>
          </div>

          {/* Hospitals */}
          <div className="bg-navy-900/80 p-2 rounded-lg border border-white/5 flex flex-col gap-1 items-center text-center">
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Hospitals</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  infraStatus.hospitals.active === infraStatus.hospitals.total
                    ? 'bg-cascade-green'
                    : 'bg-cascade-amber animate-pulse'
                }`}
              />
              <span>{infraStatus.hospitals.active}/{infraStatus.hospitals.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Most Vulnerable Zones List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-cascade-red" />
            Top 5 Critical Zones
          </span>
          <span className="text-[10px] text-gray-400">Click to inspect</span>
        </div>

        <div className="space-y-1.5">
          {topVulnerableZones.length === 0 ? (
            <div className="text-xs text-gray-400 italic p-3 text-center bg-navy-800/40 rounded-lg">
              No elevated risk detected across zones.
            </div>
          ) : (
            topVulnerableZones.map((z, idx) => {
              const isSelected = ui.selectedZone === z.id;
              const riskPercent = Math.round(z.overallRisk * 100);
              
              let badgeColor = 'bg-cascade-red/20 text-rose-300 border-cascade-red/40';
              if (riskPercent < 40) badgeColor = 'bg-cascade-amber/20 text-amber-300 border-cascade-amber/40';
              if (riskPercent < 20) badgeColor = 'bg-cascade-green/20 text-emerald-300 border-cascade-green/40';

              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => {
                    setSelectedZone(z.id);
                    setShowExplainPanel(true);
                  }}
                  className={`w-full p-2 rounded-lg border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cascade-cyan/15 border-cascade-cyan/60 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                      : 'bg-navy-900/60 border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-5 h-5 rounded-full bg-navy-800 border border-white/10 flex items-center justify-center text-[10px] font-mono text-gray-400 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-medium text-white truncate">
                        {z.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {z.populationAtRisk.toLocaleString()} at risk • {z.floodDepth.toFixed(1)}m flood
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${badgeColor}`}>
                      {riskPercent}%
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
