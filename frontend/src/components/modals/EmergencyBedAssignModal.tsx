import React, { useState } from 'react';
import { X, Send, Stethoscope, AlertCircle } from 'lucide-react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { apiClient } from '../../services/apiClient';

export const EmergencyBedAssignModal: React.FC = () => {
  const { isTriageModalOpen, setTriageModalOpen } = usePraleyeStore();

  const [casualtyCount, setCasualtyCount] = useState(20);
  const [severity, setSeverity] = useState('TRAUMA');
  const [lat, setLat] = useState(18.5204);
  const [lon, setLon] = useState(73.8567);
  const [airliftRequired, setAirliftRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isTriageModalOpen) return null;

  const handleSolveTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiClient.autoAssignBeds({
        casualty_count: casualtyCount,
        severity,
        lat,
        lon,
        airlift_required: airliftRequired
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-obsidian-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-cyan-950/30">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <Stethoscope className="w-5 h-5" />
            <span className="text-sm">AUTOMATED EMERGENCY HOSPITAL BED TRIAGE SOLVER</span>
          </div>
          <button onClick={() => setTriageModalOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-4">
          <form onSubmit={handleSolveTriage} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Casualty Count</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={casualtyCount}
                  onChange={(e) => setCasualtyCount(parseInt(e.target.value, 10))}
                  className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Triage Severity Tier</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-white"
                >
                  <option value="TRAUMA">TRAUMA (Apex Trauma Center)</option>
                  <option value="ICU">CRITICAL ICU (Ventilator)</option>
                  <option value="BURN">BURN SPECIALTY UNIT</option>
                  <option value="GENERAL">MODERATE GENERAL WARD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Disaster Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Disaster Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lon}
                  onChange={(e) => setLon(parseFloat(e.target.value))}
                  className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="airlift"
                checked={airliftRequired}
                onChange={(e) => setAirliftRequired(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <label htmlFor="airlift" className="text-slate-300">
                IAF Mi-17 / ALH Airlift Required (Helipad Mandatory)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Solving Optimal Hospital Graph...' : 'Compute Optimal Bed Allocation'}</span>
            </button>
          </form>

          {/* Allocation Result Matrix */}
          {result && (
            <div className="bg-obsidian-950 p-3 rounded border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-b border-white/10 pb-1">
                <span>ASSIGNMENT MANIFEST ({result.assigned_casualties} / {result.total_casualties} Assigned)</span>
                <span>{result.multi_hospital_split ? 'MULTI-HOSPITAL BATCH SPLIT' : 'SINGLE HOSPITAL'}</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.allocations.map((alloc: any, idx: number) => (
                  <div key={idx} className="bg-white/5 p-2 rounded flex justify-between items-center text-[11px]">
                    <div>
                      <div className="font-bold text-white">{alloc.hospital_name}</div>
                      <div className="text-slate-400">
                        Distance: {alloc.distance_km} km | ETA: {alloc.eta_minutes} mins {alloc.helipad_available ? '🚁 Helipad Ready' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                        {alloc.assigned_patients} BEDS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

