import React, { useMemo, useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  Polyline,
  Marker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Zap,
  Droplets,
  Activity,
  Home,
  AlertTriangle,
  Navigation,
  Info,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CITY_CONFIG } from '../config/city';

// Helper to create custom HTML DivIcons for infrastructure markers
function createCustomIcon(emoji, bgClass, isFailed = false) {
  const pulseClass = isFailed ? 'ring-4 ring-rose-500/70 animate-pulse bg-rose-600' : bgClass;
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xl cursor-pointer transition-transform hover:scale-110 border border-white/30 text-white font-bold ${pulseClass}">
        <span>${emoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

// Map Auto-Resize & Center Sync
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export default function CascadeMap({
  zonesData = null,
  infrastructure = null,
  dependencies = null,
}) {
  const {
    simulation,
    ui,
    setSelectedZone,
    setShowExplainPanel,
    toggleLayer,
  } = useStore();

  const { currentHour, results, citizenReports } = simulation;
  const { selectedZone, activeLayer } = ui;

  // Extract current simulation step
  const currentStep = useMemo(() => {
    if (!results?.timeline || results.timeline.length === 0) return null;
    const clamped = Math.min(currentHour, results.timeline.length - 1);
    return results.timeline[clamped];
  }, [results, currentHour]);

  // Set of currently failed asset IDs
  const failedAssetsSet = useMemo(() => {
    return new Set(currentStep?.failedInfra || []);
  }, [currentStep]);

  // Lookup map for zone coordinates / centroids from zonesData
  const zoneCentroids = useMemo(() => {
    const map = {};
    if (zonesData?.features) {
      for (const f of zonesData.features) {
        const id = f.properties?.id;
        if (f.properties?.lat && f.properties?.lng) {
          map[id] = [f.properties.lat, f.properties.lng];
        } else if (f.geometry?.coordinates?.[0]?.[0]) {
          const coords = f.geometry.coordinates[0];
          const lats = coords.map((c) => c[1]);
          const lngs = coords.map((c) => c[0]);
          const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
          const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
          map[id] = [avgLat, avgLng];
        }
      }
    }
    return map;
  }, [zonesData]);

  // Lookup map for all infrastructure locations
  const infraLocations = useMemo(() => {
    const map = {};
    if (!infrastructure) return map;

    (infrastructure.substations || []).forEach((s) => {
      map[s.id] = [s.lat, s.lng];
    });
    (infrastructure.pumpStations || []).forEach((p) => {
      map[p.id] = [p.lat, p.lng];
    });
    (infrastructure.hospitals || []).forEach((h) => {
      map[h.id] = [h.lat, h.lng];
    });
    (infrastructure.shelters || []).forEach((sh) => {
      map[sh.id] = [sh.lat, sh.lng];
    });
    (infrastructure.bridges || []).forEach((b) => {
      map[b.id] = [b.lat, b.lng];
    });

    return map;
  }, [infrastructure]);

  // Compute active cascade lines (failure propagation edges)
  const cascadeLinks = useMemo(() => {
    if (!currentStep?.cascadeEdges) return [];

    const lines = [];
    for (const edge of currentStep.cascadeEdges) {
      const fromCoord = infraLocations[edge.cause] || zoneCentroids[edge.cause];
      const toCoord = infraLocations[edge.effect] || zoneCentroids[edge.effect];

      if (fromCoord && toCoord) {
        lines.push({
          id: `${edge.cause}->${edge.effect}`,
          from: fromCoord,
          to: toCoord,
          type: edge.type,
          probability: edge.probability,
        });
      }
    }
    return lines;
  }, [currentStep, infraLocations, zoneCentroids]);

  // Determine zone polygon color and opacity based on active layer
  const getZoneStyle = (feature) => {
    const zid = feature.properties?.id;
    const isSelected = selectedZone === zid;
    const zState = currentStep?.zoneStates?.[zid];

    // Determine relevant score
    let score = zState?.overallRisk ?? 0.1;
    if (activeLayer === 'flood') score = zState?.floodRisk ?? 0;
    else if (activeLayer === 'landslide') score = zState?.landslideRisk ?? 0;
    else if (activeLayer === 'power') score = zState?.powerAvailable === false ? 0.85 : 0.1;
    else if (activeLayer === 'water') score = zState?.contaminationRisk ?? 0;
    else if (activeLayer === 'road') score = 1 - (zState?.roadAccessibility ?? 1);
    else if (activeLayer === 'hospital') score = zState?.hospitalStress ?? 0;

    // Color gradient mapping
    let fillColor = '#22c55e'; // Green (< 0.25)
    let fillOpacity = 0.45;

    if (score >= 0.75) {
      fillColor = '#ef4444'; // Red
      fillOpacity = 0.72;
    } else if (score >= 0.5) {
      fillColor = '#f97316'; // Orange
      fillOpacity = 0.62;
    } else if (score >= 0.25) {
      fillColor = '#eab308'; // Yellow/Amber
      fillOpacity = 0.52;
    }

    return {
      fillColor,
      fillOpacity: isSelected ? 0.85 : fillOpacity,
      color: isSelected ? '#00d4ff' : 'rgba(255, 255, 255, 0.25)',
      weight: isSelected ? 3.5 : 1,
      dashArray: isSelected ? '4, 4' : null,
    };
  };

  // On zone click handler
  const onEachZone = (feature, layer) => {
    layer.on({
      click: () => {
        const zid = feature.properties?.id;
        setSelectedZone(zid);
        setShowExplainPanel(true);
      },
    });
  };

  const centerPos = CITY_CONFIG?.center || [19.076, 72.877];
  const zoomLevel = CITY_CONFIG?.zoom || 12;

  // Selected zone state details for popup
  const selectedZoneState = currentStep?.zoneStates?.[selectedZone];
  const selectedZoneProps = zonesData?.features?.find(
    (f) => f.properties?.id === selectedZone
  )?.properties;

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-navy-950">
      {/* Top Map Layer Filter Tabs Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Toggles Group */}
        <div className="flex flex-wrap items-center gap-1.5 bg-navy-900/90 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-1 px-2 text-xs font-mono text-gray-400">
            <Layers className="w-3.5 h-3.5 text-cascade-cyan" />
            <span className="hidden sm:inline">Layer:</span>
          </div>

          {[
            { id: 'flood', label: 'Flood Risk', icon: Droplets, color: 'text-cyan-400' },
            { id: 'landslide', label: 'Landslide', icon: AlertTriangle, color: 'text-violet-400' },
            { id: 'power', label: 'Power Grid', icon: Zap, color: 'text-amber-400' },
            { id: 'water', label: 'Water Contam.', icon: Droplets, color: 'text-teal-400' },
            { id: 'road', label: 'Road Transit', icon: Navigation, color: 'text-rose-400' },
            { id: 'hospital', label: 'Hospitals', icon: Activity, color: 'text-emerald-400' },
          ].map((layer) => {
            const isActive = activeLayer === layer.id;
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cascade-cyan text-navy-950 font-bold shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-navy-950' : layer.color}`} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* Hour / Layer Badge */}
        <div className="bg-navy-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15 text-xs font-mono text-white shadow-xl pointer-events-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cascade-red animate-ping" />
          <span>T+{String(currentHour).padStart(2, '0')}:00 Live View</span>
        </div>
      </div>

      {/* Main React Leaflet Map */}
      <MapContainer
        center={centerPos}
        zoom={zoomLevel}
        className="w-full h-full z-0"
        zoomControl={true}
        attributionControl={false}
      >
        <MapController center={centerPos} zoom={zoomLevel} />

        {/* Key-free OSM tiles, darkened via CSS filter (.cs-dark-tiles in index.css) */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          className="cs-dark-tiles"
          maxZoom={19}
        />

        {/* Zones GeoJSON Polygons */}
        {zonesData && (
          <GeoJSON
            key={`${currentHour}-${activeLayer}-${selectedZone}`}
            data={zonesData}
            style={getZoneStyle}
            onEachFeature={onEachZone}
          />
        )}

        {/* Cascade Propagation Edges (Polylines between failed/impacted infra) */}
        {cascadeLinks.map((link) => (
          <Polyline
            key={link.id}
            positions={[link.from, link.to]}
            pathOptions={{
              color: '#ff3b5c',
              weight: 3,
              dashArray: '8, 8',
              opacity: 0.85,
            }}
          >
            <Popup className="dark-popup">
              <div className="p-1 text-xs font-mono text-white">
                <div className="text-cascade-red font-bold">Cascade Failure Link</div>
                <div>Propagated failure • Impact lag ~1-2h</div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Road Segments (when Road layer or All is viewed) */}
        {(activeLayer === 'road' || !activeLayer) &&
          infrastructure?.roads?.map((road) => {
            const fromCoord = zoneCentroids[road.from_zone];
            const toCoord = zoneCentroids[road.to_zone];
            if (!fromCoord || !toCoord) return null;

            // Check if blocked by flood in current step
            const roadState = currentStep?.roadStates?.find((r) => r.id === road.id);
            const isBlocked = roadState ? !roadState.accessible : false;

            return (
              <Polyline
                key={road.id}
                positions={[fromCoord, toCoord]}
                pathOptions={{
                  color: isBlocked ? '#ff3b5c' : '#38bdf8',
                  weight: road.is_highway ? 3.5 : 2,
                  dashArray: isBlocked ? '5, 5' : null,
                  opacity: 0.75,
                }}
              >
                <Popup>
                  <div className="p-1 text-xs font-mono">
                    <div className="font-bold text-white">Road: {road.id}</div>
                    <div className={isBlocked ? 'text-cascade-red font-bold' : 'text-emerald-400'}>
                      {isBlocked ? 'SUBMERGED / IMPASSABLE' : 'OPEN TO TRAFFIC'}
                    </div>
                    <div>Distance: {road.distance_km} km</div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

        {/* Infrastructure Markers */}
        {/* 1. Substations */}
        {(!activeLayer || activeLayer === 'power') &&
          infrastructure?.substations?.map((sub) => {
            const isFailed = failedAssetsSet.has(sub.id);
            return (
              <Marker
                key={sub.id}
                position={[sub.lat, sub.lng]}
                icon={createCustomIcon('⚡', 'bg-amber-500', isFailed)}
              >
                <Popup>
                  <div className="p-1.5 text-xs text-white font-mono space-y-1">
                    <div className="font-bold text-amber-300 text-sm flex items-center gap-1">
                      <span>⚡</span> {sub.name}
                    </div>
                    <div className={`font-semibold ${isFailed ? 'text-cascade-red' : 'text-cascade-green'}`}>
                      Status: {isFailed ? 'TRIPPED / FLOODED' : 'OPERATIONAL'}
                    </div>
                    <div>Capacity: {sub.capacity_mw} MW</div>
                    <div>Flood Limit: {sub.flood_threshold_m}m</div>
                    <div>Zones Fed: {(sub.zones_served || []).join(', ')}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 2. Pump Stations */}
        {(!activeLayer || activeLayer === 'water' || activeLayer === 'flood') &&
          infrastructure?.pumpStations?.map((pump) => {
            const isFailed = failedAssetsSet.has(pump.id) || failedAssetsSet.has(pump.powered_by);
            return (
              <Marker
                key={pump.id}
                position={[pump.lat, pump.lng]}
                icon={createCustomIcon('💧', 'bg-teal-500', isFailed)}
              >
                <Popup>
                  <div className="p-1.5 text-xs text-white font-mono space-y-1">
                    <div className="font-bold text-teal-300 text-sm flex items-center gap-1">
                      <span>💧</span> {pump.name}
                    </div>
                    <div className={`font-semibold ${isFailed ? 'text-cascade-red' : 'text-cascade-green'}`}>
                      Status: {isFailed ? 'OFFLINE / FLOODED' : 'PUMPING ACTIVE'}
                    </div>
                    <div>Capacity: {pump.capacity_mld} MLD</div>
                    <div>Powered by: {pump.powered_by}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 3. Hospitals */}
        {(!activeLayer || activeLayer === 'hospital') &&
          infrastructure?.hospitals?.map((hosp) => {
            const isFailed = failedAssetsSet.has(hosp.powered_by);
            return (
              <Marker
                key={hosp.id}
                position={[hosp.lat, hosp.lng]}
                icon={createCustomIcon('🏥', 'bg-emerald-500', isFailed)}
              >
                <Popup>
                  <div className="p-1.5 text-xs text-white font-mono space-y-1">
                    <div className="font-bold text-emerald-300 text-sm flex items-center gap-1">
                      <span>🏥</span> {hosp.name}
                    </div>
                    <div className={`font-semibold ${isFailed ? 'text-amber-400' : 'text-cascade-green'}`}>
                      Grid Power: {isFailed ? 'OUTAGE (Generator Active)' : 'NORMAL GRID'}
                    </div>
                    <div>Beds: {hosp.beds} | ICU: {hosp.icu_beds}</div>
                    <div>Gen Reserves: {hosp.generator_fuel_hours}h fuel</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 4. Shelters */}
        {infrastructure?.shelters?.map((sh) => (
          <Marker
            key={sh.id}
            position={[sh.lat, sh.lng]}
            icon={createCustomIcon('⛺', 'bg-indigo-500', false)}
          >
            <Popup>
              <div className="p-1.5 text-xs text-white font-mono space-y-1">
                <div className="font-bold text-indigo-300 text-sm flex items-center gap-1">
                  <span>⛺</span> {sh.name}
                </div>
                <div>Capacity: {sh.capacity} persons</div>
                <div>Water: {sh.has_water ? 'Available' : 'None'}</div>
                <div>Power: {sh.has_power ? 'Available' : 'None'}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 5. Citizen Reports */}
        {(citizenReports || []).map((rep) => (
          <CircleMarker
            key={rep.id}
            center={[rep.lat || 19.076, rep.lng || 72.877]}
            radius={8}
            pathOptions={{
              fillColor: '#3b82f6',
              fillOpacity: 0.9,
              color: '#ffffff',
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-1 text-xs font-mono">
                <div className="text-blue-400 font-bold">Citizen Field Report</div>
                <div>{rep.description || 'Waterlogging observed above knee level'}</div>
                <div className="text-gray-400 text-[10px] mt-1">{rep.timestamp}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Zone Click Popup */}
        {selectedZone && selectedZoneProps && (
          <Popup
            position={zoneCentroids[selectedZone] || centerPos}
            onClose={() => setSelectedZone(null)}
          >
            <div className="p-2 text-xs font-sans text-gray-100 min-w-[220px] space-y-1.5">
              <div className="border-b border-white/15 pb-1">
                <div className="font-bold text-sm text-white">{selectedZoneProps.name}</div>
                <div className="text-[10px] text-cascade-cyan font-mono">ID: {selectedZone}</div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                <div>
                  <span className="text-gray-400">Risk:</span>{' '}
                  <span className="font-bold text-cascade-red">
                    {Math.round((selectedZoneState?.overallRisk || 0) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Water Depth:</span>{' '}
                  <span className="font-bold text-cyan-300">
                    {selectedZoneState?.floodDepth?.toFixed(1) || 0}m
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Power:</span>{' '}
                  <span className={selectedZoneState?.powerAvailable !== false ? 'text-emerald-400' : 'text-rose-400'}>
                    {selectedZoneState?.powerAvailable !== false ? 'Active' : 'Offline'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Road Access:</span>{' '}
                  <span className="text-amber-300">
                    {Math.round((selectedZoneState?.roadAccessibility || 1) * 100)}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-gray-300 pt-1 border-t border-white/10">
                <span className="text-gray-400">Pop. At Risk:</span>{' '}
                <span className="font-bold text-white">
                  {(selectedZoneState?.populationAtRisk || 0).toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowExplainPanel(true)}
                className="w-full mt-1 py-1 rounded bg-cascade-cyan/25 hover:bg-cascade-cyan/40 border border-cascade-cyan/40 text-cascade-cyan text-[11px] font-medium transition-colors"
              >
                Inspect Cascade Chain →
              </button>
            </div>
          </Popup>
        )}
      </MapContainer>

      {/* Map Legend (Bottom Right Corner) */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-navy-900/90 backdrop-blur-md p-2.5 rounded-xl border border-white/15 shadow-xl text-[11px] font-mono text-gray-300 pointer-events-auto flex flex-col gap-1.5 max-w-[210px]">
        <div className="flex items-center justify-between text-xs font-semibold text-white border-b border-white/10 pb-1">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-cascade-cyan" />
            Legend
          </span>
          <span className="text-[10px] text-gray-400">Hour T+{currentHour}</span>
        </div>

        {/* Risk Gradient */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400">Zone Inundation Risk:</span>
          <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-bold">
            <span className="bg-emerald-500/80 text-navy-950 rounded py-0.5">&lt;25%</span>
            <span className="bg-amber-500/80 text-navy-950 rounded py-0.5">25-50%</span>
            <span className="bg-orange-500/80 text-navy-950 rounded py-0.5">50-75%</span>
            <span className="bg-rose-500/80 text-navy-950 rounded py-0.5">&gt;75%</span>
          </div>
        </div>

        {/* Symbol Key */}
        <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-300 pt-1 border-t border-white/10">
          <div className="flex items-center gap-1">
            <span>⚡</span> Substation
          </div>
          <div className="flex items-center gap-1">
            <span>💧</span> Pump Station
          </div>
          <div className="flex items-center gap-1">
            <span>🏥</span> Hospital
          </div>
          <div className="flex items-center gap-1">
            <span>⛺</span> Relief Shelter
          </div>
          <div className="flex items-center gap-1 col-span-2 text-cascade-red">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Pulsing = Critical Failure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
