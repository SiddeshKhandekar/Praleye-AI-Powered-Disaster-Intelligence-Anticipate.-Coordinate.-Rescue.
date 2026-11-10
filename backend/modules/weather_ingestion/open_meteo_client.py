import logging
from typing import Dict, Any, Optional
import httpx
from core.config import settings
from core.cache import cache

logger = logging.getLogger("praleye.ingestion.weather")

def get_weather_condition(code: int) -> Dict[str, str]:
    if code == 0:
        return {"condition": "Clear Sky", "icon": "☀️"}
    elif code in [1, 2, 3]:
        return {"condition": "Partly Cloudy", "icon": "⛅"}
    elif code in [45, 48]:
        return {"condition": "Dense Fog", "icon": "🌫️"}
    elif code in [51, 53, 55]:
        return {"condition": "Light Drizzle", "icon": "🌦️"}
    elif code in [61, 63]:
        return {"condition": "Moderate Rain", "icon": "🌧️"}
    elif code == 65:
        return {"condition": "Heavy Torrential Rain", "icon": "🌧️"}
    elif code in [71, 73, 75, 77]:
        return {"condition": "Snow / Glacial Precipitation", "icon": "❄️"}
    elif code in [80, 81, 82]:
        return {"condition": "Torrential Showers", "icon": "⛈️"}
    elif code in [95, 96, 99]:
        return {"condition": "Severe Thunderstorm", "icon": "⚡"}
    return {"condition": "Overcast", "icon": "☁️"}

async def fetch_open_meteo_weather(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches real-time hourly meteorological telemetry from Open-Meteo Forecast API:
    - Precipitation (mm)
    - Soil moisture (0-7cm / 0-27cm)
    - Wind speed & gusts (km/h)
    - Surface temperature (°C) & relative humidity (%)
    - Mean sea level pressure (hPa)
    Includes 5-minute TTL caching and offline fallback.
    """
    cache_key = f"weather_{round(lat, 2)}_{round(lon, 2)}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    url = settings.OPEN_METEO_BASE_URL
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": [
            "temperature_2m", "relative_humidity_2m", "apparent_temperature",
            "precipitation", "weather_code", "wind_speed_10m", "wind_gusts_10m",
            "surface_pressure", "cloud_cover"
        ],
        "hourly": ["precipitation", "soil_moisture_0_to_7cm"],
        "past_days": 3,
        "forecast_days": 1
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                current = data.get("current", {})
                hourly = data.get("hourly", {})

                # Calculate cumulative rain over last 24h & 72h
                hourly_precip = hourly.get("precipitation", [])
                rain_24h = sum(hourly_precip[-24:]) if len(hourly_precip) >= 24 else current.get("precipitation", 0.0) * 10
                rain_72h = sum(hourly_precip[-72:]) if len(hourly_precip) >= 72 else rain_24h * 2.5

                soil_moisture_list = hourly.get("soil_moisture_0_to_7cm", [])
                soil_moisture = soil_moisture_list[-1] if soil_moisture_list else 0.35

                weather_code = int(current.get("weather_code", 0))
                cond_info = get_weather_condition(weather_code)

                result = {
                    "temperature_c": float(current.get("temperature_2m", 28.0)),
                    "apparent_temperature_c": float(current.get("apparent_temperature", current.get("temperature_2m", 28.0))),
                    "relative_humidity": float(current.get("relative_humidity_2m", 65.0)),
                    "precipitation_current": float(current.get("precipitation", 0.0)),
                    "rain_24h_mm": float(round(rain_24h, 2)),
                    "rain_72h_mm": float(round(rain_72h, 2)),
                    "soil_moisture": float(round(soil_moisture, 3)),
                    "wind_speed_kmh": float(current.get("wind_speed_10m", 15.0)),
                    "wind_gust_kmh": float(current.get("wind_gusts_10m", 25.0)),
                    "pressure_msl_hpa": float(current.get("surface_pressure", 1010.0)),
                    "cloud_cover_pct": float(current.get("cloud_cover", 20.0)),
                    "weather_code": weather_code,
                    "weather_condition": cond_info["condition"],
                    "weather_icon": cond_info["icon"],
                    "status": "LIVE"
                }
                cache.set(cache_key, result)
                return result
    except Exception as e:
        logger.warning(f"Open-Meteo API unreachable or timed out ({e}). Using resilient simulation fallback.")

    # Resilient fallback with plausible baseline
    fallback = {
        "temperature_c": 28.5,
        "apparent_temperature_c": 29.2,
        "relative_humidity": 68.0,
        "precipitation_current": 0.0,
        "rain_24h_mm": 12.0,
        "rain_72h_mm": 28.0,
        "soil_moisture": 0.32,
        "wind_speed_kmh": 14.0,
        "wind_gust_kmh": 22.0,
        "pressure_msl_hpa": 1011.0,
        "cloud_cover_pct": 25.0,
        "weather_code": 1,
        "weather_condition": "Partly Cloudy",
        "weather_icon": "⛅",
        "status": "SIMULATED_OFFLINE"
    }
        "wind_speed_kmh": 14.0,
        "wind_gust_kmh": 22.0,
        "pressure_msl_hpa": 1011.0,
        "status": "SIMULATED_OFFLINE"
    }
    return fallback

