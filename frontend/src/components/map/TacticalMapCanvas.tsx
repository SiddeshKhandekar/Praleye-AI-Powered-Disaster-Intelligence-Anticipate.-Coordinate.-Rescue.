import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { MapStyleTheme, DistrictHazardFeature } from '../../types/praleye.types';

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
    vizMode,
    mapTheme,
    setSelectedDistrict,
    setSelectedSos,
    setSelectedHospital,
    setHoveredEntity
  } = usePraleyeStore();

  // Helper to construct GeoJSON for Hazard Heatmap
  const getHazardGeoJson = (): any => {
    return {
      type: 'FeatureCollection',
      features: districts.map((d) => {
        const pFlood = d.properties.probabilities?.p_flood || 0;
        const pLandslide = d.properties.probabilities?.p_landslide || 0;
        const rain = d.properties.weather_telemetry?.rain_24h_mm || 0;
        const weight = Math.min(
          1.0,
          Math.max(0.05, (pFlood * 0.4 + pLandslide * 0.35 + Math.min(100, rain) * 0.25) / 100)
        );

        return {
          type: 'Feature',
          geometry: d.geometry,
          properties: {
            risk_weight: weight,
            name: d.properties.name,
            level: d.properties.composite_risk_level
          }
        };
      })
    };
  };

  // Helper to construct GeoJSON for SOS Distress Heatmap
  const getSosGeoJson = (): any => {
    return {
      type: 'FeatureCollection',
      features: osintReports.map((r) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [r.lon, r.lat]
        },
        properties: {
          urgency_weight: Math.min(
            1.0,
            Math.max(0.2, ((r.urgency_score || 0.7) * Math.min(5, r.people_trapped || 1)) / 4)
          )
        }
      }))
    };
  };

  // Setup WebGL Heatmap layers
  const setupHeatmapLayers = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // 1. District Hazard Heatmap Source & Layer
    if (!map.current.getSource('district-hazard-source')) {
      map.current.addSource('district-hazard-source', {
        type: 'geojson',
        data: getHazardGeoJson()
      });

      map.current.addLayer({
        id: 'district-hazard-heatmap',
        type: 'heatmap',
        source: 'district-hazard-source',
        maxzoom: 14,
        paint: {
          'heatmap-weight': ['get', 'risk_weight'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1.2, 7, 2.5, 12, 4],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.15, 'rgba(6, 182, 212, 0.45)',
            0.35, 'rgba(16, 185, 129, 0.65)',
            0.55, 'rgba(245, 158, 11, 0.8)',
            0.75, 'rgba(249, 115, 22, 0.9)',
            1.0, 'rgba(239, 68, 68, 0.98)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 18, 5, 42, 9, 85],
          'heatmap-opacity': 0.75
        }
      });
    }

    // 2. SOS Distress Cluster Heatmap Source & Layer
    if (!map.current.getSource('sos-distress-source')) {
      map.current.addSource('sos-distress-source', {
        type: 'geojson',
        data: getSosGeoJson()
      });

      map.current.addLayer({
        id: 'sos-distress-heatmap',
        type: 'heatmap',
        source: 'sos-distress-source',
        maxzoom: 14,
        paint: {
          'heatmap-weight': ['get', 'urgency_weight'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1.5, 8, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.2, 'rgba(239, 68, 68, 0.4)',
            0.6, 'rgba(220, 38, 38, 0.75)',
            1.0, 'rgba(255, 0, 70, 0.98)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 14, 5, 32, 9, 65],
          'heatmap-opacity': 0.85
        }
      });
    }

    updateHeatmapVisibility();
  };

  // Sync heatmap layer visibility with vizMode
  const updateHeatmapVisibility = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const showHeatmap = vizMode === 'HEATMAP' || vizMode === 'HYBRID';
    const visibility = showHeatmap ? 'visible' : 'none';

    if (map.current.getLayer('district-hazard-heatmap')) {
      map.current.setLayoutProperty('district-hazard-heatmap', 'visibility', visibility);
    }
    if (map.current.getLayer('sos-distress-heatmap')) {
      map.current.setLayoutProperty('sos-distress-heatmap', 'visibility', visibility);
    }
  };

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

    map.current.on('style.load', () => {
      setupHeatmapLayers();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style on theme switch
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(getMapStyle(mapTheme));
    map.current.once('style.load', () => {
      setupHeatmapLayers();
    });
  }, [mapTheme]);

  // Update Heatmap data sources when districts or osint reports change
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const hazardSrc = map.current.getSource('district-hazard-source') as maplibregl.GeoJSONSource;
    if (hazardSrc) {
      hazardSrc.setData(getHazardGeoJson());
    }

    const sosSrc = map.current.getSource('sos-distress-source') as maplibregl.GeoJSONSource;
    if (sosSrc) {
      sosSrc.setData(getSosGeoJson());
    }

    updateHeatmapVisibility();
  }, [districts, osintReports, vizMode]);

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

  // Update Markers based on Active Mode, Layer Toggles, and vizMode
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // If PINS or HYBRID mode is active, render tactical symbology markers
    const shouldRenderPins = vizMode === 'PINS' || vizMode === 'HYBRID';
    if (!shouldRenderPins) return;

    // 1. High-Fidelity Tactical District Hazard Centroid Pins
    if (activeLayers.has('FLOOD_GRID') || mode === 'MODE_1_PREDICTION') {
      districts.forEach((d: DistrictHazardFeature) => {
        const el = document.createElement('div');
        const level = d.properties.composite_risk_level;
        const color =
          level === 'CRITICAL'
            ? '#EF4444'
            : level === 'HIGH'
            ? '#F97316'
            : level === 'MODERATE'
            ? '#F59E0B'
            : '#10B981';

        const maxRisk = Math.round(
          Math.max(
            d.properties.probabilities.p_flood,
            d.properties.probabilities.p_landslide,
            d.properties.probabilities.p_cyclone,
            d.properties.probabilities.p_heat
          )
        );

        // Determine dominant threat icon
        const icon =
          d.properties.probabilities.p_landslide >= d.properties.probabilities.p_flood &&
          d.properties.probabilities.p_landslide >= d.properties.probabilities.p_cyclone
            ? '⛰️'
            : d.properties.probabilities.p_cyclone >= d.properties.probabilities.p_flood
            ? '🌀'
            : '🌊';

        el.className = 'group relative flex flex-col items-center cursor-pointer select-none';

        el.innerHTML = `
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded shadow-lg transition-transform duration-200 group-hover:scale-110"
               style="background: rgba(9, 13, 22, 0.92); border: 1.5px solid ${color}; box-shadow: 0 0 10px ${color}55;">
            <span style="font-size: 11px;">${icon}</span>
            <span style="font-size: 9px; font-weight: bold; color: ${color}; font-family: monospace;">${maxRisk}%</span>
            <span style="font-size: 8px; font-weight: 600; color: #cbd5e1; font-family: monospace; text-transform: uppercase;">${d.properties.name.slice(0, 6)}</span>
          </div>
          ${
            level === 'CRITICAL'
              ? `<div class="absolute -inset-1 rounded-full border border-rose-500/60 radar-ripple pointer-events-none"></div>`
              : ''
          }
        `;

        el.onclick = () => setSelectedDistrict(d);
        el.onmouseenter = (e) =>
          setHoveredEntity({ type: 'DISTRICT', data: d, x: e.clientX, y: e.clientY });
        el.onmouseleave = () => setHoveredEntity(null);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([d.geometry.coordinates[0], d.geometry.coordinates[1]])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }

    // 2. High-Fidelity Tactical SOS Distress Beacons (Live Rescue)
    if (activeLayers.has('SOS_BEACONS') || mode === 'MODE_2_OSINT_RESCUE') {
      osintReports.forEach((r) => {
        const el = document.createElement('div');
        el.className = 'group relative flex flex-col items-center cursor-pointer select-none';

        el.innerHTML = `
          <div class="relative flex items-center gap-1 px-2 py-0.5 rounded-full shadow-2xl transition-transform duration-200 group-hover:scale-125"
               style="background: #991B1B; border: 1.5px solid #FCA5A5; box-shadow: 0 0 14px #EF4444;">
            <span class="text-xs">🆘</span>
            <span style="font-size: 9px; font-weight: 800; color: #FFFFFF; font-family: monospace;">👥 ${r.people_trapped}</span>
          </div>
          <div class="absolute -inset-2 rounded-full border-2 border-red-500/70 radar-ripple pointer-events-none"></div>
        `;

        el.onclick = () => setSelectedSos(r);
        el.onmouseenter = (e) =>
          setHoveredEntity({ type: 'SOS', data: r, x: e.clientX, y: e.clientY });
        el.onmouseleave = () => setHoveredEntity(null);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([r.lon, r.lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }

    // 3. High-Fidelity Tactical Hospital Nodes (with Live Vacant Bed Counters)
    if (activeLayers.has('HOSPITAL_NODES') || mode === 'MODE_4_TRIAGE') {
      hospitals.forEach((h) => {
        const el = document.createElement('div');
        const vacantBeds =
          h.icu.available + h.trauma.available + h.ventilator.available + h.general.available;

        const bedColor =
          vacantBeds > 30 ? '#10B981' : vacantBeds > 10 ? '#F59E0B' : '#EF4444';

        el.className = 'group relative flex flex-col items-center cursor-pointer select-none';

        el.innerHTML = `
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded shadow-lg transition-transform duration-200 group-hover:scale-110"
               style="background: rgba(8, 20, 35, 0.92); border: 1.5px solid #06B6D4; box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);">
            <div style="background: #06B6D4; color: #000; border-radius: 2px; padding: 0 2px; font-weight: 900; font-size: 9px;">+</div>
            <span style="font-size: 9px; font-weight: bold; color: ${bedColor}; font-family: monospace;">${vacantBeds}b</span>
            <span style="font-size: 8px; color: #94a3b8; font-family: monospace; max-width: 55px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${h.name.replace('Hospital', 'Hosp').slice(0, 8)}</span>
          </div>
        `;

        el.onclick = () => setSelectedHospital(h);
        el.onmouseenter = (e) =>
          setHoveredEntity({ type: 'HOSPITAL', data: h, x: e.clientX, y: e.clientY });
        el.onmouseleave = () => setHoveredEntity(null);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([h.lon, h.lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }

    // 4. High-Fidelity Tactical Safe Shelters
    if (activeLayers.has('SAFE_SHELTERS') || mode === 'MODE_3_SAFE_ZONES') {
      safeZones.forEach((s) => {
        const el = document.createElement('div');
        const occPct = Math.round((s.current_occupancy / s.capacity_max) * 100);

        el.className = 'group relative flex flex-col items-center cursor-pointer select-none';

        el.innerHTML = `
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded shadow-lg transition-transform duration-200 group-hover:scale-110"
               style="background: rgba(6, 25, 18, 0.92); border: 1.5px solid #10B981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);">
            <span style="font-size: 10px;">⛺</span>
            <span style="font-size: 8.5px; font-weight: bold; color: #34d399; font-family: monospace;">${occPct}%</span>
            <span style="font-size: 8px; color: #cbd5e1; font-family: monospace;">${s.name.slice(0, 7)}</span>
          </div>
        `;

        el.onmouseenter = (e) =>
          setHoveredEntity({ type: 'SHELTER', data: s, x: e.clientX, y: e.clientY });
        el.onmouseleave = () => setHoveredEntity(null);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([s.lon, s.lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }

    // 5. High-Fidelity Defense Forces & NDRF Units
    if (activeLayers.has('DEFENSE_FORCES')) {
      forces.forEach((f) => {
        const el = document.createElement('div');

        el.className = 'group relative flex flex-col items-center cursor-pointer select-none';

        el.innerHTML = `
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded shadow-lg transition-transform duration-200 group-hover:scale-110"
               style="background: rgba(26, 20, 7, 0.92); border: 1.5px solid #F59E0B; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);">
            <span style="font-size: 10px;">🪖</span>
            <span style="font-size: 8.5px; font-weight: bold; color: #fbbf24; font-family: monospace;">${f.branch}</span>
            <span style="font-size: 8px; color: #cbd5e1; font-family: monospace;">${f.personnel_count}p</span>
          </div>
        `;

        el.onmouseenter = (e) =>
          setHoveredEntity({ type: 'FORCE', data: f, x: e.clientX, y: e.clientY });
        el.onmouseleave = () => setHoveredEntity(null);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([f.lon, f.lat])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }
  }, [districts, osintReports, hospitals, safeZones, forces, activeLayers, mode, vizMode]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
