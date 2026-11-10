export type OperationalMode =
  | 'MODE_1_PREDICTION'
  | 'MODE_2_OSINT_RESCUE'
  | 'MODE_3_SAFE_ZONES'
  | 'MODE_4_TRIAGE';

export type MapStyleTheme =
  | 'STADIA_ALIDADE_SMOOTH_DARK'
  | 'STADIA_OUTDOORS'
  | 'STADIA_SATELLITE'
  | 'STADIA_OSM_BRIGHT'
  | 'OPENFREEMAP_DARK'
  | 'ESRI_SATELLITE'
  | 'CARTO_DARK_KEYLESS';

export type DashboardView =
  | 'COMMAND_HUD'
  | 'SUPER_ADMIN'
  | 'GOV_FORCES'
  | 'HOSPITAL_NETWORK';

export type MapVizMode = 'HYBRID' | 'HEATMAP' | 'PINS';

export type HoveredEntityType = 'DISTRICT' | 'SOS' | 'HOSPITAL' | 'SHELTER' | 'FORCE';

export interface HoveredEntity {
  type: HoveredEntityType;
  data: any;
  x: number;
  y: number;
}

export type HazardLayerType =
  | 'WEATHER_RADAR'
  | 'FLOOD_GRID'
  | 'SEISMIC_RINGS'
  | 'SOS_BEACONS'
  | 'SAFE_SHELTERS'
  | 'HOSPITAL_NODES'
  | 'DEFENSE_FORCES';

export interface DistrictHazardFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    district_id: string;
    name: string;
    state: string;
    population: number;
    elevation_m: number;
    slope_deg: number;
    probabilities: {
      p_flood: number;
      p_landslide: number;
      p_cyclone: number;
      p_heat: number;
    };
    composite_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    weather_telemetry: {
      temperature_c: number;
      relative_humidity: number;
      rain_24h_mm: number;
      rain_72h_mm: number;
      soil_moisture: number;
      wind_speed_kmh: number;
      wind_gust_kmh: number;
      pressure_msl_hpa: number;
    };
  };
}

export interface OsintReport {
  id: string;
  source: string;
  raw_text: string;
  extracted_location: string;
  lat: number;
  lon: number;
  district_id: string;
  resolution_stage: string;
  people_trapped: number;
  urgency_score: number;
  urgency_label: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  credibility_score: number;
  is_verified: boolean;
  verification_note: string;
  status: 'PENDING' | 'DISPATCHED' | 'RESCUED';
  timestamp: string;
}

export interface HospitalNode {
  id: string;
  name: string;
  chain_type: string;
  district_id: string;
  lat: number;
  lon: number;
  icu: { available: number; total: number };
  trauma: { available: number; total: number };
  ventilator: { available: number; total: number };
  general: { available: number; total: number };
  burn: { available: number; total: number };
  oxygen_reserve_hours: number;
  backup_generator_fuel_hours: number;
  helipad_available: boolean;
  structural_status: string;
}

export interface SafeZoneNode {
  id: string;
  name: string;
  district_id: string;
  lat: number;
  lon: number;
  capacity_max: number;
  current_occupancy: number;
  helipad_available: boolean;
  elevation_m: number;
}

export interface ForceUnit {
  id: string;
  unit_name: string;
  branch: string;
  district_id?: string;
  lat: number;
  lon: number;
  personnel_count: number;
  equipment: string;
  status: string;
}
