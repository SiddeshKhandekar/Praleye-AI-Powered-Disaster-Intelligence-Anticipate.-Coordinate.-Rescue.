import React, { useState } from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { HazardLayerType } from '../../types/praleye.types';

export const MapLegendControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeLayers, toggleLayer, vizMode, setVizMode } = usePraleyeStore();

  const layerItems: { id: HazardLayerType; label: string; icon: string; color: string }[] = [
    { id: 'FLOOD_GRID', label: 'Hazard Centroids', icon: '⚠️', color: '#F97316' },
    { id: 'SOS_BEACONS', label: 'Distress Beacons (SOS)', icon: '🆘', color: '#EF4444' },
    { id: 'HOSPITAL_NODES', label: 'Hospital Network & Beds', icon: '🏥', color: '#06B6D4' },
    { id: 'SAFE_SHELTERS', label: 'Evacuation Shelters', icon: '⛺', color: '#10B981' },
    { id: 'DEFENSE_FORCES', label: 'NDRF & Armed Forces', icon: '🪖', color: '#F59E0B' },
  ];

  return (
    <div className="absolute left-16 bottom-20 z-30 flex flex-col items-start font-mono text-xs select-none">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg tactical-glass border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 transition-all shadow-xl group"
      >
        <span className="text-sm">🗺️</span>
        <span className="font-bold tracking-wider text-[11px] uppercase">Map Symbology & Layers</span>
        <span className="text-[10px] text-cyan-400 font-bold ml-1">
          {isOpen ? '▼' : '▲'}
        </span>
      </button>

      {/* Expanded Legend Panel */}
      {isOpen && (
        <div className="mt-2 w-80 tactical-glass-elevated border border-slate-700/80 rounded-xl p-3.5 shadow-2xl space-y-3.5 animate-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <span className="font-bold text-slate-100 tracking-wider text-[11px] uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Tactical Symbology Guide
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-100 text-xs px-1"
            >
              ✕
            </button>
          </div>

          {/* Visualization Modes */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Visualization Mode
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setVizMode('HYBRID')}
                className={`py-1 rounded text-[10px] font-bold transition-all ${
                  vizMode === 'HYBRID'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎛️ Hybrid
              </button>
              <button
                onClick={() => setVizMode('HEATMAP')}
                className={`py-1 rounded text-[10px] font-bold transition-all ${
                  vizMode === 'HEATMAP'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔥 Heatmap
              </button>
              <button
                onClick={() => setVizMode('PINS')}
                className={`py-1 rounded text-[10px] font-bold transition-all ${
                  vizMode === 'PINS'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📌 Pins Only
              </button>
            </div>
          </div>

          {/* Risk Level Color Bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Vulnerability Risk Gradient
            </span>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 via-orange-500 to-rose-600" />
            <div className="flex justify-between text-[9px] text-slate-400 pt-0.5">
              <span className="text-emerald-400">Low (&lt;25%)</span>
              <span className="text-amber-400">Mod (25-50%)</span>
              <span className="text-orange-400">High (50-75%)</span>
              <span className="text-rose-400 font-bold">Crit (&gt;75%)</span>
            </div>
          </div>

          {/* Active Layer Toggles & Symbols */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Active Layers & Pin Types
            </span>
            <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              {layerItems.map((item) => {
                const isActive = activeLayers.has(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-center justify-between p-1 rounded hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{item.icon}</span>
                      <span
                        className={`text-[11px] ${
                          isActive ? 'text-slate-200' : 'text-slate-500 line-through'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleLayer(item.id)}
                      className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Symbology Quick Note */}
          <div className="text-[9px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>Hover on any pin for sensor telemetry</span>
            <span className="text-cyan-400">MapLibre GL WebGL</span>
          </div>
        </div>
      )}
    </div>
  );
};
