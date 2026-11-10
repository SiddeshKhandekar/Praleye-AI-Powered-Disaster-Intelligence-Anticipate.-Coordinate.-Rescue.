import React, { useState } from 'react';
import { X, Send, BellRing, CheckCircle2 } from 'lucide-react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { apiClient } from '../../services/apiClient';

export const BroadcastAlertModal: React.FC = () => {
  const { isAlertModalOpen, setAlertModalOpen, districts } = usePraleyeStore();

  const [districtName, setDistrictName] = useState('Pune');
  const [hazardType, setHazardType] = useState('Flood');
  const [severity, setSeverity] = useState('Severe');
  const [headline, setHeadline] = useState('Emergency Flood Evacuation Notice (NDMA SACHET)');
  const [instruction, setInstruction] = useState('Immediate evacuation to designated safe school & stadium shelters.');
  const [dispatched, setDispatched] = useState(false);
  const [xmlPreview, setXmlPreview] = useState('');

  if (!isAlertModalOpen) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const xml = await apiClient.broadcastCapAlert({
        alert_id: `ALT-${Date.now().toString().slice(-4)}`,
        district_name: districtName,
        hazard_type: hazardType,
        severity,
        headline,
        instruction
      });
      setXmlPreview(xml);
      setDispatched(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono text-xs">
      <div className="w-full max-w-lg bg-obsidian-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-amber-950/30">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <BellRing className="w-5 h-5" />
            <span className="text-sm">DISPATCH ITU CAP v1.2 & MULTILINGUAL CELL BROADCAST</span>
          </div>
          <button onClick={() => { setAlertModalOpen(false); setDispatched(false); }} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {!dispatched ? (
            <form onSubmit={handleBroadcast} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Target District</label>
                  <select
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-white"
                  >
                    {districts.map(d => (
                      <option key={d.properties.district_id} value={d.properties.name}>
                        {d.properties.name} ({d.properties.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Hazard Category</label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value)}
                    className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-white"
                  >
                    <option value="Flood">Flash Flood</option>
                    <option value="Landslide">Landslide / Mudflow</option>
                    <option value="Cyclone">Tropical Cyclone</option>
                    <option value="Seismic">Earthquake Tremor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Alert Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Public Protective Instructions</label>
                <textarea
                  rows={2}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Authorize Nationwide Broadcast (CAP v1.2 XML + SMS)</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Alert Successfully Dispatched via NDMA SACHET Protocol!</span>
              </div>
              <div className="bg-obsidian-950 p-2.5 rounded border border-white/10 max-h-48 overflow-y-auto text-[10px] text-slate-300">
                <pre>{xmlPreview}</pre>
              </div>
              <button
                onClick={() => setDispatched(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-1.5 rounded"
              >
                Broadcast Another Alert
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
