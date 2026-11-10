import React from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { MicroLocationNode } from '../../services/microLocationsData';
import {
  MapPin,
  Waves,
  Mountain,
  AlertOctagon,
  Building,
  Navigation,
  X,
  Radio,
  Hospital,
  ShieldCheck
} from 'lucide-react';

export const MicroLocationDetailModal: React.FC = () => {
  const {
    selectedMicroLocation,
    setSelectedMicroLocation,
    setAlertModalOpen,
    setTriageModalOpen
  } = usePraleyeStore();

  if (!selectedMicroLocation) return null;

  const loc: MicroLocationNode = selectedMicroLocation;

  const vulnColor =
    loc.vulnerability === 'EXTREME'
      ? '#EF4444'
      : loc.vulnerability === 'HIGH'
      ? '#F97316'
      : loc.vulnerability === 'MODERATE'
      ? '#F59E0B'
      : '#10B981';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl flex flex-col rounded-2xl tactical-glass-elevated border border-slate-700/80 shadow-2xl overflow-hidden font-mono text-xs text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
              style={{ backgroundColor: `${vulnColor}25`, border: `1.5px solid ${vulnColor}` }}
            >
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                  {loc.name}
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                  style={{
                    backgroundColor: `${vulnColor}25`,
                    color: vulnColor,
                    border: `1px solid ${vulnColor}60`
                  }}
                >
                  {loc.vulnerability} VULNERABILITY
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                <span className="text-cyan-400 font-bold">{loc.areaName}</span>
                <span>•</span>
                <span>{loc.cityName}</span>
                <span>•</span>
                <span>Type: {loc.type}</span>
                <span>•</span>
                <span>{loc.lat.toFixed(4)}°N, {loc.lon.toFixed(4)}°E</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedMicroLocation(null)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Elevation & Water Sensor Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block mb-1">ELEVATION (MSL)</span>
              <div className="text-lg font-bold text-slate-100">{loc.elevation_m} meters</div>
              <span className="text-[9px] text-slate-500">Local topographical basin</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block mb-1">EST. FLOOD DEPTH</span>
              <div className="text-lg font-bold text-rose-400">{loc.flood_depth_est_cm} cm</div>
              <span className="text-[9px] text-slate-500">During 50mm/h cloudburst</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block mb-1">LIVE WATER SENSOR</span>
              <div
                className={`text-lg font-bold ${
                  loc.live_water_sensor_status === 'OVERFLOW'
                    ? 'text-rose-400 animate-pulse'
                    : loc.live_water_sensor_status === 'ALERT'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {loc.live_water_sensor_status}
              </div>
              <span className="text-[9px] text-slate-500">IoT Telemetry Node</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block mb-1">EVACUATION TIER</span>
              <div className="text-lg font-bold text-amber-300">
                {loc.evac_priority.replace('_', ' ')}
              </div>
              <span className="text-[9px] text-slate-500">NDRF Standard Protocol</span>
            </div>
          </div>

          {/* Chronic Drainage & Waterlogging History */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <Waves className="w-4 h-4" /> Historical Inundation & Micro-Drainage Basin
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {loc.waterlogging_history}
            </p>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
              <span>Primary Stormwater Basin: <strong className="text-cyan-300">{loc.drainage_basin}</strong></span>
              <span>Coordinates: {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)}</span>
            </div>
          </div>

          {/* Critical Facilities & Transit Impact */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
              <Building className="w-4 h-4" /> Critical Infrastructure & Transit Nodes at this Chowk
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {loc.critical_facilities.map((fac, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-200"
                >
                  <span className="text-cyan-400 font-bold">#{idx + 1}</span>
                  <span className="text-xs truncate">{fac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700/80 bg-slate-950/80">
          <div className="text-[10px] text-slate-400">
            PRALEYE Micro-Level Urban Disaster Inundation Registry
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedMicroLocation(null);
                setAlertModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/60 text-rose-200 font-bold text-xs transition-all shadow-md"
            >
              <Radio className="w-3.5 h-3.5" /> Broadcast Ward Siren
            </button>
            <button
              onClick={() => {
                setSelectedMicroLocation(null);
                setTriageModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/60 text-cyan-200 font-bold text-xs transition-all shadow-md"
            >
              <Hospital className="w-3.5 h-3.5" /> Dispatch Medical Evac
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

