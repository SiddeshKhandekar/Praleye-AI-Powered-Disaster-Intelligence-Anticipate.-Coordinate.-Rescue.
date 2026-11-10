import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  HeartHandshake, 
  Building2,
  Navigation,
  FileCheck
} from 'lucide-react';
import { HISTORICAL_DISASTER_CASE_STUDIES, DisasterAnalysis } from '../../services/historicalDisasterStudies';
import { usePraleyeStore } from '../../store/usePraleyeStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DisasterCaseStudiesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedCase, setSelectedCase] = useState<DisasterAnalysis>(HISTORICAL_DISASTER_CASE_STUDIES[0]);
  const { flyTo, setMode } = usePraleyeStore();

  if (!isOpen) return null;

  const handleSimulateInMap = (disaster: DisasterAnalysis) => {
    flyTo(disaster.lat, disaster.lon, 11);
    if (disaster.hazard_type === 'LANDSLIDE' || disaster.hazard_type === 'FLASH_FLOOD') {
      setMode('MODE_1_PREDICTION');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono text-xs">
      <div className="w-full max-w-4xl bg-obsidian-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-cyan-950/40">
          <div className="flex items-center space-x-2.5 text-cyan-400 font-bold">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-sm">HISTORICAL DISASTER POST-MORTEM & PRALEYE PREVENTION BLUEPRINTS</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: Disaster Selector */}
          <div className="w-full md:w-80 border-r border-white/10 bg-obsidian-950/60 p-3 space-y-2 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1">REAL-WORLD INDIAN CASE STUDIES</div>
            {HISTORICAL_DISASTER_CASE_STUDIES.map(item => {
              const isSelected = selectedCase.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500/60 text-white shadow-md shadow-cyan-950/50'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200 text-xs">{item.location.split(',')[0]}</span>
                    <span className="text-[10px] text-cyan-400 font-bold">{item.year}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{item.disaster_name}</div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[9px]">
                    <span className="text-red-400 font-bold">⚠ {item.casualties} Casualties</span>
                    <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">{item.hazard_type}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: In-Depth Breakdown & Praleye Prevention Lifecycle */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* Disaster Overview */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{selectedCase.disaster_name}</h2>
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px] mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedCase.location}, {selectedCase.state}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSimulateInMap(selectedCase)}
                  className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Inspect on Map</span>
                </button>
              </div>

              <p className="text-slate-300 text-xs font-sans leading-relaxed bg-obsidian-950 p-3 rounded border border-white/10">
                {selectedCase.damage_summary}
              </p>
            </div>

            {/* Why Traditional Systems Failed */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-red-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>WHAT WENT WRONG: TRADITIONAL BOTTLENECKS</span>
              </div>
              <div className="space-y-1.5">
                {selectedCase.actual_bottlenecks.map((bottleneck, i) => (
                  <div key={i} className="flex items-start space-x-2 bg-red-950/20 border border-red-500/20 p-2.5 rounded text-red-200 text-[11px]">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{bottleneck}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How PRALEYE Prevents and Coordinates the Rescue */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>THE PRALEYE 3-PHASE PREVENTION & RESCUE ARCHITECTURE</span>
              </div>

              {/* Phase 1: Pre-Disaster Anticipate */}
              <div className="bg-obsidian-950 p-3.5 rounded-lg border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>PHASE 1: ANTICIPATE & EARLY FORESIGHT</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    +{selectedCase.praleye_prevention_lifecycle.phase_1_anticipate.lead_time_hours} Hours Lead Time
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-sans">
                  {selectedCase.praleye_prevention_lifecycle.phase_1_anticipate.action}
                </p>
                <div className="text-[10px] text-slate-400 bg-white/5 p-2 rounded">
                  <span className="text-amber-400 font-bold">Telemetry Trigger: </span>
                  {selectedCase.praleye_prevention_lifecycle.phase_1_anticipate.telemetry_trigger}
                </div>
              </div>

              {/* Phase 2: During-Disaster Coordinate */}
              <div className="bg-obsidian-950 p-3.5 rounded-lg border border-cyan-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                  <HeartHandshake className="w-4 h-4 text-cyan-400" />
                  <span>PHASE 2: COORDINATE & CITIZEN SAFEGUARDING</span>
                </div>
                <p className="text-slate-300 text-xs font-sans">
                  {selectedCase.praleye_prevention_lifecycle.phase_2_coordinate.action}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-cyan-400 font-bold">OSINT Rescue Extraction: </span>
                    {selectedCase.praleye_prevention_lifecycle.phase_2_coordinate.osint_response}
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-emerald-400 font-bold">Evacuation Corridors: </span>
                    {selectedCase.praleye_prevention_lifecycle.phase_2_coordinate.safeguard_routing}
                  </div>
                </div>
              </div>

              {/* Phase 3: Post-Disaster Automated Hospital Triage */}
              <div className="bg-obsidian-950 p-3.5 rounded-lg border border-emerald-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>PHASE 3: RESCUE TRIAGE & ZERO-TOUCH BED ALLOCATION</span>
                </div>
                <p className="text-slate-300 text-xs font-sans">
                  {selectedCase.praleye_prevention_lifecycle.phase_3_rescue_triage.action}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-emerald-400 font-bold">Hospital Network: </span>
                    {selectedCase.praleye_prevention_lifecycle.phase_3_rescue_triage.hospital_network}
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-cyan-400 font-bold">Bed Allocation Protocol: </span>
                    {selectedCase.praleye_prevention_lifecycle.phase_3_rescue_triage.bed_allocation}
                  </div>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg flex items-center justify-between text-emerald-300">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-xs">ESTIMATED LIVES PRESERVED WITH PRALEYE:</span>
                </div>
                <span className="font-bold text-sm text-white bg-emerald-600 px-3 py-1 rounded">
                  {selectedCase.praleye_prevention_lifecycle.phase_3_rescue_triage.lives_saved_estimate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
