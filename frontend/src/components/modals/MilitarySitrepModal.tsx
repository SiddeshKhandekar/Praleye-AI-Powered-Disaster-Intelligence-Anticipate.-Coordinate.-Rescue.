import React, { useState } from 'react';
import { X, FileText, Bot, RefreshCw, Copy, Check } from 'lucide-react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { apiClient } from '../../services/apiClient';

export const MilitarySitrepModal: React.FC = () => {
  const { isSitrepModalOpen, setSitrepModalOpen, osintReports } = usePraleyeStore();

  const [loading, setLoading] = useState(false);
  const [sitrepData, setSitrepData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!isSitrepModalOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await apiClient.generateSitrep({ active_sos_count: osintReports.length });
      setSitrepData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (sitrepData?.sitrep_content) {
      navigator.clipboard.writeText(sitrepData.sitrep_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono text-xs">
      <div className="w-full max-w-2xl bg-obsidian-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-emerald-950/30">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <FileText className="w-5 h-5" />
            <span className="text-sm">HQ INTEGRATED DEFENCE STAFF (IDS) / NDMA DAILY MILITARY SITREP</span>
          </div>
          <button onClick={() => setSitrepModalOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between bg-obsidian-950 p-2.5 rounded border border-white/10">
            <div className="flex items-center space-x-2 text-slate-300">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Engine: {sitrepData ? sitrepData.engine : 'Ready for Synthesis'}</span>
            </div>
            <div className="flex items-center space-x-2">
              {sitrepData && (
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-slate-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded font-bold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Compiling SITREP...' : 'Synthesize Live SITREP'}</span>
              </button>
            </div>
          </div>

          {sitrepData ? (
            <div className="bg-obsidian-950 p-4 rounded border border-white/10 overflow-x-auto text-slate-200 whitespace-pre-wrap leading-relaxed text-[11px]">
              {sitrepData.sitrep_content}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              Click "Synthesize Live SITREP" to aggregate real-time district risk, active SOS distress clusters, and ICU bed saturation via Local Ollama / Tactical Synthesizer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
