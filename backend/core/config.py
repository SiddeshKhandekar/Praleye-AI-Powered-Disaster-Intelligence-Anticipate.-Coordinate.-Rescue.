from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    FRONTEND_PORT: int = 5173
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/praleye.db"
    
    CACHE_DIR: str = "./data/cache"
    CACHE_TTL_SECONDS: int = 300
    
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"
    
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_FLOOD_URL: str = "https://flood-api.open-meteo.com/v1/flood"
    USGS_EARTHQUAKE_URL: str = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    GDACS_FEED_URL: str = "https://www.gdacs.org/xml/rss.xml"
    NASA_FIRMS_URL: str = "https://eonet.gsfc.nasa.gov/api/v3/events"
    PHOTON_GEOCODE_URL: str = "https://photon.komoot.io/api/"
    OSRM_BASE_URL: str = "https://router.project-osrm.org/route/v1/driving"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

