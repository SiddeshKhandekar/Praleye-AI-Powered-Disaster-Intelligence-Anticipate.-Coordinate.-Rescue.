import React from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import {
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Mountain,
  Compass,
  AlertTriangle,
  Hospital,
  ShieldAlert,
  Home,
  X,
  ExternalLink,
  Radio
} from 'lucide-react';

export const CityWeatherDetailModal: React.FC = () => {
  const {
    isCityDetailModalOpen,
    setCityDetailModalOpen,
    selectedDistrict,
    hospitals,
    safeZones,
    forces,
    setAlertModalOpen,
    setTriageModalOpen
  } = usePraleyeStore();

  if (!isCityDetailModalOpen || !selectedDistrict) return null;

  const d = selectedDistrict;
  const p = d.properties;
  const w = p.weather_telemetry;

  // Filter infrastructure in this district
  const localHospitals = hospitals.filter(
    (h) => h.district_id === p.district_id || h.name.toLowerCase().includes(p.name.toLowerCase())
  );
  const localShelters = safeZones.filter(
    (s) => s.district_id === p.district_id || s.name.toLowerCase().includes(p.name.toLowerCase())
  );
  const localForces = forces.filter(
    (f) => f.district_id === p.district_id || f.unit_name.toLowerCase().includes(p.name.toLowerCase())
  );

  const riskColor =
    p.composite_risk_level === 'CRITICAL'
      ? '#EF4444'
      : p.composite_risk_level === 'HIGH'
      ? '#F97316'
      : p.composite_risk_level === 'MODERATE'
      ? '#F59E0B'
      : '#10B981';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl tactical-glass-elevated border border-slate-700/80 shadow-2xl overflow-hidden font-mono text-xs text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{w.weather_icon || '🏙️'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
                  {p.name}
                </h2>
                <span className="text-slate-400 text-xs">({p.state})</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                  style={{
                    backgroundColor: `${riskColor}25`,
                    color: riskColor,
                    border: `1px solid ${riskColor}60`
                  }}
                >
                  {p.composite_risk_level} THREAT
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                <span>Coordinates: {d.geometry.coordinates[1].toFixed(4)}°N, {d.geometry.coordinates[0].toFixed(4)}°E</span>
                <span>•</span>
                <span>Elevation: {p.elevation_m}m</span>
                <span>•</span>
                <span>Slope: {p.slope_deg}°</span>
                <span>•</span>
                <span>Population: {p.population.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCityDetailModalOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Section 1: Live Meteorological Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4" /> Live City Weather Telemetry & Barometer
              </span>
              <span className="text-[10px] text-slate-400">
                Condition: <strong className="text-slate-200">{w.weather_condition || 'Active Meteorological Stream'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Temperature */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>TEMPERATURE</span>
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-bold text-slate-100">
                  {w.temperature_c.toFixed(1)}°C
                </div>
                <div className="text-[10px] text-slate-400">
                  Feels like: <span className="text-amber-300 font-bold">{w.apparent_temperature_c?.toFixed(1) || w.temperature_c.toFixed(1)}°C</span>
                </div>
              </div>

              {/* Rain 24h & 72h */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>PRECIPITATION</span>
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-bold text-cyan-300">
                  {w.rain_24h_mm.toFixed(1)} <span className="text-xs font-normal text-slate-400">mm (24h)</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  72h Total: <span className="text-cyan-400 font-bold">{w.rain_72h_mm.toFixed(1)} mm</span>
                </div>
              </div>

              {/* Soil Moisture */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>SOIL MOISTURE</span>
                  <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-emerald-300">
                  {w.soil_moisture.toFixed(3)} <span className="text-xs font-normal text-slate-400">m³/m³</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Saturation: <span className="text-emerald-400 font-bold">{w.soil_moisture > 0.4 ? 'CRITICAL SATURATION' : 'MODERATE'}</span>
                </div>
              </div>

              {/* Wind Speed & Gusts */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>WIND DYNAMICS</span>
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-xl font-bold text-slate-100">
                  {Math.round(w.wind_speed_kmh)} <span className="text-xs font-normal text-slate-400">km/h</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Max Gusts: <span className="text-sky-300 font-bold">{Math.round(w.wind_gust_kmh)} km/h</span>
                </div>
              </div>
            </div>

            {/* Additional Secondary Weather Parameters */}
            <div className="grid grid-cols-3 gap-2.5 mt-2.5">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Relative Humidity:</span>
                <span className="text-slate-100 font-bold">{Math.round(w.relative_humidity)}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Surface Pressure:</span>
                <span className="text-slate-100 font-bold">{Math.round(w.pressure_msl_hpa)} hPa</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Cloud Coverage:</span>
                <span className="text-slate-100 font-bold">{Math.round(w.cloud_cover_pct || 20)}%</span>
              </div>
            </div>
          </div>

          {/* Section 2: Mathematical Disaster Predictions */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4" /> Multi-Hazard Physics Risk Probability Breakdown
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
              {/* Flood */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1">🌊 Inundation / Flood Risk</span>
                  <span className="text-cyan-400 font-bold">{Math.round(p.probabilities.p_flood)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${p.probabilities.p_flood}%` }} />
                </div>
                <span className="text-[9px] text-slate-400 block">
                  Driven by 24h rain ({w.rain_24h_mm}mm) & soil saturation ({w.soil_moisture})
                </span>
              </div>

              {/* Landslide */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1">⛰️ Slope Landslide Risk</span>
                  <span className="text-amber-400 font-bold">{Math.round(p.probabilities.p_landslide)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${p.probabilities.p_landslide}%` }} />
                </div>
                <span className="text-[9px] text-slate-400 block">
                  Driven by slope angle ({p.slope_deg}°) & 72h rainfall ({w.rain_72h_mm}mm)
                </span>
              </div>

              {/* Cyclone */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1">🌀 Cyclone Storm Surge</span>
                  <span className="text-sky-400 font-bold">{Math.round(p.probabilities.p_cyclone)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${p.probabilities.p_cyclone}%` }} />
                </div>
                <span className="text-[9px] text-slate-400 block">
                  Driven by wind gusts ({w.wind_gust_kmh}km/h) & barometric pressure ({w.pressure_msl_hpa}hPa)
                </span>
              </div>

              {/* Heat */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1">🌡️ Wet-Bulb Hyperthermia</span>
                  <span className="text-rose-400 font-bold">{Math.round(p.probabilities.p_heat)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${p.probabilities.p_heat}%` }} />
                </div>
                <span className="text-[9px] text-slate-400 block">
                  Driven by ambient temp ({w.temperature_c}°C) & relative humidity ({w.relative_humidity}%)
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Local City Disaster Resources */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Hospitals */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1">
                <Hospital className="w-3.5 h-3.5" /> City Hospitals ({localHospitals.length})
              </span>
              {localHospitals.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {localHospitals.map((h) => (
                    <div key={h.id} className="p-1.5 rounded bg-slate-800/70 border border-slate-700/60 text-[10px]">
                      <div className="font-bold text-slate-200 truncate">{h.name}</div>
                      <div className="text-cyan-300">
                        ICU: {h.icu.available}/{h.icu.total} | Trauma: {h.trauma.available}/{h.trauma.total}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-[10px] italic">No registered tier-1 hospital in immediate district boundary. Regional hub on standby.</div>
              )}
            </div>

            {/* Shelters */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Safe Zones & Shelters ({localShelters.length})
              </span>
              {localShelters.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {localShelters.map((s) => (
                    <div key={s.id} className="p-1.5 rounded bg-slate-800/70 border border-slate-700/60 text-[10px]">
                      <div className="font-bold text-slate-200 truncate">{s.name}</div>
                      <div className="text-emerald-300">
                        Occupancy: {s.current_occupancy}/{s.capacity_max} ({Math.round((s.current_occupancy / s.capacity_max) * 100)}%)
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-[10px] italic">Emergency shelters pre-designated in adjacent sector.</div>
              )}
            </div>

            {/* Forces */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Defense & NDRF Task Forces ({localForces.length})
              </span>
              {localForces.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {localForces.map((f) => (
                    <div key={f.id} className="p-1.5 rounded bg-slate-800/70 border border-slate-700/60 text-[10px]">
                      <div className="font-bold text-slate-200 truncate">{f.unit_name}</div>
                      <div className="text-amber-300">
                        {f.branch} • {f.personnel_count} Personnel ({f.status})
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-[10px] italic">NDRF Quick Reaction Team on 30-min notice.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700/80 bg-slate-950/80">
          <div className="text-[10px] text-slate-400">
            PRALEYE Integrated City Telemetry Engine • Open-Meteo & IMD Synoptic Feed
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCityDetailModalOpen(false);
                setAlertModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/60 text-rose-200 font-bold transition-all shadow-md"
            >
              <Radio className="w-3.5 h-3.5" /> Broadcast CAP Alert
            </button>
            <button
              onClick={() => {
                setCityDetailModalOpen(false);
                setTriageModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/60 text-cyan-200 font-bold transition-all shadow-md"
            >
              <Hospital className="w-3.5 h-3.5" /> Triage Beds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

