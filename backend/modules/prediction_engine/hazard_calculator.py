import math
from typing import Dict, Any

def sigmoid(x: float) -> float:
    """Standard numerically stable logistic sigmoid function."""
    if x < -40.0:
        return 0.0
    if x > 40.0:
        return 1.0
    return 1.0 / (1.0 + math.exp(-x))

def calculate_flood_probability(
    rain_24h_mm: float,
    soil_moisture: float,
    river_discharge_m3s: float,
    elevation_m: float,
    is_mountainous: bool = False
) -> float:
    """
    Mathematical Model 2.1 from Document 01:
    I_rain = min(1.0, R_24h / R_crit)  (R_crit = 100mm for hills, 150mm for plains)
    I_river = min(1.0, Q_current / Q_bankfull) (Q_bankfull baseline ~120 m3/s)
    S_moisture in [0, 1]
    E_elev: Terrain elevation above nearest river channel
    P_flood = 100 * sigmoid(w1 * I_rain + w2 * I_river + w3 * S_moisture - w4 * ln(max(1, E_elev)))
    Weights: w1 = 0.35, w2 = 0.40, w3 = 0.15, w4 = 0.10
    """
    r_crit = 100.0 if is_mountainous else 150.0
    q_bankfull = 120.0

    i_rain = min(1.0, max(0.0, rain_24h_mm / r_crit))
    i_river = min(1.0, max(0.0, river_discharge_m3s / q_bankfull))
    s_moisture = min(1.0, max(0.0, soil_moisture))
    elev_factor = math.log(max(1.0, elevation_m))

    w1, w2, w3, w4 = 0.35, 0.40, 0.15, 0.10
    
    # Linear combination
    z = (w1 * i_rain + w2 * i_river + w3 * s_moisture) - (w4 * elev_factor * 0.2)
    # Centering around threshold
    scaled_z = (z - 0.30) * 8.0

    p_flood = 100.0 * sigmoid(scaled_z)
    return round(min(100.0, max(0.0, p_flood)), 2)


def calculate_landslide_susceptibility(
    slope_deg: float,
    rain_72h_mm: float,
    soil_moisture: float,
    recent_seismic_mag: float = 0.0
) -> float:
    """
    Mathematical Model 2.2 from Document 01:
    P_landslide = 100 * min(1.0, (slope / 45)^1.4 * (0.5 * S_moist + 0.5 * (R_72h / 250)) * (1 + 0.3 * M_seismic))
    """
    if slope_deg < 5.0:
        return 0.0

    slope_factor = math.pow(min(1.5, slope_deg / 45.0), 1.4)
    rain_factor = min(1.0, rain_72h_mm / 250.0)
    moist_factor = min(1.0, max(0.0, soil_moisture))
    
    m_seismic = max(0.0, recent_seismic_mag - 3.0) * 0.2 if recent_seismic_mag >= 3.0 else 0.0
    seismic_mult = 1.0 + (0.3 * m_seismic)

    p_landslide = 100.0 * min(1.0, slope_factor * (0.5 * moist_factor + 0.5 * rain_factor) * seismic_mult)
    return round(min(100.0, max(0.0, p_landslide)), 2)


def calculate_cyclone_surge_probability(
    wind_gust_kmh: float,
    pressure_msl_hpa: float,
    distance_coast_km: float
) -> float:
    """
    Mathematical Model 2.3 from Document 01:
    P_cyclone = 100 * min(1.0, 0.45 * (V_gust / 120) + 0.35 * ((1013 - P_msl) / 60) + 0.20 * (1 / max(1, D_coast / 50)))
    """
    if distance_coast_km > 300.0:
        return 0.0

    wind_term = 0.45 * min(1.5, wind_gust_kmh / 120.0)
    pres_drop = max(0.0, 1013.0 - pressure_msl_hpa)
    pres_term = 0.35 * min(1.5, pres_drop / 60.0)
    coast_term = 0.20 * (1.0 / max(1.0, distance_coast_km / 30.0))

    p_cyclone = 100.0 * min(1.0, wind_term + pres_term + coast_term)
    return round(min(100.0, max(0.0, p_cyclone)), 2)


def calculate_seismic_intensity_mmi(
    magnitude_mw: float,
    depth_km: float,
    distance_km: float,
    is_zone_v: bool = False
) -> float:
    """
    Mathematical Model 2.4 from Document 01:
    I_MMI = 1.68 + 1.58 * Mw - 1.42 * ln(sqrt(D_epi^2 + h_depth^2)) + Z_factor
    Z_factor in [0.2, 1.0] for Zone V
    """
    hypo_dist = math.sqrt(distance_km**2 + depth_km**2)
    z_factor = 0.8 if is_zone_v else 0.3
    
    mmi = 1.68 + (1.58 * magnitude_mw) - (1.42 * math.log(max(1.0, hypo_dist))) + z_factor
    return round(min(12.0, max(1.0, mmi)), 2)


def calculate_wet_bulb_heat_risk(temperature_c: float, relative_humidity: float) -> Dict[str, Any]:
    """
    Mathematical Model 2.5 from Document 01 (Stull's Wet-Bulb Equation):
    T_w = T * atan(0.151977 * (RH + 8.313659)^0.5) + atan(T + RH) - atan(RH - 1.676331)
          + 0.00391838 * RH^1.5 * atan(0.023101 * RH) - 4.686035
    Critical threshold: Tw >= 31°C or T >= 45°C
    """
    t = temperature_c
    rh = relative_humidity

    # Stull Formula
    term1 = t * math.atan(0.151977 * math.pow(rh + 8.313659, 0.5))
    term2 = math.atan(t + rh)
    term3 = math.atan(rh - 1.676331)
    term4 = 0.00391838 * math.pow(rh, 1.5) * math.atan(0.023101 * rh)
    
    t_w = term1 + term2 - term3 + term4 - 4.686035

    if t_w >= 31.0 or t >= 45.0:
        p_heat = min(100.0, 85.0 + (t_w - 31.0) * 5.0)
        risk_level = "CRITICAL"
    elif t_w >= 28.0 or t >= 40.0:
        p_heat = 65.0 + (t_w - 28.0) * 6.0
        risk_level = "HIGH"
    elif t_w >= 25.0:
        p_heat = 35.0
        risk_level = "MODERATE"
    else:
        p_heat = 10.0
        risk_level = "LOW"

    return {
        "wet_bulb_temp_c": round(t_w, 2),
        "p_heat": round(min(100.0, max(0.0, p_heat)), 2),
        "risk_level": risk_level
    }


def classify_risk_level(probabilities: Dict[str, float]) -> str:
    """Classifies composite threat into NDMA Standard 4-Tier Scale."""
    max_p = max(probabilities.values()) if probabilities else 0.0
    if max_p >= 75.0:
        return "CRITICAL"
    if max_p >= 50.0:
        return "HIGH"
    if max_p >= 25.0:
        return "MODERATE"
    return "LOW"
