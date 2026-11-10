import logging
from typing import Dict, Any, List
import httpx
from core.config import settings
from core.cache import cache

logger = logging.getLogger("praleye.ingestion.seismic")

async def fetch_usgs_earthquakes(min_magnitude: float = 3.0) -> List[Dict[str, Any]]:
    """
    Fetches real-time seismic events for India & surrounding sub-continent
    (Bounding Box: Lat 6.0N to 38.0N, Lon 68.0E to 98.0E).
    """
    cache_key = f"seismic_events_{min_magnitude}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    url = settings.USGS_EARTHQUAKE_URL
    params = {
        "format": "geojson",
        "starttime": "NOW - 7 days",
        "minmagnitude": min_magnitude,
        "minlatitude": 6.0,
        "maxlatitude": 38.0,
        "minlongitude": 68.0,
        "maxlongitude": 98.0
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                features = data.get("features", [])
                events = []
                for f in features:
                    props = f.get("properties", {})
                    coords = f.get("geometry", {}).get("coordinates", [0, 0, 0])
                    events.append({
                        "id": f.get("id"),
                        "magnitude": float(props.get("mag", 0.0)),
                        "place": props.get("place", "Northern India Region"),
                        "time_epoch_ms": props.get("time"),
                        "lon": float(coords[0]),
                        "lat": float(coords[1]),
                        "depth_km": float(coords[2]) if len(coords) > 2 else 10.0,
                        "status": "LIVE"
                    })
                cache.set(cache_key, events)
                return events
    except Exception as e:
        logger.warning(f"USGS Earthquake API unreachable ({e}). Returning offline seismic baseline.")

    # High-realism baseline events (Himalayan Arc / Kutch / Koyna active faultlines)
    baseline = [
        {
            "id": "usgs_sim_01",
            "magnitude": 4.6,
            "place": "24 km NE of Chamoli, Uttarakhand",
            "time_epoch_ms": 1731234567000,
            "lat": 30.5500,
            "lon": 79.4800,
            "depth_km": 15.0,
            "status": "SIMULATED_BASELINE"
        },
        {
            "id": "usgs_sim_02",
            "magnitude": 3.8,
            "place": "18 km W of Bhuj, Gujarat",
            "time_epoch_ms": 1731210000000,
            "lat": 23.2800,
            "lon": 69.5200,
            "depth_km": 20.0,
            "status": "SIMULATED_BASELINE"
        }
    ]
    return baseline

