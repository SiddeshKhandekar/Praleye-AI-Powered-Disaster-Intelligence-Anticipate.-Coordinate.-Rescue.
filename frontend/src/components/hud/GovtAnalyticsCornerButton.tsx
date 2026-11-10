import React from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { Radio } from 'lucide-react';

export const GovtAnalyticsCornerButton: React.FC = () => {
  const { isGovtAnalyticsOpen, setGovtAnalyticsOpen } = usePraleyeStore();

  return (
    <div className="fixed bottom-2 left-2 z-40 select-none">
      <button
        onClick={() => setGovtAnalyticsOpen(!isGovtAnalyticsOpen)}
        className={`relative flex flex-col items-center justify-center w-11 h-12 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 group shadow-2xl ${
          isGovtAnalyticsOpen
            ? 'bg-gradient-to-br from-amber-600/40 to-orange-600/40 text-amber-200 border-2 border-amber-400 shadow-amber-500/30 scale-105'
            : 'tactical-glass hover:bg-slate-800/90 text-slate-300 border border-slate-700/80 hover:border-cyan-400/60'
        }`}
        title="Government of India • Disaster Analytics & Live Broadcast Hub (Toggle ON/OFF)"
      >
        {/* Tricolor Indicator Line */}
        <div className="absolute top-0 inset-x-2 h-0.5 rounded-t-full bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

        {/* Center Emblem / Icon */}
        <div className="flex items-center justify-center pt-0.5">
          <span className="text-base leading-none">🇮🇳</span>
        </div>

        {/* ON / OFF Status Badge */}
        <span
          className={`text-[8px] font-mono font-bold tracking-wider mt-0.5 px-1 rounded ${
            isGovtAnalyticsOpen
              ? 'bg-amber-400 text-black'
              : 'text-slate-400 group-hover:text-cyan-300'
          }`}
        >
          {isGovtAnalyticsOpen ? 'ON' : 'HUB'}
        </span>

        {/* Active Pulse Ring when ON */}
        {isGovtAnalyticsOpen && (
          <span className="absolute -inset-1 rounded-xl border border-amber-400/60 radar-ripple pointer-events-none" />
        )}

        {/* Tooltip Hover Pill */}
        <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-obsidian-900/95 border border-slate-700 rounded-lg text-[10px] font-mono font-semibold text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl">
          <div className="font-bold text-amber-300 flex items-center gap-1">
            <span>🇮🇳</span> National Executive Analytics Hub
          </div>
          <div className="text-[9px] text-slate-400">
            Click to toggle {isGovtAnalyticsOpen ? 'OFF' : 'ON'} full GoI report & broadcast
          </div>
        </span>
      </button>
    </div>
  );
};

