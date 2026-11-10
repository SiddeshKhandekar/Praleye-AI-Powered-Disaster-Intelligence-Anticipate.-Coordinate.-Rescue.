import React, { useMemo } from 'react';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import {
  ShieldAlert,
  Radio,
  Hospital,
  Users,
  Home,
  CloudRain,
  Waves,
  Mountain,
  Thermometer,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Printer,
  X,
  FileText,
  Activity,
  Send,
  ExternalLink
} from 'lucide-react';

export const GovtExecutiveAnalyticsModal: React.FC = () => {
  const {
    isGovtAnalyticsOpen,
    setGovtAnalyticsOpen,
    districts,
    osintReports,
    hospitals,
    safeZones,
    forces,
    setAlertModalOpen,
    setTriageModalOpen,
    flyTo,
    setSelectedDistrict
  } = usePraleyeStore();

  if (!isGovtAnalyticsOpen) return null;

  // Aggregate Metrics
  const criticalDistricts = districts.filter(
    (d) => d.properties.composite_risk_level === 'CRITICAL'
  );
  const highDistricts = districts.filter(
    (d) => d.properties.composite_risk_level === 'HIGH'
  );
  const moderateDistricts = districts.filter(
    (d) => d.properties.composite_risk_level === 'MODERATE'
  );

  const totalPopulationAtRisk = [...criticalDistricts, ...highDistricts].reduce(
    (acc, d) => acc + d.properties.population,
    0
  );

  const totalIcuBeds = hospitals.reduce((acc, h) => acc + h.icu.total, 0);
  const availIcuBeds = hospitals.reduce((acc, h) => acc + h.icu.available, 0);
  const totalTraumaBeds = hospitals.reduce((acc, h) => acc + h.trauma.total, 0);
  const availTraumaBeds = hospitals.reduce((acc, h) => acc + h.trauma.available, 0);
  const icuSaturationPct = Math.round(
    ((totalIcuBeds - availIcuBeds) / (totalIcuBeds || 1)) * 100
  );

  const totalShelterCap = safeZones.reduce((acc, s) => acc + s.capacity_max, 0);
  const currentEvacuees = safeZones.reduce((acc, s) => acc + s.current_occupancy, 0);
  const shelterOccupancyPct = Math.round(
    (currentEvacuees / (totalShelterCap || 1)) * 100
  );

  const totalForcesPersonnel = forces.reduce(
    (acc, f) => acc + f.personnel_count,
    0
  );

  const totalTrappedCitizens = osintReports.reduce(
    (acc, r) => acc + (r.people_trapped || 1),
    0
  );

  // Top 5 Critical Hotspots
  const topThreatHotspots = [...districts]
    .sort((a, b) => {
      const riskA = Math.max(
        a.properties.probabilities.p_flood,
        a.properties.probabilities.p_landslide,
        a.properties.probabilities.p_cyclone,
        a.properties.probabilities.p_heat
      );
      const riskB = Math.max(
        b.properties.probabilities.p_flood,
        b.properties.probabilities.p_landslide,
        b.properties.probabilities.p_cyclone,
        b.properties.probabilities.p_heat
      );
      return riskB - riskA;
    })
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 top-14 z-50 bg-obsidian-950/98 backdrop-blur-2xl text-slate-100 font-mono overflow-y-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      {/* Container with Max Width for eye-pleasing presentation */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Tricolor National Banner & Header */}
        <div className="relative rounded-2xl tactical-glass-elevated border border-slate-700/80 p-5 shadow-2xl overflow-hidden">
          {/* Top Indian Tricolor Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
                🇮🇳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-wider uppercase">
                    Government of India • National Disaster Intelligence Matrix
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    CABINET SITUATION BRIEFING
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  National Disaster Management Authority (NDMA) & Integrated Defence Staff (HQ IDS)
                </p>
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <button
                onClick={() => setAlertModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/60 text-rose-200 text-xs font-bold transition-all shadow-md"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Trigger All-India Broadcast</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all"
                title="Print or Save PDF Briefing"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>

              <button
                onClick={() => setGovtAnalyticsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors"
                title="Close Briefing Hub"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: The 5 Key National Executive Vitals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Monitored Districts & Population */}
          <div className="p-4 rounded-xl tactical-glass border border-slate-800 space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
              <span>National Threat Posture</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {criticalDistricts.length + highDistricts.length} <span className="text-xs font-normal text-slate-400">Districts at Risk</span>
            </div>
            <div className="text-[11px] text-rose-400 font-bold">
              {criticalDistricts.length} Critical • {highDistricts.length} High Alert
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              Pop. Exposed: <strong className="text-slate-200">{(totalPopulationAtRisk / 100000).toFixed(1)} Lakh</strong>
            </div>
          </div>

          {/* Card 2: Grassroots SOS Distress */}
          <div className="p-4 rounded-xl tactical-glass border border-slate-800 space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
              <span>Citizen SOS Distress</span>
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-rose-400">
              {totalTrappedCitizens} <span className="text-xs font-normal text-slate-400">Civilians Trapped</span>
            </div>
            <div className="text-[11px] text-amber-300 font-bold">
              {osintReports.length} Geo-NER Incident Beacons
            </div>
            <div className="text-[10px] text-emerald-400 pt-1 border-t border-slate-800/80">
              ✓ 100% Anti-Fake Verified
            </div>
          </div>

          {/* Card 3: Healthcare & ICU Reserve */}
          <div className="p-4 rounded-xl tactical-glass border border-slate-800 space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
              <span>Apex ICU / Trauma Reserve</span>
              <Hospital className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-300">
              {availIcuBeds} <span className="text-xs font-normal text-slate-400">/ {totalIcuBeds} Free</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-bold">
              {100 - icuSaturationPct}% ICU Bed Headroom
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              Trauma Beds Free: <strong className="text-slate-200">{availTraumaBeds}</strong>
            </div>
          </div>

          {/* Card 4: Evacuees & Shelters */}
          <div className="p-4 rounded-xl tactical-glass border border-slate-800 space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
              <span>Evacuation Capacity</span>
              <Home className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300">
              {currentEvacuees.toLocaleString()} <span className="text-xs font-normal text-slate-400">Housed</span>
            </div>
            <div className="text-[11px] text-slate-300">
              {safeZones.length} Designated Relief Hubs
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              Headroom: <strong className="text-emerald-400">{(totalShelterCap - currentEvacuees).toLocaleString()} vacant</strong>
            </div>
          </div>

          {/* Card 5: HADR Forces Mobilized */}
          <div className="p-4 rounded-xl tactical-glass border border-slate-800 space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
              <span>HADR Defense Strength</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {totalForcesPersonnel.toLocaleString()} <span className="text-xs font-normal text-slate-400">Troops</span>
            </div>
            <div className="text-[11px] text-slate-300">
              {forces.length} Active Battalions / Flights
            </div>
            <div className="text-[10px] text-emerald-400 pt-1 border-t border-slate-800/80">
              NDRF, Army & IAF Standby
            </div>
          </div>
        </div>

        {/* Section 2: Two-Column Analytical Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Multi-Hazard Matrix & Hotspots Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Multi-Hazard Physical Breakdown */}
            <div className="p-5 rounded-2xl tactical-glass border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> All-India Multi-Hazard Physical Breakdown
                </span>
                <span className="text-[10px] text-slate-400">Real-Time Sensor & Hydrology Synthesis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Floods */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Waves className="w-4 h-4 text-cyan-400" /> Riverine & Flash Flood Hazard
                    </span>
                    <span className="text-[10px] font-bold text-cyan-400">
                      {districts.filter((d) => d.properties.probabilities.p_flood > 40).length} High Basins
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Monitored across Yamuna (Delhi), Mutha (Pune), Mithi (Mumbai), and Brahmaputra floodplains. Continuous river discharge and 24h precipitation tracking.
                  </p>
                </div>

                {/* Landslides */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Mountain className="w-4 h-4 text-amber-400" /> Slope Landslide & Debris Flow
                    </span>
                    <span className="text-[10px] font-bold text-amber-400">
                      {districts.filter((d) => d.properties.probabilities.p_landslide > 30).length} Hill Corridors
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Soil saturation threshold (&gt;0.35 m³/m³) integrated with high slope degrees (&gt;30°) across Wayanad, Idukki, Chamoli, and Shimla mountain sectors.
                  </p>
                </div>

                {/* Cyclones */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-sky-400" /> Coastal Cyclone & Storm Surge
                    </span>
                    <span className="text-[10px] font-bold text-sky-400">
                      {districts.filter((d) => d.properties.probabilities.p_cyclone > 30).length} Coastal Zones
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Bay of Bengal and Arabian Sea littoral corridors. Pressure deficit and wind gust vectors monitored for Puri, Chennai, Visakhapatnam, and Mumbai.
                  </p>
                </div>

                {/* Heatwaves */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-rose-400" /> Wet-Bulb Hyperthermia Threat
                    </span>
                    <span className="text-[10px] font-bold text-rose-400">
                      {districts.filter((d) => d.properties.probabilities.p_heat > 25).length} Heat Sectors
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Physiological survivability index synthesizing dry-bulb temperature and relative humidity across northwest plains and central arid corridors.
                  </p>
                </div>
              </div>
            </div>

            {/* Top 5 Critical Hotspots Leaderboard */}
            <div className="p-5 rounded-2xl tactical-glass border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Priority Hotspots Ranked for Cabinet Action
                </span>
                <span className="text-[10px] text-slate-400">Click district to jump map view</span>
              </div>

              <div className="space-y-2">
                {topThreatHotspots.map((d, idx) => {
                  const p = d.properties;
                  const maxRisk = Math.round(
                    Math.max(
                      p.probabilities.p_flood,
                      p.probabilities.p_landslide,
                      p.probabilities.p_cyclone,
                      p.probabilities.p_heat
                    )
                  );
                  const riskColor =
                    p.composite_risk_level === 'CRITICAL'
                      ? '#EF4444'
                      : p.composite_risk_level === 'HIGH'
                      ? '#F97316'
                      : '#F59E0B';

                  return (
                    <div
                      key={p.district_id}
                      onClick={() => {
                        setSelectedDistrict(d);
                        flyTo(d.geometry.coordinates[1], d.geometry.coordinates[0], 10);
                        setGovtAnalyticsOpen(false);
                      }}
                      className="p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:text-cyan-300">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                            <span>{p.name}</span>
                            <span className="text-slate-400 text-[10px]">({p.state})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                            <span>Pop: {p.population.toLocaleString()}</span>
                            <span>•</span>
                            <span>24h Rain: {p.weather_telemetry.rain_24h_mm.toFixed(1)}mm</span>
                            <span>•</span>
                            <span>Temp: {p.weather_telemetry.temperature_c.toFixed(1)}°C</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right font-mono text-[10px]">
                          <span className="block text-slate-400">Peak Risk</span>
                          <span className="font-bold text-sm" style={{ color: riskColor }}>
                            {maxRisk}%
                          </span>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${riskColor}20`,
                            color: riskColor,
                            border: `1px solid ${riskColor}50`
                          }}
                        >
                          {p.composite_risk_level}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live CAP Broadcast Center & Cabinet Strategic Decisions */}
          <div className="space-y-6">
            {/* Live Citizen Alert Broadcast Center */}
            <div className="p-5 rounded-2xl tactical-glass border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-400" /> Citizen Emergency Broadcast Feed
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">● Active Siren</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-bold">CAP v1.2 MULTILINGUAL SIREN</span>
                    <span className="text-slate-400">Live Channel</span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    National Disaster Cell Broadcast: Disseminating flash flood and landslide warnings across 11 official Indian languages to all citizen cellular handsets in high-risk zones.
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Protocol: ITU-T X.1303</span>
                    <span className="text-cyan-400">Cell Broadcast + SMS</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cyan-400 font-bold">OFFLINE 140-BYTE BEACON</span>
                    <span className="text-emerald-400 font-bold">Ready</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Emergency SOS mesh beacon available when cellular towers lose power or backhaul connectivity.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAlertModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/60 text-rose-200 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Radio className="w-4 h-4" /> Issue New National Broadcast →
              </button>
            </div>

            {/* Cabinet Executive Action Directives */}
            <div className="p-5 rounded-2xl tactical-glass border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Cabinet Strategic Directives
                </span>
                <span className="text-[10px] text-slate-400">Next 6–12 Hours</span>
              </div>

              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-amber-400 font-bold">01</span>
                  <span>
                    <strong>Mandatory Night Evacuation:</strong> Enforce preemptive evacuation of tea estate settlements in Wayanad and riverbanks in Pune before forecasted rainfall spikes.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-cyan-400 font-bold">02</span>
                  <span>
                    <strong>AIIMS Casualty Ring:</strong> Reserve 20% ICU bed surge capacity at AIIMS Rishikesh, Bhubaneswar, and Command Hospital Pune for rapid medical transfers.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-emerald-400 font-bold">03</span>
                  <span>
                    <strong>Dam Spillway Modulation:</strong> Coordinate staggered discharge release at Khadakwasla, Idukki, and Mullaperiyar to prevent downstream urban flash-flooding.
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center pt-1">
                Authorized by PMO / Cabinet Committee on Security (CCS) Protocol
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

