import React from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';

export const MapHoverCard: React.FC = () => {
  const { hoveredEntity } = usePraleyeStore();

  if (!hoveredEntity) return null;

  const { type, data, x, y } = hoveredEntity;

  // Clamp coordinates to keep inside screen bounds
  const cardWidth = 280;
  const left = Math.min(Math.max(16, x + 16), window.innerWidth - cardWidth - 16);
  const top = Math.min(Math.max(70, y - 50), window.innerHeight - 260);

  return (
    <div
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-50 pointer-events-none w-72 rounded-lg tactical-glass-elevated border border-slate-700/80 shadow-2xl p-3 text-xs animate-in fade-in zoom-in-95 duration-150"
    >
      {type === 'DISTRICT' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base">⚠️</span>
              <div className="truncate">
                <span className="font-bold text-slate-100 uppercase tracking-wide">
                  {data.properties.name}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">
                  {data.properties.state}
                </span>
              </div>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                data.properties.composite_risk_level === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : data.properties.composite_risk_level === 'HIGH'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : data.properties.composite_risk_level === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {data.properties.composite_risk_level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Flood Risk</span>
              <span className="text-cyan-400 font-bold">
                {Math.round(data.properties.probabilities.p_flood)}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Landslide</span>
              <span className="text-amber-400 font-bold">
                {Math.round(data.properties.probabilities.p_landslide)}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">24h Rain</span>
              <span className="text-sky-300 font-bold">
                {data.properties.weather_telemetry.rain_24h_mm.toFixed(1)} mm
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Wind Gust</span>
              <span className="text-slate-200 font-bold">
                {Math.round(data.properties.weather_telemetry.wind_gust_kmh)} km/h
              </span>
            </div>
          </div>

          <div className="text-[10px] text-cyan-400/90 font-mono text-center pt-0.5">
            Click to inspect telemetry details →
          </div>
        </div>
      )}

      {type === 'HOSPITAL' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base text-cyan-400">🏥</span>
              <div className="truncate">
                <span className="font-bold text-slate-100 tracking-wide truncate block">
                  {data.name}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {data.chain_type}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {data.helipad_available ? '🚁 HELIPAD' : 'NO HELI'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">ICU Available</span>
              <span className="text-emerald-400 font-bold">
                {data.icu.available} / {data.icu.total}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Trauma Beds</span>
              <span className="text-cyan-300 font-bold">
                {data.trauma.available} / {data.trauma.total}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Ventilators</span>
              <span className="text-sky-300 font-bold">
                {data.ventilator.available} / {data.ventilator.total}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Oxygen Reserve</span>
              <span className="text-emerald-300 font-bold">
                {data.oxygen_reserve_hours}h
              </span>
            </div>
          </div>

          <div className="text-[10px] text-cyan-400/90 font-mono text-center pt-0.5">
            Click to allocate patients & view triage →
          </div>
        </div>
      )}

      {type === 'SOS' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base text-rose-500 animate-pulse">🆘</span>
              <div>
                <span className="font-bold text-rose-400 uppercase tracking-wide">
                  CIVILIAN DISTRESS
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">
                  via {data.source}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              👥 {data.people_trapped} TRAPPED
            </span>
          </div>

          <div className="bg-slate-900/70 p-2 rounded border border-rose-950 text-slate-300 text-[11px] italic line-clamp-2">
            "{data.raw_text}"
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Loc: {data.extracted_location}</span>
            <span className={data.is_verified ? 'text-emerald-400' : 'text-amber-400'}>
              {data.is_verified ? '✓ VERIFIED' : 'PENDING CHECK'}
            </span>
          </div>

          <div className="text-[10px] text-rose-400 font-mono text-center pt-0.5">
            Click to dispatch rescue teams →
          </div>
        </div>
      )}

      {type === 'SHELTER' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base text-emerald-400">⛺</span>
              <span className="font-bold text-slate-100 tracking-wide">
                {data.name}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {data.helipad_available ? '🚁 AIR SAFE' : 'GROUND'}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400">Occupancy:</span>
              <span className="text-emerald-400 font-bold">
                {data.current_occupancy} / {data.capacity_max} (
                {Math.round((data.current_occupancy / data.capacity_max) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((data.current_occupancy / data.capacity_max) * 100)
                  )}%`
                }}
              />
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-400 pt-1">
              <span>Elevation: {data.elevation_m}m</span>
              <span>Capacity: {data.capacity_max - data.current_occupancy} vacant</span>
            </div>
          </div>
        </div>
      )}

      {type === 'FORCE' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base text-amber-400">🪖</span>
              <span className="font-bold text-slate-100 tracking-wide">
                {data.unit_name}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {data.branch}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Personnel</span>
              <span className="text-amber-400 font-bold">{data.personnel_count} Active</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Status</span>
              <span className="text-emerald-400 font-bold">{data.status}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Equipment: <span className="text-slate-200">{data.equipment}</span>
          </div>
        </div>
      )}
    </div>
  );
};

