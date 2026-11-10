import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  CloudRain, 
  Waves, 
  Radio, 
  Hospital, 
  Activity, 
  Users, 
  Globe, 
  Mic, 
  MicOff 
} from 'lucide-react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { HazardLayerType } from '../../types/praleye.types';
import { VoiceCommandService } from '../../services/voiceCommandService';

const INDIAN_LANGS = [
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
];

export const TopFilterSearchBar: React.FC = () => {
  const { 
    activeLayers, 
    toggleLayer, 
    flyTo, 
    districts, 
    language, 
    setLanguage, 
    setMode, 
    setSitrepModalOpen, 
    setAlertModalOpen 
  } = usePraleyeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [istTime, setIstTime] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceService, setVoiceService] = useState<VoiceCommandService | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setIstTime(new Intl.DateTimeFormat('en-IN', options).format(now) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const service = new VoiceCommandService((intent) => {
      if (intent.action === 'SWITCH_MODE' && intent.target) {
        setMode(intent.target as any);
      } else if (intent.action === 'NAVIGATE' && intent.value) {
        flyTo(intent.value.lat, intent.value.lon, 10);
      } else if (intent.action === 'OPEN_SITREP') {
        setSitrepModalOpen(true);
      } else if (intent.action === 'OPEN_ALERT') {
        setAlertModalOpen(true);
      }
    }, language === 'hi' ? 'hi-IN' : 'en-IN');
    setVoiceService(service);
  }, [language, setMode, flyTo, setSitrepModalOpen, setAlertModalOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const match = districts.find(d => 
      d.properties.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.properties.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      flyTo(match.geometry.coordinates[1], match.geometry.coordinates[0], 11);
      setSearchQuery('');
    }
  };

  const toggleMic = () => {
    if (voiceService) {
      const active = voiceService.toggleListening();
      setIsListening(active);
    }
  };

  const layers: { id: HazardLayerType; label: string; icon: any }[] = [
    { id: 'WEATHER_RADAR', label: 'Rain', icon: CloudRain },
    { id: 'FLOOD_GRID', label: 'Flood Grid', icon: Waves },
    { id: 'SOS_BEACONS', label: 'SOS Feed', icon: Radio },
    { id: 'HOSPITAL_NODES', label: 'Hospitals', icon: Hospital },
    { id: 'DEFENSE_FORCES', label: 'Forces', icon: Users },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 h-14 tactical-glass z-20 flex items-center justify-between px-4 border-b border-white/10 select-none">
      {/* Brand & Threat Level */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-red-500 font-extrabold tracking-wider font-mono text-lg">
          <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
          <span>PRALEYE</span>
        </div>
        <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-white/10 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{istTime}</span>
        </div>
        <div className="hidden lg:flex items-center bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-red-400 font-semibold">
          DEFCON-2 HADR ACTIVE
        </div>
      </div>

      {/* Center Search Omnibox */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            data-testid="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search City, District, PIN (e.g. Pune, Wayanad, 411011)..."
            className="w-full bg-obsidian-900/90 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
          />
        </div>
      </form>

      {/* Layer Toggle Pills & Controls */}
      <div className="flex items-center space-x-2">
        <div className="hidden xl:flex items-center space-x-1.5 mr-2">
          {layers.map(layer => {
            const Icon = layer.icon;
            const isActive = activeLayers.has(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* 11-Language Selector */}
        <div className="flex items-center bg-obsidian-900 border border-white/10 rounded px-2 py-1 text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
          >
            {INDIAN_LANGS.map(l => (
              <option key={l.code} value={l.code} className="bg-obsidian-900 text-slate-200">
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Hands-Free Voice Mic */}
        <button
          onClick={toggleMic}
          className={`p-1.5 rounded border transition-colors ${
            isListening 
              ? 'bg-red-500/30 border-red-500 text-red-400 animate-pulse' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
          title="Voice Command (11 Indian Languages)"
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
