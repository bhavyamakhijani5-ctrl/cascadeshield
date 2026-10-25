import React, { useState } from 'react';
import {
  Cloud,
  CloudRain,
  Droplets,
  Play,
  Pause,
  FastForward,
  Radio,
  Zap,
  Sliders,
  RotateCcw,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { fetchLiveWeather } from '../services/weatherService';

const ASSET_OPTIONS = [
  { id: 'SUB1', name: 'SUB1: Dharavi Substation', type: 'substation' },
  { id: 'SUB2', name: 'SUB2: Kurla West Substation', type: 'substation' },
  { id: 'SUB3', name: 'SUB3: BKC Grid Substation', type: 'substation' },
  { id: 'BR1', name: 'BR1: Mahim Causeway Bridge', type: 'bridge' },
  { id: 'BR2', name: 'BR2: BKC-Kurla Mithi Bridge', type: 'bridge' },
  { id: 'PS2', name: 'PS2: Kurla Stormwater Pump', type: 'pump' },
];

export default function SimulationControls() {
  const {
    simulation,
    setRainfallIntensity,
    setDuration,
    setSoilSaturation,
    setClimateScenario,
    setCurrentHour,
    togglePlay,
    setPlaySpeed,
    addBlockedAsset,
    removeBlockedAsset,
    resetSimulation,
  } = useStore();

  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherNotice, setWeatherNotice] = useState(null);

  const {
    rainfallIntensity,
    duration,
    soilSaturation,
    climateScenario,
    currentHour,
    isPlaying,
    playSpeed,
    blockedAssets,
    isRunning,
  } = simulation;

  const handleLiveWeather = async () => {
    setIsLoadingWeather(true);
    setWeatherNotice(null);
    try {
      const live = await fetchLiveWeather();
      setRainfallIntensity(live.rainfallIntensity);
      setDuration(live.duration);
      setSoilSaturation(live.soilSaturation);
      setWeatherNotice({
        type: 'success',
        text: `Loaded ${live.location}: ${live.rainfallIntensity}mm/hr (${live.source})`,
      });
      setTimeout(() => setWeatherNotice(null), 5000);
    } catch (err) {
      setWeatherNotice({
        type: 'error',
        text: 'Failed to retrieve live forecast. Keeping existing scenario.',
      });
      setTimeout(() => setWeatherNotice(null), 4000);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const getRainCategory = (val) => {
    if (val < 25) return { label: 'Light', color: 'text-emerald-400' };
    if (val < 65) return { label: 'Moderate', color: 'text-sky-400' };
    if (val < 115) return { label: 'Heavy', color: 'text-amber-400' };
    return { label: 'Extreme Severe', color: 'text-cascade-red font-semibold' };
  };

  const getSaturationCategory = (val) => {
    if (val < 0.35) return { label: 'Dry', color: 'text-emerald-400' };
    if (val < 0.65) return { label: 'Moist', color: 'text-sky-400' };
    if (val < 0.85) return { label: 'Saturated', color: 'text-amber-400' };
    return { label: 'Super-Saturated', color: 'text-cascade-red font-semibold' };
  };

  const rainCat = getRainCategory(rainfallIntensity);
  const satCat = getSaturationCategory(soilSaturation);

  return (
    <div className="glass-panel p-4 flex flex-col gap-5 text-sm text-gray-200 select-none overflow-y-auto max-h-full">
      {/* Header & Status Indicator */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cascade-cyan" />
          <h2 className="font-display font-semibold text-white tracking-wide text-base">
            Simulation Engine
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-cascade-amber/20 text-cascade-amber border border-cascade-amber/30">
              <Loader2 className="w-3 h-3 animate-spin" />
              Computing
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-cascade-green/20 text-cascade-green border border-cascade-green/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cascade-green animate-pulse" />
              Ready
            </span>
          )}
        </div>
      </div>

      {/* Prominent Current Hour Display & Playback */}
      <div className="bg-navy-800/90 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2 shadow-inner">
        <div className="flex items-center justify-between w-full text-xs text-gray-400 uppercase tracking-wider font-mono">
          <span>Timeline Position</span>
          <span className="text-cascade-cyan">Hour {currentHour} of {duration}h</span>
        </div>
        
        <div className="flex items-baseline gap-2 font-display">
          <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(0,212,255,0.4)]">
            T+{String(currentHour).padStart(2, '0')}:00
          </span>
          <span className="text-xs font-mono text-gray-400">
            ({currentHour >= 6 && currentHour <= 14 ? 'Peak Inundation' : 'Active Flow'})
          </span>
        </div>

        {/* Big Centered Play/Pause Button */}
        <div className="flex items-center justify-center gap-4 w-full mt-1">
          <button
            type="button"
            onClick={togglePlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isPlaying
                ? 'bg-cascade-amber hover:bg-amber-400 text-navy-900 shadow-[0_0_20px_rgba(255,176,32,0.5)] scale-105'
                : 'bg-cascade-cyan hover:bg-cyan-400 text-navy-900 shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:scale-105'
            }`}
            title={isPlaying ? 'Pause Simulation (Space)' : 'Play Simulation (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center justify-between w-full pt-2 border-t border-white/5 mt-1">
          <span className="text-xs text-gray-400">Playback Speed:</span>
          <div className="flex items-center gap-1 bg-navy-900/80 p-0.5 rounded-lg border border-white/10">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaySpeed(spd)}
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium transition-colors ${
                  playSpeed === spd
                    ? 'bg-cascade-cyan/30 text-cascade-cyan font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Weather Action Button */}
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleLiveWeather}
          disabled={isLoadingWeather}
          className="w-full py-2 px-3 rounded-lg bg-navy-800/80 border border-cascade-cyan/30 text-cascade-cyan hover:bg-cascade-cyan/15 hover:border-cascade-cyan/60 flex items-center justify-center gap-2 transition-all duration-200 text-xs font-medium shadow-sm group"
        >
          {isLoadingWeather ? (
            <Loader2 className="w-4 h-4 animate-spin text-cascade-cyan" />
          ) : (
            <Radio className="w-4 h-4 text-cascade-cyan group-hover:scale-110 transition-transform animate-pulse" />
          )}
          <span>Use Live Weather Feed</span>
        </button>

        {weatherNotice && (
          <div
            className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
              weatherNotice.type === 'success'
                ? 'bg-cascade-green/20 text-emerald-300 border border-cascade-green/30'
                : 'bg-cascade-red/20 text-rose-300 border border-cascade-red/30'
            }`}
          >
            {weatherNotice.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span className="truncate">{weatherNotice.text}</span>
          </div>
        )}
      </div>

      {/* Sliders Container */}
      <div className="flex flex-col gap-4">
        {/* Rainfall Intensity Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-300 font-medium">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              Rainfall Peak
            </span>
            <span className="font-mono text-white flex items-center gap-1.5">
              <span className="text-cascade-cyan font-bold text-sm">
                {rainfallIntensity}
              </span>
              <span className="text-gray-400 text-xs">mm/hr</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 ${rainCat.color}`}>
                {rainCat.label}
              </span>
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={rainfallIntensity}
            onChange={(e) => setRainfallIntensity(Number(e.target.value))}
            className="w-full h-1.5 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-cascade-cyan focus:outline-none"
          />

          <div className="flex justify-between text-[10px] font-mono text-gray-500 px-0.5">
            <span>0</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
          </div>
        </div>

        {/* Duration Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-300 font-medium">
              <Cloud className="w-3.5 h-3.5 text-cascade-amber" />
              Event Duration
            </span>
            <span className="font-mono text-white flex items-center gap-1">
              <span className="text-cascade-amber font-bold text-sm">{duration}</span>
              <span className="text-gray-400 text-xs">hours</span>
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="48"
            step="1"
            value={duration}
            onChange={(e) => {
              const val = Number(e.target.value);
              setDuration(val);
              if (currentHour > val) setCurrentHour(val);
            }}
            className="w-full h-1.5 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-cascade-amber focus:outline-none"
          />

          <div className="flex justify-between text-[10px] font-mono text-gray-500 px-0.5">
            <span>1h</span>
            <span>12h</span>
            <span>24h</span>
            <span>36h</span>
            <span>48h</span>
          </div>
        </div>

        {/* Soil Saturation Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-300 font-medium">
              <Droplets className="w-3.5 h-3.5 text-teal-400" />
              Soil Saturation
            </span>
            <span className="font-mono text-white flex items-center gap-1.5">
              <span className="text-teal-300 font-bold text-sm">
                {Math.round(soilSaturation * 100)}%
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 ${satCat.color}`}>
                {satCat.label}
              </span>
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soilSaturation}
            onChange={(e) => setSoilSaturation(Number(e.target.value))}
            className="w-full h-1.5 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] font-mono text-gray-500 px-0.5">
            <span>0% (Dry)</span>
            <span>50%</span>
            <span>100% (Saturated)</span>
          </div>
        </div>
      </div>

      {/* Climate Scenario Toggle */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <label className="text-xs text-gray-300 font-medium flex items-center justify-between">
          <span>Climate Warming Scenario</span>
          <span className="text-[10px] text-gray-500 font-mono">IPCC Projection</span>
        </label>
        
        <div className="grid grid-cols-3 gap-1.5 bg-navy-900/90 p-1 rounded-xl border border-white/10">
          {[
            { id: 'current', label: 'Today', note: '1.0x' },
            { id: '2040', label: '2040', note: '+20%' },
            { id: '2050', label: '2050', note: '+35%' },
          ].map((scen) => {
            const isSelected = climateScenario === scen.id;
            return (
              <button
                key={scen.id}
                type="button"
                onClick={() => setClimateScenario(scen.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-cascade-cyan text-navy-900 font-bold shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{scen.label}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-navy-900/80' : 'text-gray-500'}`}>
                  {scen.note}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* What-If Asset Disruption Section */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-cascade-amber" />
            <span>"What-If" Stress Injection</span>
          </label>
          <span className="text-[10px] font-mono text-cascade-amber">
            {blockedAssets.length} Blocked
          </span>
        </div>
        <p className="text-[11px] text-gray-400">
          Simulate targeted asset sabotage or structural failure:
        </p>

        <div className="space-y-1.5 bg-navy-900/70 p-2.5 rounded-xl border border-white/10 max-h-36 overflow-y-auto">
          {ASSET_OPTIONS.map((asset) => {
            const isBlocked = blockedAssets.includes(asset.id);
            return (
              <label
                key={asset.id}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                  isBlocked
                    ? 'bg-cascade-red/20 text-rose-300 border border-cascade-red/40'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isBlocked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addBlockedAsset(asset.id);
                      } else {
                        removeBlockedAsset(asset.id);
                      }
                    }}
                    className="rounded bg-navy-800 border-white/20 text-cascade-red focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono">{asset.name}</span>
                </div>
                {asset.type === 'substation' && <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                {asset.type === 'pump' && <Droplets className="w-3 h-3 text-teal-400 flex-shrink-0" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* Reset Simulation Defaults */}
      <div className="pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={resetSimulation}
          className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors text-xs font-mono"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Parameters to Baseline</span>
        </button>
      </div>
    </div>
  );
}
