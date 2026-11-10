import re
from typing import Dict, Any

LIFE_THREAT_KEYWORDS = [
    "trapped", "drowning", "chest deep", "submerged", "building collapse",
    "debris", "bleeding", "unconscious", "no breath", "electric shock",
    "fasse hue", "bachao", "pani bhar gaya", "dub rahe hain", "madad"
]

VULNERABLE_KEYWORDS = [
    "infant", "baby", "child", "children", "pregnant", "elderly", "old age",
    "grandfather", "grandmother", "paralyzed", "oxygen cylinder", "dialysis"
]

def score_sos_urgency(text: str, group_size: int = 1) -> Dict[str, Any]:
    """
    Computes Rescue Priority Urgency Score U_sos in [0, 100] (Doc 02 Stage 3):
    U_sos = min(100, 30*I_life_threat + 25*I_vulnerable + 25*I_location + 20*I_corroboration)
    """
    lower = text.lower()

    # Life threat check (30 pts)
    has_life_threat = any(k in lower for k in LIFE_THREAT_KEYWORDS)
    i_life_threat = 1.0 if has_life_threat else 0.0

    # Vulnerable citizens check (25 pts)
    has_vulnerable = any(k in lower for k in VULNERABLE_KEYWORDS) or group_size >= 4
    i_vulnerable = 1.0 if has_vulnerable else 0.0

    # Location precision check (25 pts)
    has_pincode = bool(re.search(r'\b[1-8][0-9]{5}\b', text))
    has_landmark = any(word in lower for word in ["near", "beside", "opposite", "road", "street", "nagar", "colony", "mandir", "masjid", "hospital"])
    i_location = 1.0 if (has_pincode or has_landmark) else 0.5

    # Group size corroboration factor (20 pts)
    i_corroboration = min(1.0, 0.5 + (group_size * 0.1))

    u_sos = 30.0 * i_life_threat + 25.0 * i_vulnerable + 25.0 * i_location + 20.0 * i_corroboration
    u_sos = round(min(100.0, max(10.0, u_sos)), 1)

    if u_sos >= 75.0:
        urgency_label = "CRITICAL"
    elif u_sos >= 50.0:
        urgency_label = "HIGH"
    elif u_sos >= 30.0:
        urgency_label = "MEDIUM"
    else:
        urgency_label = "LOW"

    return {
        "urgency_score": u_sos,
        "urgency_label": urgency_label,
        "life_threat": has_life_threat,
        "vulnerable_people": has_vulnerable
    }

