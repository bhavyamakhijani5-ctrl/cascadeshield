import React, { useState } from 'react';
import {
  ShieldAlert,
  HeartPulse,
  LifeBuoy,
  Activity,
  Zap,
  Package,
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import useStore from '../store/useStore';
import { DEFAULT_INVENTORY } from '../utils/optimizerEngine';

export default function ResourceEditor({
  currentInventory = DEFAULT_INVENTORY,
  onReoptimize,
  isLoading = false,
}) {
  const [inventory, setInventory] = useState(currentInventory);
  const [hasChanges, setHasChanges] = useState(false);
  const updateResources = useStore((state) => state.updateResources);

  // Field configurations
  const fields = [
    {
      key: 'rescueTeams',
      label: 'Rescue Teams',
      icon: ShieldAlert,
      color: 'text-cascade-cyan',
      bgGlow: 'bg-cascade-cyan/10',
      step: 1,
      min: 1,
      max: 100,
      unit: 'teams',
      desc: 'NDRF, SDRF & Civic rescue units',
    },
    {
      key: 'medicalTeams',
      label: 'Medical Teams',
      icon: HeartPulse,
      color: 'text-rose-400',
      bgGlow: 'bg-rose-500/10',
      step: 1,
      min: 1,
      max: 80,
      unit: 'teams',
      desc: 'Emergency trauma & triage doctors',
    },
    {
      key: 'boats',
      label: 'Rescue Boats',
      icon: LifeBuoy,
      color: 'text-blue-400',
      bgGlow: 'bg-blue-500/10',
      step: 2,
      min: 0,
      max: 200,
      unit: 'boats',
      desc: 'Inflatable Gemini & motor watercraft',
    },
    {
      key: 'pumps',
      label: 'Dewatering Pumps',
      icon: Activity,
      color: 'text-amber-400',
      bgGlow: 'bg-amber-500/10',
      step: 5,
      min: 2,
      max: 300,
      unit: 'units',
      desc: 'High-capacity submersible trash pumps',
    },
    {
      key: 'generators',
      label: 'Mobile Generators',
      icon: Zap,
      color: 'text-yellow-400',
      bgGlow: 'bg-yellow-500/10',
      step: 2,
      min: 0,
      max: 150,
      unit: 'gensets',
      desc: '250 kVA diesel trailer generators',
    },
    {
      key: 'reliefKits',
      label: 'Emergency Relief Kits',
      icon: Package,
      color: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
      step: 100,
      min: 100,
      max: 50000,
      unit: 'kits',
      desc: 'Clean water, dry rations & hygiene packets',
    },
  ];

  // Increment value
  const handleIncrement = (key, step, max) => {
    setInventory((prev) => {
      const updated = {
        ...prev,
        [key]: Math.min(max, (prev[key] || 0) + step),
      };
      setHasChanges(true);
      return updated;
    });
  };

  // Decrement value
  const handleDecrement = (key, step, min) => {
    setInventory((prev) => {
      const updated = {
        ...prev,
        [key]: Math.max(min, (prev[key] || 0) - step),
      };
      setHasChanges(true);
      return updated;
    });
  };

  // Direct manual input change
  const handleInputChange = (key, value, min, max) => {
    const num = parseInt(value, 10);
    setInventory((prev) => {
      const updated = {
        ...prev,
        [key]: isNaN(num) ? min : Math.max(min, Math.min(max, num)),
      };
      setHasChanges(true);
      return updated;
    });
  };

  // Reset to initial baseline
  const handleReset = () => {
    setInventory(DEFAULT_INVENTORY);
    setHasChanges(false);
    updateResources({ customInventory: DEFAULT_INVENTORY });
    if (onReoptimize) {
      onReoptimize(DEFAULT_INVENTORY);
    }
  };

  // Trigger Re-optimize
  const handleReoptimize = () => {
    updateResources({ customInventory: inventory });
    setHasChanges(false);
    if (onReoptimize) {
      onReoptimize(inventory);
    }
  };

  return (
    <div className="glass-panel p-5 bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cascade-cyan" />
            <h3 className="text-base font-display font-semibold text-white tracking-wide">
              Emergency Stockpile & Inventory Editor
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Adjust available state & municipal assets to run real-time allocation re-balancing
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-navy-900 text-xs font-medium text-gray-300 hover:text-white hover:border-white/30 transition-all"
            title="Reset stockpiles to default municipal reserves"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            onClick={handleReoptimize}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-300 ${
              hasChanges
                ? 'bg-cascade-cyan text-navy-900 shadow-[0_0_15px_rgba(0,212,255,0.5)] hover:bg-cyan-300'
                : 'bg-cascade-cyan/20 border border-cascade-cyan/40 text-cascade-cyan hover:bg-cascade-cyan/30'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Optimizing...' : 'Re-optimize'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Resource Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {fields.map((field) => {
          const Icon = field.icon;
          const val = inventory[field.key] ?? DEFAULT_INVENTORY[field.key];
          const isModified = val !== DEFAULT_INVENTORY[field.key];

          return (
            <div
              key={field.key}
              className={`p-3.5 rounded-xl border transition-all duration-200 bg-navy-900/60 ${
                isModified
                  ? 'border-cascade-cyan/40 shadow-sm'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${field.bgGlow} border border-white/5`}>
                    <Icon className={`w-4 h-4 ${field.color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-200 block">
                      {field.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{field.desc}</span>
                  </div>
                </div>
                {isModified && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cascade-cyan/15 text-cascade-cyan font-mono font-medium">
                    Modified
                  </span>
                )}
              </div>

              {/* Number control with +/- buttons */}
              <div className="flex items-center justify-between mt-3 bg-navy-950/80 border border-white/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleDecrement(field.key, field.step, field.min)}
                  className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
                  title={`Decrease by ${field.step}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  <input
                    type="number"
                    value={val}
                    min={field.min}
                    max={field.max}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value, field.min, field.max)
                    }
                    className="w-20 bg-transparent text-center font-mono font-bold text-white text-sm focus:outline-none focus:ring-1 focus:ring-cascade-cyan/50 rounded"
                  />
                  <span className="text-[10px] text-gray-400 font-mono">{field.unit}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleIncrement(field.key, field.step, field.max)}
                  className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
                  title={`Increase by ${field.step}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
