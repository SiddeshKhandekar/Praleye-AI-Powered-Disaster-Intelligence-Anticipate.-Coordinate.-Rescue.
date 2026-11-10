import React from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { Shield, Send, Users, Radio } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const GovForcesDashboard: React.FC = () => {
  const { forces, osintReports } = usePraleyeStore();

  return (
    <div className="absolute top-14 bottom-0 left-16 right-0 bg-obsidian-950 overflow-y-auto p-6 font-mono text-xs z-30 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>UNIFIED DEFENSE & HADR FORCES DEPLOYMENT COMMAND</span>
          </h2>
          <p className="text-slate-400 text-xs">Indian Army (HADR), IAF SAR, NDRF Battalions & State Fire Divisions</p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded text-emerald-400 font-bold">
          {forces.length} ACTIVE BATTALIONS / FLIGHTS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Forces Fleet */}
        <div className="bg-obsidian-900 rounded-lg border border-white/10 p-4 space-y-3">
          <div className="text-slate-300 font-bold flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>BATTALION OPERATIONAL ASSETS</span>
          </div>
          <div className="space-y-3">
            {forces.map(f => (
              <div key={f.id} className="bg-obsidian-950 p-3 rounded border border-white/10 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{f.unit_name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    f.status === 'DEPLOYED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">Branch: <span className="text-slate-200">{f.branch}</span> | Strength: <span className="text-white">{f.personnel_count} Troops</span></div>
                <div className="text-slate-400 text-[10px]">Equipment: {f.equipment}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live SOS Mission Dispatch Board */}
        <div className="bg-obsidian-900 rounded-lg border border-white/10 p-4 space-y-3">
          <div className="text-slate-300 font-bold flex items-center space-x-2">
            <Radio className="w-4 h-4 text-red-400" />
            <span>GRASSROOTS SOS DISPATCH QUEUE</span>
          </div>
          <div className="space-y-3">
            {osintReports.map(r => (
              <div key={r.id} className="bg-obsidian-950 p-3 rounded border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-400">{r.extracted_location}</span>
                  <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    {r.urgency_label}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans line-clamp-2">{r.raw_text}</p>
                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <span className="text-slate-400 text-[10px]">👥 {r.people_trapped} People Stranded</span>
                  <button
                    onClick={() => apiClient.dispatchForce(forces[0]?.id || 'UNIT-01', r.lat, r.lon)}
                    className="flex items-center space-x-1 bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                  >
                    <Send className="w-3 h-3" />
                    <span>Assign Battalion</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

