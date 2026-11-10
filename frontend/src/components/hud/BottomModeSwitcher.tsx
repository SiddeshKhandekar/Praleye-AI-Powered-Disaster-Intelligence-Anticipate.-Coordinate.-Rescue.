import React, { useState, useEffect } from 'react';
import {
  CloudLightning,
  Radio,
  ShieldCheck,
  Stethoscope,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Clock,
  Sparkles,
  History,
  Activity
} from 'lucide-react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { OperationalMode } from '../../types/praleye.types';
import { getTimelineState } from '../../services/timelineTransitionService';

export const BottomModeSwitcher: React.FC = () => {
  const { mode, setMode, timeOffsetHours, setTimeOffsetHours } = usePraleyeStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const timelineInfo = getTimelineState(timeOffsetHours);

  // Auto-play animation through timeline
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeOffsetHours(
        timeOffsetHours >= 72 ? -72 : timeOffsetHours + 6
      );
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying, timeOffsetHours, setTimeOffsetHours]);

  const modes: { id: OperationalMode; label: string; icon: any; color: string }[] = [
    { id: 'MODE_1_PREDICTION', label: '1. PRE-DISASTER PREDICT', icon: CloudLightning, color: 'text-amber-400' },
    { id: 'MODE_2_OSINT_RESCUE', label: '2. LIVE OSINT RESCUE', icon: Radio, color: 'text-red-400' },
    { id: 'MODE_3_SAFE_ZONES', label: '3. SAFE ZONES & EVAC', icon: ShieldCheck, color: 'text-emerald-400' },
    { id: 'MODE_4_TRIAGE', label: '4. HOSPITAL TRIAGE', icon: Stethoscope, color: 'text-cyan-400' },
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 h-16 tactical-glass z-20 flex flex-col md:flex-row items-center justify-between px-4 border-t border-white/10 select-none">
      {/* 
        Left Group: 4 Operational Modes.
        NOTE: ml-16 / pl-2 gives ample clearance for the Government of India Executive Analytics Hub button 
        situated at fixed bottom-2 left-2, preventing any overlap!
      */}
      <div className="flex items-center space-x-1 sm:space-x-2 py-1 pl-14 sm:pl-16">
        {modes.map(m => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              data-testid={`mode-btn-${m.id}`}
              onClick={() => setMode(m.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                isActive
                  ? 'bg-white/15 border border-white/30 text-white shadow-lg shadow-black/40 scale-[1.02]'
                  : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? m.color : 'text-slate-400'}`} />
              <span className="hidden xl:inline">{m.label}</span>
              <span className="inline xl:hidden font-mono">{m.label.split('.')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* 
        Right Group: Multi-Phase Disaster Time Machine Scrubber (Past, Present Live, Future Prediction)
        with real-time dates, time, and dynamic phase badges.
      */}
      <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end py-1">
        {/* Phase Indicator Badges (Past, Present, Future) */}
        <div className="hidden lg:flex items-center space-x-1.5">
          {/* 1. Previous Data Badge */}
          <button
            onClick={() => setTimeOffsetHours(-48)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              timelineInfo.stage === 'PAST'
                ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/60 border border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Jump to Previous Historical Replay (-48h)"
          >
            <History className="w-3 h-3 text-amber-400" />
            <span>PREVIOUS DATA</span>
          </button>

          {/* 2. Present Live Telemetry Badge */}
          <button
            onClick={() => setTimeOffsetHours(0)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              timelineInfo.stage === 'PRESENT'
                ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/60 border border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Jump to Present Live Telemetry (Now)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>PRESENT LIVE</span>
          </button>

          {/* 3. Future AI Predictions Badge */}
          <button
            onClick={() => setTimeOffsetHours(48)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              timelineInfo.stage === 'FUTURE'
                ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/60 border border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Jump to Future AI Predictions (+48h)"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>FUTURE PREDICTIONS</span>
          </button>
        </div>

        {/* Date & Time Real-World Display Box */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-obsidian-900/90 border border-slate-700/80 font-mono text-[11px] shadow-inner">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-200 font-bold whitespace-nowrap">{timelineInfo.formattedDate}</span>
          <span className="text-slate-500">|</span>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300 font-medium whitespace-nowrap">{timelineInfo.formattedTime.slice(0, 5)}</span>
        </div>

        {/* Timeline Slider with Play / Reset controls */}
        <div className="flex items-center space-x-2 bg-obsidian-900/90 border border-white/10 px-3 py-1 rounded-lg shadow-md">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded text-slate-300 hover:text-cyan-400 transition-colors"
            title={isPlaying ? 'Pause Auto-Scrub' : 'Play Timeline Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Reset to Now */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setTimeOffsetHours(0);
            }}
            className="p-1 rounded text-slate-400 hover:text-emerald-400 transition-colors"
            title="Reset Timeline to Live Present (0h)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Range Slider Lever */}
          <div className="relative flex items-center">
            <input
              type="range"
              min="-72"
              max="72"
              step="6"
              value={timeOffsetHours}
              onChange={(e) => {
                setIsPlaying(false);
                setTimeOffsetHours(parseInt(e.target.value, 10));
              }}
              className="w-24 sm:w-36 md:w-44 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 transition-all"
              title={`Scrub timeline (-72h past to +72h forecast): currently at ${timeOffsetHours > 0 ? '+' : ''}${timeOffsetHours}h`}
            />
          </div>

          {/* Dynamic Active Phase Chip */}
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border min-w-16 text-center ${timelineInfo.stageBadgeColor}`}
          >
            {timeOffsetHours === 0 ? 'LIVE NOW' : timeOffsetHours > 0 ? `+${timeOffsetHours}h FCST` : `${timeOffsetHours}h PAST`}
          </span>
        </div>
      </div>
    </footer>
  );
};
