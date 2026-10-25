import React, { useState, useMemo, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  MUMBAI_ZONES,
  SHELTERS_DATA,
  HOSPITALS_DATA,
  calculateDistanceKm,
} from '../utils/optimizerEngine';
import useStore from '../store/useStore';

// Road network waypoints for realistic evacuation routing
const ROAD_ROUTES = {
  'zone-kurla-w': {
    primaryShelterId: 'shelter-bkc',
    primaryHospitalId: 'hosp-sion',
    shelterPath: [
      [19.0728, 72.8826],
      [19.0695, 72.8760], // Mithi Bridge choke point
      [19.0665, 72.8710],
      [19.0650, 72.8680],
    ],
    altShelterPath: [
      [19.0728, 72.8826],
      [19.0780, 72.8870],
      [19.0830, 72.8720], // SCLR bypass
      [19.0730, 72.8620],
      [19.0650, 72.8680],
    ],
    hospitalPath: [
      [19.0728, 72.8826],
      [19.0550, 72.8750],
      [19.0420, 72.8660],
      [19.0360, 72.8600],
    ],
    altHospitalPath: [
      [19.0728, 72.8826],
      [19.0650, 72.8950],
      [19.0480, 72.8820],
      [19.0360, 72.8600],
    ],
    chokePoint: [19.0695, 72.8760],
    chokePointName: 'Mithi River Causeway Bridge',
  },
  'zone-dharavi': {
    primaryShelterId: 'shelter-dharavi',
    primaryHospitalId: 'hosp-sion',
    shelterPath: [
      [19.0434, 72.8567],
      [19.0420, 72.8540],
      [19.0410, 72.8520],
    ],
    altShelterPath: [
      [19.0434, 72.8567],
      [19.0470, 72.8550],
      [19.0430, 72.8500],
      [19.0410, 72.8520],
    ],
    hospitalPath: [
      [19.0434, 72.8567],
      [19.0400, 72.8590],
      [19.0360, 72.8600],
    ],
    altHospitalPath: [
      [19.0434, 72.8567],
      [19.0490, 72.8610],
      [19.0400, 72.8640],
      [19.0360, 72.8600],
    ],
    chokePoint: [19.0400, 72.8590],
    chokePointName: '90 Feet Road Culvert',
  },
  'zone-kalina': {
    primaryShelterId: 'shelter-kalina',
    primaryHospitalId: 'hosp-vndesai',
    shelterPath: [
      [19.0772, 72.8530],
      [19.0755, 72.8570],
      [19.0740, 72.8600],
    ],
    altShelterPath: [
      [19.0772, 72.8530],
      [19.0810, 72.8580],
      [19.0760, 72.8610],
      [19.0740, 72.8600],
    ],
    hospitalPath: [
      [19.0772, 72.8530],
      [19.0800, 72.8480],
      [19.0830, 72.8420],
    ],
    altHospitalPath: [
      [19.0772, 72.8530],
      [19.0850, 72.8500],
      [19.0830, 72.8420],
    ],
    chokePoint: [19.0755, 72.8570],
    chokePointName: 'Vakola Nallah Culvert',
  },
  'zone-sion': {
    primaryShelterId: 'shelter-bkc',
    primaryHospitalId: 'hosp-sion',
    shelterPath: [
      [19.0390, 72.8619],
      [19.0500, 72.8650],
      [19.0650, 72.8680],
    ],
    altShelterPath: [
      [19.0390, 72.8619],
      [19.0450, 72.8550],
      [19.0600, 72.8600],
      [19.0650, 72.8680],
    ],
    hospitalPath: [
      [19.0390, 72.8619],
      [19.0370, 72.8610],
      [19.0360, 72.8600],
    ],
    altHospitalPath: [
      [19.0390, 72.8619],
      [19.0350, 72.8630],
      [19.0360, 72.8600],
    ],
    chokePoint: [19.0500, 72.8650],
    chokePointName: 'Sion-Bandra Link Road',
  },
  'zone-bkc': {
    primaryShelterId: 'shelter-bkc',
    primaryHospitalId: 'hosp-asian-heart',
    shelterPath: [
      [19.0607, 72.8644],
      [19.0630, 72.8660],
      [19.0650, 72.8680],
    ],
    altShelterPath: [
      [19.0607, 72.8644],
      [19.0620, 72.8620],
      [19.0650, 72.8680],
    ],
    hospitalPath: [
      [19.0607, 72.8644],
      [19.0625, 72.8650],
      [19.0645, 72.8660],
    ],
    altHospitalPath: [
      [19.0607, 72.8644],
      [19.0610, 72.8680],
      [19.0645, 72.8660],
    ],
    chokePoint: [19.0630, 72.8660],
    chokePointName: 'BKC Central Avenue Gate',
  },
  'zone-sakinaka': {
    primaryShelterId: 'shelter-kalina',
    primaryHospitalId: 'hosp-rajawadi',
    shelterPath: [
      [19.1075, 72.8877],
      [19.0900, 72.8750],
      [19.0740, 72.8600],
    ],
    altShelterPath: [
      [19.1075, 72.8877],
      [19.0950, 72.8650],
      [19.0800, 72.8550],
      [19.0740, 72.8600],
    ],
    hospitalPath: [
      [19.1075, 72.8877],
      [19.0920, 72.8980],
      [19.0780, 72.9050],
    ],
    altHospitalPath: [
      [19.1075, 72.8877],
      [19.1000, 72.9100],
      [19.0780, 72.9050],
    ],
    chokePoint: [19.0900, 72.8750],
    chokePointName: 'Saki Naka Metro Flyover Underpass',
  },
  'zone-chembur': {
    primaryShelterId: 'shelter-chembur',
    primaryHospitalId: 'hosp-rajawadi',
    shelterPath: [
      [19.0622, 72.8994],
      [19.0610, 72.9010],
      [19.0600, 72.9020],
    ],
    altShelterPath: [
      [19.0622, 72.8994],
      [19.0640, 72.9000],
      [19.0600, 72.9020],
    ],
    hospitalPath: [
      [19.0622, 72.8994],
      [19.0700, 72.9020],
      [19.0780, 72.9050],
    ],
    altHospitalPath: [
      [19.0622, 72.8994],
      [19.0650, 72.9150],
      [19.0780, 72.9050],
    ],
    chokePoint: [19.0700, 72.9020],
    chokePointName: 'Tilak Nagar Railway Subway',
  },
  'zone-bandra-w': {
    primaryShelterId: 'shelter-bandra',
    primaryHospitalId: 'hosp-bhabha',
    shelterPath: [
      [19.0596, 72.8295],
      [19.0585, 72.8330],
      [19.0580, 72.8360],
    ],
    altShelterPath: [
      [19.0596, 72.8295],
      [19.0620, 72.8320],
      [19.0580, 72.8360],
    ],
    hospitalPath: [
      [19.0596, 72.8295],
      [19.0560, 72.8310],
      [19.0540, 72.8330],
    ],
    altHospitalPath: [
      [19.0596, 72.8295],
      [19.0520, 72.8280],
      [19.0540, 72.8330],
    ],
    chokePoint: [19.0585, 72.8330],
    chokePointName: 'Linking Road Junction',
  },
};

// Map Auto-Panner component
function ChangeMapView({ coords, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, zoom, { duration: 1.2 });
    }
  }, [coords, zoom, map]);
  return null;
}

// Custom Leaflet Div Icons
const createDivIcon = (type, label) => {
  let bgClass = 'bg-cascade-cyan text-navy-900 border-cyan-300';
  let symbol = '🏠';

  if (type === 'origin') {
    bgClass = 'bg-amber-400 text-navy-900 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]';
    symbol = '📍';
  } else if (type === 'hospital') {
    bgClass = 'bg-rose-500 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.8)]';
    symbol = '🏥';
  } else if (type === 'shelter') {
    bgClass = 'bg-emerald-500 text-navy-900 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]';
    symbol = '🏕️';
  } else if (type === 'block') {
    bgClass = 'bg-rose-600 text-white border-white animate-pulse shadow-[0_0_16px_rgba(225,29,72,1)]';
    symbol = '⚠️';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; font-size:14px; font-weight:bold; border:2px solid;" class="${bgClass}">
        ${symbol}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export default function RoutePlanner({ bridgeClosedOverride = false }) {
  const [selectedZoneId, setSelectedZoneId] = useState('zone-kurla-w');
  const [simulateBlockage, setSimulateBlockage] = useState(false);
  const [activeRouteType, setActiveRouteType] = useState('both'); // 'shelter' | 'hospital' | 'both'

  // Blocked assets in store or override
  const storeBlockedAssets = useStore((state) => state.simulation.blockedAssets || []);
  const isGlobalBridgeClosed =
    bridgeClosedOverride ||
    simulateBlockage ||
    storeBlockedAssets.includes('bridge-mithi') ||
    storeBlockedAssets.includes('bridge-x');

  const selectedZone = useMemo(() => {
    return MUMBAI_ZONES.find((z) => z.id === selectedZoneId) || MUMBAI_ZONES[0];
  }, [selectedZoneId]);

  const routeConfig = useMemo(() => {
    return ROAD_ROUTES[selectedZoneId] || ROAD_ROUTES['zone-kurla-w'];
  }, [selectedZoneId]);

  const nearestShelter = useMemo(() => {
    return (
      SHELTERS_DATA.find((s) => s.id === routeConfig.primaryShelterId) ||
      SHELTERS_DATA[0]
    );
  }, [routeConfig]);

  const nearestHospital = useMemo(() => {
    return (
      HOSPITALS_DATA.find((h) => h.id === routeConfig.primaryHospitalId) ||
      HOSPITALS_DATA[0]
    );
  }, [routeConfig]);

  // Distances and estimated travel times
  const shelterDistanceKm = calculateDistanceKm(
    selectedZone.coordinates[0],
    selectedZone.coordinates[1],
    nearestShelter.coordinates[0],
    nearestShelter.coordinates[1]
  );

  const hospitalDistanceKm = calculateDistanceKm(
    selectedZone.coordinates[0],
    selectedZone.coordinates[1],
    nearestHospital.coordinates[0],
    nearestHospital.coordinates[1]
  );

  // Speed: ~18 km/h in city flood scenario normally; rerouting adds +12 to +18 mins
  const normalShelterTimeMins = Math.max(6, Math.round((shelterDistanceKm / 18) * 60));
  const reroutedShelterTimeMins = normalShelterTimeMins + 14;

  const normalHospitalTimeMins = Math.max(5, Math.round((hospitalDistanceKm / 18) * 60));
  const reroutedHospitalTimeMins = normalHospitalTimeMins + 16;

  // Is current zone affected by blockage?
  const isRouteBlocked =
    isGlobalBridgeClosed &&
    (selectedZoneId === 'zone-kurla-w' ||
      selectedZoneId === 'zone-kalina' ||
      selectedZoneId === 'zone-dharavi');

  // Paths
  const currentShelterPath = isRouteBlocked
    ? routeConfig.altShelterPath
    : routeConfig.shelterPath;

  const currentHospitalPath = isRouteBlocked
    ? routeConfig.altHospitalPath
    : routeConfig.hospitalPath;

  // Capacity status badge helper
  const getCapacityStatus = (occupied, total) => {
    const pct = Math.round((occupied / total) * 100);
    if (pct >= 85) {
      return {
        label: 'Critical Surge (>85%)',
        colorClass: 'bg-rose-500 text-rose-100',
        barClass: 'bg-rose-500',
        textColor: 'text-rose-400',
      };
    }
    if (pct >= 60) {
      return {
        label: 'Elevated (60-85%)',
        colorClass: 'bg-amber-500 text-amber-100',
        barClass: 'bg-amber-500',
        textColor: 'text-amber-400',
      };
    }
    return {
      label: 'Optimal (<60%)',
      colorClass: 'bg-emerald-500 text-emerald-100',
      barClass: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    };
  };

  return (
    <div className="glass-panel p-5 bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl space-y-6">
      {/* Dynamic CSS for Animated Dashed Route Lines */}
      <style>{`
        @keyframes dashEvacForward {
          to {
            stroke-dashoffset: -32;
          }
        }
        .route-shelter-animated {
          stroke-dasharray: 8, 8;
          animation: dashEvacForward 1.2s linear infinite;
        }
        .route-hospital-animated {
          stroke-dasharray: 7, 7;
          animation: dashEvacForward 1.4s linear infinite;
        }
        .route-alt-animated {
          stroke-dasharray: 10, 8;
          animation: dashEvacForward 1s linear infinite;
        }
        .route-blocked-line {
          stroke-dasharray: 4, 6;
        }
      `}</style>

      {/* Header and Zone Selection Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cascade-cyan" />
            <h3 className="text-base font-display font-semibold text-white tracking-wide">
              Tactical Evacuation Route Planner & Capacity Allocator
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time road graph routing to nearest functional relief centers and emergency trauma hospitals
          </p>
        </div>

        {/* Source Zone Dropdown & Blockage Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-navy-900/90 border border-white/15 px-3 py-1.5 rounded-xl">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-gray-400 font-medium">Source Zone:</span>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {MUMBAI_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id} className="bg-navy-900 text-white">
                  {zone.name} ({zone.riskLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Blockage simulation trigger */}
          <button
            onClick={() => setSimulateBlockage(!simulateBlockage)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              isRouteBlocked
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'bg-navy-900 text-gray-400 border-white/15 hover:text-white'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isRouteBlocked ? 'text-rose-400' : 'text-gray-400'}`} />
            <span>{isRouteBlocked ? 'Choke Point Active' : 'Simulate Road Blockage'}</span>
          </button>
        </div>
      </div>

      {/* Blockage Alert Banner */}
      {isRouteBlocked && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-3 text-xs animate-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <div className="font-semibold text-rose-200 flex items-center gap-2">
              <span>PRIMARY ARTERIAL CORRIDOR BLOCKED: {routeConfig.chokePointName}</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 text-[10px]">
                Submerged &gt; 1.4m
              </span>
            </div>
            <p className="text-rose-300/80">
              Direct route via river crossing is impassable. CascadeShield routing engine has automatically
              switched to elevated bypass corridor. Travel delay: +14 to +16 mins.
            </p>
          </div>
        </div>
      )}

      {/* Nearest Facilities Quick Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nearest Shelter Card */}
        <div className="bg-navy-900/60 border border-emerald-500/30 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm">
                🏕️
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Recommended Nearest Shelter
                </span>
                <h4 className="text-sm font-semibold text-white">{nearestShelter.name}</h4>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
              {nearestShelter.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-1">
            <div className="bg-navy-950/60 p-2 rounded-lg border border-white/5">
              <span className="text-gray-400 block text-[10px]">Route Distance</span>
              <span className="text-white font-mono font-bold text-sm">
                {shelterDistanceKm} km
              </span>
            </div>
            <div className="bg-navy-950/60 p-2 rounded-lg border border-white/5">
              <span className="text-gray-400 block text-[10px]">Estimated Transit</span>
              <span
                className={`font-mono font-bold text-sm flex items-center gap-1 ${
                  isRouteBlocked ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {isRouteBlocked ? reroutedShelterTimeMins : normalShelterTimeMins} mins
                {isRouteBlocked && <span className="text-[10px] text-rose-400">(+14m)</span>}
              </span>
            </div>
          </div>

          {/* Shelter Capacity Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-gray-300 font-medium">Shelter Capacity:</span>
              <span className="font-mono text-gray-200">
                {nearestShelter.occupied.toLocaleString()} / {nearestShelter.capacity.toLocaleString()}{' '}
                ({Math.round((nearestShelter.occupied / nearestShelter.capacity) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  getCapacityStatus(nearestShelter.occupied, nearestShelter.capacity).barClass
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((nearestShelter.occupied / nearestShelter.capacity) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Nearest Hospital Card */}
        <div className="bg-navy-900/60 border border-rose-500/30 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-sm">
                🏥
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                  Designated Emergency Hospital
                </span>
                <h4 className="text-sm font-semibold text-white">{nearestHospital.name}</h4>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">
              {nearestHospital.traumaLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-1">
            <div className="bg-navy-950/60 p-2 rounded-lg border border-white/5">
              <span className="text-gray-400 block text-[10px]">Route Distance</span>
              <span className="text-white font-mono font-bold text-sm">
                {hospitalDistanceKm} km
              </span>
            </div>
            <div className="bg-navy-950/60 p-2 rounded-lg border border-white/5">
              <span className="text-gray-400 block text-[10px]">Ambulance Transit</span>
              <span
                className={`font-mono font-bold text-sm flex items-center gap-1 ${
                  isRouteBlocked ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {isRouteBlocked ? reroutedHospitalTimeMins : normalHospitalTimeMins} mins
                {isRouteBlocked && <span className="text-[10px] text-rose-400">(+16m)</span>}
              </span>
            </div>
          </div>

          {/* Hospital Bed Capacity Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-gray-300 font-medium">Beds Occupied & ICU Load:</span>
              <span className="font-mono text-gray-200">
                {nearestHospital.occupied.toLocaleString()} / {nearestHospital.capacity.toLocaleString()}{' '}
                ({Math.round((nearestHospital.occupied / nearestHospital.capacity) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  getCapacityStatus(nearestHospital.occupied, nearestHospital.capacity).barClass
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((nearestHospital.occupied / nearestHospital.capacity) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Leaflet Map (Left) & All Shelters Capacity Overview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Leaflet Map Column */}
        <div className="lg:col-span-8 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-300 px-1">
            <span className="font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cascade-cyan" />
              Live Evacuation Routing Map
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
                Shelter Route
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-rose-400 inline-block" />
                Hospital Corridor
              </span>
              {isRouteBlocked && (
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-3 h-0.5 bg-rose-500 border-dashed inline-block" />
                  Submerged Choke
                </span>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="w-full h-80 rounded-xl overflow-hidden border border-white/15 relative shadow-inner bg-navy-950">
            <MapContainer
              center={selectedZone.coordinates}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <ChangeMapView coords={selectedZone.coordinates} zoom={13} />

              {/* Key-free OSM tiles, darkened via CSS filter */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="cs-dark-tiles"
                maxZoom={19}
              />

              {/* Source Zone Origin Marker */}
              <Marker
                position={selectedZone.coordinates}
                icon={createDivIcon('origin')}
              >
                <Popup>
                  <div className="p-1 text-navy-900 text-xs">
                    <strong className="block text-sm">{selectedZone.name}</strong>
                    <div>Risk Level: <strong>{selectedZone.riskLevel}</strong></div>
                    <div>Est. Flood Depth: <strong>{selectedZone.floodDepthMeters}m</strong></div>
                  </div>
                </Popup>
              </Marker>

              {/* Nearest Shelter Marker */}
              <Marker
                position={nearestShelter.coordinates}
                icon={createDivIcon('shelter')}
              >
                <Popup>
                  <div className="p-1 text-navy-900 text-xs">
                    <strong className="block text-sm">🏕️ {nearestShelter.name}</strong>
                    <div>Capacity: {nearestShelter.occupied} / {nearestShelter.capacity}</div>
                    <div>Status: {nearestShelter.status}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Nearest Hospital Marker */}
              <Marker
                position={nearestHospital.coordinates}
                icon={createDivIcon('hospital')}
              >
                <Popup>
                  <div className="p-1 text-navy-900 text-xs">
                    <strong className="block text-sm">🏥 {nearestHospital.name}</strong>
                    <div>ICU Beds Available: {nearestHospital.icuAvailable}</div>
                    <div>Trauma Level: {nearestHospital.traumaLevel}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Blockage Marker if active */}
              {isRouteBlocked && routeConfig.chokePoint && (
                <Marker
                  position={routeConfig.chokePoint}
                  icon={createDivIcon('block')}
                >
                  <Popup>
                    <div className="p-1 text-navy-900 text-xs">
                      <strong className="block text-rose-700">⚠️ ROAD IMPASSABLE</strong>
                      <div>{routeConfig.chokePointName}</div>
                      <div>Water Depth: 1.6m (No Vehicle Passage)</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Normal Shelter Route (or Blocked segment) */}
              {isRouteBlocked ? (
                <>
                  {/* Blocked original route segment in red */}
                  <Polyline
                    positions={routeConfig.shelterPath}
                    pathOptions={{
                      color: '#f43f5e',
                      weight: 3,
                      dashArray: '6, 6',
                      opacity: 0.6,
                    }}
                  />
                  {/* Active Alternative Route with CSS animated dash */}
                  <Polyline
                    positions={currentShelterPath}
                    pathOptions={{
                      color: '#00d4ff',
                      weight: 5,
                      className: 'route-alt-animated',
                      opacity: 0.95,
                    }}
                  />
                </>
              ) : (
                <Polyline
                  positions={currentShelterPath}
                  pathOptions={{
                    color: '#10b981',
                    weight: 4.5,
                    className: 'route-shelter-animated',
                    opacity: 0.9,
                  }}
                />
              )}

              {/* Hospital Route */}
              <Polyline
                positions={currentHospitalPath}
                pathOptions={{
                  color: isRouteBlocked ? '#fbbf24' : '#f43f5e',
                  weight: 4,
                  className: isRouteBlocked ? 'route-alt-animated' : 'route-hospital-animated',
                  opacity: 0.85,
                }}
              />
            </MapContainer>
          </div>
        </div>

        {/* All Shelters Capacity Status List (Right Column) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cascade-cyan" />
              Regional Shelter Capacities
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              Total: {SHELTERS_DATA.reduce((a, s) => a + s.capacity, 0).toLocaleString()}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
            {SHELTERS_DATA.map((shelter) => {
              const status = getCapacityStatus(shelter.occupied, shelter.capacity);
              const fillPct = Math.round((shelter.occupied / shelter.capacity) * 100);
              const isSelected = shelter.id === nearestShelter.id;

              return (
                <div
                  key={shelter.id}
                  className={`p-2.5 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'bg-cascade-cyan/10 border-cascade-cyan/40 shadow-sm'
                      : 'bg-navy-900/60 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-gray-200 block">{shelter.name}</span>
                      <span className="text-[10px] text-gray-400">{shelter.type}</span>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${status.textColor}`}>
                      {fillPct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full ${status.barClass}`}
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
                    <span>Occupied: {shelter.occupied.toLocaleString()}</span>
                    <span>Remaining: {(shelter.capacity - shelter.occupied).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 text-[10px] text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Optimal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Elevated (60-85%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical (&gt;85%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
