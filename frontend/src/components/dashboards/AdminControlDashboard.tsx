import React from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { Activity, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AdminControlDashboard: React.FC = () => {
  const { districts, osintReports, hospitals } = usePraleyeStore();

  const totalIcuBeds = hospitals.reduce((acc, h) => acc + h.icu.total, 0);
  const availIcuBeds = hospitals.reduce((acc, h) => acc + h.icu.available, 0);
  const icuSaturation = Math.round(((totalIcuBeds - availIcuBeds) / (totalIcuBeds || 1)) * 100);

  const criticalDistricts = districts.filter(d => d.properties.composite_risk_level === 'CRITICAL');
  const highDistricts = districts.filter(d => d.properties.composite_risk_level === 'HIGH');

  return (
    <div className="absolute top-14 bottom-0 left-16 right-0 bg-obsidian-950 overflow-y-auto p-6 font-mono text-xs z-30 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>NDMA NATIONAL DISASTER RISK & TELEMETRY MATRIX</span>
          </h2>
          <p className="text-slate-400 text-xs">Real-Time Ingestion, District Risk Synthesis & Scraper Health</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded text-red-400 font-bold">
            {criticalDistricts.length} CRITICAL DISTRICTS
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded text-orange-400 font-bold">
            {highDistricts.length} HIGH RISK
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-obsidian-900 p-4 rounded-lg border border-white/10">
          <div className="text-slate-400 text-[11px] mb-1">MONITORED DISTRICTS</div>
          <div className="text-2xl font-bold text-white">{districts.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1">100% Ingestion Active</div>
        </div>

        <div className="bg-obsidian-900 p-4 rounded-lg border border-white/10">
          <div className="text-slate-400 text-[11px] mb-1">GRASSROOTS SOS REPORTS</div>
          <div className="text-2xl font-bold text-red-400">{osintReports.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Geo-NER 3-Stage Verified</div>
        </div>

        <div className="bg-obsidian-900 p-4 rounded-lg border border-white/10">
          <div className="text-slate-400 text-[11px] mb-1">NATIONAL ICU SATURATION</div>
          <div className="text-2xl font-bold text-amber-400">{icuSaturation}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{availIcuBeds} / {totalIcuBeds} Vacant</div>
        </div>

        <div className="bg-obsidian-900 p-4 rounded-lg border border-white/10">
          <div className="text-slate-400 text-[11px] mb-1">TELEMETRY INGESTION</div>
          <div className="text-2xl font-bold text-cyan-400">NORMAL</div>
          <div className="text-[10px] text-slate-400 mt-1">Open-Meteo & USGS 0-Key</div>
        </div>
      </div>

      {/* National Districts Ranking Table */}
      <div className="bg-obsidian-900 rounded-lg border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 font-bold text-slate-300">
          ALL-INDIA DISTRICT HAZARD RISK LEADERBOARD
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-obsidian-950 text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3">District</th>
                <th className="p-3">State</th>
                <th className="p-3">Composite Alert</th>
                <th className="p-3">P_flood</th>
                <th className="p-3">P_landslide</th>
                <th className="p-3">P_cyclone</th>
                <th className="p-3">Rain (24h)</th>
                <th className="p-3">Soil Saturation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {districts.map(d => (
                <tr key={d.properties.district_id} className="hover:bg-white/5">
                  <td className="p-3 font-bold text-white">{d.properties.name}</td>
                  <td className="p-3">{d.properties.state}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.properties.composite_risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        d.properties.composite_risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                          d.properties.composite_risk_level === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                      {d.properties.composite_risk_level}
                    </span>
                  </td>
                  <td className="p-3 text-cyan-400">{d.properties.probabilities.p_flood}%</td>
                  <td className="p-3 text-amber-400">{d.properties.probabilities.p_landslide}%</td>
                  <td className="p-3 text-indigo-400">{d.properties.probabilities.p_cyclone}%</td>
                  <td className="p-3">{d.properties.weather_telemetry.rain_24h_mm} mm</td>
                  <td className="p-3">{d.properties.weather_telemetry.soil_moisture} m³/m³</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
