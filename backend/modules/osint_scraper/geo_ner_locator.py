import re
import math
import logging
from typing import Dict, Any, Optional
import httpx
from core.cache import cache

logger = logging.getLogger("praleye.osint.geoner")

# Offline centroid dictionary for major Indian disaster-prone pincodes
PINCODE_CENTROIDS = {
    "411011": {"name": "Kasba Peth, Pune", "lat": 18.5204, "lon": 73.8567, "district": "IN-MH-PUN"},
    "411001": {"name": "Pune Station / Camp", "lat": 18.5289, "lon": 73.8744, "district": "IN-MH-PUN"},
    "400051": {"name": "Bandra East, Mumbai", "lat": 19.0607, "lon": 72.8554, "district": "IN-MH-MUM"},
    "400001": {"name": "Fort, Mumbai", "lat": 18.9322, "lon": 72.8354, "district": "IN-MH-MUM"},
    "600042": {"name": "Velachery, Chennai", "lat": 12.9815, "lon": 80.2180, "district": "IN-TN-CHE"},
    "600028": {"name": "Raja Annamalaipuram, Chennai", "lat": 13.0238, "lon": 80.2585, "district": "IN-TN-CHE"},
    "673577": {"name": "Meppadi / Chooralmala, Wayanad", "lat": 11.5512, "lon": 76.1280, "district": "IN-KL-WAY"},
    "682011": {"name": "Kochi City, Ernakulam", "lat": 9.9674, "lon": 76.2440, "district": "IN-KL-EKM"},
    "246401": {"name": "Gopeshwar, Chamoli", "lat": 30.4120, "lon": 79.3350, "district": "IN-UT-CHA"},
    "248001": {"name": "Dehradun GPO", "lat": 30.3256, "lon": 78.0437, "district": "IN-UT-DEH"},
    "752001": {"name": "Puri Town", "lat": 19.8135, "lon": 85.8312, "district": "IN-OD-PUR"},
    "751001": {"name": "Bhubaneswar Central", "lat": 20.2706, "lon": 85.8334, "district": "IN-OD-KHO"},
    "700001": {"name": "BBD Bagh, Kolkata", "lat": 22.5726, "lon": 88.3510, "district": "IN-WB-KOL"},
    "781001": {"name": "Pan Bazar, Guwahati", "lat": 26.1856, "lon": 91.7485, "district": "IN-AS-KAM"},
    "110001": {"name": "Connaught Place, New Delhi", "lat": 28.6315, "lon": 77.2167, "district": "IN-DL-DEL"},
    "560001": {"name": "MG Road, Bengaluru", "lat": 12.9756, "lon": 77.6066, "district": "IN-KA-BLR"},
    "500001": {"name": "Abids, Hyderabad", "lat": 17.3916, "lon": 78.4734, "district": "IN-TG-HYD"},
    "171001": {"name": "The Mall, Shimla", "lat": 31.1048, "lon": 77.1734, "district": "IN-HP-SHI"}
}

# Offline Gazetteer of Major Indian Landmarks
LANDMARK_GAZETTEER = {
    "kasba peth": {"lat": 18.5204, "lon": 73.8567, "district": "IN-MH-PUN", "name": "Kasba Peth Ganpati"},
    "velachery": {"lat": 12.9815, "lon": 80.2180, "district": "IN-TN-CHE", "name": "Velachery MRTS"},
    "chooralmala": {"lat": 11.5512, "lon": 76.1280, "district": "IN-KL-WAY", "name": "Chooralmala Bridge"},
    "mundakkai": {"lat": 11.5360, "lon": 76.1420, "district": "IN-KL-WAY", "name": "Mundakkai Town"},
    "joshimath": {"lat": 30.5564, "lon": 79.5658, "district": "IN-UT-CHA", "name": "Joshimath Badrinath Road"},
    "aluva": {"lat": 10.1076, "lon": 76.3516, "district": "IN-KL-EKM", "name": "Aluva Manappuram Temple"},
    "dadar": {"lat": 19.0178, "lon": 72.8478, "district": "IN-MH-MUM", "name": "Dadar TT Circle"},
    "kurla": {"lat": 19.0657, "lon": 72.8797, "district": "IN-MH-MUM", "name": "Kurla Mithi River"},
    "salt lake": {"lat": 22.5800, "lon": 88.4200, "district": "IN-WB-KOL", "name": "Salt Lake Sector V"},
    "panbazar": {"lat": 26.1856, "lon": 91.7485, "district": "IN-AS-KAM", "name": "Panbazar Brahmaputra Ghat"}
}

async def extract_indian_geolocation(text: str) -> Dict[str, Any]:
    """
    3-Stage Indian Geo-NER Pipeline (Doc 02):
    1. Explicit 6-digit Indian PIN Code Regex matching
    2. Indian Landmark & Locality Gazetteer string matching
    3. Photon/Nominatim Geocoding fallback with local caching
    """
    clean_text = text.strip()
    
    # Stage 1: PIN Code regex match
    pin_match = re.search(r'\b[1-8][0-9]{5}\b', clean_text)
    if pin_match:
        pin = pin_match.group(0)
        if pin in PINCODE_CENTROIDS:
            data = PINCODE_CENTROIDS[pin]
            return {
                "matched_location": f"{data['name']} (PIN {pin})",
                "lat": data["lat"],
                "lon": data["lon"],
                "district_id": data["district"],
                "confidence": 0.95,
                "resolution_stage": "STAGE_1_PINCODE_CENTROID"
            }

    # Stage 2: Landmark Gazetteer Match
    lower_text = clean_text.lower()
    for landmark_key, val in LANDMARK_GAZETTEER.items():
        if landmark_key in lower_text:
            return {
                "matched_location": val["name"],
                "lat": val["lat"],
                "lon": val["lon"],
                "district_id": val["district"],
                "confidence": 0.88,
                "resolution_stage": "STAGE_2_LANDMARK_GAZETTEER"
            }

    # Stage 3: Photon Geocoder (Biased to India)
    cache_key = f"geo_{clean_text[:40]}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        # Extract potential proper nouns / capitalized words as search terms
        words = re.findall(r'[A-Z][a-z]+', clean_text)
        query = " ".join(words[:3]) if words else clean_text[:30]
        
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(
                "https://photon.komoot.io/api/",
                params={"q": query, "limit": 1}
            )
            if resp.status_code == 200:
                features = resp.json().get("features", [])
                if features:
                    f = features[0]
                    coords = f.get("geometry", {}).get("coordinates", [0, 0])
                    props = f.get("properties", {})
                    loc_name = props.get("name", query)
                    res = {
                        "matched_location": f"{loc_name}, {props.get('state', 'India')}",
                        "lat": coords[1],
                        "lon": coords[0],
                        "district_id": "IN-GEN-01",
                        "confidence": 0.70,
                        "resolution_stage": "STAGE_3_PHOTON_GEOCODER"
                    }
                    cache.set(cache_key, res)
                    return res
    except Exception as e:
        logger.warning(f"Photon geocoder lookup error ({e}).")

    # Default fallback to central coordinates
    return {
        "matched_location": "Unresolved Indian Coordinates",
        "lat": 18.5204,
        "lon": 73.8567,
        "district_id": "IN-MH-PUN",
        "confidence": 0.40,
        "resolution_stage": "FALLBACK_REGIONAL_DEFAULT"
    }

