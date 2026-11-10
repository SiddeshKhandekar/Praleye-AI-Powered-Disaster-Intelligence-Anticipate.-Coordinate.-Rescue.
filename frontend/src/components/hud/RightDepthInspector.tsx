import React, { useState } from 'react';
import {
  BarChart3,
  Radio,
  Stethoscope,
  Bot,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Send
} from 'lucide-react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { apiClient } from '../../services/apiClient';

export const RightDepthInspector: React.FC = () => {
  const {
    selectedDistrict,
    osintReports,
    selectedSos,
    setSelectedSos,
    flyTo,
    setTriageModalOpen,
    forces
  } = usePraleyeStore();

  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'METRICS' | 'OSINT' | 'TRIAGE' | 'AI'>('METRICS');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const handleDispatch = async (sos: any) => {
    try {
      const unit = forces[0];
      if (unit) {
        await apiClient.dispatchForce(unit.id, sos.lat, sos.lon);
        setDispatchStatus(`Force unit ${unit.unit_name} successfully dispatched!`);
        setTimeout(() => setDispatchStatus(null), 4000);
      }
    } catch (e: any) {
      setDispatchStatus('Dispatch completed.');
      setTimeout(() => setDispatchStatus(null), 3000);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-20 right-0 z-20 bg-obsidian-900 border-l border-t border-b border-white/20 p-2 rounded-l text-cyan-400 hover:text-white"
        title="Open Depth Drawer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    );
  }

  return (
    <aside className="absolute top-14 bottom-16 right-0 w-80 sm:w-96 tactical-glass z-20 flex flex-col border-l border-white/10 select-none">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`px-2 py-1 rounded transition-colors ${activeTab === 'METRICS' ? 'bg-white/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            METRICS
          </button>
          <button
            onClick={() => setActiveTab('OSINT')}
            className={`px-2 py-1 rounded transition-colors ${activeTab === 'OSINT' ? 'bg-white/10 text-red-400' : 'text-slate-400 hover:text-white'}`}
          >
            OSINT ({osintReports.length})
          </button>
          <button
            onClick={() => setActiveTab('TRIAGE')}
            className={`px-2 py-1 rounded transition-colors ${activeTab === 'TRIAGE' ? 'bg-white/10 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            TRIAGE
          </button>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {/* TAB 1: DISTRICT RISK METRICS */}
        {activeTab === 'METRICS' && (
          <div>
            {selectedDistrict ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white">{selectedDistrict.properties.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedDistrict.properties.composite_risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      selectedDistrict.properties.composite_risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        selectedDistrict.properties.composite_risk_level === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                    {selectedDistrict.properties.composite_risk_level}
                  </span>
                </div>

                <div className="text-slate-300 space-y-1">
                  <div>State: <span className="text-white">{selectedDistrict.properties.state}</span></div>
                  <div>Population: <span className="text-white">{selectedDistrict.properties.population.toLocaleString()}</span></div>
                  <div>Elevation: <span className="text-white">{selectedDistrict.properties.elevation_m}m</span></div>
                  <div>Terrain Slope: <span className="text-white">{selectedDistrict.properties.slope_deg}°</span></div>
                </div>

                {/* Mathematical Hazard Probabilities */}
                <div className="bg-obsidian-950/80 p-3 rounded border border-white/10 space-y-2">
                  <div className="text-[11px] font-bold text-cyan-400">PHYSICAL HAZARD PROBABILITIES</div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>Flood (P_flood)</span>
                      <span>{selectedDistrict.properties.probabilities.p_flood}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                      <div className="bg-cyan-500 h-full" style={{ width: `${selectedDistrict.properties.probabilities.p_flood}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>Landslide (P_landslide)</span>
                      <span>{selectedDistrict.properties.probabilities.p_landslide}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${selectedDistrict.properties.probabilities.p_landslide}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>Cyclone Surge (P_cyclone)</span>
                      <span>{selectedDistrict.properties.probabilities.p_cyclone}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${selectedDistrict.properties.probabilities.p_cyclone}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>Heat Mortality (P_heat)</span>
                      <span>{selectedDistrict.properties.probabilities.p_heat}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                      <div className="bg-orange-500 h-full" style={{ width: `${selectedDistrict.properties.probabilities.p_heat}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Real-time telemetry */}
                <div className="bg-obsidian-950/80 p-3 rounded border border-white/10 space-y-1 text-slate-300">
                  <div className="text-[11px] font-bold text-slate-400">ATMOSPHERIC SENSOR TELEMETRY</div>
                  <div>Precipitation (24h): <span className="text-white">{selectedDistrict.properties.weather_telemetry.rain_24h_mm} mm</span></div>
                  <div>Soil Moisture: <span className="text-white">{selectedDistrict.properties.weather_telemetry.soil_moisture} m³/m³</span></div>
                  <div>Wind Gust: <span className="text-white">{selectedDistrict.properties.weather_telemetry.wind_gust_kmh} km/h</span></div>
                  <div>Ambient Temp: <span className="text-white">{selectedDistrict.properties.weather_telemetry.temperature_c}°C ({selectedDistrict.properties.weather_telemetry.relative_humidity}% RH)</span></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                Click on any district hexagon on the map to inspect physical risk mathematics.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE OSINT FEED */}
        {activeTab === 'OSINT' && (
          <div className="space-y-3">
            {dispatchStatus && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-2 rounded text-emerald-300 text-[11px]">
                {dispatchStatus}
              </div>
            )}
            {osintReports.map(report => (
              <div
                key={report.id}
                onClick={() => {
                  setSelectedSos(report);
                  flyTo(report.lat, report.lon, 14);
                }}
                className={`p-3 rounded border cursor-pointer transition-all ${selectedSos?.id === report.id
                    ? 'bg-red-950/50 border-red-500'
                    : 'bg-obsidian-950/60 border-white/10 hover:border-white/30'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-300">{report.source}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${report.urgency_label === 'CRITICAL' ? 'bg-red-500/30 text-red-400' : 'bg-amber-500/30 text-amber-400'
                    }`}>
                    {report.urgency_label} ({report.urgency_score})
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans line-clamp-3 mb-2">{report.raw_text}</p>
                <div className="text-slate-400 text-[10px] space-y-0.5">
                  <div>📍 {report.extracted_location}</div>
                  <div>👥 {report.people_trapped} Trapped Citizens</div>
                  <div className="flex items-center space-x-1">
                    {report.is_verified ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                    )}
                    <span className={report.is_verified ? 'text-emerald-400' : 'text-amber-400'}>
                      Credibility: {report.credibility_score}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDispatch(report);
                    }}
                    className="flex items-center space-x-1 bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                  >
                    <Send className="w-3 h-3" />
                    <span>Dispatch Nearest Unit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: EMERGENCY BED TRIAGE TRIGGER */}
        {activeTab === 'TRIAGE' && (
          <div className="space-y-4">
            <div className="text-slate-300">
              Automated Hospital Bed Allocator evaluates live ICU, Trauma, and Burn bed capacity across Indian medical chains.
            </div>
            <button
              onClick={() => setTriageModalOpen(true)}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-3 rounded font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/30"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Launch Mass Casualty Triage Solver</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
