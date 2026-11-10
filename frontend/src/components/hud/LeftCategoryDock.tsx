import React from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  ShieldAlert, 
  Building2, 
  Flame, 
  Anchor, 
  BellRing, 
  FileText 
} from 'lucide-react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { DashboardView } from '../../types/praleye.types';

export const LeftCategoryDock: React.FC = () => {
  const { activeView, setActiveView, setAlertModalOpen, setSitrepModalOpen } = usePraleyeStore();

  const views: { id: DashboardView; label: string; icon: any }[] = [
    { id: 'COMMAND_HUD', label: 'Tactical Map', icon: Compass },
    { id: 'SUPER_ADMIN', label: 'NDMA Admin', icon: LayoutDashboard },
    { id: 'GOV_FORCES', label: 'Armed Forces / NDRF', icon: ShieldAlert },
    { id: 'HOSPITAL_NETWORK', label: 'Hospital Chains', icon: Building2 },
  ];

  return (
    <aside className="absolute top-14 bottom-16 left-0 w-14 sm:w-16 tactical-glass z-20 flex flex-col items-center py-4 justify-between border-r border-white/10 select-none">
      {/* Top Views Switcher */}
      <div className="flex flex-col items-center space-y-4">
        {views.map(v => {
          const Icon = v.icon;
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`p-2.5 rounded-lg transition-all relative group ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title={v.label}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-obsidian-900 border border-white/10 rounded text-[10px] font-semibold text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                {v.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Action Triggers */}
      <div className="flex flex-col items-center space-y-3 pt-4 border-t border-white/10">
        <button
          onClick={() => setAlertModalOpen(true)}
          className="p-2.5 rounded-lg text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all relative group"
          title="Broadcast CAP v1.2 / SMS Alert"
        >
          <BellRing className="w-5 h-5" />
          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-obsidian-900 border border-white/10 rounded text-[10px] font-semibold text-amber-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            CAP Alert Broadcast
          </span>
        </button>

        <button
          onClick={() => setSitrepModalOpen(true)}
          className="p-2.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all relative group"
          title="Daily Military SITREP"
        >
          <FileText className="w-5 h-5" />
          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-obsidian-900 border border-white/10 rounded text-[10px] font-semibold text-emerald-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            Local LLM SITREP
          </span>
        </button>
      </div>
    </aside>
  );
};
