import { DistrictHazardFeature, OsintReport } from '../types/praleye.types';

export interface TimelineStateInfo {
  offsetHours: number;
  stage: 'PAST' | 'PRESENT' | 'FUTURE';
  stageLabel: string;
  stageBadgeColor: string;
  badgeIcon: string;
  targetDate: Date;
  formattedDate: string;
  formattedTime: string;
  formattedRelative: string;
  multiplier: number;
}

/**
 * Calculates current real-world timestamp in Indian Standard Time (IST)
 * and projects it forwards or backwards based on offsetHours.
 */
export function getTimelineState(offsetHours: number): TimelineStateInfo {
  const now = new Date();
  const targetMs = now.getTime() + offsetHours * 3600 * 1000;
  const targetDate = new Date(targetMs);

  let stage: 'PAST' | 'PRESENT' | 'FUTURE' = 'PRESENT';
  let stageLabel = 'PRESENT LIVE DATA';
  let stageBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
  let badgeIcon = '🟢';
  let formattedRelative = 'LIVE TELEMETRY (0h)';

  if (offsetHours < 0) {
    stage = 'PAST';
    stageLabel = 'PREVIOUS HINDCAST DATA';
    stageBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    badgeIcon = '⏪';
    formattedRelative = `${Math.abs(offsetHours)}h PAST REPLAY`;
  } else if (offsetHours > 0) {
    stage = 'FUTURE';
    stageLabel = 'FUTURE AI PREDICTIONS';
    stageBadgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
    badgeIcon = '🔮';
    formattedRelative = `+${offsetHours}h FORECAST`;
  }

  // Format date in IST
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', dateOptions).format(targetDate);
  const formattedTime = new Intl.DateTimeFormat('en-IN', timeOptions).format(targetDate) + ' IST';

  // Multiplier for physical modeling
  // Past: hazard builds up gradually (0.6x at -72h -> 1.0x at 0h)
  // Present: 1.0x baseline
  // Future: hazard escalates (up to 1.7x or decays depending on weather trajectory)
  const multiplier = offsetHours === 0 
    ? 1.0 
    : offsetHours < 0 
      ? Math.max(0.4, 1.0 + (offsetHours / 72) * 0.5) 
      : 1.0 + Math.sin((offsetHours / 72) * Math.PI) * 0.55;

  return {
    offsetHours,
    stage,
    stageLabel,
    stageBadgeColor,
    badgeIcon,
    targetDate,
    formattedDate,
    formattedTime,
    formattedRelative,
    multiplier
  };
}

/**
 * Produces smoothly interpolated district hazard features according to timeline offset.
 */
export function interpolateDistrictData(
  district: DistrictHazardFeature,
  offsetHours: number
): DistrictHazardFeature {
  if (offsetHours === 0) return district;

  const { p_flood, p_landslide, p_cyclone, p_heat } = district.properties.probabilities;
  const w = district.properties.weather_telemetry;

  let multiplier = 1.0;
  let rainMod = 1.0;
  let windMod = 1.0;

  if (offsetHours < 0) {
    // Past: -72h to -1h represents storm evolution prior to peak
    const progress = (offsetHours + 72) / 72; // 0 at -72h, 1 at 0h
    multiplier = 0.45 + 0.55 * progress;
    rainMod = 0.3 + 0.7 * progress;
    windMod = 0.5 + 0.5 * progress;
  } else {
    // Future: +1h to +72h represents predictive peak and downstream river swelling
    // Peak disaster occurs around +18h to +36h, then gradual discharge
    const peakFactor = Math.sin(Math.min(Math.PI, (offsetHours / 48) * Math.PI));
    multiplier = 1.0 + peakFactor * 0.48;
    rainMod = 1.0 + peakFactor * 0.65;
    windMod = 1.0 + peakFactor * 0.35;
  }

  const adjFlood = Math.min(99.0, Math.max(2.0, p_flood * multiplier));
  const adjLandslide = Math.min(99.0, Math.max(1.0, p_landslide * multiplier));
  const adjCyclone = Math.min(99.0, Math.max(0.0, p_cyclone * windMod));
  const adjHeat = Math.min(99.0, Math.max(3.0, p_heat * (offsetHours > 0 ? 1.1 : 0.95)));

  const maxProb = Math.max(adjFlood, adjLandslide, adjCyclone, adjHeat);
  let compositeLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (maxProb >= 75) compositeLevel = 'CRITICAL';
  else if (maxProb >= 50) compositeLevel = 'HIGH';
  else if (maxProb >= 25) compositeLevel = 'MODERATE';

  return {
    ...district,
    properties: {
      ...district.properties,
      composite_risk_level: compositeLevel,
      probabilities: {
        p_flood: Math.round(adjFlood * 10) / 10,
        p_landslide: Math.round(adjLandslide * 10) / 10,
        p_cyclone: Math.round(adjCyclone * 10) / 10,
        p_heat: Math.round(adjHeat * 10) / 10
      },
      weather_telemetry: {
        ...w,
        rain_24h_mm: Math.round(w.rain_24h_mm * rainMod * 10) / 10,
        rain_72h_mm: Math.round(w.rain_72h_mm * (rainMod * 1.15) * 10) / 10,
        soil_moisture: Math.min(0.95, Math.max(0.1, Math.round(w.soil_moisture * (offsetHours > 0 ? 1.25 : 0.85) * 100) / 100)),
        wind_gust_kmh: Math.round(w.wind_gust_kmh * windMod * 10) / 10,
        temperature_c: Math.round((w.temperature_c + (offsetHours > 0 ? 0.8 : -0.5)) * 10) / 10,
        apparent_temperature_c: Math.round(((w.apparent_temperature_c || w.temperature_c) + (offsetHours > 0 ? 1.0 : -0.6)) * 10) / 10
      }
    }
  };
}

/**
 * Filters or adjusts active OSINT distress reports according to the timeline.
 */
export function interpolateOsintReports(
  reports: OsintReport[],
  offsetHours: number
): OsintReport[] {
  if (offsetHours === 0) return reports;

  // In the past (-48h to -72h), only early distress calls had arrived
  if (offsetHours <= -36) {
    return reports.slice(0, 2);
  }
  if (offsetHours < 0) {
    return reports.slice(0, 4);
  }

  // In the future, predict escalation in trapped counts and emergency urgency
  const surge = Math.min(2.0, 1.0 + (offsetHours / 48) * 0.8);
  return reports.map((r, idx) => ({
    ...r,
    people_trapped: Math.max(1, Math.round(r.people_trapped * surge)),
    urgency_score: Math.min(1.0, Math.round((r.urgency_score * (1.0 + (offsetHours / 72) * 0.2)) * 100) / 100),
    urgency_label: (r.urgency_score * surge >= 0.85 ? 'CRITICAL' : r.urgency_label) as any
  }));
}
