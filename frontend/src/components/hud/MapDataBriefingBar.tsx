import React, { useMemo } from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { DistrictHazardFeature } from '../../types/praleye.types';
import { interpolateDistrictData, interpolateOsintReports, getTimelineState } from '../../services/timelineTransitionService';

export const MapDataBriefingBar: React.FC = () => {
  const {
    districts,
    hospitals,
    safeZones,
    osintReports,
    flyTo,
    setSelectedDistrict,
    vizMode,
    setVizMode,
    setCaseStudiesModalOpen,
    timeOffsetHours
  } = usePraleyeStore();

  const timelineInfo = getTimelineState(timeOffsetHours);

  // Dynamically interpolate districts according to timeline offset
  const effectiveDistricts = useMemo(() => {
    return districts.map((d) => interpolateDistrictData(d, timeOffsetHours));
  }, [districts, timeOffsetHours]);

  const effectiveOsintReports = useMemo(() => {
    return interpolateOsintReports(osintReports, timeOffsetHours);
  }, [osintReports, timeOffsetHours]);

  // Calculate highest risk districts
  const topCriticalDistricts = useMemo(() => {
    return [...effectiveDistricts]
      .sort((a, b) => {
        const riskA = Math.max(
          a.properties.probabilities.p_flood,
          a.properties.probabilities.p_landslide,
          a.properties.probabilities.p_cyclone,
          a.properties.probabilities.p_heat
        );
        const riskB = Math.max(
          b.properties.probabilities.p_flood,
          b.properties.probabilities.p_landslide,
          b.properties.probabilities.p_cyclone,
          b.properties.probabilities.p_heat
        );
        return riskB - riskA;
      })
      .slice(0, 3);
  }, [effectiveDistricts]);

  // Aggregate Hospital ICU capacity
  const hospitalStats = useMemo(() => {
    const totalIcu = hospitals.reduce((acc, h) => acc + h.icu.total, 0);
    const vacantIcu = hospitals.reduce((acc, h) => acc + h.icu.available, 0);
    const totalTrauma = hospitals.reduce((acc, h) => acc + h.trauma.total, 0);
    const vacantTrauma = hospitals.reduce((acc, h) => acc + h.trauma.available, 0);
    const percentIcu = totalIcu > 0 ? Math.round((vacantIcu / totalIcu) * 100) : 0;
    return { totalIcu, vacantIcu, totalTrauma, vacantTrauma, percentIcu };
  }, [hospitals]);

  // Aggregate Shelter occupancy
  const shelterStats = useMemo(() => {
    const totalOccupancy = safeZones.reduce((acc, s) => acc + s.current_occupancy, 0);
    const totalCap = safeZones.reduce((acc, s) => acc + s.capacity_max, 0);
    return { totalOccupancy, totalCap, count: safeZones.length };
  }, [safeZones]);

  // Aggregate Active Distress count
  const totalTrapped = useMemo(() => {
    return effectiveOsintReports.reduce((acc, r) => acc + (r.people_trapped || 1), 0);
  }, [effectiveOsintReports]);

  const handleDistrictJump = (d: DistrictHazardFeature) => {
    flyTo(d.geometry.coordinates[1], d.geometry.coordinates[0], 9);
    setSelectedDistrict(d);
  };

  return (
    <div className="absolute top-16 left-16 max-w-[calc(100vw-410px)] z-20 pointer-events-none flex flex-wrap items-center gap-2 font-mono text-xs">
      {/* Left Group: DEFCON Badge & Top Threat District Jump Pills */}
      <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* DEFCON Status Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg tactical-glass border border-rose-500/40 text-slate-100 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <span className="font-bold text-[11px] text-rose-300 tracking-wider">
            DEFCON-2 HADR
          </span>
          <span className="text-[10px] text-slate-400 pl-1 border-l border-slate-700">
            {effectiveDistricts.filter((d) => d.properties.composite_risk_level === 'CRITICAL').length} CRIT /{' '}
            {effectiveDistricts.filter((d) => d.properties.composite_risk_level === 'HIGH').length} HIGH
          </span>
        </div>

        {/* Dynamic Timeline Phase Stamp */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg tactical-glass border shadow-lg text-[10px] font-bold ${timelineInfo.stageBadgeColor}`}>
          <span>{timelineInfo.badgeIcon}</span>
          <span>{timelineInfo.stageLabel}</span>
          <span className="opacity-80 font-normal">({timelineInfo.formattedDate})</span>
        </div>

        {/* Priority Hotspot Quick-Jump Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider px-1">
            Focus:
          </span>
          {topCriticalDistricts.map((d) => {
            const maxRisk = Math.round(
              Math.max(
                d.properties.probabilities.p_flood,
                d.properties.probabilities.p_landslide,
                d.properties.probabilities.p_cyclone,
                d.properties.probabilities.p_heat
              )
            );
            const hazardIcon =
              d.properties.probabilities.p_landslide >= d.properties.probabilities.p_flood
                ? '⛰️'
                : '🌊';

            return (
              <button
                key={d.properties.district_id}
                onClick={() => handleDistrictJump(d)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg tactical-glass border border-slate-700/80 hover:border-cyan-400 hover:bg-cyan-950/30 text-slate-200 transition-all shadow-md group"
                title={`Fly to ${d.properties.name}, ${d.properties.state}`}
              >
                <span>{hazardIcon}</span>
                <span className="font-bold tracking-wide uppercase text-[10px] group-hover:text-cyan-300">
                  {d.properties.name}
                </span>
                <span
                  className={`text-[9px] font-bold px-1 rounded ${
                    maxRisk >= 75
                      ? 'bg-rose-500/30 text-rose-300'
                      : maxRisk >= 50
                      ? 'bg-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {maxRisk}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Group: Live Telemetry Summary Chips & Visualization Mode Switcher */}
      <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* ICU Reserve Counter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg tactical-glass border border-cyan-500/30 text-slate-200 shadow-md">
          <span className="text-cyan-400">🏥</span>
          <span className="text-[10px] text-slate-400 uppercase">ICU:</span>
          <span className="font-bold text-cyan-300">
            {hospitalStats.vacantIcu}/{hospitalStats.totalIcu}
          </span>
          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded">
            {hospitalStats.percentIcu}% free
          </span>
        </div>

        {/* Evacuation Shelters Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg tactical-glass border border-emerald-500/30 text-slate-200 shadow-md">
          <span className="text-emerald-400">⛺</span>
          <span className="text-[10px] text-slate-400 uppercase">Evac:</span>
          <span className="font-bold text-emerald-300">
            {shelterStats.totalOccupancy.toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-400">
            / {shelterStats.count} Shelters
          </span>
        </div>

        {/* OSINT Distress Counter */}
        {totalTrapped > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg tactical-glass border border-rose-500/40 text-rose-300 shadow-md">
            <span className="animate-pulse">🆘</span>
            <span className="font-bold">{totalTrapped} Trapped</span>
          </div>
        )}

        {/* Case Studies Modal Trigger */}
        <button
          onClick={() => setCaseStudiesModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-900/60 to-rose-900/60 border border-amber-500/50 hover:border-amber-400 text-amber-200 font-bold transition-all shadow-lg hover:scale-105"
          title="Inspect Wayanad, Chamoli, and Chennai avoidable disaster simulations"
        >
          <span>📖</span>
          <span className="text-[10px] tracking-wide uppercase">Avoidable Disaster Case Studies</span>
        </button>

        {/* View Mode Toggle Pill */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900/90 border border-slate-700/80">
          <button
            onClick={() => setVizMode('HYBRID')}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              vizMode === 'HYBRID'
                ? 'bg-cyan-500/30 text-cyan-300 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Show both WebGL Heatmap and Tactical Pins"
          >
            🎛️ Hybrid
          </button>
          <button
            onClick={() => setVizMode('HEATMAP')}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              vizMode === 'HEATMAP'
                ? 'bg-amber-500/30 text-amber-300 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Continuous WebGL Hazard & Distress Heatmap"
          >
            🔥 Heatmap
          </button>
          <button
            onClick={() => setVizMode('PINS')}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              vizMode === 'PINS'
                ? 'bg-emerald-500/30 text-emerald-300 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tactical Symbology Pins Only"
          >
            📌 Pins
          </button>
        </div>
      </div>
    </div>
  );
};
