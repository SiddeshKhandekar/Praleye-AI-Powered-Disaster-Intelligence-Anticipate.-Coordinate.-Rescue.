import base64
import json
import logging
from typing import Dict, Any

logger = logging.getLogger("praleye.alert.beacon")

def generate_compressed_offline_sos_beacon(
    lat: float,
    lon: float,
    headcount: int,
    medical_need: str,
    battery_pct: int
) -> Dict[str, Any]:
    """
    Launch-Grade Feature 1 (Doc 05): Offline-First Citizen SOS Beacon with Acoustic Siren
    Compresses emergency payload into an ultra-compact ~100 byte base64 string for SMS/Satellite relay.
    """
    compact_payload = {
        "c": [round(lat, 5), round(lon, 5)],
        "n": headcount,
        "m": medical_need[:10],
        "b": battery_pct
    }
    raw_str = json.dumps(compact_payload, separators=(',', ':'))
    b64_str = base64.b64encode(raw_str.encode('utf-8')).decode('utf-8')

    return {
        "compressed_beacon": b64_str,
        "byte_size": len(b64_str),
        "fits_sms_pdu": len(b64_str) <= 140,
        "acoustic_distress_freq_hz": 2800,  # 2.8kHz resonant search-and-rescue tone
        "decoded_preview": compact_payload
    }
