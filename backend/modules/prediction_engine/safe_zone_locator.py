import math
import logging
from typing import Dict, Any, List
import httpx
from core.config import settings

logger = logging.getLogger("praleye.routing.safezones")

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two geographic coordinates."""
    r = 6371.0  # Earth's radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


async def get_osrm_evacuation_route(
    start_lat: float, start_lon: float,
    dest_lat: float, dest_lon: float
) -> Dict[str, Any]:
    """
    Computes road evacuation corridor using OSRM routing engine with offline Haversine fallback.
    """
    url = f"{settings.OSRM_BASE_URL}/{start_lon},{start_lat};{dest_lon},{dest_lat}"
    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "true"
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                routes = data.get("routes", [])
                if routes:
                    primary = routes[0]
                    return {
                        "distance_km": round(primary.get("distance", 0.0) / 1000.0, 2),
                        "duration_minutes": round(primary.get("duration", 0.0) / 60.0, 1),
                        "geojson": primary.get("geometry"),
                        "routing_mode": "OSRM_ROAD_NETWORK"
                    }
    except Exception as e:
        logger.warning(f"OSRM service unreachable ({e}). Using direct corridor approximation.")

    direct_dist = haversine_distance_km(start_lat, start_lon, dest_lat, dest_lon)
    # Estimate driving speed ~40 km/h in disaster conditions
    est_duration = (direct_dist / 40.0) * 60.0

    return {
        "distance_km": direct_dist,
        "duration_minutes": round(est_duration, 1),
        "geojson": {
            "type": "LineString",
            "coordinates": [[start_lon, start_lat], [dest_lon, dest_lat]]
        },
        "routing_mode": "DIRECT_HAVERSINE_CORRIDOR"
    }


def validate_iaf_helipad_weather_ceiling(
    wind_gust_kmh: float,
    visibility_km: float = 8.0,
    rainfall_intensity_mmhr: float = 0.0
) -> Dict[str, Any]:
    """
    Launch-Grade Feature 3 (Doc 05): Golden-Hour Airlift Helipad & Weather Ceiling Validator
    For IAF Mi-17 V5 / ALH Dhruv CASEVAC operations:
    - GREEN (FLYABLE): V_gust < 45 km/h, Visibility > 5km, Rain < 15 mm/hr
    - AMBER (INSTRUMENT ONLY): V_gust 45-55 km/h, Visibility 2-5km
    - RED (GROUNDED): V_gust > 55 km/h or Visibility < 2km or Rain > 40 mm/hr
    """
    if wind_gust_kmh > 55.0 or visibility_km < 2.0 or rainfall_intensity_mmhr > 40.0:
        status = "RED"
        recommendation = "GROUNDED - High shear/turbulence. Use motorized flood boats or amphibious vehicles."
        flyable = False
    elif wind_gust_kmh >= 45.0 or visibility_km < 5.0 or rainfall_intensity_mmhr >= 15.0:
        status = "AMBER"
        recommendation = "INSTRUMENT_ONLY - Experienced IAF SAR pilots under IFR flight plan."
        flyable = True
    else:
        status = "GREEN"
        recommendation = "FLYABLE - Visual Flight Rules (VFR) clear for CASEVAC airlift & winch operations."
        flyable = True

    return {
        "airlift_status": status,
        "flyable": flyable,
        "wind_gust_kmh": wind_gust_kmh,
        "visibility_km": visibility_km,
        "recommendation": recommendation
    }

