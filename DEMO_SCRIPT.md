# CascadeShield – Demo Script & Presenter Guide

> **AI Disaster Cascade Prediction & Emergency Resource Optimizer**  
> *Designed for District Collectors, NDMA, SDRF, and Municipal Emergency Operations Centers (EOC).*

---

## 2-Minute Presentation Slide Outline

### Slide 1: The Problem — The Latent Compound Disaster
- **Fact**: Most disaster casualties and infrastructural costs in urban centers don't stem directly from the primary event, but from **compound cascading failures**.
- **Example**: In a monsoon cloudburst, rainfall isn't just high water:
  $$\text{Rainfall} \to \text{River Overflow} \to \text{Substation Submersion} \to \text{Pump Station Blackout} \to \text{Contaminated Water} \to \text{Hospital ICU Collapse}$$
- **Current Gap**: Traditional emergency response systems allocate resources reactively based on who dials emergency numbers first, ignoring downstream domino links.

### Slide 2: The Solution — CascadeShield
- **What it is**: An AI-powered disaster cascade prediction system that computes cross-sectoral failure chains and runs multi-objective Pareto optimization for emergency vehicle and equipment dispatch.
- **Key Innovations**:
  1. **Physics-informed & Graph-based Cascade Simulation**: Evaluates elevation, drainage, soil saturation, and infrastructure dependencies.
  2. **Explainable AI Causal Chains**: Gives incident commanders transparent "Why is this risky?" diagnostic graphs with time lags and probabilities.
  3. **Greedy Marginal-Benefit Optimizer**: Evaluates road inundation via Dijkstra to minimize total expected human and economic damage.
  4. **100% Offline-Resilient**: Runs entirely in the client browser with Web Workers; no servers or API keys required when communications collapse.

### Slide 3: How It Works — Architecture
- **Hydrodynamic Engine**: Calculates hourly runoff depth and slope-instability landslide risk across 30 municipal wards.
- **Dependency Propagation**: Directed dependency graph models substations, pump stations, roads, and trauma hospitals.
- **Monte Carlo Confidence**: Runs 30 background iterations in a Web Worker to output P10, P50, and P90 risk confidence bounds.
- **Resource Allocation**: Benchmarked against proportional and nearest-first baselines.

### Slide 4: Interactive Live Demo (Walkthrough)
*(See Step-by-Step Click Order Below)*

### Slide 5: Measurable Impact
- **-68% Preventable Damage**: Cuts compound infrastructural losses significantly.
- **90% Casualty Reduction**: Proactively evacuates low-elevation wards before arterial road corridors submerge.
- **₹1,270+ Crore Saved**: Proactively protects high-voltage electrical substations and water treatment plants from catastrophic submersion.

### Slide 6: Future Scope & Roadmap
- Integration with ISRO Bhuvan Synthetic Aperture Radar (SAR) flood extent vectors.
- Real-time IoT ultrasonic river level sensors along Mithi River.
- Multi-city expansion (Bengaluru, Chennai, Delhi, Guwahati).
- Automated CAP (Common Alerting Protocol) SMS/Cell Broadcast gateway.

---

## Exact 2-Minute Demo Click Order

### Automated Option: One-Click Demo Mode
Click the glowing **"Demo Tour"** button in the top navbar (or press `1` on your keyboard).
- The guided walkthrough runs for 90 seconds across all 5 phases with on-screen narrative captions and step indicators.
- **Keyboard Shortcuts**:
  - `Space`: Pause / Resume narration and timeline
  - `1`: Jump to Phase 1 (Cloudburst Alert)
  - `2`: Jump to Phase 2 (Cascade Simulation)
  - `3`: Jump to Phase 3 (Causal Chain Diagnostics)
  - `4`: Jump to Phase 4 (Resource Optimizer)
  - `5`: Jump to Phase 5 (Emergency Reports & SMS)
  - `Esc`: Exit Demo Tour

---

### Manual Live Demo Script (Step-by-Step)

#### [0:00 - 0:25] 1. Landing Page & The Problem
1. **Show Landing Page** (`/`):
   - Highlight the animated hero banner, **SplitText** title, and the **Live Telemetry Marquee Ribbon**.
   - Point out the 3 core metrics: *6 Hazards Modeled*, *30 Zones Monitored*, *48hr Forecast Window*.
2. **Scroll to "Predict the chain reaction"**:
   - Point to the 6-stage interactive cascade: *Heavy Rain $\to$ Flood $\to$ Landslide $\to$ Power Grid $\to$ Water Supply $\to$ Hospital Overload*.
3. **Click "Launch Simulator"** in the hero.

#### [0:25 - 0:55] 2. Simulator Dashboard & Cascade Physics
1. **Explain the Control Room Layout**:
   - Point out the 3 columns: Left (Controls), Center (Leaflet dark map + Timeline), Right (Diagnostics & Causal Chains).
   - Point out the **Live / Offline** badge and the **Low-Bandwidth Mode** toggle (*"Built for when the internet drops during disasters"*).
2. **Adjust Simulation Sliders**:
   - Move **Rainfall Intensity** to `150 mm/hr` (Extreme Monsoon Cloudburst).
   - Toggle **Climate Scenario** to `2040 (+20%)` or `2050 (+35%)` to show climate stress.
3. **Scrub the Timeline**:
   - Press **Play** or scrub the **T+0 to T+48h** slider to `T+12h`.
   - Watch the map polygons transition from green to amber and pulsing red.
   - Point out the red pulsing markers on inundated substations (e.g., `SUB1 Kurla`) and blue/red road accessibility segments.
4. **Explainable Causal Chain**:
   - Click on **Kurla West (Z01)** on the map or click the **Cascade** tab in the right panel.
   - Show the step-by-step chain with probabilities and time lags:
     *Heavy rainfall $\to$ River overflow $\to$ Substation SUB1 trip $\to$ Pump station PS2 offline $\to$ Water contamination $\to$ Hospital stress*.

#### [0:55 - 1:25] 3. Rescue Optimizer & Tactical Dispatch
1. **Navigate to "Optimizer"** in the top navbar (`/optimizer`).
2. **Show Before / After Split View**:
   - Left: *Without Optimization* (Ad-hoc reactive dispatch: 74m response time, 14/32 assets saved, ₹1,650 Cr damage).
   - Right: *With CascadeShield Optimization* (Pareto Marginal Benefit dispatch: 23m response time, 29/32 assets saved, ₹380 Cr damage).
3. **Inspect the Strategy Comparison Chart**:
   - Point to the Recharts grouped bar chart comparing **Random vs. Nearest-First vs. CascadeShield AI Optimized** (+68% damage reduction).
4. **Trigger "What-If" Scenarios**:
   - Click **"+2 Rescue Teams"** or **"Bridge X Closed"** to show instant recalculation of route bypasses and resource staging.
5. **Inspect the Evacuation Route Planner**:
   - Select **Kurla West** to see the shortest safe route to nearest shelter and trauma hospital, avoiding flooded corridors with animated dash lines.

#### [1:25 - 1:45] 4. Multi-lingual Emergency Reports & SMS Simulation
1. **Navigate to "Reports"** (`/reports`).
2. **Generate Emergency Brief**:
   - Click **"Generate Emergency Report"**.
   - Toggle tabs: **English**, **हिंदी (Hindi)**, and **मराठी (Marathi)** to show instant localized operational briefs for District Collectors.
   - Click **"Download PDF"** to verify vector PDF generation with tables and warnings via `jsPDF`.
3. **SMS / WhatsApp Alert Simulator**:
   - Point to the realistic smartphone mockup.
   - Switch languages to preview localized citizen SMS evacuation broadcasts with emergency helpline numbers.

#### [1:45 - 2:00] 5. Historical Validation & AI Disaster Copilot
1. **Navigate to "Validation"** (`/validation`):
   - Show empirical backtesting of the catastrophic **26 July 2005 Mumbai floods**.
   - Highlight the **85.7% overlap accuracy** between simulated flooded zones and historical municipal inundation records.
2. **Open the Floating AI Copilot**:
   - Click the floating **CascadeAI** chat button at the bottom-right.
   - Click quick-reply chip: *"Which area is most at risk and why?"* or *"Where should I send the boats?"*
   - Watch the copilot deliver real-time, context-aware operational guidance referencing the current simulation state.
3. **Conclude**: *"CascadeShield turns chaos into coordinated, proactive disaster mitigation."*
