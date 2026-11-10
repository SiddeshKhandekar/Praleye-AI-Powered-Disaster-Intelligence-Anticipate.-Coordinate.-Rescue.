import React, { useEffect } from 'react';
import { usePraleyeStore } from './store/usePraleyeStore';
import { apiClient } from './services/apiClient';

// HUD Framework
import { TopFilterSearchBar } from './components/hud/TopFilterSearchBar';
import { BottomModeSwitcher } from './components/hud/BottomModeSwitcher';
import { LeftCategoryDock } from './components/hud/LeftCategoryDock';
import { RightDepthInspector } from './components/hud/RightDepthInspector';
import { TacticalMapCanvas } from './components/map/TacticalMapCanvas';

// Dashboards
import { AdminControlDashboard } from './components/dashboards/AdminControlDashboard';
import { GovForcesDashboard } from './components/dashboards/GovForcesDashboard';
import { HospitalCommandView } from './components/dashboards/HospitalCommandView';

// Modals
import { EmergencyBedAssignModal } from './components/modals/EmergencyBedAssignModal';
import { BroadcastAlertModal } from './components/modals/BroadcastAlertModal';
import { MilitarySitrepModal } from './components/modals/MilitarySitrepModal';

export const App: React.FC = () => {
  const { 
    activeView, 
    setDistricts, 
    setOsintReports, 
    setHospitals, 
    setSafeZones, 
    setForces 
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
      {/* 100vw x 100vh Full-Bleed Map Canvas */}
      <TacticalMapCanvas />

      {/* 4-Edge Peripheral HUD Navigation Frame */}
      <TopFilterSearchBar />
      <BottomModeSwitcher />
      <LeftCategoryDock />
      <RightDepthInspector />

      {/* Multi-Role Overlay Dashboards */}
      {activeView === 'SUPER_ADMIN' && <AdminControlDashboard />}
      {activeView === 'GOV_FORCES' && <GovForcesDashboard />}
      {activeView === 'HOSPITAL_NETWORK' && <HospitalCommandView />}

      {/* Interactive Command Modals */}
      <EmergencyBedAssignModal />
      <BroadcastAlertModal />
      <MilitarySitrepModal />
    </div>
  );
};

export default App;
