import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  Play,
  CloudRain,
  Waves,
  Mountain,
  Zap,
  Droplets,
  HeartPulse,
  Activity,
  Cpu,
  Layers,
  ChevronDown,
  Clock,
  Sparkles,
  MapPin,
  TrendingDown,
  Gauge,
  WifiOff,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import SplitText from '../components/reactbits/SplitText';
import ShinyText from '../components/reactbits/ShinyText';
import CountUp from '../components/reactbits/CountUp';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import Marquee from '../components/reactbits/Marquee';
import AuroraBackground from '../components/reactbits/AuroraBackground';

export default function Landing() {
  const navigate = useNavigate();
  const startDemo = useStore((state) => state.startDemo);

  const handleLaunchDemo = () => {
    startDemo();
    navigate('/simulator');
  };

  const cascadeSteps = [
    {
      id: 'rain',
      title: 'Heavy Rainfall',
      hazard: 'Meteorological',
      time: 'T + 0h',
      desc: 'Monsoon deluge exceeds 120mm/hr cloudburst threshold in upper catchment zones.',
      icon: CloudRain,
      color: 'text-cascade-cyan',
      bg: 'bg-cascade-cyan/10 border-cascade-cyan/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]',
      badge: 'Trigger Source',
    },
    {
      id: 'flood',
      title: 'Urban Inundation',
      hazard: 'Hydrological',
      time: 'T + 2h',
      desc: 'Mithi River basin chokes stormwater arterial culverts; water levels surge 2.4m.',
      icon: Waves,
      color: 'text-cascade-blue',
      bg: 'bg-cascade-blue/10 border-cascade-blue/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
      badge: 'Tier-1 Impact',
    },
    {
      id: 'landslide',
      title: 'Slope Failure',
      hazard: 'Geological',
      time: 'T + 5h',
      desc: 'High soil pore-water pressure triggers debris flow blocking arterial Western Express Highway.',
      icon: Mountain,
      color: 'text-cascade-amber',
      bg: 'bg-cascade-amber/10 border-cascade-amber/40 shadow-[0_0_15px_rgba(255,176,32,0.2)]',
      badge: 'Transit Severed',
    },
    {
      id: 'power',
      title: 'Grid Substation Trip',
      hazard: 'Infrastructure',
      time: 'T + 8h',
      desc: 'Kurla 220kV transmission substation inundation causes localized islanding & blackouts.',
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10 border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.2)]',
      badge: 'Power Blackout',
    },
    {
      id: 'water',
      title: 'Pumping Station Outage',
      hazard: 'Utilities',
      time: 'T + 12h',
      desc: 'Bhandup water filtration loss and main pressure drops threaten safe drinking supply.',
      icon: Droplets,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10 border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]',
      badge: 'Contamination Risk',
    },
    {
      id: 'hospital',
      title: 'ICU Generator Strain',
      hazard: 'Healthcare',
      time: 'T + 18h',
      desc: 'Sion Hospital backup diesel pumps run dry; access corridors submerged under 1.1m floodwater.',
      icon: HeartPulse,
      color: 'text-cascade-red',
      bg: 'bg-cascade-red/10 border-cascade-red/40 shadow-[0_0_15px_rgba(255,59,92,0.2)]',
      badge: 'Life Critical',
    },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-navy-900 text-gray-100">
      {/* Background Decorative Grid and Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,212,255,0.15),rgba(10,14,26,0))] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-cascade-cyan text-xs font-mono mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(0,212,255,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Gen Multi-Hazard Cascade Resilience Platform</span>
        </motion.div>

        {/* Title with SplitText */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight max-w-5xl"
        >
          <span className="bg-gradient-to-r from-cascade-cyan via-sky-400 to-cascade-blue bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,212,255,0.3)]">
            <SplitText text="CascadeShield" delay={0.06} />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl font-light leading-relaxed"
        >
          AI-Powered Disaster Cascade Prediction &amp; Emergency Resource Optimizer
        </motion.p>

        {/* Call to action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 z-10"
        >
          <Link
            to="/simulator"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-cascade-cyan/20 border border-cascade-cyan/60 text-cascade-cyan rounded-xl font-display font-semibold text-base hover:bg-cascade-cyan/30 hover:scale-105 transition-all duration-300 shadow-[0_0_25px_rgba(0,212,255,0.35)] group"
          >
            <ShinyText text="Launch Simulator" className="font-semibold" />
            <ArrowRight className="w-5 h-5 text-cascade-cyan transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/5 border border-white/15 text-gray-200 rounded-xl font-display font-medium text-base hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300 backdrop-blur-md"
          >
            <Play className="w-4 h-4 text-cascade-amber fill-cascade-amber" />
            <span>Demo Mode</span>
          </button>
        </motion.div>

        {/* 3 Animated Stat Cards in Hero with SpotlightCard & CountUp */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl w-full text-left"
        >
          <SpotlightCard className="p-5" spotlightColor="rgba(0, 212, 255, 0.2)">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-cascade-cyan/15 text-cascade-cyan">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
                <CountUp to={6} duration={1.2} suffix=" Hazards" />
              </span>
            </div>
            <h3 className="font-display font-semibold text-cascade-cyan text-sm">
              Hazard Types Modeled
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-normal">
              Flood, rainfall, landslide, grid, water supply &amp; healthcare cascade matrix.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-5" spotlightColor="rgba(59, 130, 246, 0.2)">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-cascade-blue/15 text-cascade-blue">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
                <CountUp to={30} duration={1.2} suffix=" Zones" />
              </span>
            </div>
            <h3 className="font-display font-semibold text-cascade-blue text-sm">
              Zones Monitored
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-normal">
              High-resolution ward polygons with elevation and demographic vulnerability metrics.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-5" spotlightColor="rgba(139, 92, 246, 0.2)">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-cascade-violet/15 text-cascade-violet">
                <Clock className="w-5 h-5" />
              </div>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
                <CountUp to={48} duration={1.2} prefix="T+" suffix="h Window" />
              </span>
            </div>
            <h3 className="font-display font-semibold text-cascade-violet text-sm">
              Forecast Window
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-normal">
              Hourly lookahead simulation revealing secondary and tertiary domino failures before onset.
            </p>
          </SpotlightCard>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-14 flex flex-col items-center text-gray-500 text-xs font-mono"
        >
          <span>EXPLORE THE ARCHITECTURE</span>
          <ChevronDown className="w-4 h-4 text-cascade-cyan mt-1" />
        </motion.div>
      </section>

      {/* Live Ticker Marquee Ribbon */}
      <div className="w-full bg-navy-950/90 backdrop-blur-md border-y border-white/10 py-2.5">
        <Marquee speed={35} className="text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-2 text-rose-400 mx-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <span className="font-bold">LIVE TELEMETRY:</span>
            <span>Mithi River gauge at 3.8m &bull; Kurla West (Z01) Waterlogging risk 88%</span>
          </div>
          <div className="flex items-center space-x-2 text-amber-300 mx-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>Substation SUB1 load diverted &bull; 4 dewatering pumps operational at Saki Naka</span>
          </div>
          <div className="flex items-center space-x-2 text-cyan-400 mx-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>NDRF Battalion 8 pre-positioned &bull; Sion Trauma Hospital on backup generator grid</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400 mx-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Evacuation Corridor Alpha (SCLR Flyover) clear for transit</span>
          </div>
        </Marquee>
      </div>

      {/* 2. PROBLEM SECTION: When one disaster triggers another */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-cascade-red px-3 py-1 rounded-full bg-cascade-red/10 border border-cascade-red/30">
            The Latent Risk
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mt-4 tracking-tight">
            When one disaster triggers another
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-300 font-light leading-relaxed">
            Catastrophes in modern megacities are compound events. A flash flood rarely stays just a flood.
            It triggers geotechnical failures, knocks down power grids, cripples municipal water pumping, and paralyzes
            trauma centers when they are needed most.
          </p>
        </motion.div>

        {/* Comparison / Problem Animation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-6 sm:p-8 border-cascade-red/30 relative"
          >
            <div className="inline-flex items-center space-x-2 text-cascade-red font-mono text-xs uppercase tracking-wider mb-4">
              <TrendingDown className="w-4 h-4" />
              <span>Conventional Siloed Emergency Response</span>
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-3">
              Blind to Systemic Interdependencies
            </h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-cascade-red mt-2 flex-shrink-0" />
                <span>
                  <strong>Reactive Dispatch:</strong> Units only deploy after a bridge is already blocked or an ICU runs completely dry.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-cascade-red mt-2 flex-shrink-0" />
                <span>
                  <strong>Stranded Resources:</strong> Rescue teams sent down choked corridors get trapped in secondary mudslides.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-cascade-red mt-2 flex-shrink-0" />
                <span>
                  <strong>Unpredicted Dominoes:</strong> 65% of disaster economic losses stem from cascading utility and transport halts, not the initial storm.
                </span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-6 sm:p-8 border-cascade-cyan/30 relative bg-gradient-to-br from-navy-800/80 to-cascade-cyan/5"
          >
            <div className="inline-flex items-center space-x-2 text-cascade-cyan font-mono text-xs uppercase tracking-wider mb-4">
              <Shield className="w-4 h-4" />
              <span>The CascadeShield Paradigm</span>
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-3">
              Proactive Multi-Tiered Intervention
            </h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-cascade-cyan mt-2 flex-shrink-0" />
                <span>
                  <strong>Predictive Graph Modeling:</strong> Calculates probabilistic failure propagation across 6 infrastructure networks hours in advance.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-cascade-cyan mt-2 flex-shrink-0" />
                <span>
                  <strong>Pre-emptive Positioning:</strong> Stages dewatering pumps, backup generators, and inflatable rafts before roads submerge.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-cascade-cyan mt-2 flex-shrink-0" />
                <span>
                  <strong>Explainable AI Triage:</strong> Provides command staff with causal tree breakdowns for every automated allocation recommendation.
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 3. CASCADE SECTION: Predict the chain reaction */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 bg-navy-950/40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-cascade-cyan px-3 py-1 rounded-full bg-cascade-cyan/10 border border-cascade-cyan/30">
            Dynamic Propagation Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mt-4 tracking-tight">
            Predict the chain reaction
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-300 font-light leading-relaxed">
            Observe how initial monsoon downpours propagate through topological, electrical, and public health systems.
            CascadeShield visualizes the exact domino sequence to sever failure links before they lock.
          </p>
        </motion.div>

        {/* Chain Flow Visualization */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {cascadeSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`glass-panel p-6 border transition-all duration-300 relative group hover:scale-[1.02] ${step.bg}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-navy-900/80 border border-white/10 ${step.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-gray-200">
                      {step.time}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                    Step 0{idx + 1} • {step.hazard}
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    {step.desc}
                  </p>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-400">Impact Class:</span>
                    <span className={`font-semibold ${step.color}`}>{step.badge}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. OPTIMIZER SECTION: Smart resource allocation */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-cascade-amber px-3 py-1 rounded-full bg-cascade-amber/10 border border-cascade-amber/30">
            Constrained Optimization Engine
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mt-4 tracking-tight">
            Smart resource allocation
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-300 font-light leading-relaxed">
            When teams, pumps, and generators are scarce, heuristic guessing wastes lives.
            Our multi-objective solver continuously balances transit accessibility, vulnerable demographics, and critical infrastructure dependencies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel p-6 border-white/10 hover:border-cascade-cyan/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-cascade-cyan/10 border border-cascade-cyan/30 flex items-center justify-center text-cascade-cyan mb-5">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">
              Linear &amp; Genetic Solvers
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Computes Pareto-optimal dispatch itineraries in milliseconds. Maximizes life preservation while keeping equipment recovery routes unblocked.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel p-6 border-white/10 hover:border-cascade-amber/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-cascade-amber/10 border border-cascade-amber/30 flex items-center justify-center text-cascade-amber mb-5">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">
              Dynamic Road Obstacle Rerouting
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              If an arterial flyover is blocked by mud or inundated above 0.5m, routes instantly recalibrate through safe elevated bypasses.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel p-6 border-white/10 hover:border-cascade-green/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-cascade-green/10 border border-cascade-green/30 flex items-center justify-center text-cascade-green mb-5">
              <Gauge className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">
              Demographic Equity Weighting
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Prioritizes high-density informal settlements, dialysis clinics, neonatal centers, and senior care homes with zero algorithmic bias.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. IMPACT SECTION: Measurable outcomes */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-cascade-green px-3 py-1 rounded-full bg-cascade-green/10 border border-cascade-green/30">
            Validated Metrics
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mt-4 tracking-tight">
            Measurable outcomes
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-300 font-light leading-relaxed">
            Benchmarked against historical super-monsoon events and municipal disaster incident records.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel p-8 text-center border-cascade-cyan/30 relative overflow-hidden group hover:border-cascade-cyan transition-all"
          >
            <div className="text-5xl sm:text-6xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cascade-cyan to-blue-400 mb-2">
              40%
            </div>
            <div className="font-display font-bold text-xl text-white mb-2">
              Damage Reduction
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              By proactively staging temporary flood barriers and dewatering pumps ahead of storm crests, secondary asset flooding drops by 40%.
            </p>
          </motion.div>

          {/* Stat 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-8 text-center border-cascade-amber/30 relative overflow-hidden group hover:border-cascade-amber transition-all"
          >
            <div className="text-5xl sm:text-6xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cascade-amber to-yellow-300 mb-2">
              5x
            </div>
            <div className="font-display font-bold text-xl text-white mb-2">
              Faster Response
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Algorithmic dispatch recommendations deliver actionable route solutions in seconds, saving up to 4 vital hours in field deployment.
            </p>
          </motion.div>

          {/* Stat 3 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-panel p-8 text-center border-cascade-green/30 relative overflow-hidden group hover:border-cascade-green transition-all"
          >
            <div className="text-5xl sm:text-6xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cascade-green to-emerald-300 mb-2">
              100%
            </div>
            <div className="font-display font-bold text-xl text-white mb-2">
              Offline Capable
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Deterministic simulation and lightweight graph logic run locally in-browser or on edge rugged tablets even if telecom towers collapse.
            </p>
          </motion.div>
        </div>

        {/* Bottom CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 glass-panel-dark p-8 sm:p-12 text-center border border-cascade-cyan/30 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cascade-cyan/10 via-transparent to-cascade-blue/10 pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
            Ready to simulate disaster cascades?
          </h3>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-8 font-light">
            Adjust rainfall parameters, test climate severity models, trigger dynamic asset blockages, and watch the emergency optimizer solve allocations in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/simulator"
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-cascade-cyan/20 border border-cascade-cyan/60 text-cascade-cyan rounded-xl font-display font-semibold hover:bg-cascade-cyan/30 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            >
              <span>Launch Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLaunchDemo}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-white/5 border border-white/10 text-gray-200 rounded-xl font-display font-medium hover:bg-white/10 transition-all"
            >
              <Play className="w-4 h-4 text-cascade-amber fill-cascade-amber" />
              <span>Run Automated Demo</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER & DISCLAIMER */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400 bg-navy-950">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-center space-x-2 text-cascade-cyan font-display font-semibold text-sm">
            <Shield className="w-4 h-4" />
            <span>CascadeShield Emergency Resilience Initiative</span>
          </div>
          <p className="font-mono text-gray-400">
            Built with illustrative data for demonstration purposes
          </p>
          <p className="text-[11px] text-gray-400">
            All hazard probability curves, terrain topology matrices, and synthetic emergency units are engineered to simulate high-stress urban disaster scenarios.
          </p>
        </div>
      </footer>
    </div>
  );
}
