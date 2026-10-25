// CascadeShield Cascade Engine
// Time-stepped disaster cascade simulation (hourly, T+0 to T+48h)
// All functions are pure - no side effects, no DOM access

import { SIMULATION_CONFIG, DAMAGE_CONFIG } from '../config/city.js';

// Seeded random number generator for reproducible Monte Carlo
export function createRNG(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Calculate flood risk for a zone based on rainfall, elevation, drainage, river distance
export function calculateFloodRisk(zone, rainfallMM, cumulativeRainMM, soilSaturation, climateMultiplier) {
  const effectiveRain = rainfallMM * climateMultiplier;
  const cumulativeEffective = cumulativeRainMM * climateMultiplier;
  
  // Base risk from rainfall intensity
  const intensityFactor = Math.min(effectiveRain / 100, 1); // 100mm/hr = max
  
  // Elevation factor: lower elevation = higher risk
  const elevationFactor = Math.max(0, 1 - (zone.properties.elevation_m / 50));
  
  // Drainage quality inverse
  const drainageFactor = 1 - zone.properties.drainage_quality;
  
  // River proximity factor
  const riverFactor = Math.max(0, 1 - (zone.properties.distance_to_river_km / 3));
  
  // Soil saturation accumulation
  const saturationFactor = Math.min(1, soilSaturation + (cumulativeEffective / 500));
  
  // Combined flood risk
  const risk = (
    intensityFactor * 0.3 +
    elevationFactor * 0.2 +
    drainageFactor * 0.15 +
    riverFactor * 0.2 +
    saturationFactor * 0.15
  );
  
  return Math.min(1, Math.max(0, risk));
}

// Calculate estimated flood depth in meters
export function estimateFloodDepth(floodRisk, elevation, rainfallMM, cumulativeRainMM) {
  if (floodRisk < 0.3) return 0;
  const baseDepth = (cumulativeRainMM / 200) * floodRisk;
  const elevationPenalty = Math.max(0, (10 - elevation) / 10);
  return Math.min(5, baseDepth * (1 + elevationPenalty));
}

// Calculate landslide risk based on flood, slope, saturation
export function calculateLandslideRisk(zone, floodRisk, soilSaturation, cumulativeRainMM) {
  const slopeFactor = zone.properties.slope_deg / 45; // Normalize to 45 degree max
  const proneFactor = zone.properties.landslide_prone;
  const saturationFactor = Math.min(1, soilSaturation + cumulativeRainMM / 400);
  
  // Landslide requires slope AND water saturation
  const risk = (
    slopeFactor * 0.35 +
    proneFactor * 0.3 +
    saturationFactor * 0.2 +
    floodRisk * 0.15
  );
  
  return Math.min(1, Math.max(0, risk));
}

// Check if a substation/infrastructure fails based on flood depth
export function checkInfrastructureFailure(asset, floodDepth, rng) {
  if (floodDepth <= 0) return false;
  const threshold = asset.flood_threshold_m || 1.0;
  if (floodDepth >= threshold) return true;
  // Probabilistic failure as water approaches threshold
  const ratio = floodDepth / threshold;
  if (ratio > 0.7) {
    return rng() < ((ratio - 0.7) / 0.3) * 0.8; // Up to 80% chance near threshold
  }
  return false;
}

// Propagate failures through dependency graph using BFS
export function propagateFailures(failedAssets, dependencies) {
  const allFailed = new Set(failedAssets);
  const cascadeEdges = [];
  const queue = [...failedAssets];
  
  const edges = dependencies?.edges || [];
  
  while (queue.length > 0) {
    const current = queue.shift();
    const dependents = edges.filter(e => e.from === current);
    
    for (const dep of dependents) {
      if (!allFailed.has(dep.to)) {
        allFailed.add(dep.to);
        queue.push(dep.to);
        cascadeEdges.push({
          cause: current,
          effect: dep.to,
          type: dep.type,
          probability: dep.failure_probability,
          lagHours: dep.lag_hours,
        });
      }
    }
  }
  
  return { failedAssets: [...allFailed], cascadeEdges };
}

// Calculate water contamination risk
export function calculateContaminationRisk(zone, floodRisk, floodDepth, pumpStationsFailed, waterSupplyActive) {
  if (floodDepth <= 0 && waterSupplyActive) return 0;
  
  let risk = 0;
  // Flood + sewage mixing
  if (floodDepth > 0.5) risk += Math.min(0.4, floodDepth / 5);
  // Pump station failure = no water treatment
  if (pumpStationsFailed) risk += 0.3;
  // No water supply
  if (!waterSupplyActive) risk += 0.2;
  // High density increases contamination spread
  risk *= (1 + (zone.properties.density || 0) / 100000);
  
  return Math.min(1, Math.max(0, risk));
}

// Calculate road accessibility (0 = fully blocked, 1 = clear)
export function calculateRoadAccessibility(roads = [], floodDepths = {}) {
  return roads.map(road => {
    const fromDepth = floodDepths[road.from_zone] || 0;
    const toDepth = floodDepths[road.to_zone] || 0;
    const maxDepth = Math.max(fromDepth, toDepth);
    const threshold = road.flood_threshold_m || 0.5;
    
    if (maxDepth >= threshold) {
      return { ...road, accessible: false, travelTimeMultiplier: Infinity };
    }
    if (maxDepth > threshold * 0.5) {
      const slowdown = 1 + ((maxDepth / threshold) * 3);
      return { ...road, accessible: true, travelTimeMultiplier: slowdown };
    }
    return { ...road, accessible: true, travelTimeMultiplier: 1 };
  });
}

// Calculate hospital stress level
export function calculateHospitalStress(hospital, hasPower, hasAccess, casualtyEstimate) {
  let stress = 0;
  if (!hasPower) {
    stress += hospital.has_generator ? 0.2 : 0.6; // Generator provides some relief
  }
  if (!hasAccess) stress += 0.3;
  const beds = hospital.beds || 100;
  const occupancyRatio = Math.min(1, casualtyEstimate / beds);
  stress += occupancyRatio * 0.4;
  return Math.min(1, stress);
}

// Calculate vulnerability score for a zone
export function calculateVulnerability(zone) {
  const props = zone.properties || {};
  const elevationScore = Math.max(0, 1 - (props.elevation_m || 0) / 30); // 0-30m normalized
  const slopeScore = (props.slope_deg || 0) / 30;
  const densityScore = Math.min(1, (props.density || 0) / 50000);
  const vulnerablePopScore = props.pct_children_elderly || 0;
  const drainageScore = 1 - (props.drainage_quality || 0);
  const riverScore = Math.max(0, 1 - (props.distance_to_river_km || 0) / 3);
  const landslideScore = props.landslide_prone || 0;
  
  return (
    elevationScore * 0.2 +
    slopeScore * 0.1 +
    densityScore * 0.15 +
    vulnerablePopScore * 0.15 +
    drainageScore * 0.15 +
    riverScore * 0.15 +
    landslideScore * 0.1
  );
}

// Run a single simulation step
export function simulateStep(hour, zones, infrastructure, dependencies, resources, rainfallProfile, soilSaturation, climateMultiplier, rng, previousState) {
  const rainfall = rainfallProfile[hour] || 0;
  const cumulativeRain = rainfallProfile.slice(0, hour + 1).reduce((a, b) => a + b, 0);
  
  const zoneStates = {};
  const floodDepths = {};
  const failedInfra = new Set(previousState?.failedInfra || []);
  const cascadeEdges = [...(previousState?.cascadeEdges || [])];
  let totalPopAtRisk = 0;
  let totalDamage = 0;
  
  // Phase 1: Calculate flood and landslide risk per zone
  for (const zone of zones) {
    const zid = zone.properties.id;
    const floodRisk = calculateFloodRisk(zone, rainfall, cumulativeRain, soilSaturation, climateMultiplier);
    const floodDepth = estimateFloodDepth(floodRisk, zone.properties.elevation_m, rainfall, cumulativeRain);
    const landslideRisk = calculateLandslideRisk(zone, floodRisk, soilSaturation, cumulativeRain);
    
    floodDepths[zid] = floodDepth;
    zoneStates[zid] = {
      id: zid,
      name: zone.properties.name,
      floodRisk,
      floodDepth,
      landslideRisk,
      powerAvailable: true,
      waterAvailable: true,
      contaminationRisk: 0,
      roadAccessibility: 1,
      hospitalStress: 0,
      overallRisk: 0,
      populationAtRisk: 0,
      vulnerability: calculateVulnerability(zone),
      population: zone.properties.population,
      pct_children_elderly: zone.properties.pct_children_elderly || 0.2,
    };
  }
  
  // Phase 2: Check infrastructure failures
  const substations = infrastructure?.substations || [];
  const pumpStations = infrastructure?.pumpStations || [];
  const hospitals = infrastructure?.hospitals || [];
  const roads = infrastructure?.roads || [];

  for (const sub of substations) {
    const zoneFloodDepth = floodDepths[sub.zones_served?.[0]] || 0;
    if (checkInfrastructureFailure(sub, zoneFloodDepth, rng)) {
      failedInfra.add(sub.id);
    }
  }
  
  // Phase 3: Propagate failures through dependency graph
  const propagation = propagateFailures([...failedInfra], dependencies);
  const allFailed = new Set(propagation.failedAssets);
  cascadeEdges.push(...propagation.cascadeEdges.filter(e => 
    !cascadeEdges.some(existing => existing.cause === e.cause && existing.effect === e.effect)
  ));
  
  // Phase 4: Update zone states based on failures
  for (const ps of pumpStations) {
    if (allFailed.has(ps.id) || allFailed.has(ps.powered_by)) {
      for (const zid of (ps.zones_served || [])) {
        if (zoneStates[zid]) {
          zoneStates[zid].waterAvailable = false;
        }
      }
    }
  }
  
  for (const sub of substations) {
    if (allFailed.has(sub.id)) {
      for (const zid of (sub.zones_served || [])) {
        if (zoneStates[zid]) {
          zoneStates[zid].powerAvailable = false;
        }
      }
    }
  }
  
  // Phase 5: Calculate road accessibility
  const roadStates = calculateRoadAccessibility(roads, floodDepths);
  
  // Phase 6: Calculate contamination and overall risk
  const zoneList = Object.values(zoneStates);
  for (const zone of zones) {
    const zid = zone.properties.id;
    const state = zoneStates[zid];
    
    const pumpsFailed = pumpStations.some(ps => 
      (ps.zones_served || []).includes(zid) && (allFailed.has(ps.id) || allFailed.has(ps.powered_by))
    );
    
    state.contaminationRisk = calculateContaminationRisk(
      zone, state.floodRisk, state.floodDepth, pumpsFailed, state.waterAvailable
    );
    
    // Road accessibility for this zone
    const zoneRoads = roadStates.filter(r => r.from_zone === zid || r.to_zone === zid);
    state.roadAccessibility = zoneRoads.length > 0 
      ? zoneRoads.filter(r => r.accessible).length / zoneRoads.length 
      : 1;
    
    // Overall risk (weighted combination)
    state.overallRisk = Math.min(1, (
      state.floodRisk * 0.3 +
      state.landslideRisk * 0.2 +
      (state.powerAvailable ? 0 : 0.15) +
      state.contaminationRisk * 0.15 +
      (1 - state.roadAccessibility) * 0.1 +
      state.hospitalStress * 0.1
    ));
    
    // Population at risk
    state.populationAtRisk = Math.round(state.population * state.overallRisk * state.vulnerability);
    totalPopAtRisk += state.populationAtRisk;
    
    // Damage estimate
    const croreUnit = DAMAGE_CONFIG?.croreMultiplier || 10000000;
    const zoneDamage = (
      state.populationAtRisk * DAMAGE_CONFIG.perCapitaLoss_inr +
      (state.powerAvailable ? 0 : (DAMAGE_CONFIG.downtimePerHour_crore || 2) * croreUnit) +
      (state.waterAvailable ? 0 : (DAMAGE_CONFIG.downtimePerHour_crore || 2) * 0.5 * croreUnit)
    );
    totalDamage += zoneDamage;
  }
  
  // Hospital stress
  for (const hospital of hospitals) {
    const hasPower = !allFailed.has(hospital.powered_by);
    const zoneState = zoneStates[hospital.zone_id];
    const hasAccess = zoneState ? zoneState.roadAccessibility > 0.3 : true;
    const localCasualties = zoneState ? zoneState.populationAtRisk * 0.01 : 0;
    hospital._stress = calculateHospitalStress(hospital, hasPower, hasAccess, localCasualties);
    if (zoneState) zoneState.hospitalStress = hospital._stress;
  }
  
  // Resilience score (city-wide, 0-100)
  const zoneCount = zoneList.length || 1;
  const avgRisk = zoneList.reduce((s, z) => s + z.overallRisk, 0) / zoneCount;
  const totalAssets = (substations.length + pumpStations.length + hospitals.length) || 1;
  const infraIntact = 1 - ([...allFailed].length / totalAssets);
  const roadIntact = roadStates.length > 0 ? roadStates.filter(r => r.accessible).length / roadStates.length : 1;
  const resilienceScore = Math.round((1 - avgRisk * 0.4) * infraIntact * 0.3 * 100 + roadIntact * 30 + (1 - avgRisk) * 40);
  
  return {
    hour,
    rainfall,
    cumulativeRain,
    zoneStates,
    floodDepths,
    failedInfra: [...allFailed],
    cascadeEdges,
    roadStates,
    totalPopAtRisk,
    totalDamage,
    totalDamageCrore: Math.round(totalDamage / 10000000 * 100) / 100,
    resilienceScore: Math.min(100, Math.max(0, resilienceScore)),
    hospitalStates: hospitals.map(h => ({ id: h.id, name: h.name, stress: h._stress || 0, hasPower: !allFailed.has(h.powered_by) })),
  };
}

// Run full simulation (all timesteps)
export function runSimulation(zones, infrastructure, dependencies, resources, rainfallProfile, soilSaturation, climateScenario, blockedAssets = []) {
  const climateMultiplier = SIMULATION_CONFIG.climateScenarios[climateScenario]?.rainfallMultiplier || 1;
  const maxHours = Math.min(rainfallProfile.length, SIMULATION_CONFIG.maxHours);
  const rng = createRNG(42);
  
  const timeline = [];
  let previousState = { failedInfra: [...blockedAssets], cascadeEdges: [] };
  
  for (let hour = 0; hour < maxHours; hour++) {
    const step = simulateStep(
      hour, zones, infrastructure, dependencies, resources,
      rainfallProfile, soilSaturation, climateMultiplier, rng, previousState
    );
    timeline.push(step);
    previousState = step;
  }
  
  return timeline;
}

// Run Monte Carlo simulation for confidence intervals
export function runMonteCarlo(zones, infrastructure, dependencies, resources, rainfallProfile, soilSaturation, climateScenario, blockedAssets = [], numRuns = 30) {
  const results = [];
  
  for (let run = 0; run < numRuns; run++) {
    const climateMultiplier = SIMULATION_CONFIG.climateScenarios[climateScenario]?.rainfallMultiplier || 1;
    const maxHours = Math.min(rainfallProfile.length, SIMULATION_CONFIG.maxHours);
    const rng = createRNG(run * 1000 + 42);
    
    const timeline = [];
    let previousState = { failedInfra: [...blockedAssets], cascadeEdges: [] };
    
    // Add noise to soil saturation per run
    const noisySaturation = soilSaturation + (rng() - 0.5) * 0.2;
    
    for (let hour = 0; hour < maxHours; hour++) {
      const step = simulateStep(
        hour, zones, infrastructure, dependencies, resources,
        rainfallProfile, noisySaturation, climateMultiplier, rng, previousState
      );
      timeline.push(step);
      previousState = step;
    }
    
    results.push(timeline);
  }
  
  // Compute confidence intervals per hour per zone
  const confidenceData = [];
  const maxHours = results[0]?.length || 0;
  
  for (let hour = 0; hour < maxHours; hour++) {
    const hourData = {};
    const zoneIds = Object.keys(results[0][hour].zoneStates);
    
    for (const zid of zoneIds) {
      const risks = results.map(r => r[hour].zoneStates[zid].overallRisk).sort((a, b) => a - b);
      hourData[zid] = {
        mean: risks.reduce((a, b) => a + b, 0) / risks.length,
        p10: risks[Math.floor(risks.length * 0.1)],
        p50: risks[Math.floor(risks.length * 0.5)],
        p90: risks[Math.floor(risks.length * 0.9)],
        std: Math.sqrt(risks.reduce((s, v) => s + Math.pow(v - risks.reduce((a, b) => a + b, 0) / risks.length, 2), 0) / risks.length),
      };
    }
    
    const totalPops = results.map(r => r[hour].totalPopAtRisk).sort((a, b) => a - b);
    const totalDamages = results.map(r => r[hour].totalDamageCrore).sort((a, b) => a - b);
    
    confidenceData.push({
      hour,
      zones: hourData,
      totalPopAtRisk: {
        mean: totalPops.reduce((a, b) => a + b, 0) / totalPops.length,
        p10: totalPops[Math.floor(totalPops.length * 0.1)],
        p90: totalPops[Math.floor(totalPops.length * 0.9)],
      },
      totalDamageCrore: {
        mean: totalDamages.reduce((a, b) => a + b, 0) / totalDamages.length,
        p10: totalDamages[Math.floor(totalDamages.length * 0.1)],
        p90: totalDamages[Math.floor(totalDamages.length * 0.9)],
      },
    });
  }
  
  // Confidence level (inverse of average std deviation)
  const avgStd = confidenceData.length > 0 ? (confidenceData.reduce((s, h) => {
    const stds = Object.values(h.zones).map(z => z.std);
    return s + (stds.length > 0 ? stds.reduce((a, b) => a + b, 0) / stds.length : 0);
  }, 0) / confidenceData.length) : 0;
  
  const confidenceLevel = Math.round((1 - Math.min(1, avgStd * 2)) * 100);
  
  return {
    medianTimeline: results[Math.floor(results.length / 2)],
    confidenceData,
    confidenceLevel,
    numRuns,
  };
}

// Generate cause chain explanation for a zone
export function explainCauseChain(zoneId, simulationStep, infrastructure, dependencies) {
  const chain = [];
  const zoneState = simulationStep.zoneStates[zoneId];
  if (!zoneState) return chain;
  
  // Start with rainfall
  if (simulationStep.rainfall > 20) {
    chain.push({
      event: `Heavy rainfall (${simulationStep.rainfall.toFixed(0)} mm/hr)`,
      type: 'rainfall',
      probability: 1,
      timelag: 0,
    });
  }
  
  // Flood risk
  if (zoneState.floodRisk > 0.3) {
    chain.push({
      event: `Flooding in ${zoneState.name} (depth: ${zoneState.floodDepth.toFixed(1)}m)`,
      type: 'flood',
      probability: zoneState.floodRisk,
      timelag: 0,
      cause: 'Heavy rainfall + low elevation + poor drainage',
    });
  }
  
  // Landslide
  if (zoneState.landslideRisk > 0.3) {
    chain.push({
      event: `Landslide risk in ${zoneState.name}`,
      type: 'landslide',
      probability: zoneState.landslideRisk,
      timelag: 1,
      cause: 'Soil saturation + steep slope',
    });
  }
  
  // Power failure
  if (!zoneState.powerAvailable) {
    const failedSubs = (infrastructure?.substations || []).filter(
      s => simulationStep.failedInfra.includes(s.id) && (s.zones_served || []).includes(zoneId)
    );
    for (const sub of failedSubs) {
      chain.push({
        event: `${sub.name} substation failure`,
        type: 'power',
        probability: 0.8,
        timelag: 2,
        cause: `Flood depth exceeded threshold at ${sub.name}`,
      });
    }
  }
  
  // Water contamination
  if (zoneState.contaminationRisk > 0.2) {
    chain.push({
      event: `Water contamination risk (${(zoneState.contaminationRisk * 100).toFixed(0)}%)`,
      type: 'water',
      probability: zoneState.contaminationRisk,
      timelag: 3,
      cause: 'Flood + sewage mixing + pump station offline',
    });
  }
  
  // Road blockage
  if (zoneState.roadAccessibility < 0.7) {
    chain.push({
      event: `Road access reduced to ${(zoneState.roadAccessibility * 100).toFixed(0)}%`,
      type: 'road',
      probability: 1 - zoneState.roadAccessibility,
      timelag: 1,
      cause: 'Flood depth on road segments',
    });
  }
  
  // Hospital stress
  if (zoneState.hospitalStress > 0.3) {
    chain.push({
      event: `Hospital under stress (${(zoneState.hospitalStress * 100).toFixed(0)}%)`,
      type: 'hospital',
      probability: zoneState.hospitalStress,
      timelag: 4,
      cause: 'Power loss + reduced access + high casualties',
    });
  }
  
  return chain;
}

// Generate rainfall profile from intensity and duration
export function generateRainfallProfile(intensity, duration, pattern = 'burst') {
  const profile = [];
  for (let h = 0; h < 48; h++) {
    if (h >= duration) {
      profile.push(Math.max(0, intensity * 0.1 * Math.exp(-(h - duration) / 6)));
    } else if (pattern === 'burst') {
      // Peak in the middle
      const center = duration / 2;
      const dist = Math.abs(h - center);
      const factor = Math.exp(-(dist * dist) / (duration * 2));
      profile.push(intensity * factor);
    } else {
      // Steady
      profile.push(intensity);
    }
  }
  return profile;
}
