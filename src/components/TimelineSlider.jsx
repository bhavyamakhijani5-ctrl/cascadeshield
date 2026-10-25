import React, { useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  CloudRain,
  Flame,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useStore } from '../store/useStore';

export default function TimelineSlider({ rainfallProfile = [] }) {
  const {
    simulation,
    setCurrentHour,
    togglePlay,
    setPlaySpeed,
  } = useStore();

  const {
    currentHour,
    duration,
    isPlaying,
    playSpeed,
    results,
  } = simulation;

  // Auto-advance timeline during playback
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(100, Math.round(1000 / playSpeed));
    const timer = setInterval(() => {
      setCurrentHour((prev) => {
        const next = prev + 1;
        if (next > duration) {
          return 0; // Loop or stop
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, duration, setCurrentHour]);

  // Construct chart dataset for hourly rainfall and impact
  const chartData = useMemo(() => {
    const timeline = results?.timeline || [];
    const maxH = Math.min(48, Math.max(duration, 24));
    const data = [];

    let cumRain = 0;
    for (let h = 0; h <= maxH; h++) {
      const step = timeline[h];
      const rainfall = step?.rainfall ?? (rainfallProfile[h] ?? 0);
      cumRain += rainfall;

      data.push({
        hour: h,
        displayHour: `T+${h}h`,
        rainfall: Math.round(rainfall * 10) / 10,
        cumulative: Math.round(cumRain),
        damageCrore: step?.totalDamageCrore ?? 0,
        popAtRisk: step?.totalPopAtRisk ?? 0,
      });
    }
    return data;
  }, [results, rainfallProfile, duration]);

  const currentStep = results?.timeline?.[currentHour];

  return (
    <div className="glass-panel p-3 px-4 flex flex-col gap-2 w-full text-white shadow-2xl border-t border-white/10 select-none backdrop-blur-md">
      {/* Top Bar: Controls + Current Status */}
      <div className="flex items-center justify-between gap-4">
        {/* Play / Step Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-cascade-amber text-navy-900 shadow-[0_0_12px_rgba(255,176,32,0.5)]'
                : 'bg-cascade-cyan text-navy-900 shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:brightness-110'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentHour((h) => Math.max(0, h - 1))}
            className="p-1.5 rounded-lg bg-navy-800/80 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Step Back 1 Hour"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentHour((h) => Math.min(duration, h + 1))}
            className="p-1.5 rounded-lg bg-navy-800/80 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Step Forward 1 Hour"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentHour(0)}
            className="p-1.5 rounded-lg bg-navy-800/80 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-mono flex items-center gap-1"
            title="Jump to T+0h"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">T+0</span>
          </button>
        </div>

        {/* Prominent Current Hour Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-navy-800/90 border border-cascade-cyan/30 px-3 py-1 rounded-xl shadow-inner">
            <Clock className="w-4 h-4 text-cascade-cyan animate-pulse" />
            <span className="font-display font-bold text-base text-white tracking-wide">
              T+{String(currentHour).padStart(2, '0')}:00
            </span>
            <span className="text-xs text-gray-400 font-mono">
              / T+{duration}h
            </span>
          </div>

          {currentStep && (
            <div className="hidden md:flex items-center gap-3 text-xs font-mono text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <span className="flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-cascade-cyan" />
                <span>{currentStep.rainfall?.toFixed(1) ?? 0} mm/h</span>
              </span>
              <span className="text-gray-500">•</span>
              <span className="flex items-center gap-1 text-cascade-red">
                <Flame className="w-3.5 h-3.5" />
                <span>{currentStep.totalPopAtRisk?.toLocaleString() ?? 0} at risk</span>
              </span>
            </div>
          )}
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-navy-900/90 p-0.5 rounded-lg border border-white/10 text-xs">
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setPlaySpeed(spd)}
              className={`px-2 py-0.5 rounded font-mono transition-colors ${
                playSpeed === spd
                  ? 'bg-cascade-cyan/25 text-cascade-cyan font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Timeline Slider */}
      <div className="relative flex flex-col gap-1 w-full pt-1">
        <input
          type="range"
          min="0"
          max={duration}
          step="1"
          value={currentHour}
          onChange={(e) => setCurrentHour(Number(e.target.value))}
          className="w-full h-2 bg-navy-700/80 rounded-lg appearance-none cursor-pointer accent-cascade-cyan focus:outline-none"
        />

        {/* Time Marks */}
        <div className="flex justify-between text-[10px] font-mono text-gray-400 px-0.5 select-none">
          {Array.from({ length: 9 }).map((_, i) => {
            const h = Math.round((i / 8) * duration);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentHour(h)}
                className={`hover:text-cascade-cyan transition-colors ${
                  currentHour === h ? 'text-cascade-cyan font-bold scale-110' : ''
                }`}
              >
                T+{h}h
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini Rainfall Sparkline / AreaChart */}
      <div className="w-full h-14 relative mt-0.5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 2, right: 6, left: 6, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activeTooltipIndex !== undefined) {
                const clickedHour = chartData[e.activeTooltipIndex]?.hour;
                if (clickedHour !== undefined && clickedHour <= duration) {
                  setCurrentHour(clickedHour);
                }
              }
            }}
          >
            <defs>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" hide domain={[0, duration]} />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-navy-900/95 border border-white/20 p-1.5 rounded text-[11px] font-mono shadow-xl">
                      <div className="text-cascade-cyan font-bold">{d.displayHour}</div>
                      <div>Rain: {d.rainfall} mm/hr</div>
                      <div>Damages: ₹{d.damageCrore} Cr</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="rainfall"
              stroke="#00d4ff"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#rainGradient)"
              isAnimationActive={false}
            />
            <ReferenceLine
              x={currentHour}
              stroke="#ff3b5c"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `T+${currentHour}`,
                fill: '#ff3b5c',
                fontSize: 10,
                position: 'top',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
