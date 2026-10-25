// CascadeShield Resource Optimizer
// Allocates limited rescue resources to minimize total expected damage

import { DAMAGE_CONFIG } from '../config/city.js';

// Dijkstra shortest path on road graph
export function dijkstra(roads = [], startZone, endZone) {
  const graph = {};
  for (const road of roads) {
    if (!road.accessible) continue;
    if (!graph[road.from_zone]) graph[road.from_zone] = [];
    if (!graph[road.to_zone]) graph[road.to_zone] = [];
    const time = road.travel_time_min * (road.travelTimeMultiplier || 1);
    graph[road.from_zone].push({ node: road.to_zone, weight: time, road });
    graph[road.to_zone].push({ node: road.from_zone, weight: time, road });
  }
  
  const dist = {};
  const prev = {};
  const visited = new Set();
  const queue = [{ node: startZone, dist: 0 }];
  dist[startZone] = 0;
  
  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const { node } = queue.shift();
    if (visited.has(node)) continue;
    visited.add(node);
    
    if (node === endZone) break;
    
    for (const neighbor of (graph[node] || [])) {
      const newDist = dist[node] + neighbor.weight;
      if (newDist < (dist[neighbor.node] ?? Infinity)) {
        dist[neighbor.node] = newDist;
        prev[neighbor.node] = node;
        queue.push({ node: neighbor.node, dist: newDist });
      }
    }
  }
  
  if (dist[endZone] === undefined) return null;
  
  // Reconstruct path
  const path = [];
  let current = endZone;
  while (current) {
    path.unshift(current);
    current = prev[current];
  }
  
  return { path, time: dist[endZone], distance: path.length };
}

// Find nearest available shelter/hospital from a zone
export function findNearestFacility(zone, facilities = [], roads = [], type = 'shelter') {
  const available = facilities.filter(f => {
    if (type === 'shelter') return (f.current_occupancy || 0) < f.capacity;
    if (type === 'hospital') return (f._stress || 0) < 0.8;
    return true;
  });
  
  let best = null;
  let bestTime = Infinity;
  
  for (const facility of available) {
    const route = dijkstra(roads, zone, facility.zone_id);
    if (route && route.time < bestTime) {
      bestTime = route.time;
      best = { facility, route };
    }
  }
  
  return best;
}

// Calculate marginal benefit of allocating a resource to a zone
export function marginalBenefit(zoneState, resourceType, currentAllocations = []) {
  const existingCount = currentAllocations.filter(
    a => a.zone === zoneState.id && a.resourceType === resourceType
  ).length;
  
  // Diminishing returns
  const diminishing = 1 / (1 + existingCount * 0.5);
  
  const riskReduction = {
    rescue: 0.15 * diminishing,
    medical: 0.1 * diminishing,
    boat: zoneState.floodDepth > 0.5 ? 0.2 * diminishing : 0.02,
    pump: zoneState.floodDepth > 0.3 ? 0.12 * diminishing : 0.01,
    generator: !zoneState.powerAvailable ? 0.15 * diminishing : 0.01,
    relief_kit: 0.05 * diminishing,
  };
  
  const reduction = riskReduction[resourceType] || 0.05;
  
  // Weight by population, vulnerability, and children/elderly priority
  const weight = zoneState.population * zoneState.vulnerability * 
    (1 + (zoneState.pct_children_elderly || 0.2));
  
  return reduction * weight * zoneState.overallRisk;
}

// Greedy marginal-benefit allocation
export function greedyAllocate(zoneStates = {}, resources = {}, roads = []) {
  const allocations = [];
  const remaining = { ...resources };
  
  const reliefBatches = Math.min(Math.floor((remaining.supplies?.relief_kits?.total ?? 0) / 500), 10);
  const resourceTypes = [
    { type: 'rescue', key: 'rescue', total: remaining.teams?.rescue?.available ?? 12 },
    { type: 'medical', key: 'medical', total: remaining.teams?.medical?.available ?? 5 },
    { type: 'boat', key: 'boat', total: remaining.equipment?.boats?.available ?? 8 },
    { type: 'pump', key: 'pump', total: remaining.equipment?.pumps?.available ?? 10 },
    { type: 'generator', key: 'generator', total: remaining.equipment?.generators?.available ?? 6 },
    { type: 'relief_kit', key: 'relief_kit', total: reliefBatches },
  ];
  
  const zones = Object.values(zoneStates);
  
  for (const resource of resourceTypes) {
    let available = resource.total;
    
    while (available > 0) {
      let bestZone = null;
      let bestBenefit = -1;
      
      for (const zone of zones) {
        const benefit = marginalBenefit(zone, resource.type, allocations);
        if (benefit > bestBenefit) {
          bestBenefit = benefit;
          bestZone = zone;
        }
      }
      
      if (bestZone && bestBenefit > 0) {
        allocations.push({
          zone: bestZone.id,
          zoneName: bestZone.name,
          resourceType: resource.type,
          benefit: bestBenefit,
          quantity: resource.type === 'relief_kit' ? 50 : 1,
        });
        available -= 1;
      } else {
        break;
      }
    }
  }
  
  return allocations;
}

// Random allocation baseline
export function randomAllocate(zoneStates = {}, resources = {}) {
  const allocations = [];
  const zones = Object.values(zoneStates);
  if (zones.length === 0) return allocations;
  const rng = () => Math.floor(Math.random() * zones.length);
  
  const reliefBatches = Math.min(Math.floor((resources.supplies?.relief_kits?.total ?? 0) / 500), 10);
  const resourceTypes = [
    { type: 'rescue', total: resources.teams?.rescue?.available ?? 12 },
    { type: 'medical', total: resources.teams?.medical?.available ?? 5 },
    { type: 'boat', total: resources.equipment?.boats?.available ?? 8 },
    { type: 'pump', total: resources.equipment?.pumps?.available ?? 10 },
    { type: 'generator', total: resources.equipment?.generators?.available ?? 6 },
    { type: 'relief_kit', total: reliefBatches },
  ];
  
  for (const resource of resourceTypes) {
    for (let i = 0; i < resource.total; i++) {
      const zone = zones[rng()];
      allocations.push({
        zone: zone.id,
        zoneName: zone.name,
        resourceType: resource.type,
        benefit: 0,
        quantity: 1,
      });
    }
  }
  
  return allocations;
}

// Nearest-first allocation baseline
export function nearestFirstAllocate(zoneStates = {}, resources = {}, baseZone = 'Z01') {
  const allocations = [];
  const zones = Object.values(zoneStates).filter(z => z.overallRisk > 0.2);
  if (zones.length === 0) return allocations;
  
  // Sort by proximity to base (simple by zone ID distance as proxy)
  const baseNum = parseInt(baseZone.replace('Z', '')) || 1;
  zones.sort((a, b) => {
    const aNum = parseInt(a.id.replace('Z', '')) || 1;
    const bNum = parseInt(b.id.replace('Z', '')) || 1;
    return Math.abs(aNum - baseNum) - Math.abs(bNum - baseNum);
  });
  
  const reliefBatches = Math.min(Math.floor((resources.supplies?.relief_kits?.total ?? 0) / 500), 10);
  const resourceTypes = [
    { type: 'rescue', total: resources.teams?.rescue?.available ?? 12 },
    { type: 'medical', total: resources.teams?.medical?.available ?? 5 },
    { type: 'boat', total: resources.equipment?.boats?.available ?? 8 },
    { type: 'pump', total: resources.equipment?.pumps?.available ?? 10 },
    { type: 'generator', total: resources.equipment?.generators?.available ?? 6 },
    { type: 'relief_kit', total: reliefBatches },
  ];
  
  for (const resource of resourceTypes) {
    for (let i = 0; i < resource.total && i < zones.length; i++) {
      allocations.push({
        zone: zones[i % zones.length].id,
        zoneName: zones[i % zones.length].name,
        resourceType: resource.type,
        benefit: 0,
        quantity: 1,
      });
    }
  }
  
  return allocations;
}

// Calculate damage with a given allocation
export function calculateDamageWithAllocation(zoneStates = {}, allocations = []) {
  let totalDamage = 0;
  let totalPopAtRisk = 0;
  const zoneResults = {};
  
  for (const [zid, zone] of Object.entries(zoneStates)) {
    const zoneAllocations = allocations.filter(a => a.zone === zid);
    let riskReduction = 0;
    const typeCounts = {};
    
    for (const alloc of zoneAllocations) {
      typeCounts[alloc.resourceType] = (typeCounts[alloc.resourceType] || 0) + 1;
      const diminishing = 1 / (1 + (typeCounts[alloc.resourceType] - 1) * 0.7);
      
      const reductions = {
        rescue: 0.14,
        medical: 0.10,
        boat: zone.floodDepth > 0.5 ? 0.18 : 0.02,
        pump: zone.floodDepth > 0.3 ? 0.14 : 0.02,
        generator: !zone.powerAvailable ? 0.15 : 0.02,
        relief_kit: 0.04,
      };
      riskReduction += (reductions[alloc.resourceType] || 0.05) * diminishing;
    }
    
    const effectiveRisk = Math.max(0, zone.overallRisk - Math.min(0.7, riskReduction));
    const popAtRisk = Math.round(zone.population * effectiveRisk * zone.vulnerability);
    const damage = popAtRisk * DAMAGE_CONFIG.perCapitaLoss_inr;
    
    zoneResults[zid] = {
      ...zone,
      effectiveRisk,
      populationAtRisk: popAtRisk,
      damage,
      allocations: zoneAllocations,
    };
    
    totalDamage += damage;
    totalPopAtRisk += popAtRisk;
  }
  
  return { totalDamage, totalPopAtRisk, totalDamageCrore: totalDamage / 10000000, zoneResults };
}

// Compare allocation strategies
export function compareStrategies(zoneStates = {}, resources = {}, roads = []) {
  const noAllocation = calculateDamageWithAllocation(zoneStates, []);
  const randomAlloc = randomAllocate(zoneStates, resources);
  const nearestAlloc = nearestFirstAllocate(zoneStates, resources);
  const optimizedAlloc = greedyAllocate(zoneStates, resources, roads);
  
  const randomResult = calculateDamageWithAllocation(zoneStates, randomAlloc);
  const nearestResult = calculateDamageWithAllocation(zoneStates, nearestAlloc);
  const optimizedResult = calculateDamageWithAllocation(zoneStates, optimizedAlloc);
  
  const baseDamage = noAllocation.totalDamage || 1;
  
  return {
    noAllocation,
    random: { allocations: randomAlloc, result: randomResult },
    nearest: { allocations: nearestAlloc, result: nearestResult },
    optimized: { allocations: optimizedAlloc, result: optimizedResult },
    comparison: {
      damageReduction: {
        random: ((noAllocation.totalDamage - randomResult.totalDamage) / baseDamage * 100).toFixed(1),
        nearest: ((noAllocation.totalDamage - nearestResult.totalDamage) / baseDamage * 100).toFixed(1),
        optimized: ((noAllocation.totalDamage - optimizedResult.totalDamage) / baseDamage * 100).toFixed(1),
      },
      livesProtected: {
        random: noAllocation.totalPopAtRisk - randomResult.totalPopAtRisk,
        nearest: noAllocation.totalPopAtRisk - nearestResult.totalPopAtRisk,
        optimized: noAllocation.totalPopAtRisk - optimizedResult.totalPopAtRisk,
      },
      inrSaved: {
        random: ((noAllocation.totalDamage - randomResult.totalDamage) / 10000000).toFixed(1),
        nearest: ((noAllocation.totalDamage - nearestResult.totalDamage) / 10000000).toFixed(1),
        optimized: ((noAllocation.totalDamage - optimizedResult.totalDamage) / 10000000).toFixed(1),
      },
    },
  };
}

// Evacuation route planner
export function planEvacuationRoute(fromZone, shelters = [], hospitals = [], roads = []) {
  const targets = [
    ...shelters.filter(s => (s.current_occupancy || 0) < s.capacity).map(s => ({ ...s, type: 'shelter' })),
    ...hospitals.filter(h => (h._stress || 0) < 0.8).map(h => ({ ...h, type: 'hospital', zone_id: h.zone_id })),
  ];
  
  let bestRoute = null;
  let bestTime = Infinity;
  
  for (const target of targets) {
    const route = dijkstra(roads, fromZone, target.zone_id);
    if (route && route.time < bestTime) {
      bestTime = route.time;
      bestRoute = { ...route, target };
    }
  }
  
  return bestRoute;
}
