import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import { usePraleyeStore } from '../../store/usePraleyeStore';
import { MapStyleTheme, DistrictHazardFeature } from '../../types/praleye.types';
import { getMicroLocationsForDistrict, MicroLocationNode } from '../../services/microLocationsData';
import { interpolateDistrictData, interpolateOsintReports } from '../../services/timelineTransitionService';

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
  const [currentZoom, setCurrentZoom] = useState<number>(4.8);

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
    setHoveredEntity,
    setCityDetailModalOpen,
    setSelectedMicroLocation,
    flyTo,
    timeOffsetHours
  } = usePraleyeStore();

  // Dynamically interpolate district hazard features and OSINT reports according to timeline scrubber
  const effectiveDistricts = useMemo(() => {
    return districts.map((d) => interpolateDistrictData(d, timeOffsetHours));
  }, [districts, timeOffsetHours]);

  const effectiveOsintReports = useMemo(() => {
    return interpolateOsintReports(osintReports, timeOffsetHours);
  }, [osintReports, timeOffsetHours]);

  // Helper to construct GeoJSON for Hazard Heatmap & Halo Circle Layer
  const getHazardGeoJson = (): any => {
    return {
      type: 'FeatureCollection',
      features: effectiveDistricts.map((d) => {
        const pFlood = d.properties.probabilities?.p_flood || 0;
        const pLandslide = d.properties.probabilities?.p_landslide || 0;
        const pCyclone = d.properties.probabilities?.p_cyclone || 0;
        const pHeat = d.properties.probabilities?.p_heat || 0;
        const rain = d.properties.weather_telemetry?.rain_24h_mm || 0;

        // Composite risk score normalized between 0.1 and 1.0
        const maxProb = Math.max(pFlood, pLandslide, pCyclone, pHeat);
        const weight = Math.min(
          1.0,
          Math.max(0.15, (maxProb * 0.7 + Math.min(100, rain) * 0.3) / 100)
        );

        return {
          type: 'Feature',
          geometry: d.geometry,
          properties: {
            risk_weight: weight,
            name: d.properties.name,
            state: d.properties.state,
            level: d.properties.composite_risk_level,
            temperature_c: d.properties.weather_telemetry?.temperature_c || 28.0,
            rain_24h_mm: rain
          }
        };
      })
    };
  };

  // Helper to construct GeoJSON for SOS Distress Heatmap
  const getSosGeoJson = (): any => {
    return {
      type: 'FeatureCollection',
      features: effectiveOsintReports.map((r) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [r.lon, r.lat]
        },
        properties: {
          urgency_weight: Math.min(
            1.0,
            Math.max(0.2, ((r.urgency_score || 0.7) * Math.min(5, r.people_trapped || 1)) / 3)
          )
        }
      }))
    };
  };

  // Robust Heatmap & Circle Halo Layer Setup
  const ensureHeatmapLayers = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // 1. Hazard Data Source
    let hazardSrc = map.current.getSource('district-hazard-source') as maplibregl.GeoJSONSource;
    if (!hazardSrc) {
      map.current.addSource('district-hazard-source', {
        type: 'geojson',
        data: getHazardGeoJson()
      });
    } else {
      hazardSrc.setData(getHazardGeoJson());
    }

    // 2. High-Vibrancy WebGL Heatmap Layer
    if (!map.current.getLayer('district-hazard-heatmap')) {
      map.current.addLayer({
        id: 'district-hazard-heatmap',
        type: 'heatmap',
        source: 'district-hazard-source',
        maxzoom: 15,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'risk_weight'],
            0, 0.5,
            0.5, 2.5,
            1.0, 5.0
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1.8,
            4, 3.2,
            8, 5.0,
            13, 7.5
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.03, 'rgba(6, 182, 212, 0.4)',
            0.20, 'rgba(16, 185, 129, 0.7)',
            0.45, 'rgba(245, 158, 11, 0.85)',
            0.70, 'rgba(249, 115, 22, 0.95)',
            0.90, 'rgba(239, 68, 68, 1.0)',
            1.0, 'rgba(255, 0, 80, 1.0)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 45,
            3, 75,
            5, 115,
            8, 165,
            12, 240
          ],
          'heatmap-opacity': 0.85
        }
      });
    }

    // 3. Radial Glow Halo Layer (ensures visible disaster fields even when zoomed into city)
    if (!map.current.getLayer('district-hazard-circle-halo')) {
      map.current.addLayer({
        id: 'district-hazard-circle-halo',
        type: 'circle',
        source: 'district-hazard-source',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 20,
            5, 55,
            8, 110,
            12, 220
          ],
          'circle-color': [
            'match',
            ['get', 'level'],
            'CRITICAL', '#EF4444',
            'HIGH', '#F97316',
            'MODERATE', '#F59E0B',
            '#10B981'
          ],
          'circle-blur': 0.8,
          'circle-opacity': 0.55
        }
      });
    }

    // 4. SOS Distress Heatmap Source & Layer
    let sosSrc = map.current.getSource('sos-distress-source') as maplibregl.GeoJSONSource;
    if (!sosSrc) {
      map.current.addSource('sos-distress-source', {
        type: 'geojson',
        data: getSosGeoJson()
      });
    } else {
      sosSrc.setData(getSosGeoJson());
    }

    if (!map.current.getLayer('sos-distress-heatmap')) {
      map.current.addLayer({
        id: 'sos-distress-heatmap',
        type: 'heatmap',
        source: 'sos-distress-source',
        maxzoom: 15,
        paint: {
          'heatmap-weight': ['get', 'urgency_weight'],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2.0,
            5, 4.0,
            9, 6.0
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.15, 'rgba(239, 68, 68, 0.45)',
            0.55, 'rgba(220, 38, 38, 0.8)',
            1.0, 'rgba(255, 0, 80, 1.0)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 30,
            5, 60,
            9, 110
          ],
          'heatmap-opacity': 0.88
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
    if (map.current.getLayer('district-hazard-circle-halo')) {
      map.current.setLayoutProperty('district-hazard-circle-halo', 'visibility', visibility);
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

    map.current.on('load', () => {
      ensureHeatmapLayers();
    });

    map.current.on('style.load', () => {
      ensureHeatmapLayers();
    });

    map.current.on('zoom', () => {
      if (map.current) {
        setCurrentZoom(map.current.getZoom());
      }
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
      ensureHeatmapLayers();
    });
  }, [mapTheme]);

  // Update Heatmap data sources when districts, osint reports, or timeline offset change
  useEffect(() => {
    ensureHeatmapLayers();
  }, [effectiveDistricts, effectiveOsintReports, vizMode, timeOffsetHours]);

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

  // Update Markers based on Active Mode, Layer Toggles, vizMode, and currentZoom
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // If PINS or HYBRID mode is active, render tactical symbology markers
    const shouldRenderPins = vizMode === 'PINS' || vizMode === 'HYBRID';
    if (!shouldRenderPins) return;

    const isZoomedIntoCity = currentZoom >= 7.0;

    // 1. High-Fidelity Tactical District / City Hazard Centroid Pins
    if (activeLayers.has('FLOOD_GRID') || mode === 'MODE_1_PREDICTION') {
      effectiveDistricts.forEach((d: DistrictHazardFeature) => {
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

        const w = d.properties.weather_telemetry;

        // In HYBRID mode when zoomed into city (currentZoom >= 7.0), render expanded City Weather Card
        // In PINS mode, keep the sleek tactical pin dot/pill at all zoom levels so it never blocks the map
        const showExpandedCityCard = vizMode === 'HYBRID' && isZoomedIntoCity;

        if (showExpandedCityCard) {
          // ========================================================
          // HYBRID MODE (ZOOMED INTO CITY): Expanded Interactive City Weather Card
          // ========================================================
          el.className = 'group relative flex flex-col items-center cursor-pointer select-none';
          el.innerHTML = `
            <div class="relative w-64 rounded-xl tactical-glass-elevated border border-slate-700/90 shadow-2xl p-2.5 space-y-2 transition-all duration-200 group-hover:scale-105 group-hover:border-cyan-400"
                 style="box-shadow: 0 0 20px ${color}40;">
              
              <!-- City Header -->
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-700/70">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-2.5 h-2.5 rounded-full ${level === 'CRITICAL' ? 'bg-rose-500 animate-ping' : ''}" style="background-color: ${color};"></span>
                  <div class="truncate">
                    <span class="font-bold text-slate-100 text-xs uppercase tracking-wider block truncate">${d.properties.name}</span>
                    <span class="text-[9px] text-slate-400 font-mono">${d.properties.state}</span>
                  </div>
                </div>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono" style="background-color: ${color}25; color: ${color}; border: 1px solid ${color}50;">
                  ${maxRisk}% RISK
                </span>
              </div>

              <!-- Main Weather Readout -->
              <div class="flex items-center justify-between bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="text-xl">${w.weather_icon || '⛅'}</span>
                  <div>
                    <div class="text-sm font-bold text-slate-100 font-mono">${w.temperature_c.toFixed(1)}°C</div>
                    <div class="text-[9px] text-slate-400 font-mono">Feels ${w.apparent_temperature_c?.toFixed(1) || w.temperature_c.toFixed(1)}°C</div>
                  </div>
                </div>
                <div class="text-right font-mono">
                  <div class="text-[10px] text-cyan-300 font-bold">${w.rain_24h_mm.toFixed(1)}mm Rain</div>
                  <div class="text-[9px] text-slate-400">${w.weather_condition || 'Partly Cloudy'}</div>
                </div>
              </div>

              <!-- Secondary Sensor Grid -->
              <div class="grid grid-cols-3 gap-1 font-mono text-[9px] text-center">
                <div class="bg-slate-900/60 p-1 rounded border border-slate-800">
                  <span class="text-slate-400 block text-[8px]">HUMIDITY</span>
                  <span class="text-slate-200 font-bold">${Math.round(w.relative_humidity)}%</span>
                </div>
                <div class="bg-slate-900/60 p-1 rounded border border-slate-800">
                  <span class="text-slate-400 block text-[8px]">WIND GUST</span>
                  <span class="text-sky-300 font-bold">${Math.round(w.wind_gust_kmh)}kph</span>
                </div>
                <div class="bg-slate-900/60 p-1 rounded border border-slate-800">
                  <span class="text-slate-400 block text-[8px]">SOIL MOIST</span>
                  <span class="text-emerald-300 font-bold">${w.soil_moisture.toFixed(2)}</span>
                </div>
              </div>

              <!-- Click Action Button -->
              <button class="w-full py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 text-[10px] font-bold font-mono tracking-wider transition-colors flex items-center justify-center gap-1">
                <span>🔍</span> INSPECT CITY INTEL →
              </button>
            </div>
            ${level === 'CRITICAL' ? `<div class="absolute -inset-2 rounded-2xl border border-rose-500/50 radar-ripple pointer-events-none"></div>` : ''}
          `;
        } else {
          // ========================================================
          // REGIONAL VIEW: Compact High-Contrast Tactical Marker
          // ========================================================
          el.className = 'group relative flex flex-col items-center cursor-pointer select-none';
          el.innerHTML = `
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg shadow-xl transition-transform duration-200 group-hover:scale-125"
                 style="background: rgba(9, 13, 22, 0.94); border: 1.5px solid ${color}; box-shadow: 0 0 12px ${color}66;">
              <span style="font-size: 12px;">${icon}</span>
              <span style="font-size: 10px; font-weight: bold; color: ${color}; font-family: monospace;">${maxRisk}%</span>
              <span style="font-size: 9px; font-weight: 700; color: #f1f5f9; font-family: monospace; text-transform: uppercase;">${d.properties.name.slice(0, 7)}</span>
              <span style="font-size: 9px; color: #38bdf8; font-family: monospace; padding-left: 2px; border-left: 1px solid #334155;">${Math.round(w.temperature_c)}°</span>
            </div>
            ${
              level === 'CRITICAL'
                ? `<div class="absolute -inset-1 rounded-full border border-rose-500/60 radar-ripple pointer-events-none"></div>`
                : ''
            }
          `;
        }

        const handleSelectCity = () => {
          setSelectedDistrict(d);
          setCityDetailModalOpen(true);
          flyTo(d.geometry.coordinates[1], d.geometry.coordinates[0], Math.max(currentZoom, 10));
        };

        el.onclick = handleSelectCity;
        el.onmouseenter = (e) =>
          setHoveredEntity({ type: 'DISTRICT', data: d, x: e.clientX, y: e.clientY });
        el.onmouseleave = () => setHoveredEntity(null);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([d.geometry.coordinates[0], d.geometry.coordinates[1]])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }

    // 1.B Micro-Location Chowks & Localities (Rendered when zoomed in >= 8.5)
    if (currentZoom >= 8.5 && (activeLayers.has('FLOOD_GRID') || mode === 'MODE_1_PREDICTION')) {
      // Find districts within reasonable distance or visible area
      effectiveDistricts.forEach((d) => {
        const microLocs = getMicroLocationsForDistrict(
          d.properties.district_id,
          d.properties.name,
          d.properties.state,
          d.geometry.coordinates[1],
          d.geometry.coordinates[0]
        );

        microLocs.forEach((loc) => {
          const dotEl = document.createElement('div');
          const dotColor =
            loc.vulnerability === 'EXTREME'
              ? '#EF4444'
              : loc.vulnerability === 'HIGH'
              ? '#F97316'
              : loc.vulnerability === 'MODERATE'
              ? '#F59E0B'
              : '#10B981';

          dotEl.className = 'group relative flex items-center justify-center cursor-pointer select-none';
          dotEl.style.width = '20px';
          dotEl.style.height = '20px';

          // Micro dot point with pulse aura
          dotEl.innerHTML = `
            <div class="relative w-3.5 h-3.5 rounded-full transition-transform duration-200 group-hover:scale-150 flex items-center justify-center shadow-lg"
                 style="background-color: ${dotColor}; border: 1.5px solid #ffffff; box-shadow: 0 0 8px ${dotColor};">
              <div class="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
            </div>
            ${
              loc.vulnerability === 'EXTREME'
                ? `<div class="absolute -inset-1 rounded-full border border-rose-500/60 radar-ripple pointer-events-none"></div>`
                : ''
            }
          `;

          // On hover: Show popup tooltip
          dotEl.onmouseenter = (e) => {
            setHoveredEntity({
              type: 'MICRO_LOCATION',
              data: loc,
              x: e.clientX,
              y: e.clientY
            });
          };
          dotEl.onmouseleave = () => setHoveredEntity(null);

          // On click: Open detail dialog
          dotEl.onclick = (e) => {
            e.stopPropagation();
            setSelectedMicroLocation(loc);
          };

          const dotMarker = new maplibregl.Marker({ element: dotEl })
            .setLngLat([loc.lon, loc.lat])
            .addTo(map.current!);
          markersRef.current.push(dotMarker);
        });
      });
    }

    // 2. High-Fidelity Tactical SOS Distress Beacons (Live Rescue)
    if (activeLayers.has('SOS_BEACONS') || mode === 'MODE_2_OSINT_RESCUE') {
      effectiveOsintReports.forEach((r) => {
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
  }, [
    effectiveDistricts,
    effectiveOsintReports,
    hospitals,
    safeZones,
    forces,
    activeLayers,
    mode,
    vizMode,
    currentZoom,
    timeOffsetHours
  ]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* High-Fidelity Tactical Map Navigation & Camera Controls */}
      <div className="absolute bottom-24 right-4 z-20 flex flex-col items-center gap-1.5 select-none font-mono text-xs">
        <button
          onClick={() => map.current?.zoomIn()}
          className="w-8 h-8 rounded-lg tactical-glass-elevated border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-bold text-base flex items-center justify-center transition-all shadow-xl active:scale-95"
          title="Zoom In (+)"
        >
          +
        </button>
        <button
          onClick={() => map.current?.zoomOut()}
          className="w-8 h-8 rounded-lg tactical-glass-elevated border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-bold text-base flex items-center justify-center transition-all shadow-xl active:scale-95"
          title="Zoom Out (−)"
        >
          −
        </button>
        <button
          onClick={() => {
            if (map.current) {
              const currentPitch = map.current.getPitch();
              map.current.easeTo({ pitch: currentPitch > 25 ? 0 : 50, duration: 800 });
            }
          }}
          className="w-8 h-8 rounded-lg tactical-glass-elevated border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 text-xs flex items-center justify-center transition-all shadow-xl active:scale-95"
          title="Toggle 3D Terrain Pitch / 2D Flat View"
        >
          📐
        </button>
        <button
          onClick={() => map.current?.resetNorthPitch()}
          className="w-8 h-8 rounded-lg tactical-glass-elevated border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 text-xs flex items-center justify-center transition-all shadow-xl active:scale-95"
          title="Reset Camera Bearing to True North"
        >
          🧭
        </button>
        <button
          onClick={() =>
            map.current?.flyTo({
              center: [78.9629, 21.5937],
              zoom: 4.8,
              pitch: 20,
              bearing: 0,
              duration: 1200
            })
          }
          className="w-8 h-8 rounded-lg tactical-glass-elevated border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 text-xs flex items-center justify-center transition-all shadow-xl active:scale-95"
          title="Reset to All-India View"
        >
          🇮🇳
        </button>
      </div>
    </div>
  );
};
