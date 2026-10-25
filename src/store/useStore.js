import { create } from 'zustand';

const DEFAULT_RESOURCES = {
  teams: {
    rescue: { total: 12, available: 12, base_lat: 19.076, base_lng: 72.877, speed_kmph: 15 },
    medical: { total: 5, available: 5, base_lat: 19.086, base_lng: 72.887, speed_kmph: 20 },
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

const INITIAL_SIMULATION = {
  rainfallIntensity: 50,
  duration: 24,
  soilSaturation: 0.5,
  climateScenario: 'current',
  currentHour: 0,
  isPlaying: false,
  playSpeed: 1,
  results: null,
  isRunning: false,
  confidenceLevel: 0,
  blockedAssets: [],
  citizenReports: [],
};

const INITIAL_RESOURCES = {
  teams: DEFAULT_RESOURCES.teams,
  equipment: DEFAULT_RESOURCES.equipment,
  supplies: DEFAULT_RESOURCES.supplies,
  allocations: [],
  optimizerResult: null,
};

const INITIAL_UI = {
  activeView: 'control-room',
  sidebarOpen: true,
  activeLayer: 'flood',
  showExplainPanel: false,
  selectedZone: null,
  selectedAsset: null,
  isOnline: true,
  isLowBandwidth: false,
  isDemoMode: false,
  language: 'en',
};

export const useStore = create((set, get) => ({
  // State Slices
  simulation: { ...INITIAL_SIMULATION },
  resources: { ...INITIAL_RESOURCES },
  ui: { ...INITIAL_UI },

  // Simulation Actions
  setRainfallIntensity: (rainfallIntensity) =>
    set((state) => ({
      simulation: { ...state.simulation, rainfallIntensity },
    })),

  setDuration: (duration) =>
    set((state) => ({
      simulation: { ...state.simulation, duration },
    })),

  setSoilSaturation: (soilSaturation) =>
    set((state) => ({
      simulation: { ...state.simulation, soilSaturation },
    })),

  setClimateScenario: (climateScenario) =>
    set((state) => ({
      simulation: { ...state.simulation, climateScenario },
    })),

  setCurrentHour: (hourOrFn) =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        currentHour:
          typeof hourOrFn === 'function'
            ? hourOrFn(state.simulation.currentHour)
            : hourOrFn,
      },
    })),

  togglePlay: () =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        isPlaying: !state.simulation.isPlaying,
      },
    })),

  setPlaySpeed: (playSpeed) =>
    set((state) => ({
      simulation: { ...state.simulation, playSpeed },
    })),

  setIsRunning: (isRunning) =>
    set((state) => ({
      simulation: { ...state.simulation, isRunning },
    })),

  setConfidenceLevel: (confidenceLevel) =>
    set((state) => ({
      simulation: { ...state.simulation, confidenceLevel },
    })),

  setResults: (results) =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        results,
        confidenceLevel: results?.confidenceLevel ?? state.simulation.confidenceLevel,
      },
    })),

  addCitizenReport: (report) =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        citizenReports: [
          {
            id: report.id || `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: report.timestamp || new Date().toISOString(),
            ...report,
          },
          ...state.simulation.citizenReports,
        ],
      },
    })),

  addBlockedAsset: (assetId) =>
    set((state) => {
      if (state.simulation.blockedAssets.includes(assetId)) return state;
      return {
        simulation: {
          ...state.simulation,
          blockedAssets: [...state.simulation.blockedAssets, assetId],
        },
      };
    }),

  removeBlockedAsset: (assetId) =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        blockedAssets: state.simulation.blockedAssets.filter((id) => id !== assetId),
      },
    })),

  resetSimulation: () =>
    set((state) => ({
      simulation: { ...INITIAL_SIMULATION },
    })),

  // Resource Actions
  updateResources: (updatedResources) =>
    set((state) => ({
      resources: { ...state.resources, ...updatedResources },
    })),

  setAllocations: (allocations) =>
    set((state) => ({
      resources: { ...state.resources, allocations },
    })),

  setOptimizerResult: (optimizerResult) =>
    set((state) => ({
      resources: { ...state.resources, optimizerResult },
    })),

  // UI Actions
  setActiveView: (activeView) =>
    set((state) => ({
      ui: { ...state.ui, activeView },
    })),

  setSidebarOpen: (sidebarOpen) =>
    set((state) => ({
      ui: {
        ...state.ui,
        sidebarOpen:
          typeof sidebarOpen === 'function'
            ? sidebarOpen(state.ui.sidebarOpen)
            : sidebarOpen,
      },
    })),

  toggleSidebar: () =>
    set((state) => ({
      ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
    })),

  setSelectedZone: (selectedZone) =>
    set((state) => ({
      ui: { ...state.ui, selectedZone },
    })),

  setSelectedAsset: (selectedAsset) =>
    set((state) => ({
      ui: { ...state.ui, selectedAsset },
    })),

  setShowExplainPanel: (showExplainPanel) =>
    set((state) => ({
      ui: {
        ...state.ui,
        showExplainPanel:
          typeof showExplainPanel === 'function'
            ? showExplainPanel(state.ui.showExplainPanel)
            : showExplainPanel,
      },
    })),

  toggleExplainPanel: () =>
    set((state) => ({
      ui: { ...state.ui, showExplainPanel: !state.ui.showExplainPanel },
    })),

  toggleLayer: (layer) =>
    set((state) => ({
      ui: {
        ...state.ui,
        activeLayer: state.ui.activeLayer === layer ? null : layer,
      },
    })),

  setActiveLayer: (activeLayer) =>
    set((state) => ({
      ui: { ...state.ui, activeLayer },
    })),

  setOnlineStatus: (isOnline) =>
    set((state) => ({
      ui: { ...state.ui, isOnline },
    })),

  toggleLowBandwidth: () =>
    set((state) => ({
      ui: { ...state.ui, isLowBandwidth: !state.ui.isLowBandwidth },
    })),

  startDemo: () =>
    set((state) => ({
      ui: { ...state.ui, isDemoMode: true },
    })),

  stopDemo: () =>
    set((state) => ({
      ui: { ...state.ui, isDemoMode: false },
    })),

  setLanguage: (language) =>
    set((state) => ({
      ui: { ...state.ui, language },
    })),
}));

export default useStore;
