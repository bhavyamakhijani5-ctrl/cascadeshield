import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Zap,
  Droplets,
  MapPin,
  Activity,
  Flame,
  ShieldAlert,
  Bell,
  Filter,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AlertsFeed({ infrastructure = null }) {
  const {
    simulation,
    setSelectedZone,
    setShowExplainPanel,
  } = useStore();

  const { results, currentHour } = simulation;
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Auto-generate alerts up to currentHour based on timeline results
  const alerts = useMemo(() => {
    if (!results?.timeline) return [];

    const generatedAlerts = [];
    const maxHour = Math.min(currentHour, results.timeline.length - 1);

    // Keep track of emitted events to avoid duplicates across consecutive hours
    const seenEvents = new Set();

    for (let h = 0; h <= maxHour; h++) {
      const step = results.timeline[h];
      if (!step) continue;

      // 1. Heavy rainfall alerts
      if (step.rainfall > 80 && !seenEvents.has(`rain-heavy-${h}`)) {
        seenEvents.add(`rain-heavy-${h}`);
        generatedAlerts.unshift({
          id: `rain-${h}`,
          hour: h,
          timestamp: `T+${h}h`,
          severity: step.rainfall > 120 ? 'critical' : 'warning',
          type: 'rainfall',
          zone: 'Basin Wide',
          zoneId: null,
          message: `Extreme cloudburst detected: ${step.rainfall.toFixed(0)} mm/hr over Mithi watershed.`,
        });
      }

      // 2. Failed infrastructure alerts
      if (step.failedInfra && Array.isArray(step.failedInfra)) {
        for (const infraId of step.failedInfra) {
          const key = `infra-${infraId}`;
          if (!seenEvents.has(key)) {
            seenEvents.add(key);

            // Find name
            const sub = infrastructure?.substations?.find(s => s.id === infraId);
            const pump = infrastructure?.pumpStations?.find(p => p.id === infraId);
            const bridge = infrastructure?.bridges?.find(b => b.id === infraId);

            if (sub) {
              generatedAlerts.unshift({
                id: `sub-${infraId}-${h}`,
                hour: h,
                timestamp: `T+${h}h`,
                severity: 'critical',
                type: 'power',
                zone: sub.zones_served?.[0] || 'Multiple',
                zoneId: sub.zones_served?.[0] || null,
                message: `Grid Outage: ${sub.name} tripped from floodwaters. ${(sub.zones_served || []).length} zones lost grid feed.`,
              });
            } else if (pump) {
              generatedAlerts.unshift({
                id: `pump-${infraId}-${h}`,
                hour: h,
                timestamp: `T+${h}h`,
                severity: 'critical',
                type: 'water',
                zone: pump.zones_served?.[0] || 'Basin',
                zoneId: pump.zones_served?.[0] || null,
                message: `Pump Station Failure: ${pump.name} flooded or unpowered. Dewatering capacity halted.`,
              });
            } else if (bridge) {
              generatedAlerts.unshift({
                id: `bridge-${infraId}-${h}`,
                hour: h,
                timestamp: `T+${h}h`,
                severity: 'warning',
                type: 'road',
                zone: bridge.connects?.[0] || 'Transit',
                zoneId: bridge.connects?.[0] || null,
                message: `Road Closure: ${bridge.name} submerged above structural safety limit.`,
              });
            }
          }
        }
      }

      // 3. Zone level deep flooding & contamination
      if (step.zoneStates) {
        for (const [zid, zState] of Object.entries(step.zoneStates)) {
          // Severe Flood
          if (zState.floodDepth >= 1.0 && !seenEvents.has(`flood-${zid}`)) {
            seenEvents.add(`flood-${zid}`);
            generatedAlerts.unshift({
              id: `flood-${zid}-${h}`,
              hour: h,
              timestamp: `T+${h}h`,
              severity: zState.floodDepth >= 1.8 ? 'critical' : 'warning',
              type: 'flood',
              zone: zState.name || zid,
              zoneId: zid,
              message: `Severe Inundation: Water levels reached ${zState.floodDepth.toFixed(1)}m. Ground floor evacuation triggered.`,
            });
          }

          // Water contamination
          if (zState.contaminationRisk >= 0.45 && !seenEvents.has(`contam-${zid}`)) {
            seenEvents.add(`contam-${zid}`);
            generatedAlerts.unshift({
              id: `contam-${zid}-${h}`,
              hour: h,
              timestamp: `T+${h}h`,
              severity: 'warning',
              type: 'contamination',
              zone: zState.name || zid,
              zoneId: zid,
              message: `Water Contamination Alert: Sewage intrusion in municipal pipelines. Boil-water notice active.`,
            });
          }

          // Hospital stress
          if (zState.hospitalStress >= 0.7 && !seenEvents.has(`hosp-${zid}`)) {
            seenEvents.add(`hosp-${zid}`);
            generatedAlerts.unshift({
              id: `hosp-${zid}-${h}`,
              hour: h,
              timestamp: `T+${h}h`,
              severity: 'critical',
              type: 'hospital',
              zone: zState.name || zid,
              zoneId: zid,
              message: `Hospital Surge Alert: Emergency triage saturated; generator fuel reserves critical.`,
            });
          }
        }
      }
    }

    // Default informative alerts if none yet
    if (generatedAlerts.length === 0) {
      generatedAlerts.push({
        id: 'init-0',
        hour: 0,
        timestamp: 'T+0h',
        severity: 'info',
        type: 'info',
        zone: 'Basin Wide',
        zoneId: null,
        message: 'Disaster monitoring initialized. No cascade disruptions at baseline T+0h.',
      });
    }

    return generatedAlerts.slice(0, 20); // Maximum 20 alerts
  }, [results, currentHour, infrastructure]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    if (filterSeverity === 'all') return alerts;
    return alerts.filter((a) => a.severity === filterSeverity);
  }, [alerts, filterSeverity]);

  const getAlertIcon = (type, severity) => {
    switch (type) {
      case 'power':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'water':
      case 'flood':
      case 'contamination':
        return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'road':
        return <Navigation className="w-3.5 h-3.5 text-rose-400" />;
      case 'hospital':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return severity === 'critical' ? (
          <Flame className="w-3.5 h-3.5 text-cascade-red" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-cascade-amber" />
        );
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          card: 'bg-rose-950/30 border-rose-500/30 hover:border-rose-500/50',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'warning':
        return {
          card: 'bg-amber-950/30 border-amber-500/30 hover:border-amber-500/50',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      default:
        return {
          card: 'bg-cyan-950/20 border-cyan-500/20 hover:border-cyan-500/40',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
    }
  };

  return (
    <div className="glass-panel p-3.5 flex flex-col gap-3 text-sm text-gray-200 select-none overflow-hidden h-full">
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cascade-cyan animate-pulse" />
          <h3 className="font-display font-semibold text-white tracking-wide text-sm">
            Live Cascade Feed
          </h3>
          <span className="text-xs font-mono px-2 py-0.2 rounded-full bg-white/10 text-gray-300">
            {filteredAlerts.length}
          </span>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 bg-navy-900/80 p-0.5 rounded-lg border border-white/10 text-[11px]">
          {['all', 'critical', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded capitalize transition-colors font-mono ${
                filterSeverity === sev
                  ? 'bg-cascade-cyan/30 text-cascade-cyan font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Scrolling Live Feed List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence initial={false}>
          {filteredAlerts.map((alert) => {
            const styles = getSeverityStyle(alert.severity);

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  if (alert.zoneId) {
                    setSelectedZone(alert.zoneId);
                    setShowExplainPanel(true);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${styles.card}`}
              >
                {/* Alert Top Line: Time + Severity + Zone */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-white text-[11px]">
                      {alert.timestamp}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border ${styles.badge}`}>
                      {alert.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-300 font-medium truncate max-w-[140px]">
                    <MapPin className="w-3 h-3 text-cascade-cyan flex-shrink-0" />
                    <span className="truncate">{alert.zone}</span>
                  </div>
                </div>

                {/* Alert Message */}
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex-shrink-0">
                    {getAlertIcon(alert.type, alert.severity)}
                  </div>
                  <p className="text-xs text-gray-200 leading-snug">
                    {alert.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
