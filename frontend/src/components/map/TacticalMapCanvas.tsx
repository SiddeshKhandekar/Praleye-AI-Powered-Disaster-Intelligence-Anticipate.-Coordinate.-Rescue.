import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { MapStyleTheme } from '../../types/praleye.types';

export const getMapStyle = (theme: MapStyleTheme): any => {
  const apiKey = (import.meta as any).env?.VITE_STADIA_API_KEY || '';
  const keyParam = apiKey ? `?api_key=${apiKey}` : '';

  switch (theme) {
    case 'STADIA_ALIDADE_SMOOTH_DARK':
      return {
        version: 8,
        sources: {
          'stadia-dark': {
            type: 'raster',
            tiles: [
              `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png${keyParam}`
            ],
            tileSize: 256,
            attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'stadia-dark-tiles',
            type: 'raster',
            source: 'stadia-dark',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      };

    case 'STADIA_OUTDOORS':
      return {
        version: 8,
        sources: {
          'stadia-outdoors': {
            type: 'raster',
            tiles: [
              `https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}@2x.png${keyParam}`
            ],
            tileSize: 256,
            attribution: '&copy; Stadia Maps &copy; OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'stadia-outdoors-tiles',
            type: 'raster',
            source: 'stadia-outdoors',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      };

    case 'STADIA_OSM_BRIGHT':
      return {
        version: 8,
        sources: {
          'stadia-bright': {
            type: 'raster',
            tiles: [
              `https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png${keyParam}`
            ],
            tileSize: 256,
            attribution: '&copy; Stadia Maps &copy; OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'stadia-bright-tiles',
            type: 'raster',
            source: 'stadia-bright',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      };

    case 'STADIA_SATELLITE':
    case 'ESRI_SATELLITE':
      return {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '&copy; Esri, Maxar, Earthstar Geographics'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };

    case 'OPENFREEMAP_DARK':
    case 'CARTO_DARK_KEYLESS':
    default:
      return {
        version: 8,
        sources: {
          'open-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'open-base-layer',
            type: 'raster',
            source: 'open-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
  }
};

export const TacticalMapCanvas: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const {
    viewport,
    districts,
    osintReports,
    hospitals,
    safeZones,
    forces,
    activeLayers,
    mode,
    mapTheme,
    setSelectedDistrict,
    setSelectedSos,
    setSelectedHospital
  } = usePraleyeStore();

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyle(mapTheme),
      center: [viewport.lon, viewport.lat],
      zoom: viewport.zoom,
      pitch: viewport.pitch,
      bearing: viewport.bearing
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-left');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style on theme switch
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(getMapStyle(mapTheme));
  }, [mapTheme]);

  // Sync Camera Viewport
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({
      center: [viewport.lon, viewport.lat],
      zoom: viewport.zoom,
      duration: 1500,
      essential: true
    });
  }, [viewport.lat, viewport.lon, viewport.zoom]);

  // Update Markers based on Active Mode & Layer Toggles
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 1. District Hazard Risk Hexagons / Beacons
    if (activeLayers.has('FLOOD_GRID') || mode === 'MODE_1_PREDICTION') {
      districts.forEach(d => {
        const el = document.createElement('div');
        const level = d.properties.composite_risk_level;
        const color = level === 'CRITICAL' ? '#EF4444' :
        level === 'HIGH' ? '#F97316' :
          level === 'MODERATE' ? '#F59E0B' : '#10B981';

        el.className = 'district-marker cursor-pointer transition-transform hover:scale-125';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = `${color}33`;
        el.style.border = `2px solid ${color}`;
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = '#fff';
        el.style.fontSize = '9px';
        el.style.fontWeight = 'bold';
        el.style.fontFamily = 'monospace';
        el.innerText = `${Math.round(d.properties.probabilities.p_flood)}`;

        el.onclick = () => setSelectedDistrict(d);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([d.geometry.coordinates[0], d.geometry.coordinates[1]])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }

    // 2. Scraped SOS Distress Clusters (Live Rescue Mode)
    if (activeLayers.has('SOS_BEACONS') || mode === 'MODE_2_OSINT_RESCUE') {
      osintReports.forEach(r => {
        const el = document.createElement('div');
        el.className = 'sos-beacon cursor-pointer pulse-crimson';
        el.style.width = '18px';
        el.style.height = '18px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#EF4444';
        el.style.border = '2px solid #FFFFFF';
        el.style.boxShadow = '0 0 12px #EF4444';

        el.onclick = () => setSelectedSos(r);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([r.lon, r.lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }

    // 3. Hospital Nodes
    if (activeLayers.has('HOSPITAL_NODES') || mode === 'MODE_4_TRIAGE') {
      hospitals.forEach(h => {
        const el = document.createElement('div');
        el.className = 'hospital-marker cursor-pointer hover:scale-125 transition-transform';
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.backgroundColor = '#06B6D4';
        el.style.borderRadius = '3px';
        el.style.border = '1px solid #FFFFFF';
        el.style.boxShadow = '0 0 8px #06B6D4';

        el.onclick = () => setSelectedHospital(h);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([h.lon, h.lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }

    // 4. Safe Shelters
    if (activeLayers.has('SAFE_SHELTERS') || mode === 'MODE_3_SAFE_ZONES') {
      safeZones.forEach(s => {
        const el = document.createElement('div');
        el.className = 'safe-zone-marker cursor-pointer hover:scale-125 transition-transform';
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.backgroundColor = '#10B981';
        el.style.borderRadius = '2px';
        el.style.border = '1px solid #FFFFFF';

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([s.lon, s.lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }
  }, [districts, osintReports, hospitals, safeZones, activeLayers, mode]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
