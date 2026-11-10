from fastapi import APIRouter, Query
from modules.weather_ingestion.open_meteo_client import fetch_open_meteo_weather
from modules.weather_ingestion.usgs_ncs_seismic import fetch_usgs_earthquakes
from modules.weather_ingestion.nasa_firms_gdacs import fetch_gdacs_alerts
from modules.weather_ingestion.imd_cwc_rss import fetch_imd_cwc_bulletins

router = APIRouter(prefix="/weather", tags=["Weather & Ingestion"])

@router.get("/current")
async def get_current_weather(lat: float = Query(18.5204), lon: float = Query(73.8567)):
    """Fetch real-time weather & hydrological metrics for coordinate."""
    return await fetch_open_meteo_weather(lat, lon)

@router.get("/seismic")
async def get_seismic_feed(min_mag: float = Query(3.0)):
    """Fetch live USGS/NCS seismic events across India."""
    return await fetch_usgs_earthquakes(min_mag)

@router.get("/bulletins")
async def get_disaster_bulletins():
    """Fetch official IMD, CWC & GDACS bulletins."""
    gdacs = await fetch_gdacs_alerts()
    imd = await fetch_imd_cwc_bulletins()
    return {"gdacs_alerts": gdacs, "national_bulletins": imd}
