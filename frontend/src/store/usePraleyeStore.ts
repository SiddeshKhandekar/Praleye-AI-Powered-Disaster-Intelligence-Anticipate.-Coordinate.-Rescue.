import { create } from 'zustand';
import {
  OperationalMode,
  DashboardView,
  HazardLayerType,
  MapStyleTheme,
  DistrictHazardFeature,
  OsintReport,
  HospitalNode,
  SafeZoneNode,
  ForceUnit
} from '../types/praleye.types';

interface PraleyeStore {
  // Operational Mode & View
  mode: OperationalMode;
  setMode: (mode: OperationalMode) => void;
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;

  // Base Map Theme
  mapTheme: MapStyleTheme;
  setMapTheme: (theme: MapStyleTheme) => void;

  // Map Viewport
  viewport: { lat: number; lon: number; zoom: number; pitch: number; bearing: number };
  setViewport: (viewport: { lat: number; lon: number; zoom: number; pitch: number; bearing: number }) => void;
  flyTo: (lat: number, lon: number, zoom?: number) => void;

  // Layer Toggles
  activeLayers: Set<HazardLayerType>;
  toggleLayer: (layer: HazardLayerType) => void;

  // Selected Entities
  selectedDistrict: DistrictHazardFeature | null;
  setSelectedDistrict: (district: DistrictHazardFeature | null) => void;
  selectedSos: OsintReport | null;
  setSelectedSos: (report: OsintReport | null) => void;
  selectedHospital: HospitalNode | null;
  setSelectedHospital: (hospital: HospitalNode | null) => void;

  // Data Collections
  districts: DistrictHazardFeature[];
  setDistricts: (districts: DistrictHazardFeature[]) => void;
  osintReports: OsintReport[];
  setOsintReports: (reports: OsintReport[]) => void;
  hospitals: HospitalNode[];
  setHospitals: (hospitals: HospitalNode[]) => void;
  safeZones: SafeZoneNode[];
  setSafeZones: (zones: SafeZoneNode[]) => void;
  forces: ForceUnit[];
  setForces: (forces: ForceUnit[]) => void;

  // Multilingual & Time Scrubber
  language: string;
  setLanguage: (lang: string) => void;
  timeOffsetHours: number;
  setTimeOffsetHours: (offset: number) => void;

  // Modals
  isAlertModalOpen: boolean;
  setAlertModalOpen: (open: boolean) => void;
  isTriageModalOpen: boolean;
  setTriageModalOpen: (open: boolean) => void;
  isSitrepModalOpen: boolean;
  setSitrepModalOpen: (open: boolean) => void;
  isCaseStudiesModalOpen: boolean;
  setCaseStudiesModalOpen: (open: boolean) => void;
}

export const usePraleyeStore = create<PraleyeStore>((set) => ({
  mode: 'MODE_1_PREDICTION',
  setMode: (mode) => set({ mode }),
  activeView: 'COMMAND_HUD',
  setActiveView: (activeView) => set({ activeView }),

  mapTheme: 'STADIA_ALIDADE_SMOOTH_DARK',
  setMapTheme: (mapTheme) => set({ mapTheme }),

  viewport: { lat: 21.5937, lon: 78.9629, zoom: 4.8, pitch: 20, bearing: 0 },
  setViewport: (viewport) => set({ viewport }),
  flyTo: (lat, lon, zoom = 11) => set((state) => ({
    viewport: { ...state.viewport, lat, lon, zoom }
  })),

  activeLayers: new Set<HazardLayerType>([
    'WEATHER_RADAR',
    'FLOOD_GRID',
    'SEISMIC_RINGS',
    'SOS_BEACONS',
    'SAFE_SHELTERS',
    'HOSPITAL_NODES',
    'DEFENSE_FORCES'
  ]),
  toggleLayer: (layer) => set((state) => {
    const next = new Set(state.activeLayers);
    if (next.has(layer)) {
      next.delete(layer);
    } else {
      next.add(layer);
    }
    return { activeLayers: next };
  }),

  selectedDistrict: null,
  setSelectedDistrict: (selectedDistrict) => set({ selectedDistrict }),
  selectedSos: null,
  setSelectedSos: (selectedSos) => set({ selectedSos }),
  selectedHospital: null,
  setSelectedHospital: (selectedHospital) => set({ selectedHospital }),

  districts: [],
  setDistricts: (districts) => set({ districts }),
  osintReports: [],
  setOsintReports: (osintReports) => set({ osintReports }),
  hospitals: [],
  setHospitals: (hospitals) => set({ hospitals }),
  safeZones: [],
  setSafeZones: (safeZones) => set({ safeZones }),
  forces: [],
  setForces: (forces) => set({ forces }),

  language: 'hi',
  setLanguage: (language) => set({ language }),
  timeOffsetHours: 0,
  setTimeOffsetHours: (timeOffsetHours) => set({ timeOffsetHours }),

  isAlertModalOpen: false,
  setAlertModalOpen: (isAlertModalOpen) => set({ isAlertModalOpen }),
  isTriageModalOpen: false,
  setTriageModalOpen: (isTriageModalOpen) => set({ isTriageModalOpen }),
  isSitrepModalOpen: false,
  setSitrepModalOpen: (isSitrepModalOpen) => set({ isSitrepModalOpen }),
  isCaseStudiesModalOpen: false,
  setCaseStudiesModalOpen: (isCaseStudiesModalOpen) => set({ isCaseStudiesModalOpen }),
}));
