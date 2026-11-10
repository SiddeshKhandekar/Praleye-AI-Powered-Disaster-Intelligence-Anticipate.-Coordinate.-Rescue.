from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db, District, HazardTelemetry, SafeZone
from modules.weather_ingestion.open_meteo_client import fetch_open_meteo_weather
from modules.prediction_engine.hazard_calculator import (
    calculate_flood_probability, calculate_landslide_susceptibility,
    calculate_cyclone_surge_probability, calculate_wet_bulb_heat_risk,
    classify_risk_level
)
from modules.prediction_engine.dam_cascade_simulator import simulate_dam_cascade_failure
from modules.prediction_engine.safe_zone_locator import get_osrm_evacuation_route, validate_iaf_helipad_weather_ceiling

router = APIRouter(prefix="/predictions", tags=["Predictions & Hazard Grid"])

@router.get("/india-grid")
async def get_india_hazard_grid(session: AsyncSession = Depends(get_db)):
    """
    Returns real-time multi-hazard risk GeoJSON grid across all monitored Indian districts.
    Computes deterministic probabilities using live Open-Meteo telemetry.
    """
    result = await session.execute(select(District))
    districts = result.scalars().all()

    features = []
    for d in districts:
        weather = await fetch_open_meteo_weather(d.lat, d.lon)
        
        is_hilly = d.slope_deg >= 20.0 or d.elevation_m >= 500.0
        p_flood = calculate_flood_probability(
            rain_24h_mm=weather["rain_24h_mm"],
            soil_moisture=weather["soil_moisture"],
            river_discharge_m3s=weather["rain_24h_mm"] * 1.5,
            elevation_m=d.elevation_m,
            is_mountainous=is_hilly
        )
        p_landslide = calculate_landslide_susceptibility(
            slope_deg=d.slope_deg,
            rain_72h_mm=weather["rain_72h_mm"],
            soil_moisture=weather["soil_moisture"]
        )
        p_cyclone = calculate_cyclone_surge_probability(
            wind_gust_kmh=weather["wind_gust_kmh"],
            pressure_msl_hpa=weather["pressure_msl_hpa"],
            distance_coast_km=max(5.0, d.elevation_m / 2.0)
        )
        heat_data = calculate_wet_bulb_heat_risk(
            temperature_c=weather["temperature_c"],
            relative_humidity=weather["relative_humidity"]
        )
        p_heat = heat_data["p_heat"]

        probs = {
            "p_flood": p_flood,
            "p_landslide": p_landslide,
            "p_cyclone": p_cyclone,
            "p_heat": p_heat
        }
        risk_level = classify_risk_level(probs)

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [d.lon, d.lat]
            },
            "properties": {
                "district_id": d.id,
                "name": d.name,
                "state": d.state,
                "population": d.population,
                "elevation_m": d.elevation_m,
                "slope_deg": d.slope_deg,
                "probabilities": probs,
                "composite_risk_level": risk_level,
                "weather_telemetry": weather
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.post("/simulate-cascade")
async def run_dam_cascade_simulation(
    dam_id: str = Query("DAM-IDUKKI"),
    upstream_rain_mm: float = Query(220.0),
    current_storage_pct: float = Query(88.0)
):
    """Simulate dam spillway release and downstream inundation impacts."""
    return simulate_dam_cascade_failure(dam_id, upstream_rain_mm, current_storage_pct)

@router.get("/helipad-weather-ceiling")
async def check_helipad_clearance(
    wind_gust_kmh: float = Query(35.0),
    visibility_km: float = Query(7.0),
    rain_mmhr: float = Query(5.0)
):
    """Validates IAF Mi-17 / ALH Dhruv CASEVAC airlift clearance."""
    return validate_iaf_helipad_weather_ceiling(wind_gust_kmh, visibility_km, rain_mmhr)

@router.get("/evacuation-corridor")
async def get_evacuation_corridor(
    start_lat: float = Query(...),
    start_lon: float = Query(...),
    safe_zone_lat: float = Query(...),
    safe_zone_lon: float = Query(...)
):
    """Calculates road evacuation route to nearest safe zone."""
    return await get_osrm_evacuation_route(start_lat, start_lon, safe_zone_lat, safe_zone_lon)
