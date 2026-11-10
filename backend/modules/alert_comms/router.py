from typing import Dict, Any
from fastapi import APIRouter, Body, Query, Response
from modules.alert_comms.cap_xml_generator import generate_cap_v12_xml
from modules.alert_comms.multilingual_engine import translate_disaster_alert, INDIAN_LANG_TRANSLATIONS
from modules.alert_comms.offline_beacon import generate_compressed_offline_sos_beacon

router = APIRouter(prefix="/alerts", tags=["CAP v1.2 & Multilingual Alerts"])

@router.post("/broadcast-cap")
async def broadcast_cap_alert(payload: Dict[str, Any] = Body(...)):
    """
    Dispatches ITU CAP v1.2 XML alert payload.
    """
    alert_id = payload.get("alert_id", "ALT-001")
    district = payload.get("district_name", "Pune")
    hazard = payload.get("hazard_type", "Flood")
    severity = payload.get("severity", "Severe")
    headline = payload.get("headline", f"Emergency {hazard} Evacuation Alert")
    desc = payload.get("description", "Heavy precipitation has triggered severe flash flood warnings.")
    inst = payload.get("instruction", "Proceed to nearest elevated school or sports complex shelter immediately.")
    lang = payload.get("language", "en-IN")

    xml_content = generate_cap_v12_xml(
        alert_id=alert_id,
        district_name=district,
        hazard_type=hazard,
        severity=severity,
        headline=headline,
        description=desc,
        instruction=inst,
        language=lang
    )

    return Response(content=xml_content, media_type="application/xml")

@router.get("/translate")
async def get_multilingual_alert(
    hazard_key: str = Query("flood_alert"),
    language: str = Query("hi")
):
    """Translates alert phrase into any of the 11 official Indian languages."""
    translated = translate_disaster_alert(hazard_key, language)
    return {
        "language": language,
        "hazard_key": hazard_key,
        "translated_text": translated
    }

@router.post("/offline-sos-beacon")
async def create_offline_beacon(payload: Dict[str, Any] = Body(...)):
    """Creates a compressed 140-byte acoustic/SMS SOS beacon."""
    lat = payload.get("lat", 18.5204)
    lon = payload.get("lon", 73.8567)
    headcount = payload.get("headcount", 2)
    med = payload.get("medical_need", "NONE")
    bat = payload.get("battery_pct", 75)
    return generate_compressed_offline_sos_beacon(lat, lon, headcount, med, bat)

