from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db, OsintSosReport
from modules.osint_scraper.social_harvester import harvest_osint_reports
from modules.osint_scraper.geo_ner_locator import extract_indian_geolocation
from modules.osint_scraper.sos_classifier import score_sos_urgency
from modules.osint_scraper.telemetry_verifier import cross_verify_weather_credibility

router = APIRouter(prefix="/osint", tags=["OSINT Rescue & Geo-NER"])

@router.get("/live-feed")
async def get_live_osint_feed():
    """
    Returns real-time geo-verified OSINT distress calls scraped across X, Telegram, Reddit, and News.
    Each post includes exact coordinates, rescue urgency, and fake-news credibility status.
    """
    return await harvest_osint_reports()

@router.post("/extract-location")
async def run_geo_ner_extraction(payload: Dict[str, Any] = Body(...)):
    """
    Runs the 3-stage Indian Geo-NER pipeline and urgency classifier on unstructured text.
    Payload: {"text": "Water in Kasba Peth Pune 411011, 4 people trapped", "group_size": 4}
    """
    text = payload.get("text", "")
    group_size = payload.get("group_size", 1)
    if not text:
        raise HTTPException(status_code=400, detail="Missing text field")

    geo = await extract_indian_geolocation(text)
    urgency = score_sos_urgency(text, group_size)

    return {
        "text": text,
        "extracted_location": geo["matched_location"],
        "coordinates": {"lat": geo["lat"], "lon": geo["lon"]},
        "district_id": geo["district_id"],
        "resolution_stage": geo["resolution_stage"],
        "confidence": geo["confidence"],
        "urgency": urgency
    }

@router.post("/verify-claim")
async def verify_sos_claim(
    hazard: str = Query("flood"),
    rain_mm: float = Query(75.0),
    wind_kmh: float = Query(25.0),
    discharge: float = Query(120.0),
    seismic_mag: float = Query(0.0)
):
    """Anti-Fake-News Verifier: Corroborates disaster claim against physical sensor telemetry."""
    return cross_verify_weather_credibility(hazard, rain_mm, wind_kmh, discharge, seismic_mag)

