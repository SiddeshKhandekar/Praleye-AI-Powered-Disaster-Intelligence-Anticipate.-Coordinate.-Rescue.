import React, { useEffect } from 'react';
import { usePraleyeStore } from './store/usePraleyeStore';
import { apiClient } from './services/apiClient';

// HUD Framework
import { TopFilterSearchBar } from './components/hud/TopFilterSearchBar';
import { BottomModeSwitcher } from './components/hud/BottomModeSwitcher';
import { LeftCategoryDock } from './components/hud/LeftCategoryDock';
import { RightDepthInspector } from './components/hud/RightDepthInspector';
import { TacticalMapCanvas } from './components/map/TacticalMapCanvas';
import { MapDataBriefingBar } from './components/hud/MapDataBriefingBar';
import { MapLegendControl } from './components/hud/MapLegendControl';
import { MapHoverCard } from './components/map/MapHoverCard';

// Dashboards
import { AdminControlDashboard } from './components/dashboards/AdminControlDashboard';
import { GovForcesDashboard } from './components/dashboards/GovForcesDashboard';
import { HospitalCommandView } from './components/dashboards/HospitalCommandView';

// Modals
import { EmergencyBedAssignModal } from './components/modals/EmergencyBedAssignModal';
import { BroadcastAlertModal } from './components/modals/BroadcastAlertModal';
import { MilitarySitrepModal } from './components/modals/MilitarySitrepModal';
import { DisasterCaseStudiesModal } from './components/modals/DisasterCaseStudiesModal';
import { CityWeatherDetailModal } from './components/modals/CityWeatherDetailModal';
import { MicroLocationDetailModal } from './components/modals/MicroLocationDetailModal';
import { GovtAnalyticsCornerButton } from './components/hud/GovtAnalyticsCornerButton';
import { GovtExecutiveAnalyticsModal } from './components/dashboards/GovtExecutiveAnalyticsModal';

export const App: React.FC = () => {
  const { 
    activeView, 
    setDistricts, 
    setOsintReports, 
    setHospitals, 
    setSafeZones, 
    setForces,
    isCaseStudiesModalOpen,
    setCaseStudiesModalOpen
  } = usePraleyeStore();

  useEffect(() => {
    // Bootstrap National Data
    const loadData = async () => {
      try {
        const [grid, osint, hosp, shelters, units] = await Promise.all([
          apiClient.getHazardGrid(),
          apiClient.getOsintLiveFeed(),
          apiClient.getHospitals(),
          apiClient.getSafeZones(),
          apiClient.getForces(),
        ]);
        setDistricts(grid.features || []);
        setOsintReports(osint || []);
        setHospitals(hosp || []);
        setSafeZones(shelters || []);
        setForces(units || []);
      } catch (err) {
        console.error('Failed to load initial disaster intelligence:', err);
      }
    };

    loadData();

    // Setup Live WebSocket Telemetry Stream
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live-telemetry`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log('PRALEYE Tactical Telemetry WebSocket Connected.');
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('Live Telemetry Update:', msg);
      } catch (e) {
        // Ping response
      }
    };

    return () => socket.close();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-obsidian-950 text-slate-100 font-sans">
      {/* 100vw x 100vh Full-Bleed Map Canvas - Isolated to Tactical Map View */}
      <div className={`absolute inset-0 w-full h-full ${activeView === 'COMMAND_HUD' ? 'block' : 'invisible pointer-events-none'}`}>
        <TacticalMapCanvas />
      </div>

      {/* Map HUD Overlays - Visible ONLY in Tactical Map View */}
      {activeView === 'COMMAND_HUD' && (
        <>
          <MapHoverCard />
          <MapDataBriefingBar />
          <MapLegendControl />
          <BottomModeSwitcher />
        </>
      )}

      {/* 4-Edge Peripheral HUD Navigation Frame */}
      <TopFilterSearchBar />
      <LeftCategoryDock />
      {activeView === 'COMMAND_HUD' && <RightDepthInspector />}

      {/* Bottom-Left Corner Executive Analytics & Broadcast Toggle Button */}
      <GovtAnalyticsCornerButton />

      {/* Multi-Role Overlay Dashboards */}
      {activeView === 'SUPER_ADMIN' && <AdminControlDashboard />}
      {activeView === 'GOV_FORCES' && <GovForcesDashboard />}
      {activeView === 'HOSPITAL_NETWORK' && <HospitalCommandView />}

      {/* All-India Executive Disaster Analytics & Live Broadcast Hub */}
      <GovtExecutiveAnalyticsModal />

      {/* Interactive Command Modals */}
      <EmergencyBedAssignModal />
      <BroadcastAlertModal />
      <MilitarySitrepModal />
      <CityWeatherDetailModal />
      <MicroLocationDetailModal />
      <DisasterCaseStudiesModal 
        isOpen={isCaseStudiesModalOpen} 
        onClose={() => setCaseStudiesModalOpen(false)} 
      />
    </div>
  );
};

export default App;

