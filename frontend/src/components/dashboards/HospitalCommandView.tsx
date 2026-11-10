import React from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { Building2, Stethoscope, AlertOctagon } from 'lucide-react';

export const HospitalCommandView: React.FC = () => {
  const { hospitals, setTriageModalOpen } = usePraleyeStore();

  return (
    <div className="absolute top-14 bottom-16 left-16 right-0 bg-obsidian-950/95 overflow-y-auto p-6 font-mono text-xs z-10 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>NATIONAL HOSPITAL NETWORK & TERTIARY TRIAGE MATRIX</span>
          </h2>
          <p className="text-slate-400 text-xs">AIIMS, Armed Forces Command Hospitals & Apex Private Networks</p>
        </div>
        <button
          onClick={() => setTriageModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded font-bold flex items-center space-x-2"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Batch Casualty Triage</span>
        </button>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitals.map(h => (
          <div key={h.id} className="bg-obsidian-900 rounded-lg border border-white/10 p-4 space-y-3">
            <div className="flex justify-between items-start pb-2 border-b border-white/10">
              <div>
                <div className="font-bold text-white text-[13px]">{h.name}</div>
                <div className="text-slate-400 text-[10px]">{h.chain_type} Network</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                h.structural_status === 'OPERATIONAL' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {h.structural_status}
              </span>
            </div>

            {/* Bed Vacancy Gauges */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">ICU Beds:</span>
                <span className="font-bold text-cyan-400">{h.icu.available} / {h.icu.total} Vacant</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Trauma Emergency:</span>
                <span className="font-bold text-emerald-400">{h.trauma.available} / {h.trauma.total} Vacant</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Ventilator Beds:</span>
                <span className="font-bold text-amber-400">{h.ventilator.available} / {h.ventilator.total} Vacant</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Burn Unit:</span>
                <span className="font-bold text-orange-400">{h.burn.available} / {h.burn.total} Vacant</span>
              </div>
            </div>

            {/* Critical Telemetry */}
            <div className="bg-obsidian-950 p-2.5 rounded border border-white/5 space-y-1 text-[10px] text-slate-300">
              <div>Liquid Medical O₂: <span className="text-white font-bold">{h.oxygen_reserve_hours} Hours</span></div>
              <div>Backup Generator Fuel: <span className="text-white font-bold">{h.backup_generator_fuel_hours} Hours</span></div>
              <div>IAF Helipad Clearance: <span className={h.helipad_available ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {h.helipad_available ? 'Available (CASEVAC Ready)' : 'None'}
              </span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
