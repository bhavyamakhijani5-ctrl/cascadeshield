import { describe, it, expect } from 'vitest';
import {
  generateEmergencyReport,
  generateAlertMessage,
} from '../utils/reportGenerator';

describe('Emergency Report Generator & Localized Alerting', () => {
  const mockSimulationResults = {
    timeline: [
      {
        hour: 6,
        rainfall: 80,
        totalPopAtRisk: 125000,
        totalDamageCrore: 420.5,
        resilienceScore: 42,
        zoneStates: {
          Z01: {
            id: 'Z01',
            name: 'Kurla West',
            overallRisk: 0.88,
            floodDepth: 2.3,
            population: 45000,
            populationAtRisk: 39600,
            powerAvailable: false,
            vulnerability: 0.8,
          },
          Z02: {
            id: 'Z02',
            name: 'Dharavi Central',
            overallRisk: 0.79,
            floodDepth: 1.8,
            population: 60000,
            populationAtRisk: 47400,
            powerAvailable: false,
            vulnerability: 0.85,
          },
        },
      },
    ],
  };

  it('generates a comprehensive report structure in English', () => {
    const reportEn = generateEmergencyReport(mockSimulationResults, 'en');
    expect(reportEn).toBeDefined();
    expect(reportEn.summary).toBeDefined();
    expect(reportEn.vulnerableZones.length).toBeGreaterThan(0);
    expect(reportEn.resourcePlan).toBeDefined();
  });

  it('generates localized emergency report in Hindi', () => {
    const reportHi = generateEmergencyReport(mockSimulationResults, 'hi');
    expect(reportHi).toBeDefined();
    expect(reportHi.summary).toBeDefined();
    expect(typeof reportHi.summary).toBe('string');
  });

  it('generates localized emergency report in Marathi', () => {
    const reportMr = generateEmergencyReport(mockSimulationResults, 'mr');
    expect(reportMr).toBeDefined();
    expect(reportMr.summary).toBeDefined();
    expect(typeof reportMr.summary).toBe('string');
  });

  it('generates localized SMS emergency broadcast templates', () => {
    const alertEn = generateAlertMessage('Kurla West', 'CRITICAL', 'Sion Municipal Hall', 'en');
    const alertHi = generateAlertMessage('कुर्ला पश्चिम', 'गंभीर', 'सायन नगरपालिका हॉल', 'hi');
    const alertMr = generateAlertMessage('कुर्ला पश्चिम', 'गंभीर', 'शीव महानगरपालिका सभागृह', 'mr');

    expect(alertEn).toContain('Kurla West');
    expect(alertEn).toContain('CRITICAL');
    expect(alertHi).toContain('कुर्ला');
    expect(alertMr).toContain('कुर्ला');
  });
});
