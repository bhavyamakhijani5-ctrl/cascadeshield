// CascadeShield Weather Service
// Uses Open-Meteo free API with offline fallback

import { CITY_CONFIG } from '../config/city.js';

const TIMEOUT_MS = 5000;

function fetchWithTimeout(url, timeoutMs) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
}

export async function fetchLiveWeather() {
  const [lat, lng] = CITY_CONFIG.center;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m&forecast_days=3&timezone=auto`;
  
  try {
    const response = await fetchWithTimeout(url, TIMEOUT_MS);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    return {
      isLive: true,
      source: 'Open-Meteo',
      lastUpdated: new Date().toISOString(),
      hourly: data.hourly.time.map((time, i) => ({
        time,
        precipitation_mm: data.hourly.precipitation[i] || 0,
        temperature_c: data.hourly.temperature_2m[i],
        humidity_pct: data.hourly.relative_humidity_2m[i],
        wind_kmph: data.hourly.wind_speed_10m[i],
      })),
      rainfallProfile: data.hourly.precipitation.slice(0, 48),
    };
  } catch (error) {
    console.warn('Live weather fetch failed, using offline data:', error.message);
    return null;
  }
}

export async function loadOfflineRainfall() {
  try {
    const response = await fetch('/data/rainfall_sample.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return {
      isLive: false,
      source: 'Offline sample data',
      scenarios: data.scenarios,
      defaultProfile: data.scenarios?.extreme?.hours ? data.scenarios.extreme.hours.map(h => h.rainfall_mm).slice(0, 48) : [],
    };
  } catch (error) {
    console.warn('Failed to load offline rainfall data:', error.message);
    // Ultimate fallback: generate synthetic profile
    const profile = Array.from({ length: 48 }, (_, i) => {
      const peak = 12;
      return Math.max(0, 80 * Math.exp(-Math.pow(i - peak, 2) / 20));
    });
    return {
      isLive: false,
      source: 'Generated fallback',
      defaultProfile: profile,
    };
  }
}

export async function getWeatherData(preferLive = true) {
  if (preferLive) {
    const live = await fetchLiveWeather();
    if (live) return live;
  }
  return await loadOfflineRainfall();
}
