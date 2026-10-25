// CascadeShield - Synthetic Data Generator
// Run: node scripts/generate-data.js
// Generates illustrative data for a configurable city

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');

// City config - change these to generate for a different city
const CITY = {
  name: 'Mumbai',
  centerLat: 19.076,
  centerLng: 72.877,
  latRange: [19.02, 19.13],
  lngRange: [72.83, 72.93],
  riverLat: 19.075,
  riverLng: 72.875,
};

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const rng = seededRandom(12345);

function generateZones() {
  const zones = [];
  const names = [
    'Powai', 'Vikhroli West', 'Vikhroli East', 'Kanjurmarg', 'Bhandup',
    'Kurla West', 'Kurla East', 'Sion', 'Matunga', 'Dharavi',
    'Bandra East', 'Bandra Kurla Complex', 'Santacruz East', 'Vile Parle East', 'Andheri East',
    'Jogeshwari East', 'Goregaon East', 'Chembur', 'Wadala', 'Dadar East',
    'Parel', 'Worli', 'Mahim', 'Sion Koliwada', 'Chunabhatti',
    'Ghatkopar West', 'Ghatkopar East', 'Vidyavihar', 'Mulund West', 'Mulund East'
  ];

  for (let i = 0; i < 30; i++) {
    const lat = CITY.latRange[0] + rng() * (CITY.latRange[1] - CITY.latRange[0]);
    const lng = CITY.lngRange[0] + rng() * (CITY.lngRange[1] - CITY.lngRange[0]);
    const distToRiver = Math.sqrt(
      Math.pow((lat - CITY.riverLat) * 111, 2) + Math.pow((lng - CITY.riverLng) * 85, 2)
    );

    const elevation = distToRiver < 1 ? 2 + rng() * 8 : 5 + rng() * 40;
    const slope = names[i].includes('Powai') || names[i].includes('Vikhroli') ? 10 + rng() * 15 : rng() * 10;
    const drainageQuality = distToRiver < 1.5 ? 0.2 + rng() * 0.3 : 0.4 + rng() * 0.5;

    const d = 0.004;
    zones.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[lng-d, lat-d], [lng+d, lat-d], [lng+d, lat+d], [lng-d, lat+d], [lng-d, lat-d]]],
      },
      properties: {
        id: `Z${String(i + 1).padStart(2, '0')}`,
        name: names[i],
        elevation_m: Math.round(elevation * 10) / 10,
        slope_deg: Math.round(slope * 10) / 10,
        population: Math.round(10000 + rng() * 70000),
        density: Math.round(15000 + rng() * 45000),
        pct_children_elderly: Math.round((0.15 + rng() * 0.3) * 100) / 100,
        drainage_quality: Math.round(drainageQuality * 100) / 100,
        distance_to_river_km: Math.round(distToRiver * 100) / 100,
        landslide_prone: Math.round((slope > 10 ? 0.3 + rng() * 0.6 : rng() * 0.3) * 100) / 100,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
      },
    });
  }

  return { type: 'FeatureCollection', features: zones };
}

function generateInfrastructure(zones) {
  const zoneIds = zones.features.map(z => z.properties.id);
  return {
    substations: Array.from({ length: 5 }, (_, i) => ({
      id: `SUB${i + 1}`,
      name: `Substation ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][i]}`,
      lat: zones.features[i * 5].properties.lat + (rng() - 0.5) * 0.005,
      lng: zones.features[i * 5].properties.lng + (rng() - 0.5) * 0.005,
      capacity_mw: 50 + Math.round(rng() * 150),
      elevation_m: zones.features[i * 5].properties.elevation_m + rng() * 3,
      flood_threshold_m: 0.8 + rng() * 1.2,
      zones_served: zoneIds.slice(i * 6, i * 6 + 6),
    })),
    pumpStations: Array.from({ length: 4 }, (_, i) => ({
      id: `PS${i + 1}`,
      name: `Pump Station ${['North', 'South', 'East', 'West'][i]}`,
      lat: zones.features[i * 7].properties.lat + (rng() - 0.5) * 0.005,
      lng: zones.features[i * 7].properties.lng + (rng() - 0.5) * 0.005,
      capacity_mld: 100 + Math.round(rng() * 200),
      elevation_m: zones.features[i * 7].properties.elevation_m,
      powered_by: `SUB${(i % 5) + 1}`,
      zones_served: zoneIds.slice(i * 7, i * 7 + 8),
    })),
    hospitals: Array.from({ length: 8 }, (_, i) => ({
      id: `H${i + 1}`,
      name: `${['City General', 'Metro', 'District', 'Community', 'Regional', 'Central', 'Municipal', 'Trauma'][i]} Hospital`,
      lat: zones.features[i * 3].properties.lat + (rng() - 0.5) * 0.003,
      lng: zones.features[i * 3].properties.lng + (rng() - 0.5) * 0.003,
      beds: 100 + Math.round(rng() * 400),
      icu_beds: 10 + Math.round(rng() * 40),
      has_generator: rng() > 0.3,
      generator_fuel_hours: 12 + Math.round(rng() * 36),
      powered_by: `SUB${(i % 5) + 1}`,
      zone_id: zoneIds[i * 3],
    })),
    shelters: Array.from({ length: 10 }, (_, i) => ({
      id: `SH${i + 1}`,
      name: `${['School', 'Community Hall', 'Sports Complex', 'Temple', 'Municipal Hall', 'College', 'Stadium', 'Library', 'Civic Center', 'Church'][i]} Shelter`,
      lat: zones.features[i * 3].properties.lat + (rng() - 0.5) * 0.004,
      lng: zones.features[i * 3].properties.lng + (rng() - 0.5) * 0.004,
      capacity: 200 + Math.round(rng() * 800),
      current_occupancy: 0,
      zone_id: zoneIds[i * 3],
      has_water: rng() > 0.3,
      has_power: rng() > 0.4,
    })),
    bridges: Array.from({ length: 5 }, (_, i) => ({
      id: `BR${i + 1}`,
      name: `${['Mithi River', 'Eastern Express', 'Western Express', 'Sion-Panvel', 'LBS Road'][i]} Bridge`,
      lat: zones.features[i * 5 + 2].properties.lat,
      lng: zones.features[i * 5 + 2].properties.lng,
      flood_threshold_m: 1.5 + rng() * 1.5,
      connects: [zoneIds[i * 5], zoneIds[i * 5 + 3]],
    })),
    roads: Array.from({ length: 15 }, (_, i) => ({
      id: `R${i + 1}`,
      from_zone: zoneIds[i % 30],
      to_zone: zoneIds[(i + 1 + Math.floor(rng() * 3)) % 30],
      distance_km: 1 + Math.round(rng() * 5 * 10) / 10,
      travel_time_min: 10 + Math.round(rng() * 30),
      flood_threshold_m: 0.5 + rng() * 2,
      is_highway: rng() > 0.7,
    })),
  };
}

function generateDependencies(infra) {
  const nodes = [];
  const edges = [];

  infra.substations.forEach(s => nodes.push({ id: s.id, type: 'substation', name: s.name }));
  infra.pumpStations.forEach(p => {
    nodes.push({ id: p.id, type: 'pump_station', name: p.name });
    edges.push({ from: p.powered_by, to: p.id, type: 'powers', lag_hours: 0, failure_probability: 0.85 });
  });
  infra.hospitals.forEach(h => {
    nodes.push({ id: h.id, type: 'hospital', name: h.name });
    edges.push({ from: h.powered_by, to: h.id, type: 'powers', lag_hours: 1, failure_probability: 0.7 });
  });

  infra.pumpStations.forEach(p => {
    (p.zones_served || []).forEach(z => {
      edges.push({ from: p.id, to: z, type: 'supplies_water', lag_hours: 2, failure_probability: 0.6 });
    });
  });

  return { nodes, edges };
}

function generateRainfall() {
  const makeScenario = (name, peakMM, peakHour, duration) => {
    const hours = Array.from({ length: 72 }, (_, h) => {
      const dist = Math.abs(h - peakHour);
      const base = peakMM * Math.exp(-(dist * dist) / (duration * 3));
      const noise = (rng() - 0.5) * peakMM * 0.1;
      return { hour: h, rainfall_mm: Math.round(Math.max(0, base + noise) * 10) / 10 };
    });
    return { name, hours };
  };

  return {
    metadata: { city: 'Mumbai', source: 'Synthetic illustrative data - NOT official', unit: 'mm/hr', interval: 'hourly' },
    scenarios: {
      moderate: makeScenario('Moderate Rainfall', 35, 14, 12),
      heavy: makeScenario('Heavy Rainfall', 90, 12, 8),
      extreme: makeScenario('Extreme Event (2005-style)', 190, 8, 5),
    },
  };
}

function generateHistory2005() {
  return {
    metadata: {
      event: 'Mumbai Floods 26 July 2005 (Approximate Reconstruction)',
      disclaimer: 'This is illustrative synthetic data based on publicly available reports, NOT official records.',
    },
    timeline: Array.from({ length: 48 }, (_, h) => {
      let rainfall;
      if (h >= 5 && h <= 10) rainfall = 150 + rng() * 50;
      else if (h >= 11 && h <= 18) rainfall = 50 + rng() * 40;
      else if (h < 5) rainfall = 10 + rng() * 20;
      else rainfall = Math.max(0, 30 - (h - 18) * 3 + rng() * 10);
      return { hour: h, rainfall_mm: Math.round(rainfall * 10) / 10, cumulative_mm: 0 };
    }).map((entry, i, arr) => {
      entry.cumulative_mm = Math.round(arr.slice(0, i + 1).reduce((s, e) => s + e.rainfall_mm, 0) * 10) / 10;
      return entry;
    }),
    affected_zones: ['Z01', 'Z06', 'Z07', 'Z08', 'Z10', 'Z11', 'Z12', 'Z18', 'Z19', 'Z24', 'Z25'],
    impacts: {
      deaths_approx: 1000,
      displaced_approx: 100000,
      damage_inr_crore: 550,
      roads_blocked: 15,
      power_outages: 8,
      hospitals_affected: 4,
    },
    key_events: [
      { hour: 5, event: 'Heavy rainfall begins, 100mm/hr recorded' },
      { hour: 7, event: 'Mithi River water level rises rapidly' },
      { hour: 8, event: 'Peak rainfall: ~190mm/hr recorded at Santa Cruz' },
      { hour: 9, event: 'Mithi River breaches banks near Sion and Kurla' },
      { hour: 10, event: 'Mumbai Airport runway flooded, flights suspended' },
      { hour: 12, event: 'Major power substations trip, widespread outages' },
      { hour: 14, event: 'Western Express Highway submerged, traffic halted' },
      { hour: 16, event: 'Hospital basements flooded, patients evacuated' },
      { hour: 20, event: 'Water pumping stations fail, supply disrupted' },
      { hour: 24, event: 'Contamination warnings issued for flood-affected areas' },
      { hour: 36, event: 'Water begins receding in some areas' },
      { hour: 48, event: 'Relief operations in full swing, cleanup begins' },
    ],
  };
}

// Generate all data
try {
  mkdirSync(dataDir, { recursive: true });
} catch (e) {}

const zones = generateZones();
const infra = generateInfrastructure(zones);
const deps = generateDependencies(infra);
const rainfall = generateRainfall();
const history = generateHistory2005();
const resources = {
  teams: {
    rescue: { total: 12, available: 12, base_lat: CITY.centerLat, base_lng: CITY.centerLng, speed_kmph: 15 },
    medical: { total: 5, available: 5, base_lat: CITY.centerLat + 0.01, base_lng: CITY.centerLng + 0.01, speed_kmph: 20 },
  },
  equipment: {
    boats: { total: 8, available: 8, base_zone: 'Z01' },
    pumps: { total: 10, available: 10, base_zone: 'Z05' },
    generators: { total: 6, available: 6, base_zone: 'Z03' },
  },
  supplies: {
    relief_kits: { total: 5000, per_person: 1, base_zone: 'Z01' },
    water_liters: { total: 50000, per_person: 3, base_zone: 'Z05' },
    medical_kits: { total: 500, base_zone: 'Z10' },
  },
};

writeFileSync(join(dataDir, 'zones.geojson'), JSON.stringify(zones, null, 2));
writeFileSync(join(dataDir, 'infrastructure.json'), JSON.stringify(infra, null, 2));
writeFileSync(join(dataDir, 'dependencies.json'), JSON.stringify(deps, null, 2));
writeFileSync(join(dataDir, 'resources.json'), JSON.stringify(resources, null, 2));
writeFileSync(join(dataDir, 'rainfall_sample.json'), JSON.stringify(rainfall, null, 2));
writeFileSync(join(dataDir, 'history_2005.json'), JSON.stringify(history, null, 2));

console.log('✅ Generated all data files in', dataDir);
console.log(`   - zones.geojson (${zones.features.length} zones)`);
console.log(`   - infrastructure.json (${infra.substations.length} substations, ${infra.hospitals.length} hospitals, ${infra.shelters.length} shelters)`);
console.log(`   - dependencies.json (${deps.nodes.length} nodes, ${deps.edges.length} edges)`);
console.log('   - resources.json');
console.log('   - rainfall_sample.json (3 scenarios)');
console.log('   - history_2005.json');
