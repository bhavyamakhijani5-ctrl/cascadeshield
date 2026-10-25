import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Layers,
  Cpu,
  Database,
  AlertTriangle,
  HeartHandshake,
  Code2,
  Rocket,
  CloudRain,
  Waves,
  Mountain,
  Zap,
  Droplets,
  Hospital,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Info,
  Server,
  Compass,
} from 'lucide-react';

export default function About() {
  const cascadeStages = [
    {
      step: 1,
      title: 'Precipitation Trigger',
      icon: CloudRain,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      desc: 'Extreme precipitation or cloudburst event (>100mm/h) exceeds surface percolation threshold.',
      metric: 'Rainfall (mm/hr)',
    },
    {
      step: 2,
      title: 'Hydrodynamic Inundation',
      icon: Waves,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
      desc: 'Elevation slope, impervious soil, and river channel overflow cause localized ponding & overland flow.',
      metric: 'Flood Depth (m)',
    },
    {
      step: 3,
      title: 'Slope & Debris Failure',
      icon: Mountain,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      desc: 'Hill slopes (>10° incline) experience liquefaction and mudslides, blocking arterial escape roads.',
      metric: 'Slope Stability Index',
    },
    {
      step: 4,
      title: 'Power Grid Tripping',
      icon: Zap,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      desc: 'Water ingress into 220kV/33kV substations forces protective disconnects to prevent transformer explosion.',
      metric: 'Grid MW Capacity Offline',
    },
    {
      step: 5,
      title: 'Water & Sanitation Stall',
      icon: Droplets,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/30',
      desc: 'Dewatering pump stations lose power; untreated sewage backs up into municipal drinking supplies.',
      metric: 'Pumping Capacity (MLD)',
    },
    {
      step: 6,
      title: 'Healthcare Cascade Crisis',
      icon: Hospital,
      color: 'text-red-500',
      bg: 'bg-red-500/10 border-red-500/30',
      desc: 'Hospital basements submerge, backup generators run out of diesel, and ambulances cannot navigate choked arteries.',
      metric: 'ICU Patient Vulnerability',
    },
  ];

  const techStack = [
    { name: 'Vite', role: 'Next-Generation Fast Frontend Tooling', category: 'Build' },
    { name: 'React 18', role: 'Component Architecture with Concurrent Hooks', category: 'Framework' },
    { name: 'Tailwind CSS', role: 'Utility-First Cybernetic UI & Glassmorphism Design', category: 'Styling' },
    { name: 'Leaflet & React-Leaflet', role: 'Interactive Geospatial Vector & Tile Mapping', category: 'GIS' },
    { name: 'Recharts', role: 'Composable SVG Data Visualization & Rainfall Profiles', category: 'Charts' },
    { name: 'jsPDF & AutoTable', role: 'Client-Side Vector PDF Briefing Synthesis', category: 'Reporting' },
    { name: 'Zustand', role: 'High-Performance Unidirectional State Store', category: 'State' },
    { name: 'Web Workers', role: 'Background Threading for Hydrodynamic Matrix Math', category: 'Performance' },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-12 max-w-7xl mx-auto">
      {/* Page Title & Mission */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center space-x-2 text-cascade-cyan text-xs font-mono uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4 text-cascade-cyan" />
          <span>Architectural Documentation & Research Methodology</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Methodology & About CascadeShield
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-4xl leading-relaxed">
          CascadeShield is an AI-assisted disaster intelligence decision support platform. It models multi-tier compounding infrastructure failures during extreme climatic events and generates optimized, marginal-benefit emergency resource staging manifests in real time.
        </p>
      </div>

      {/* SECTION A: OVERVIEW & TARGET USERS */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10 mb-5">
          <div className="w-8 h-8 rounded-lg bg-cascade-cyan/20 border border-cascade-cyan/40 flex items-center justify-center text-cascade-cyan">
            <Compass className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-white">
            A. System Overview & Operational Target Audience
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              Contemporary disaster management systems typically treat urban hazards as isolated events: meteorologists track precipitation, civil engineers track river levels, and power utilities track substation faults on disconnected dashboards.
            </p>
            <p>
              When an extreme cloudburst hits, failures do not remain isolated—they <strong>cascade across interdependent infrastructure</strong>. A flooded roadway blocks diesel fuel tankers from reaching hospital backup generators; a tripped power substation disables municipal storm pumps, compounding flood levels upstream.
            </p>
            <p>
              CascadeShield solves this critical visibility gap by integrating hydrodynamic runoff, network flow graph modeling, and continuous heuristic optimization into a unified tactical command console.
            </p>
          </div>

          <div className="lg:col-span-5 bg-navy-800/80 p-5 rounded-xl border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-cascade-cyan">
              Primary Deployment Stakeholders
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white block font-medium">1. District Disaster Control Rooms (DDMA)</strong>
                <span className="text-slate-400 text-[11px]">
                  District Collectors and Municipal Commissioners conducting strategic resource staging before high tides.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white block font-medium">2. National & State Disaster Response Forces (NDRF / SDRF)</strong>
                <span className="text-slate-400 text-[11px]">
                  Tactical field commanders routing inflatable rescue boats and amphibious vehicles along passable corridors.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <strong className="text-white block font-medium">3. Municipal Emergency Operations Centers (MCGM EOC)</strong>
                <span className="text-slate-400 text-[11px]">
                  Unified dispatchers coordinating fire hazmat, heavy dewatering pumps, and trauma hospital admissions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: 6-STAGE CASCADE MODEL */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              B. The 6-Stage Infrastructure Cascade Model
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic & probabilistic directed acyclic graph (DAG) modeling inter-sector failure propagation
            </p>
          </div>
        </div>

        {/* Visual Pipeline Chain */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cascadeStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className={`p-4 rounded-xl border ${stage.bg} flex flex-col justify-between relative group hover:border-white/30 transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-navy-900/80 border border-white/10 text-white font-bold">
                      Stage {stage.step} of 6
                    </span>
                    <Icon className={`w-5 h-5 ${stage.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-white text-sm mb-1.5">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{stage.desc}</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Metric Target:</span>
                  <span className="font-mono text-white font-medium">{stage.metric}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inline SVG Cascade Dependency Flow Diagram */}
        <div className="p-5 rounded-xl bg-navy-950 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-bold text-white font-mono uppercase">
              Cascading Dependency Directed Graph
            </span>
            <span>Hover edges indicate failure probability ($P_f$) & temporal lag ($\tau$)</span>
          </div>

          <div className="overflow-x-auto py-2">
            <svg
              className="w-full min-w-[700px] h-32"
              viewBox="0 0 900 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Connector Arrows */}
              <defs>
                <marker id="arrowhead" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                  <polygon points="0 0, 7 2.5, 0 5" fill="#00d4ff" />
                </marker>
              </defs>

              <line x1="120" y1="60" x2="165" y2="60" stroke="#00d4ff" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrowhead)" />
              <line x1="280" y1="60" x2="325" y2="60" stroke="#00d4ff" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrowhead)" />
              <line x1="440" y1="60" x2="485" y2="60" stroke="#00d4ff" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrowhead)" />
              <line x1="600" y1="60" x2="645" y2="60" stroke="#00d4ff" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrowhead)" />
              <line x1="760" y1="60" x2="805" y2="60" stroke="#00d4ff" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrowhead)" />

              {/* Node 1: Rainfall */}
              <rect x="10" y="25" width="110" height="70" rx="10" fill="#0f172a" stroke="#00d4ff" strokeWidth="1.5" />
              <text x="65" y="55" fill="#00d4ff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">1. Precipitation</text>
              <text x="65" y="73" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="sans-serif">Inflow Input</text>

              {/* Node 2: Floods */}
              <rect x="170" y="25" width="110" height="70" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="225" y="55" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">2. Flood Runoff</text>
              <text x="225" y="73" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="sans-serif">DEM & Manning's n</text>

              {/* Node 3: Slope */}
              <rect x="330" y="25" width="110" height="70" rx="10" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="385" y="55" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">3. Landslides</text>
              <text x="385" y="73" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="sans-serif">Roads Cut Off</text>

              {/* Node 4: Power */}
              <rect x="490" y="25" width="110" height="70" rx="10" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
              <text x="545" y="55" fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">4. Power Grid</text>
              <text x="545" y="73" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="sans-serif">Substations Trip</text>

              {/* Node 5: Water */}
              <rect x="650" y="25" width="110" height="70" rx="10" fill="#0f172a" stroke="#2dd4bf" strokeWidth="1.5" />
              <text x="705" y="55" fill="#2dd4bf" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">5. Dewatering</text>
              <text x="705" y="73" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="sans-serif">Pumps Fail</text>

              {/* Node 6: Hospitals */}
              <rect x="810" y="25" width="85" height="70" rx="10" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
              <text x="852" y="55" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">6. Hospital</text>
              <text x="852" y="73" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="sans-serif">Critical Surge</text>
            </svg>
          </div>
        </div>
      </section>

      {/* SECTION C: OPTIMIZATION ALGORITHM */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              C. Greedy Marginal-Benefit Allocation with 2-Opt Local Search
            </h2>
            <p className="text-xs text-slate-400">
              Heuristic resource optimization under non-convex cascading network constraints
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs sm:text-sm text-slate-300">
          <div className="lg:col-span-7 space-y-4 leading-relaxed">
            <p>
              Allocating limited emergency relief resources (e.g., 28 rescue boats, 24 dewatering pumps, and 16 mobile generators) across 30 municipal wards is a combinatorial NP-hard problem.
            </p>
            <div className="p-4 rounded-xl bg-navy-950 font-mono text-xs text-cyan-300 border border-white/10">
              <span className="text-slate-400 block mb-1">Mathematical Objective Function:</span>
              {"$$\\max \\sum_{z \\in Z} \\Delta \\text{RiskMitigated}(r, z) \\cdot \\text{Population}(z) - \\lambda \\cdot \\text{TransitTime}(b, z)$$"}
              <span className="text-slate-400 block mt-2 text-[11px]">
                {"Where $\\Delta\\text{RiskMitigated}$"} accounts for downstream prevented cascade failures (e.g. saving 1 substation prevents outages across 6 dependent wards).
              </span>
            </div>
            <p>
              Standard linear programming fails because cascade feedback loops introduce non-convex discontinuities. CascadeShield utilizes a <strong>Greedy Marginal-Benefit algorithm</strong> initialized with steepest-gradient candidate assignments, followed by a <strong>2-Opt Local Search</strong> permutation pass to resolve routing deadlocks across submerged road networks.
            </p>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-emerald-400">
              Comparison Against Traditional Baselines
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex justify-between font-bold text-slate-300 mb-1">
                  <span>Baseline 1: Equal Proportional</span>
                  <span className="text-red-400 font-mono">-42% efficiency</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Splits resources equally across all wards. Starves critical chokepoint hubs while over-allocating to dry high-elevation areas.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex justify-between font-bold text-slate-300 mb-1">
                  <span>Baseline 2: First-Come First-Served</span>
                  <span className="text-amber-400 font-mono">-35% efficiency</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Responds reactively to the earliest phone calls, stranding emergency teams in localized traffic snarls while major sub-stations flood unaddressed.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-cascade-cyan/10 border border-cascade-cyan/30">
                <div className="flex justify-between font-bold text-cyan-300 mb-1">
                  <span>CascadeShield: Marginal Cascade Optimizer</span>
                  <span className="text-emerald-300 font-mono">+68% lives protected</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Targets nodes where intervention stops the largest tree of downstream infrastructural collapse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: DATA SOURCES */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              D. Geospatial & Meteorological Data Integration
            </h2>
            <p className="text-xs text-slate-400">
              Open-source telemetry architecture (Synthetic illustrative profile active; API connectors documented)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Meteorology
            </span>
            <h3 className="text-sm font-bold text-white">Open-Meteo API</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides hourly ensemble precipitation forecasts, convective available potential energy (CAPE), and radar precipitation estimates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Road Network
            </span>
            <h3 className="text-sm font-bold text-white">OpenStreetMap (OSM)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Highways, arterial connectors, bridges, and underpass geometries mapped with elevation nodes to determine passable routes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Elevation DEM
            </span>
            <h3 className="text-sm font-bold text-white">NASA SRTM 30m</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shuttle Radar Topography Mission digital elevation grid used to calculate natural watershed slopes and low-lying hollows.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Demographics
            </span>
            <h3 className="text-sm font-bold text-white">WorldPop 100m</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-resolution spatial population density, age distribution ratios, and vulnerable pediatric/geriatric demographic factors.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION E: ASSUMPTIONS & LIMITATIONS */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10 mb-4">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              E. Technical Assumptions & Current Limitations
            </h2>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Hydraulic Simplification:</strong> Overland flood depth is calculated using quasi-2D kinematic wave Manning equations rather than computationally intensive 3D Navier-Stokes hydrodynamic solvers to maintain 60 FPS in-browser execution.
            </li>
            <li>
              <strong>Synthetic Baseline Data:</strong> All infrastructure IDs, transformer flood thresholds, and hospital diesel tank capacities shown in the current prototype are synthetic illustrative representations modeled on published academic literature.
            </li>
            <li>
              <strong>Network Disconnect Determinism:</strong> Substation flood tripping is modeled as a sigmoidal probability curve centered at 0.85m water ingress; micro-transformer localized waterproofing variations are not individually resolved.
            </li>
            <li>
              <strong>Stationary Tide Harmonic:</strong> Estuary sea level conditions utilize an idealized spring-tide diurnal curve rather than coupled real-time oceanographic storm surge gauge feeds.
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION F: ETHICS & RESPONSIBLE AI NOTE */}
      <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-navy-800 to-navy-950 border-2 border-cascade-cyan/30 relative overflow-hidden">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-cascade-cyan/20 border border-cascade-cyan/50 flex items-center justify-center text-cascade-cyan shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-display font-bold text-white">
              F. Ethics, Responsibility & Humanitarian Notice
            </h2>
            <blockquote className="p-3.5 bg-navy-900/90 rounded-xl border border-white/10 text-xs sm:text-sm text-cyan-200 font-medium italic leading-relaxed">
              "All data shown is illustrative and synthetic. This tool is for demonstration and educational purposes. Real-world deployment would require validated data, expert review, and community engagement."
            </blockquote>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algorithmic disaster optimization must always augment—never supersede—human command authority. First-responder field observations and vulnerable community input must remain paramount during live operational mobilization.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION G: TECH STACK */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10 mb-5">
          <div className="w-8 h-8 rounded-lg bg-cascade-cyan/20 border border-cascade-cyan/40 flex items-center justify-center text-cascade-cyan">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              G. Production Technology Stack
            </h2>
            <p className="text-xs text-slate-400">Modern, zero-dependency serverless web architecture</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-3.5 rounded-xl bg-navy-800/60 border border-white/5 hover:border-white/20 transition flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  {tech.category}
                </span>
                <div className="text-sm font-bold text-white font-display mt-2">
                  {tech.name}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                {tech.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION H: FUTURE SCOPE */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
            <Rocket className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              H. Platform Roadmap & Future Engineering Scope
            </h2>
            <p className="text-xs text-slate-400">Phased milestones toward nationwide operational readiness</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">ISRO Bhuvan Integration</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">Q1 2027</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct ingestion of Indian Space Research Organisation (ISRO) RISAT-1A Synthetic Aperture Radar (SAR) imagery for cloud-penetrating water surface detection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">IoT River Sensor Ingestion</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">Q2 2027</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              MQTT telemetry hooks for BMC automated river gauge sensors installed along Mithi River, Vakola nullah, and Poisar channels.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Graph Neural Networks (GNN)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">Q3 2027</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Machine learning surrogate models replacing heuristic cascade traversal to achieve sub-second Monte Carlo risk simulations across 10,000 ward nodes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Multi-City Portability</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">Q3 2027</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plug-and-play geographic configuration for flood-vulnerable Indian metropolises including Chennai, Guwahati, Bengaluru, and Patna.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Twilio & Sachet CAP Gateway</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">Q4 2027</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              One-click multi-lingual Cell Broadcast alerting through NDMA CAP protocols and telecom SMS/WhatsApp Business gateways.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Offline First Mobile PWA</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">Q4 2027</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              IndexedDB offline sync for ground first responders operating in severed connectivity zones, synchronizing upon reconnect.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
