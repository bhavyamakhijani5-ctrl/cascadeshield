import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { BarChart3, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

const DEFAULT_STRATEGIES_DATA = [
  {
    metric: 'Damage Reduction',
    unit: '%',
    random: 19,
    nearest: 44,
    optimized: 78,
    labelRandom: '19%',
    labelNearest: '44%',
    labelOptimized: '78%',
    randomScaled: 19,
    nearestScaled: 44,
    optimizedScaled: 78,
  },
  {
    metric: 'Lives Protected',
    unit: 'count',
    random: 4200,
    nearest: 12600,
    optimized: 24800,
    labelRandom: '4,200',
    labelNearest: '12,600',
    labelOptimized: '24,800',
    randomScaled: 17,
    nearestScaled: 51,
    optimizedScaled: 100,
  },
  {
    metric: 'INR Saved',
    unit: '₹ Cr',
    random: 180,
    nearest: 460,
    optimized: 920,
    labelRandom: '₹180 Cr',
    labelNearest: '₹460 Cr',
    labelOptimized: '₹920 Cr',
    randomScaled: 20,
    nearestScaled: 50,
    optimizedScaled: 100,
  },
];

// Custom glass tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const rawData = payload[0]?.payload;
    return (
      <div className="bg-navy-800/95 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[200px]">
        <div className="font-semibold text-white border-b border-white/10 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-gray-400 font-mono">[{rawData?.unit || ''}]</span>
        </div>
        {payload.map((entry, index) => {
          let displayVal = entry.value;
          if (entry.dataKey === 'random') displayVal = rawData?.labelRandom || entry.value;
          if (entry.dataKey === 'nearest') displayVal = rawData?.labelNearest || entry.value;
          if (entry.dataKey === 'optimized') displayVal = rawData?.labelOptimized || entry.value;

          return (
            <div key={`tooltip-${index}`} className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-gray-300">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold font-mono text-white ml-2">{displayVal}</span>
            </div>
          );
        })}
        {rawData && rawData.optimized && rawData.nearest && (
          <div className="pt-1 mt-1 border-t border-white/10 text-[10px] text-cascade-cyan flex items-center justify-between">
            <span>Optimization Lift:</span>
            <span className="font-bold">
              +{Math.round(((rawData.optimized - rawData.nearest) / rawData.nearest) * 100)}% vs Nearest
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Formatter for top-of-bar labels
const renderCustomLabel = (props, dataKey, dataset) => {
  const { x, y, width, value, index } = props;
  const item = dataset[index];
  if (!item) return null;

  let text = value;
  if (dataKey === 'random') text = item.labelRandom || value;
  if (dataKey === 'nearest') text = item.labelNearest || value;
  if (dataKey === 'optimized') text = item.labelOptimized || value;

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#e2e8f0"
      textAnchor="middle"
      fontSize={10}
      fontWeight={600}
      fontFamily="monospace"
    >
      {text}
    </text>
  );
};

export default function ComparisonChart({ strategiesData = DEFAULT_STRATEGIES_DATA }) {
  const [activeView, setActiveView] = useState('cards'); // 'cards' | 'consolidated'

  const data = strategiesData && strategiesData.length > 0 ? strategiesData : DEFAULT_STRATEGIES_DATA;

  // Single metric charts configuration
  const metricConfigs = [
    {
      key: 'Damage Reduction',
      title: 'Damage Reduction (%)',
      desc: 'Infrastructure & property flood loss mitigation',
      data: [
        {
          name: 'Damage Reduction',
          Random: data[0]?.random || 19,
          'Nearest-First': data[0]?.nearest || 44,
          Optimized: data[0]?.optimized || 78,
          labelRandom: data[0]?.labelRandom || '19%',
          labelNearest: data[0]?.labelNearest || '44%',
          labelOptimized: data[0]?.labelOptimized || '78%',
        },
      ],
      unit: '%',
      domain: [0, 100],
    },
    {
      key: 'Lives Protected',
      title: 'Lives Protected (Count)',
      desc: 'Estimated citizens evacuated & safely secured',
      data: [
        {
          name: 'Lives Protected',
          Random: data[1]?.random || 4200,
          'Nearest-First': data[1]?.nearest || 12600,
          Optimized: data[1]?.optimized || 24800,
          labelRandom: data[1]?.labelRandom || '4,200',
          labelNearest: data[1]?.labelNearest || '12,600',
          labelOptimized: data[1]?.labelOptimized || '24,800',
        },
      ],
      unit: 'people',
      domain: [0, 30000],
    },
    {
      key: 'INR Saved',
      title: 'INR Saved (₹ Crore)',
      desc: 'Economic assets and direct relief costs saved',
      data: [
        {
          name: 'INR Saved',
          Random: data[2]?.random || 180,
          'Nearest-First': data[2]?.nearest || 460,
          Optimized: data[2]?.optimized || 920,
          labelRandom: data[2]?.labelRandom || '₹180 Cr',
          labelNearest: data[2]?.labelNearest || '₹460 Cr',
          labelOptimized: data[2]?.labelOptimized || '₹920 Cr',
        },
      ],
      unit: '₹ Cr',
      domain: [0, 1100],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-panel p-5 bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl space-y-4"
    >
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cascade-cyan" />
            <h3 className="text-base font-display font-semibold text-white tracking-wide">
              Strategy Benchmark: Random vs. Nearest-First vs. AI Optimized
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Comparative performance across standard heuristics vs CascadeShield multi-objective dispatch
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-navy-900/80 p-1 rounded-lg border border-white/10 text-xs self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setActiveView('cards')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeView === 'cards'
                ? 'bg-cascade-cyan/20 text-cascade-cyan shadow-sm border border-cascade-cyan/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Metric Cards
            </span>
          </button>
          <button
            onClick={() => setActiveView('consolidated')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeView === 'consolidated'
                ? 'bg-cascade-cyan/20 text-cascade-cyan shadow-sm border border-cascade-cyan/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Normalized Chart
            </span>
          </button>
        </div>
      </div>

      {/* Global Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-navy-900/40 px-4 py-2 rounded-xl border border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-gray-500 border border-gray-400" />
            <span className="text-gray-300 font-medium">Random Allocation</span>
            <span className="text-[11px] text-gray-400">(Legacy ad-hoc)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-500 border border-blue-400" />
            <span className="text-blue-300 font-medium">Nearest-First</span>
            <span className="text-[11px] text-gray-400">(Greedy distance)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-cascade-cyan shadow-[0_0_8px_rgba(0,212,255,0.6)] border border-cyan-300" />
            <span className="text-cascade-cyan font-semibold flex items-center gap-1">
              CascadeShield Optimized
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </span>
          </div>
        </div>
        <div className="text-[11px] text-gray-400 hidden md:block">
          *Values dynamically re-evaluated based on active What-If triggers
        </div>
      </div>

      {/* View 1: 3 Grouped BarCharts Side-by-Side (Cards Mode) */}
      {activeView === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metricConfigs.map((cfg, idx) => (
            <div
              key={cfg.key}
              className="bg-navy-900/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between hover:border-cascade-cyan/30 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-200">
                    {cfg.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                    {cfg.unit}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{cfg.desc}</p>
              </div>

              <div className="h-56 mt-2 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cfg.data}
                    margin={{ top: 24, right: 10, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={false} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      domain={cfg.domain}
                      tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                    />
                    <Tooltip
                      content={
                        <CustomTooltip />
                      }
                    />
                    {/* Random Bar - Gray */}
                    <Bar
                      dataKey="Random"
                      fill="#64748b"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={42}
                    >
                      <LabelList
                        dataKey="labelRandom"
                        position="top"
                        fill="#94a3b8"
                        fontSize={10}
                        fontWeight={600}
                      />
                    </Bar>
                    {/* Nearest Bar - Blue */}
                    <Bar
                      dataKey="Nearest-First"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={42}
                    >
                      <LabelList
                        dataKey="labelNearest"
                        position="top"
                        fill="#93c5fd"
                        fontSize={10}
                        fontWeight={600}
                      />
                    </Bar>
                    {/* Optimized Bar - Cyan/Green */}
                    <Bar
                      dataKey="Optimized"
                      fill="#00d4ff"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={42}
                    >
                      <LabelList
                        dataKey="labelOptimized"
                        position="top"
                        fill="#67e8f9"
                        fontSize={11}
                        fontWeight={700}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mini highlight badge */}
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">AI Advantage:</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  +{Math.round(
                    ((cfg.data[0].Optimized - cfg.data[0]['Nearest-First']) /
                      cfg.data[0]['Nearest-First']) *
                      100
                  )}
                  % improvement
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* View 2: Consolidated Grouped BarChart with all 3 metrics */
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 24, right: 20, left: -10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="metric"
                stroke="#94a3b8"
                fontSize={12}
                tick={{ fill: '#cbd5e1' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                domain={[0, 100]}
                unit="%"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(val) => <span className="text-xs text-gray-300">{val}</span>}
              />
              <Bar
                name="Random Strategy"
                dataKey="randomScaled"
                fill="#64748b"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              >
                <LabelList
                  content={(props) => renderCustomLabel(props, 'random', data)}
                />
              </Bar>
              <Bar
                name="Nearest-First (Greedy)"
                dataKey="nearestScaled"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              >
                <LabelList
                  content={(props) => renderCustomLabel(props, 'nearest', data)}
                />
              </Bar>
              <Bar
                name="CascadeShield AI"
                dataKey="optimizedScaled"
                fill="#00d4ff"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              >
                <LabelList
                  content={(props) => renderCustomLabel(props, 'optimized', data)}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
