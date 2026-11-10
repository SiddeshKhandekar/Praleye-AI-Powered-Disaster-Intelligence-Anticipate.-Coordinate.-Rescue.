import React from 'react';
import {
  CloudLightning,
  Radio,
  ShieldCheck,
  Stethoscope,
  Play,
  RotateCcw
} from 'lucide-react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { OperationalMode } from '../../types/praleye.types';

export const BottomModeSwitcher: React.FC = () => {
  const { mode, setMode, timeOffsetHours, setTimeOffsetHours } = usePraleyeStore();

  const modes: { id: OperationalMode; label: string; icon: any; color: string }[] = [
    { id: 'MODE_1_PREDICTION', label: '1. PRE-DISASTER PREDICT', icon: CloudLightning, color: 'text-amber-400' },
    { id: 'MODE_2_OSINT_RESCUE', label: '2. LIVE OSINT RESCUE', icon: Radio, color: 'text-red-400' },
    { id: 'MODE_3_SAFE_ZONES', label: '3. SAFE ZONES & EVAC', icon: ShieldCheck, color: 'text-emerald-400' },
    { id: 'MODE_4_TRIAGE', label: '4. HOSPITAL TRIAGE', icon: Stethoscope, color: 'text-cyan-400' },
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 h-16 tactical-glass z-20 flex flex-col md:flex-row items-center justify-between px-4 border-t border-white/10 select-none">
      {/* 4 Operational Modes */}
      <div className="flex items-center space-x-1 sm:space-x-2 py-1">
        {modes.map(m => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              data-testid={`mode-btn-${m.id}`}
              onClick={() => setMode(m.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-semibold tracking-wider transition-all ${isActive
                  ? 'bg-white/10 border border-white/30 text-white shadow-lg shadow-black/40'
                  : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? m.color : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* 72-Hour Disaster Time-Machine Scrubber */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-end py-1">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400">
          <RotateCcw className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white" onClick={() => setTimeOffsetHours(0)} />
          <span className="text-[11px] font-semibold tracking-wider text-slate-300">TIMELINE:</span>
        </div>
        <div className="flex items-center space-x-2 bg-obsidian-900/90 border border-white/10 px-3 py-1 rounded">
          <input
            type="range"
            min="-24"
            max="72"
            step="6"
            value={timeOffsetHours}
            onChange={(e) => setTimeOffsetHours(parseInt(e.target.value, 10))}
            className="w-28 sm:w-44 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span className="font-mono text-xs font-bold text-cyan-400 w-16 text-right">
            {timeOffsetHours === 0 ? 'NOW' : timeOffsetHours > 0 ? `+${timeOffsetHours}h` : `${timeOffsetHours}h`}
          </span>
        </div>
      </div>
    </footer>
  );
};
