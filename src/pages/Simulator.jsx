import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AlertTriangle,
  Radio,
  Sliders,
  Activity,
  Layers,
  HelpCircle,
  Bell,
  RefreshCw,
  Info,
  CheckCircle2,
  Droplets,
  Zap,
  Navigation,
  MapPin,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import SimulationControls from '../components/SimulationControls';
import CascadeMap from '../components/CascadeMap';
import TimelineSlider from '../components/TimelineSlider';
import StatsPanel from '../components/StatsPanel';
import ExplainPanel from '../components/ExplainPanel';
import AlertsFeed from '../components/AlertsFeed';
import CitizenReportForm from '../components/CitizenReportForm';
import { fetchLiveWeather } from '../services/weatherService';
import { generateRainfallProfile, runMonteCarlo } from '../engine/cascade';
import { compareStrategies } from '../engine/optimizer';

export default function Simulator() {
  const {
    simulation,
    ui,
    setResults,
    setIsRunning,
    setRainfallIntensity,
    setDuration,
    setSoilSaturation,
    setSelectedZone,
    setShowExplainPanel,
    toggleLayer,
  } = useStore();

  const {
    rainfallIntensity,
    duration,
    soilSaturation,
    climateScenario,
    blockedAssets,
    isRunning,
  } = simulation;

  const { showExplainPanel, selectedZone, activeLayer } = ui;

  // Raw dataset states loaded from /data/*.json
  const [zonesData, setZonesData] = useState(null);
  const [infrastructureData, setInfrastructureData] = useState(null);
  const [dependenciesData, setDependenciesData] = useState(null);
  const [resourcesData, setResourcesData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Active right panel tab on desktop/mobile: 'stats' | 'explain' | 'alerts'
  const [rightTab, setRightTab] = useState('stats');

  // Mobile active view tab: 'map' | 'controls' | 'diagnostics' | 'alerts'
  const [mobileTab, setMobileTab] = useState('map');

  // Loading weather feedback
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherBanner, setWeatherBanner] = useState(null);

  const workerRef = useRef(null);

  // Synchronize right panel tab when selectedZone changes
  useEffect(() => {
    if (selectedZone && showExplainPanel) {
      setRightTab('explain');
    }
  }, [selectedZone, showExplainPanel]);

  // 1. Fetch simulation datasets on mount
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        const [zRes, iRes, dRes, rRes] = await Promise.all([
          fetch('/data/zones.geojson'),
          fetch('/data/infrastructure.json'),
          fetch('/data/dependencies.json'),
          fetch('/data/resources.json'),
        ]);

        if (!zRes.ok || !iRes.ok || !dRes.ok || !rRes.ok) {
          throw new Error('Failed to load one or more simulation datasets from /data/');
        }

        const [zones, infra, deps, res] = await Promise.all([
          zRes.json(),
          iRes.json(),
          dRes.json(),
          rRes.json(),
        ]);

        if (!isCancelled) {
          setZonesData(zones);
          setInfrastructureData(infra);
          setDependenciesData(deps);
          setResourcesData(res);
          setDataLoaded(true);
        }
      } catch (err) {
        console.error('[Simulator] Data loading error:', err);
        if (!isCancelled) {
          setLoadError(err.message);
        }
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Compute rainfall profile from intensity & duration
  const rainfallProfile = useMemo(() => {
    return generateRainfallProfile(rainfallIntensity, duration, 'burst');
  }, [rainfallIntensity, duration]);

  // 2. Dispatch simulation to Web Worker when parameters or data change
  useEffect(() => {
    if (!dataLoaded || !zonesData || !infrastructureData || !dependenciesData) return;

    setIsRunning(true);

    const payload = {
      zones: zonesData.features,
      infrastructure: infrastructureData,
      dependencies: dependenciesData,
      resources: resourcesData,
      rainfallProfile,
      soilSaturation,
      climateScenario,
      blockedAssets,
    };

    // Try web worker execution first
    let usedFallback = false;

    try {
      if (!workerRef.current) {
        workerRef.current = new Worker(
          new URL('../workers/simulationWorker.js', import.meta.url),
          { type: 'module' }
        );
      }

      const handleWorkerMessage = (e) => {
        const { type, result, error } = e.data;
        if (type === 'SIMULATION_COMPLETE') {
          setResults(result);
          setIsRunning(false);
        } else if (type === 'ERROR') {
          console.warn('[Simulator Worker Error, fallback to main thread]:', error);
          runFallbackSimulation();
        }
      };

      workerRef.current.onmessage = handleWorkerMessage;
      workerRef.current.onerror = (err) => {
        console.warn('[Simulator Worker Init Error, fallback to main thread]:', err);
        runFallbackSimulation();
      };

      workerRef.current.postMessage({
        type: 'RUN_SIMULATION',
        payload,
      });
    } catch (workerErr) {
      console.warn('[Simulator] Could not spawn Web Worker, using main thread engine:', workerErr);
      runFallbackSimulation();
    }

    // Direct synchronous fallback function if web worker is blocked in environment
    function runFallbackSimulation() {
      if (usedFallback) return;
      usedFallback = true;
      try {
        const result = runMonteCarlo(
          zonesData.features,
          infrastructureData,
          dependenciesData,
          resourcesData,
          rainfallProfile,
          soilSaturation,
          climateScenario,
          blockedAssets,
          15 // runs
        );

        const peakHour = result.medianTimeline.reduce(
          (max, step) => (step.totalPopAtRisk > max.totalPopAtRisk ? step : max),
          result.medianTimeline[0]
        );

        const comparison = compareStrategies(
          peakHour.zoneStates,
          resourcesData,
          peakHour.roadStates || infrastructureData.roads
        );

        setResults({
          timeline: result.medianTimeline,
          confidence: result.confidenceData,
          confidenceLevel: result.confidenceLevel,
          comparison,
        });
      } catch (err) {
        console.error('[Simulator Fallback Engine Error]:', err);
      } finally {
        setIsRunning(false);
      }
    }

    return () => {
      // Clean up previous run if needed
    };
  }, [
    dataLoaded,
    zonesData,
    infrastructureData,
    dependenciesData,
    resourcesData,
    rainfallIntensity,
    duration,
    soilSaturation,
    climateScenario,
    blockedAssets,
    rainfallProfile,
    setIsRunning,
    setResults,
  ]);

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Live Weather button handler
  const handleLiveWeatherClick = async () => {
    setIsFetchingWeather(true);
    setWeatherBanner(null);
    try {
      const weather = await fetchLiveWeather();
      setRainfallIntensity(weather.rainfallIntensity);
      setDuration(weather.duration);
      setSoilSaturation(weather.soilSaturation);
      setWeatherBanner({
        type: 'success',
        message: `Synced with ${weather.location} (${weather.rainfallIntensity} mm/hr - ${weather.source})`,
      });
      setTimeout(() => setWeatherBanner(null), 5000);
    } catch (err) {
      setWeatherBanner({
        type: 'error',
        message: 'Unable to fetch external weather stream. Retaining existing values.',
      });
      setTimeout(() => setWeatherBanner(null), 4000);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-navy-900 text-white font-body overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-white/10 bg-navy-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cascade-cyan/20 border border-cascade-cyan/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,212,255,0.3)]">
            <Activity className="w-4 h-4 text-cascade-cyan animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base tracking-wide text-white flex items-center gap-2">
              <span>CascadeShield</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cascade-cyan/15 text-cascade-cyan border border-cascade-cyan/30 font-normal">
                Simulator v2.4
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Illustrative Data Badge + Live Weather Banner */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-cascade-amber flex-shrink-0" />
            <span>Illustrative Data: Calibrated synthetic disaster cascade for emergency planning</span>
          </div>

          {weatherBanner && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
                weatherBanner.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{weatherBanner.message}</span>
            </div>
          )}
        </div>

        {/* Right Action: Live Weather Button + Status */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleLiveWeatherClick}
            disabled={isFetchingWeather}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cascade-cyan/15 hover:bg-cascade-cyan/25 border border-cascade-cyan/40 text-cascade-cyan text-xs font-medium transition-all shadow-[0_0_12px_rgba(0,212,255,0.2)]"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Use Live Weather</span>
          </button>

          {isRunning && (
            <div className="flex items-center gap-1.5 text-xs text-cascade-amber font-mono bg-cascade-amber/15 px-2.5 py-1 rounded-lg border border-cascade-amber/30">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Worker Running</span>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Disclaimer (visible on small screens) */}
      <div className="lg:hidden bg-amber-500/10 border-b border-amber-500/20 px-3 py-1 text-[11px] font-mono text-amber-300 flex items-center justify-center gap-1">
        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">Illustrative Data: Calibrated synthetic simulation</span>
      </div>

      {/* Main 3-Column Dashboard Body (Desktop) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Simulation Controls (Desktop) */}
        <aside className="hidden lg:flex w-80 xl:w-88 flex-shrink-0 border-r border-white/10 p-3 bg-navy-950/70 overflow-hidden flex-col">
          <SimulationControls />
        </aside>

        {/* Center: Interactive Cascade Map + Bottom Timeline Scrubber */}
        <main className="flex-1 flex flex-col min-w-0 relative h-full">
          {/* Map Container */}
          <div className="flex-1 relative w-full h-full p-2 pb-0">
            {loadError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-rose-400 gap-2 p-4 text-center">
                <AlertTriangle className="w-8 h-8" />
                <div className="text-sm font-semibold">Error loading simulation data files</div>
                <div className="text-xs text-gray-400 font-mono">{loadError}</div>
              </div>
            ) : (
              <CascadeMap
                zonesData={zonesData}
                infrastructure={infrastructureData}
                dependencies={dependenciesData}
              />
            )}
          </div>

          {/* Bottom Timeline Scrubber Slider */}
          <div className="p-2 pt-1 flex-shrink-0 z-10">
            <TimelineSlider rainfallProfile={rainfallProfile} />
          </div>
        </main>

        {/* Right Sidebar: Diagnostics / Explain / Alerts (Desktop) */}
        <aside className="hidden xl:flex w-96 flex-shrink-0 border-l border-white/10 bg-navy-950/70 p-3 flex-col gap-3 overflow-hidden">
          {/* Right Panel Tabs */}
          <div className="flex items-center gap-1 bg-navy-900/90 p-1 rounded-xl border border-white/10 text-xs font-medium">
            <button
              type="button"
              onClick={() => setRightTab('stats')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                rightTab === 'stats'
                  ? 'bg-cascade-cyan text-navy-950 font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Diagnostics</span>
            </button>

            <button
              type="button"
              onClick={() => setRightTab('explain')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
                rightTab === 'explain'
                  ? 'bg-cascade-cyan text-navy-950 font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Cascade</span>
              {selectedZone && (
                <span className="w-1.5 h-1.5 rounded-full bg-cascade-amber animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setRightTab('alerts')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                rightTab === 'alerts'
                  ? 'bg-cascade-cyan text-navy-950 font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts</span>
            </button>

            <button
              type="button"
              onClick={() => setRightTab('citizen')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                rightTab === 'citizen'
                  ? 'bg-cascade-cyan text-navy-950 font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>

          {/* Right Panel Body View */}
          <div className="flex-1 overflow-hidden">
            {rightTab === 'stats' && (
              <StatsPanel infrastructure={infrastructureData} />
            )}

            {rightTab === 'explain' && (
              selectedZone ? (
                <ExplainPanel
                  zonesData={zonesData}
                  infrastructure={infrastructureData}
                  dependencies={dependenciesData}
                />
              ) : (
                <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-3 h-full text-gray-400">
                  <HelpCircle className="w-10 h-10 text-cascade-cyan/50 animate-bounce" />
                  <div className="font-display font-semibold text-white text-sm">
                    No Zone Selected
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                    Click any zone on the map or select from the Top 5 Critical Zones in the Diagnostics panel to inspect its cascade propagation chain.
                  </p>
                </div>
              )
            )}

            {rightTab === 'alerts' && (
              <AlertsFeed infrastructure={infrastructureData} />
            )}

            {rightTab === 'citizen' && (
              <div className="h-full overflow-y-auto pr-1">
                <CitizenReportForm />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation Tabs (below xl) */}
      <div className="xl:hidden flex items-center justify-around bg-navy-950 border-t border-white/10 py-2 px-3 z-30">
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            mobileTab === 'map' ? 'text-cascade-cyan font-bold' : 'text-gray-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Map</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('controls')}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            mobileTab === 'controls' ? 'text-cascade-cyan font-bold' : 'text-gray-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Controls</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('diagnostics')}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            mobileTab === 'diagnostics' ? 'text-cascade-cyan font-bold' : 'text-gray-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Diagnostics</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('alerts')}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            mobileTab === 'alerts' ? 'text-cascade-cyan font-bold' : 'text-gray-400'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts</span>
        </button>
      </div>

      {/* Mobile Modal Drawer when a non-map tab is chosen */}
      {mobileTab !== 'map' && (
        <div className="xl:hidden fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-xl flex flex-col p-4 pt-12 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <h2 className="font-display font-bold text-base capitalize">
              {mobileTab} Panel
            </h2>
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono text-white"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-12">
            {mobileTab === 'controls' && <SimulationControls />}
            {mobileTab === 'diagnostics' && (
              selectedZone && showExplainPanel ? (
                <ExplainPanel
                  zonesData={zonesData}
                  infrastructure={infrastructureData}
                  dependencies={dependenciesData}
                />
              ) : (
                <StatsPanel infrastructure={infrastructureData} />
              )
            )}
            {mobileTab === 'alerts' && <AlertsFeed infrastructure={infrastructureData} />}
          </div>
        </div>
      )}
    </div>
  );
}
