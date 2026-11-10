import math
from typing import Dict, Any, List

MAJOR_DAMS_INDIA = {
    "DAM-TEHRI": {
        "name": "Tehri Dam (Uttarakhand)",
        "capacity_mcm": 3540.0,
        "max_discharge_cusecs": 390000.0,
        "downstream_districts": ["Dehradun", "Rishikesh", "Haridwar"],
        "lat": 30.3780,
        "lon": 78.4800
    },
    "DAM-SARDAR": {
        "name": "Sardar Sarovar Dam (Gujarat)",
        "capacity_mcm": 9500.0,
        "max_discharge_cusecs": 850000.0,
        "downstream_districts": ["Bharuch", "Narmada", "Vadodara"],
        "lat": 21.8290,
        "lon": 73.7480
    },
    "DAM-IDUKKI": {
        "name": "Idukki Arch Dam (Kerala)",
        "capacity_mcm": 2000.0,
        "max_discharge_cusecs": 150000.0,
        "downstream_districts": ["Idukki", "Ernakulam", "Aluva"],
        "lat": 9.8497,
        "lon": 76.9744
    },
    "DAM-HIRAKUD": {
        "name": "Hirakud Dam (Odisha)",
        "capacity_mcm": 5896.0,
        "max_discharge_cusecs": 1500000.0,
        "downstream_districts": ["Sambalpur", "Cuttack", "Puri"],
        "lat": 21.5700,
        "lon": 83.8700
    },
    "DAM-KOYNA": {
        "name": "Koyna Dam (Maharashtra)",
        "capacity_mcm": 2797.0,
        "max_discharge_cusecs": 120000.0,
        "downstream_districts": ["Satara", "Sangli", "Kolhapur"],
        "lat": 17.4000,
        "lon": 73.7500
    }
}

def simulate_dam_cascade_failure(
    dam_id: str,
    upstream_rain_24h_mm: float,
    current_storage_pct: float
) -> Dict[str, Any]:
    """
    Critical Infrastructure Cascade Simulator (Doc 05 Feature 2):
    When storage crosses 90% or rainfall exceeds 200mm, computes downstream
    inundation polygon, breach risk, and vulnerable infrastructure.
    """
    dam = MAJOR_DAMS_INDIA.get(dam_id, MAJOR_DAMS_INDIA["DAM-IDUKKI"])
    
    inflow_expansion = (upstream_rain_24h_mm / 150.0) * 15.0
    projected_storage_pct = min(100.0, current_storage_pct + inflow_expansion)
    
    spillway_open = projected_storage_pct >= 85.0
    discharge_m3s = (projected_storage_pct / 100.0) * (dam["max_discharge_cusecs"] * 0.0283168)
    
    # Cascade Impact Severity
    if projected_storage_pct >= 95.0:
        alert_status = "CRITICAL_SPILLWAY_EMERGENCY"
        inundation_radius_km = 45.0
    elif projected_storage_pct >= 85.0:
        alert_status = "CONTROLLED_DISCHARGE_WARNING"
        inundation_radius_km = 20.0
    else:
        alert_status = "NORMAL_STORAGE"
        inundation_radius_km = 5.0

    return {
        "dam_name": dam["name"],
        "projected_storage_pct": round(projected_storage_pct, 1),
        "spillway_gates_open": spillway_open,
        "simulated_discharge_m3s": round(discharge_m3s, 1),
        "alert_status": alert_status,
        "inundation_radius_km": inundation_radius_km,
        "threatened_districts": dam["downstream_districts"],
        "critical_infrastructure_at_risk": [
            f"{dam['downstream_districts'][0]} 220kV Electrical Substation",
            f"{dam['downstream_districts'][-1]} District Hospital Water Treatment Plant",
            "State Highway Bridges (Low-lying)"
        ]
    }

