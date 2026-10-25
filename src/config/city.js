// CascadeShield City Configuration
// Change this file to switch the target city
export const CITY_CONFIG = {
  name: 'Mumbai',
  region: 'Mithi River Basin',
  state: 'Maharashtra',
  country: 'India',
  center: [19.076, 72.877],
  zoom: 13,
  bounds: [[19.00, 72.80], [19.15, 72.95]],
  currency: 'INR',
  currencySymbol: '₹',
  croreMultiplier: 10000000,
  timezone: 'Asia/Kolkata',
  avgAnnualRainfall_mm: 2400,
  floodPlainElevation_m: 10,
  riverName: 'Mithi River',
  tilesUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  tilesAttribution: '&copy; Stadia Maps, &copy; OpenMapTiles &copy; OpenStreetMap',
  offlineFallbackCenter: [19.076, 72.877],
};

export const DAMAGE_CONFIG = {
  perCapitaLoss_inr: 50000,
  infrastructureLoss_per_asset_crore: 25,
  downtimePerHour_crore: 2,
  hospitalDisruptionMultiplier: 3,
  roadBlockageMultiplier: 1.5,
};

export const SIMULATION_CONFIG = {
  maxHours: 48,
  monteCarloRuns: 30,
  timeStepMinutes: 60,
  climateScenarios: {
    current: { label: 'Today', rainfallMultiplier: 1.0, sealevelRise_m: 0 },
    '2040': { label: '2040 (+20%)', rainfallMultiplier: 1.2, sealevelRise_m: 0.1 },
    '2050': { label: '2050 (+35%)', rainfallMultiplier: 1.35, sealevelRise_m: 0.2 },
  },
};
