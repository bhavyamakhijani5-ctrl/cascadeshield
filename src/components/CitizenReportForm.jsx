import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  Flame,
  Shield,
  LifeBuoy,
  ZapOff,
  Droplets,
  Construction,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../store/useStore';

const REPORT_TYPES = [
  { id: 'waterlogging', label: 'Severe Waterlogging', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'road_blocked', label: 'Road / Arterial Blocked', icon: Construction, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  { id: 'power_outage', label: 'Grid / Power Outage', icon: ZapOff, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
  { id: 'need_rescue', label: 'Citizens Need Rescue', icon: LifeBuoy, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
];

const PRESET_HOTSPOTS = [
  { name: 'Kurla West (LBS Marg)', lat: 19.0722, lng: 72.8805, zoneId: 'Z06' },
  { name: 'Dharavi (Kumbharwada)', lat: 19.0435, lng: 72.8542, zoneId: 'Z01' },
  { name: 'Sion Gandhi Market', lat: 19.0365, lng: 72.8602, zoneId: 'Z08' },
  { name: 'BKC Junction Connector', lat: 19.0635, lng: 72.8655, zoneId: 'Z03' },
  { name: 'Santacruz Vakola Bridge', lat: 19.0880, lng: 72.8620, zoneId: 'Z14' },
  { name: 'Chembur Postal Colony', lat: 19.0612, lng: 72.9008, zoneId: 'Z19' },
];

const STORAGE_KEY = 'cascadeshield_citizen_reports';

/**
 * Citizen Incident Crowdsource Report Form
 * Enables field workers, volunteers, and citizens to report local hazards,
 * nudging local risk in the simulation and persisting locally.
 */
export default function CitizenReportForm({ onLocationSelect, selectedCoords = null }) {
  const addCitizenReport = useStore((state) => state.addCitizenReport);
  const storeReports = useStore((state) => state.simulation.citizenReports);

  const [reportType, setReportType] = useState('waterlogging');
  const [severity, setSeverity] = useState(3);
  const [locationName, setLocationName] = useState('Kurla West (LBS Marg)');
  const [lat, setLat] = useState('19.0722');
  const [lng, setLng] = useState('72.8805');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [pastReports, setPastReports] = useState([]);

  // Sync selected external coordinates if passed from a map click
  useEffect(() => {
    if (selectedCoords && selectedCoords.lat && selectedCoords.lng) {
      setLat(Number(selectedCoords.lat).toFixed(4));
      setLng(Number(selectedCoords.lng).toFixed(4));
      setLocationName(selectedCoords.name || `Pin (${Number(selectedCoords.lat).toFixed(3)}, ${Number(selectedCoords.lng).toFixed(3)})`);
    }
  }, [selectedCoords]);

  // Load past reports safely from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPastReports(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to load past citizen reports from localStorage:', err);
    }
  }, []);

  const handleHotspotSelect = (e) => {
    const spot = PRESET_HOTSPOTS.find((h) => h.name === e.target.value);
    if (spot) {
      setLocationName(spot.name);
      setLat(spot.lat.toFixed(4));
      setLng(spot.lng.toFixed(4));
      if (onLocationSelect) {
        onLocationSelect({ lat: spot.lat, lng: spot.lng, name: spot.name });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parsedLat = parseFloat(lat) || 19.0722;
    const parsedLng = parseFloat(lng) || 72.8805;

    const newReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: reportType,
      severity: Number(severity),
      location: locationName || `Coordinates (${parsedLat.toFixed(3)}, ${parsedLng.toFixed(3)})`,
      lat: parsedLat,
      lng: parsedLng,
      description: description.trim() || 'No additional commentary provided.',
      timestamp: new Date().toISOString(),
      verified: true,
      riskMultiplierDelta: (Number(severity) * 0.05).toFixed(2), // slight risk nudge
    };

    // 1. Dispatch into Zustand store to nudge simulation
    addCitizenReport(newReport);

    // 2. Persist safely in localStorage with quota error fallback
    try {
      const updatedReports = [newReport, ...pastReports.slice(0, 49)];
      setPastReports(updatedReports);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
    } catch (storageErr) {
      console.warn('localStorage write failed or quota exceeded:', storageErr);
      // Still update memory state even if storage quota exceeded
      setPastReports((prev) => [newReport, ...prev.slice(0, 49)]);
    }

    // Reset inputs & show toast
    setDescription('');
    setIsSubmitting(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  const getSeverityBadge = (level) => {
    switch (level) {
      case 5:
        return { label: '5 - Catastrophic', color: 'bg-red-500/20 text-red-400 border-red-500/40' };
      case 4:
        return { label: '4 - Severe Hazard', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' };
      case 3:
        return { label: '3 - High Priority', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 2:
        return { label: '2 - Moderate Alert', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
      default:
        return { label: '1 - Minor / Advisory', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl relative overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-4 right-4 z-40 bg-emerald-950/90 border border-emerald-500/50 backdrop-blur-xl p-3.5 rounded-xl shadow-2xl flex items-center justify-between text-emerald-200"
          >
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Report Successfully Broadcasted</p>
                <p className="text-[11px] text-emerald-300">
                  Incident logged. Local zone risk has been nudged in the cascade engine.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="text-emerald-400 hover:text-white text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Citizen Incident Submission
            </h3>
            <p className="text-xs text-slate-400">
              Crowdsource ground-truth telemetry to update real-time cascade risks
            </p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
          {pastReports.length + storeReports.length} Reports Logged
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Report Type Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Incident Classification
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {REPORT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = reportType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setReportType(type.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col items-start ${
                    isSelected
                      ? `${type.bg} border-cascade-cyan/80 ring-1 ring-cascade-cyan/50 text-white shadow-lg`
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${type.color}`} />
                  <span className="text-xs font-medium leading-tight">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location Selection: Preset Hotspot or Manual Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Monitored Hotspot
            </label>
            <div className="relative">
              <select
                value={locationName}
                onChange={handleHotspotSelect}
                className="w-full bg-navy-800 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 appearance-none pr-8"
              >
                {PRESET_HOTSPOTS.map((spot) => (
                  <option key={spot.name} value={spot.name}>
                    {spot.name} ({spot.zoneId})
                  </option>
                ))}
                <option value="Custom Coordinate">Custom GPS Coordinate</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              GPS Coordinates (Lat / Lng)
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Latitude"
                  className="w-full bg-navy-800 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
                <span className="absolute right-2 top-2 text-[10px] text-slate-400">N</span>
              </div>
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Longitude"
                  className="w-full bg-navy-800 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
                <span className="absolute right-2 top-2 text-[10px] text-slate-400">E</span>
              </div>
            </div>
          </div>
        </div>

        {/* Severity Slider */}
        <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Hazard Severity</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${getSeverityBadge(severity).color}`}>
              {getSeverityBadge(severity).label}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full accent-cascade-cyan h-2 bg-navy-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
            <span>1 - Minor</span>
            <span>2 - Moderate</span>
            <span>3 - High</span>
            <span>4 - Severe</span>
            <span>5 - Critical</span>
          </div>
        </div>

        {/* Optional Description */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Eyewitness Observation / Street Details (Optional)
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., Water rising above knee level near Kurla station west; vehicular underpass completely submerged..."
            className="w-full bg-navy-800 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-medium text-xs rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Transmitting Ground Telemetry...' : 'Transmit Emergency Report'}</span>
        </button>
      </form>

      {/* History of Past Reports List */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Recent Community Submissions</span>
          </h4>
          <span className="text-[10px] text-slate-400">Local Cache + Store</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {pastReports.length === 0 && storeReports.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-slate-400">
              No reports submitted yet. Submit the form above to add your ground observation.
            </div>
          ) : (
            [...storeReports, ...pastReports]
              .filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx)
              .slice(0, 5)
              .map((rep) => {
                const typeObj = REPORT_TYPES.find((t) => t.id === rep.type) || REPORT_TYPES[0];
                const TypeIcon = typeObj.icon;
                return (
                  <div
                    key={rep.id}
                    className="p-2.5 rounded-xl bg-navy-800/80 border border-white/5 flex items-start justify-between text-xs hover:border-white/15 transition"
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className={`p-1.5 rounded-lg ${typeObj.bg} shrink-0 mt-0.5`}>
                        <TypeIcon className={`w-3.5 h-3.5 ${typeObj.color}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center space-x-2">
                          <span>{rep.location}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${getSeverityBadge(rep.severity).color}`}>
                            Lvl {rep.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {rep.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
