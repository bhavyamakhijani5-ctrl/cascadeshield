import { describe, it, expect } from 'vitest';
import {
  calculateFloodRisk,
  estimateFloodDepth,
  calculateLandslideRisk,
  checkInfrastructureFailure,
  propagateFailures,
  calculateVulnerability,
  generateRainfallProfile,
  createRNG,
  explainCauseChain,
} from '../engine/cascade';

describe('Cascade Engine - Hydrodynamic & Multi-Hazard Rules', () => {
  const mockZoneLowland = {
    properties: {
      id: 'Z01',
      name: 'Kurla West',
      elevation_m: 3.5,
      slope_deg: 2.0,
      population: 45000,
      density: 35000,
      pct_children_elderly: 0.28,
      drainage_quality: 0.15,
      distance_to_river_km: 0.2,
      landslide_prone: 0.1,
    },
  };

  const mockZoneHill = {
    properties: {
      id: 'Z20',
      name: 'Asalpha Ridge',
      elevation_m: 42.0,
      slope_deg: 22.5,
      population: 18000,
      density: 20000,
      pct_children_elderly: 0.22,
      drainage_quality: 0.75,
      distance_to_river_km: 3.8,
      landslide_prone: 0.85,
    },
  };

  it('calculates higher flood risk for low-elevation riverfront zones', () => {
    const riskLowland = calculateFloodRisk(mockZoneLowland, 85, 200, 0.6, 1.0);
    const riskHill = calculateFloodRisk(mockZoneHill, 85, 200, 0.6, 1.0);

    expect(riskLowland).toBeGreaterThan(0.6);
    expect(riskLowland).toBeGreaterThan(riskHill);
    expect(riskHill).toBeLessThan(0.5);
  });

  it('calculates higher landslide risk on steep slopes with high soil saturation', () => {
    const slideRiskLowland = calculateLandslideRisk(mockZoneLowland, 0.8, 0.8, 250);
    const slideRiskHill = calculateLandslideRisk(mockZoneHill, 0.3, 0.8, 250);

    expect(slideRiskHill).toBeGreaterThan(slideRiskLowland);
    expect(slideRiskHill).toBeGreaterThan(0.5);
  });

  it('estimates flood depth in meters with elevation penalty', () => {
    const depthLow = estimateFloodDepth(0.8, 3.5, 90, 250);
    const depthZero = estimateFloodDepth(0.2, 40.0, 90, 250);

    expect(depthLow).toBeGreaterThan(1.0);
    expect(depthZero).toBe(0);
  });

  it('triggers probabilistic infrastructure failure when water exceeds threshold', () => {
    const rng = createRNG(42);
    const asset = { id: 'SUB1', flood_threshold_m: 1.2 };

    const failed = checkInfrastructureFailure(asset, 1.5, rng);
    expect(failed).toBe(true);

    const safe = checkInfrastructureFailure(asset, 0, rng);
    expect(safe).toBe(false);
  });

  it('propagates cascading failures using BFS through dependency graph', () => {
    const dependencies = {
      nodes: [
        { id: 'SUB1', type: 'substation' },
        { id: 'PS1', type: 'pump_station' },
        { id: 'Z01', type: 'zone' },
      ],
      edges: [
        { from: 'SUB1', to: 'PS1', type: 'powers', lag_hours: 1, failure_probability: 0.9 },
        { from: 'PS1', to: 'Z01', type: 'supplies_water', lag_hours: 2, failure_probability: 0.8 },
      ],
    };

    const result = propagateFailures(['SUB1'], dependencies);
    expect(result.failedAssets).toContain('SUB1');
    expect(result.failedAssets).toContain('PS1');
    expect(result.failedAssets).toContain('Z01');
    expect(result.cascadeEdges.length).toBe(2);
  });

  it('computes composite demographic and terrain vulnerability score', () => {
    const vulnLow = calculateVulnerability(mockZoneLowland);
    const vulnHigh = calculateVulnerability(mockZoneHill);

    expect(vulnLow).toBeGreaterThan(0);
    expect(vulnLow).toBeLessThanOrEqual(1);
    expect(vulnHigh).toBeGreaterThan(0);
  });

  it('generates 48-hour rainfall profile based on intensity and burst duration', () => {
    const profile = generateRainfallProfile(120, 24);
    expect(profile.length).toBe(48);
    expect(Math.max(...profile)).toBeCloseTo(120, -1);
  });

  it('produces explainable cause-effect chain with time lags', () => {
    const simulationStep = {
      hour: 6,
      rainfall: 95,
      failedInfra: ['SUB1'],
      zoneStates: {
        Z01: {
          id: 'Z01',
          name: 'Kurla West',
          floodRisk: 0.85,
          floodDepth: 2.1,
          landslideRisk: 0.1,
          powerAvailable: false,
          contaminationRisk: 0.65,
          roadAccessibility: 0.3,
          hospitalStress: 0.75,
        },
      },
    };

    const infrastructure = {
      substations: [{ id: 'SUB1', name: 'Kurla Substation', zones_served: ['Z01'] }],
    };

    const chain = explainCauseChain('Z01', simulationStep, infrastructure, { edges: [] });
    expect(chain.length).toBeGreaterThanOrEqual(3);
    expect(chain[0].type).toBe('rainfall');
    expect(chain.some((e) => e.type === 'flood')).toBe(true);
    expect(chain.some((e) => e.type === 'power')).toBe(true);
  });
});
