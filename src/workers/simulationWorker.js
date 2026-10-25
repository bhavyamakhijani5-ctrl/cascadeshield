// CascadeShield Simulation Web Worker
// Runs Monte Carlo simulation off the main thread

import { runSimulation, runMonteCarlo, generateRainfallProfile } from '../engine/cascade.js';
import { compareStrategies } from '../engine/optimizer.js';

self.onmessage = function(e) {
  const { type, payload } = e.data;
  
  try {
    if (type === 'RUN_SIMULATION') {
      const { zones, infrastructure, dependencies, resources, rainfallProfile, soilSaturation, climateScenario, blockedAssets } = payload;
      
      self.postMessage({ type: 'PROGRESS', progress: 0.1 });
      
      const result = runMonteCarlo(
        zones, infrastructure, dependencies, resources,
        rainfallProfile, soilSaturation, climateScenario, blockedAssets
      );
      
      self.postMessage({ type: 'PROGRESS', progress: 0.8 });
      
      // Run optimizer comparison
      const peakHour = result.medianTimeline.reduce(
        (max, step) => step.totalPopAtRisk > max.totalPopAtRisk ? step : max,
        result.medianTimeline[0]
      );
      
      const comparison = compareStrategies(
        peakHour.zoneStates,
        resources,
        peakHour.roadStates || infrastructure.roads
      );
      
      self.postMessage({ type: 'PROGRESS', progress: 1 });
      self.postMessage({ 
        type: 'SIMULATION_COMPLETE', 
        result: {
          timeline: result.medianTimeline,
          confidence: result.confidenceData,
          confidenceLevel: result.confidenceLevel,
          comparison,
        }
      });
    } else if (type === 'GENERATE_PROFILE') {
      const { intensity, duration } = payload;
      const profile = generateRainfallProfile(intensity, duration);
      self.postMessage({ type: 'PROFILE_GENERATED', profile });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message });
  }
};
