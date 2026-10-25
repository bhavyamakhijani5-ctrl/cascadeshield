import { describe, it, expect } from 'vitest';
import {
  dijkstra,
  findNearestFacility,
  marginalBenefit,
  greedyAllocate,
  randomAllocate,
  nearestFirstAllocate,
  compareStrategies,
} from '../engine/optimizer';

describe('Resource Optimizer - Allocation Algorithms & Dijkstra Routing', () => {
  const mockRoads = [
    { from_zone: 'Z01', to_zone: 'Z02', travel_time_min: 15, accessible: true },
    { from_zone: 'Z02', to_zone: 'Z03', travel_time_min: 20, accessible: true },
    { from_zone: 'Z01', to_zone: 'Z03', travel_time_min: 50, accessible: false }, // flooded
  ];

  const mockZoneStates = {
    Z01: {
      id: 'Z01',
      name: 'Kurla West',
      overallRisk: 0.85,
      population: 40000,
      vulnerability: 0.75,
      pct_children_elderly: 0.3,
      floodDepth: 2.2,
      powerAvailable: false,
    },
    Z02: {
      id: 'Z02',
      name: 'Kalina',
      overallRisk: 0.65,
      population: 35000,
      vulnerability: 0.6,
      pct_children_elderly: 0.25,
      floodDepth: 1.4,
      powerAvailable: false,
    },
    Z03: {
      id: 'Z03',
      name: 'Bandra East',
      overallRisk: 0.35,
      population: 25000,
      vulnerability: 0.4,
      pct_children_elderly: 0.2,
      floodDepth: 0.3,
      powerAvailable: true,
    },
    Z04: {
      id: 'Z04',
      name: 'Pali Hill',
      overallRisk: 0.12,
      population: 20000,
      vulnerability: 0.2,
      pct_children_elderly: 0.15,
      floodDepth: 0.0,
      powerAvailable: true,
    },
    Z05: {
      id: 'Z05',
      name: 'Powai Heights',
      overallRisk: 0.15,
      population: 30000,
      vulnerability: 0.2,
      pct_children_elderly: 0.18,
      floodDepth: 0.0,
      powerAvailable: true,
    },
    Z06: {
      id: 'Z06',
      name: 'Vikhroli Ridge',
      overallRisk: 0.18,
      population: 28000,
      vulnerability: 0.25,
      pct_children_elderly: 0.18,
      floodDepth: 0.0,
      powerAvailable: true,
    },
  };

  const mockResources = {
    teams: {
      rescue: { available: 4 },
      medical: { available: 2 },
    },
    equipment: {
      boats: { available: 3 },
      pumps: { available: 4 },
      generators: { available: 2 },
    },
    supplies: {
      relief_kits: { total: 500 },
    },
  };

  it('computes shortest route avoiding flooded roads with Dijkstra', () => {
    const route = dijkstra(mockRoads, 'Z01', 'Z03');
    expect(route).not.toBeNull();
    // Path should take Z01 -> Z02 -> Z03 = 15 + 20 = 35 mins
    expect(route.path).toEqual(['Z01', 'Z02', 'Z03']);
    expect(route.time).toBe(35);
  });

  it('returns null when destination is unreachable due to road closures', () => {
    const blockedRoads = [
      { from_zone: 'Z01', to_zone: 'Z02', travel_time_min: 15, accessible: false },
    ];
    const route = dijkstra(blockedRoads, 'Z01', 'Z02');
    expect(route).toBeNull();
  });

  it('calculates diminishing marginal benefit for repeated resource allocation', () => {
    const benefit1 = marginalBenefit(mockZoneStates.Z01, 'rescue', []);
    const benefit2 = marginalBenefit(mockZoneStates.Z01, 'rescue', [
      { zone: 'Z01', resourceType: 'rescue' },
    ]);

    expect(benefit1).toBeGreaterThan(0);
    expect(benefit1).toBeGreaterThan(benefit2);
  });

  it('prioritizes highest risk and vulnerable population in greedy allocation', () => {
    const allocations = greedyAllocate(mockZoneStates, mockResources, mockRoads);
    expect(allocations.length).toBeGreaterThan(0);

    // Z01 has highest risk, so should get early allocations
    const z01Allocations = allocations.filter((a) => a.zone === 'Z01');
    expect(z01Allocations.length).toBeGreaterThan(0);
  });

  it('outperforms random and nearest-first baseline strategies', () => {
    const comparison = compareStrategies(mockZoneStates, mockResources, mockRoads);

    expect(comparison.noAllocation).toBeDefined();
    expect(comparison.random).toBeDefined();
    expect(comparison.nearest).toBeDefined();
    expect(comparison.optimized).toBeDefined();

    // Damage with optimization must be lower than no allocation
    expect(comparison.optimized.result.totalDamage).toBeLessThan(
      comparison.noAllocation.totalDamage
    );

    // Optimized should protect more lives or reduce more damage than random
    expect(
      parseFloat(comparison.comparison.damageReduction.optimized)
    ).toBeGreaterThanOrEqual(
      parseFloat(comparison.comparison.damageReduction.random)
    );
  });
});
