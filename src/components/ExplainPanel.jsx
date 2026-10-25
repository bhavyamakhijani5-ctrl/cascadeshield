import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  HelpCircle,
  AlertTriangle,
  CloudRain,
  Zap,
  Droplets,
  Activity,
  Compass,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle,
  Truck,
  Mountain,
  Navigation
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { explainCauseChain } from '../engine/cascade';

export default function ExplainPanel({
  zonesData = null,
  infrastructure = null,
  dependencies = null,
}) {
  const {
    simulation,
    ui,
    setSelectedZone,
    setShowExplainPanel,
  } = useStore();

  const { selectedZone } = ui;
  const { results, currentHour } = simulation;

  const currentStep = useMemo(() => {
    if (!results?.timeline) return null;
    const clampedHour = Math.min(currentHour, results.timeline.length - 1);
    return results.timeline[clampedHour];
  }, [results, currentHour]);

  const zoneFeature = useMemo(() => {
    if (!selectedZone || !zonesData?.features) return null;
    return zonesData.features.find((f) => f.properties?.id === selectedZone);
  }, [selectedZone, zonesData]);

  const zoneState = useMemo(() => {
    if (!selectedZone || !currentStep?.zoneStates) return null;
    return currentStep.zoneStates[selectedZone];
  }, [selectedZone, currentStep]);

  // Compute or get explanation chain
  const cascadeChain = useMemo(() => {
    if (!selectedZone || !currentStep) return [];
    
    // Call engine explainCauseChain
    const rawChain = explainCauseChain(
      selectedZone,
      currentStep,
      infrastructure,
      dependencies
    );

    // If chain is empty (e.g. at T+0 or very low rain), provide baseline step
    if (rawChain.length === 0) {
      return [
        {
          event: 'Conditions Stable',
          type: 'water',
          probability: 0.1,
          timelag: 0,
          cause: 'Drainage network handling current precipitation level',
        },
      ];
    }
    return rawChain;
  }, [selectedZone, currentStep, infrastructure, dependencies]);

  // Determine recommended emergency actions based on highest risks
  const recommendedActions = useMemo(() => {
    if (!zoneState) return [];
    const actions = [];

    if (zoneState.floodDepth > 1.2) {
      actions.push({
        title: 'Priority Evacuation - Watercraft Needed',
        detail: 'Deploy 2 NDRF inflatable rescue boats to low-lying sectors.',
        priority: 'critical',
      });
    } else if (zoneState.floodRisk > 0.4) {
      actions.push({
        title: 'Deploy High-Volume Mobile Pumps',
        detail: 'Position dewatering pumps at Mithi outfall culverts.',
        priority: 'high',
      });
    }

    if (!zoneState.powerAvailable) {
      actions.push({
        title: 'Emergency Generator Interconnect',
        detail: 'Dispatch 250kVA mobile generator to maintain feeder lines.',
        priority: 'high',
      });
    }

    if (zoneState.contaminationRisk > 0.3) {
      actions.push({
        title: 'Potable Water Tanker Deployment',
        detail: 'Dispatch 10,000L water tankers to community centers.',
        priority: 'medium',
      });
    }

    if (zoneState.roadAccessibility < 0.6) {
      actions.push({
        title: 'Traffic Diversion & Barrier Placement',
        detail: 'Seal submerged road corridors and divert to elevated bypass.',
        priority: 'medium',
      });
    }

    if (actions.length === 0) {
      actions.push({
        title: 'Standard Monitoring & Patrol',
        detail: 'Maintain regular ward surveillance and inspect storm drains.',
        priority: 'low',
      });
    }

    return actions;
  }, [zoneState]);

  if (!selectedZone || !zoneFeature) return null;

  const props = zoneFeature.properties || {};

  // Hazard type colors and icons
  const getHazardMeta = (type) => {
    switch (type) {
      case 'rainfall':
        return {
          icon: CloudRain,
          border: 'border-cyan-500/40',
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          pill: 'bg-cyan-500/20 text-cyan-300',
        };
      case 'flood':
        return {
          icon: Droplets,
          border: 'border-cyan-400/40',
          bg: 'bg-cyan-400/10',
          text: 'text-cyan-300',
          pill: 'bg-cyan-400/20 text-cyan-200',
        };
      case 'landslide':
        return {
          icon: Mountain,
          border: 'border-violet-500/40',
          bg: 'bg-violet-500/10',
          text: 'text-violet-400',
          pill: 'bg-violet-500/20 text-violet-300',
        };
      case 'power':
        return {
          icon: Zap,
          border: 'border-amber-500/40',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          pill: 'bg-amber-500/20 text-amber-300',
        };
      case 'water':
        return {
          icon: Droplets,
          border: 'border-teal-500/40',
          bg: 'bg-teal-500/10',
          text: 'text-teal-400',
          pill: 'bg-teal-500/20 text-teal-300',
        };
      case 'road':
        return {
          icon: Navigation,
          border: 'border-rose-500/40',
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          pill: 'bg-rose-500/20 text-rose-300',
        };
      case 'hospital':
        return {
          icon: Activity,
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          pill: 'bg-emerald-500/20 text-emerald-300',
        };
      default:
        return {
          icon: AlertTriangle,
          border: 'border-sky-500/40',
          bg: 'bg-sky-500/10',
          text: 'text-sky-400',
          pill: 'bg-sky-500/20 text-sky-300',
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="glass-panel p-4 flex flex-col gap-4 text-sm text-gray-200 overflow-y-auto max-h-full select-none">
      {/* Header with Title and Close Button */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <HelpCircle className="w-5 h-5 text-cascade-cyan flex-shrink-0" />
          <div className="truncate">
            <h2 className="font-display font-semibold text-white tracking-wide text-base truncate">
              {props.name || selectedZone}
            </h2>
            <div className="text-[11px] font-mono text-cascade-cyan">
              Zone ID: {selectedZone} • Why is this zone at risk?
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowExplainPanel(false);
            setSelectedZone(null);
          }}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Close Explain Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Zone Key Physical & Demographic Attributes */}
      <div className="grid grid-cols-2 gap-2 bg-navy-800/80 p-3 rounded-xl border border-white/10 text-xs">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-mono">
            Population & Density
          </span>
          <span className="font-bold text-white font-mono">
            {(props.population || 0).toLocaleString()}
          </span>
          <span className="text-gray-400 text-[10px] block">
            {(props.density || 0).toLocaleString()} /km²
          </span>
        </div>

        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-mono">
            Elevation & River Proximity
          </span>
          <span className="font-bold text-white font-mono">
            {props.elevation_m ?? '--'} m
          </span>
          <span className="text-gray-400 text-[10px] block">
            {props.distance_to_river_km ?? '--'} km from river
          </span>
        </div>

        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-mono">
            Drainage Quality
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-full bg-navy-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cascade-cyan h-full"
                style={{ width: `${Math.round((props.drainage_quality || 0.3) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-gray-300">
              {Math.round((props.drainage_quality || 0.3) * 100)}%
            </span>
          </div>
        </div>

        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-mono">
            Vulnerability Index
          </span>
          <span className="font-bold text-cascade-amber font-mono">
            {((props.pct_children_elderly || 0.3) * 100).toFixed(0)}% Vulnerable
          </span>
        </div>
      </div>

      {/* Cause Chain Vertical Timeline */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
          <span className="flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-cascade-cyan" />
            <span>Cascade Propagation Chain</span>
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            Current Hour: T+{currentHour}h
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative pl-5 border-l-2 border-white/10 space-y-3.5 my-1"
        >
          {cascadeChain.map((step, idx) => {
            const meta = getHazardMeta(step.type);
            const IconComponent = meta.icon;

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative"
              >
                {/* Timeline node dot */}
                <div
                  className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-navy-900 flex items-center justify-center ${meta.bg}`}
                >
                  <div className={`w-2 h-2 rounded-full ${meta.text.replace('text-', 'bg-')}`} />
                </div>

                {/* Step card */}
                <div
                  className={`p-2.5 rounded-xl border ${meta.border} ${meta.bg} flex flex-col gap-1 transition-all`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <IconComponent className={`w-3.5 h-3.5 ${meta.text}`} />
                      <span>{step.event}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {step.timelag !== undefined && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-gray-300 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          +{step.timelag}h
                        </span>
                      )}
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${meta.pill}`}>
                        {Math.round((step.probability || 0.8) * 100)}%
                      </span>
                    </div>
                  </div>

                  {step.cause && (
                    <p className="text-[11px] text-gray-300 leading-relaxed pl-5">
                      {step.cause}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Recommended Resource Actions Section */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Recommended Mitigation Actions</span>
          </span>
          <span className="text-[10px] text-cascade-green font-mono">
            Optimized Dispatch
          </span>
        </div>

        <div className="space-y-2">
          {recommendedActions.map((action, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-navy-800/80 border border-white/10 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cascade-green" />
                  {action.title}
                </span>
                <span
                  className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.2 rounded ${
                    action.priority === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : action.priority === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {action.priority}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-normal">
                {action.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
