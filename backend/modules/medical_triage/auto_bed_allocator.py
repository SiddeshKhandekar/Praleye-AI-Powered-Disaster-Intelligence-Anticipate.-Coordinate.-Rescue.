import math
import logging
from typing import Dict, Any, List, Optional
from modules.prediction_engine.safe_zone_locator import haversine_distance_km

logger = logging.getLogger("praleye.medical.allocator")

def calculate_hospital_triage_cost(
    distance_km: float,
    vacant_beds: int,
    total_beds: int,
    oxygen_reserve_hours: float,
    is_specialty_matched: bool = True,
    is_flooded_zone: bool = False
) -> float:
    """
    Mathematical Model 2.1 from Document 04 (Optimal Assignment Cost J(h)):
    J(h) = alpha * (T_travel / T_max) + beta * (1 - B_vacant / B_total) + gamma * Phi_risk - delta * I_specialty
    Weights: alpha = 0.45, beta = 0.30, gamma = 0.15, delta = 0.10
    Lower Cost J(h) is more optimal.
    """
    t_travel = (distance_km / 45.0) * 60.0  # Approx 45 km/h ambulance road speed
    t_max = 90.0  # Golden-hour baseline 90 mins
    t_term = min(1.5, t_travel / t_max)

    # Bed occupancy penalty
    b_total = max(1, total_beds)
    vacant_ratio = min(1.0, max(0.0, vacant_beds / b_total))
    b_term = 1.0 - vacant_ratio

    # Risk penalty (hospital inside flood zone or oxygen < 12h)
    risk_penalty = 0.0
    if is_flooded_zone:
        risk_penalty += 0.8
    if oxygen_reserve_hours < 12.0:
        risk_penalty += 0.6
    elif oxygen_reserve_hours < 4.0:
        risk_penalty += 2.0  # Extreme hazard

    # Specialty bonus
    spec_bonus = 1.0 if is_specialty_matched else 0.0

    alpha, beta, gamma, delta = 0.45, 0.30, 0.15, 0.10
    cost = (alpha * t_term) + (beta * b_term) + (gamma * risk_penalty) - (delta * spec_bonus)
    return round(cost, 3)


def allocate_emergency_beds(
    casualty_count: int,
    severity: str,  # ICU, TRAUMA, VENTILATOR, GENERAL, BURN
    disaster_lat: float,
    disaster_lon: float,
    candidate_hospitals: List[Dict[str, Any]],
    airlift_required: bool = False
) -> Dict[str, Any]:
    """
    Automated Multi-Hospital Batch Splitting & Bed Assignment (Doc 04 Section 2.2):
    - Automatically filters out damaged/evacuating hospitals and hospitals with < 4h oxygen
    - Ranks surviving facilities by lowest J(h) cost
    - Splits patient batches across multiple top hospitals if casualty count exceeds single hospital vacancy
    """
    eligible = []
    bed_field = f"{severity.lower()}_available"
    total_field = f"{severity.lower()}_total"

    for h in candidate_hospitals:
        # Exclusion 1: Hospital status
        if h.get("structural_status") == "DAMAGED_EVACUATING":
            continue
        # Exclusion 2: Critical oxygen depletion
        if h.get("oxygen_reserve_hours", 24.0) < 4.0:
            continue
        # Exclusion 3: Airlift capability check
        if airlift_required and not h.get("helipad_available", False):
            continue

        vacant = h.get(bed_field, h.get("icu_available", 0))
        total = h.get(total_field, h.get("icu_total", 20))
        dist = haversine_distance_km(disaster_lat, disaster_lon, h["lat"], h["lon"])

        cost = calculate_hospital_triage_cost(
            distance_km=dist,
            vacant_beds=vacant,
            total_beds=total,
            oxygen_reserve_hours=h.get("oxygen_reserve_hours", 24.0),
            is_specialty_matched=True
        )

        eligible.append({
            "hospital_id": h["id"],
            "name": h["name"],
            "lat": h["lat"],
            "lon": h["lon"],
            "distance_km": dist,
            "eta_minutes": round((dist / 45.0) * 60.0, 1),
            "vacant_specialty_beds": vacant,
            "helipad_available": h.get("helipad_available", False),
            "assignment_cost": cost
        })

    # Sort by lowest cost
    eligible.sort(key=lambda x: x["assignment_cost"])

    # Multi-hospital batch splitting
    allocations = []
    unassigned = casualty_count

    for h in eligible:
        if unassigned <= 0:
            break
        available = h["vacant_specialty_beds"]
        if available <= 0:
            continue

        assigned = min(unassigned, available)
        allocations.append({
            "hospital_id": h["hospital_id"],
            "hospital_name": h["name"],
            "assigned_patients": assigned,
            "distance_km": h["distance_km"],
            "eta_minutes": h["eta_minutes"],
            "helipad_available": h["helipad_available"],
            "lat": h["lat"],
            "lon": h["lon"]
        })
        unassigned -= assigned

    return {
        "severity": severity,
        "total_casualties": casualty_count,
        "assigned_casualties": casualty_count - unassigned,
        "unassigned_casualties": unassigned,
        "multi_hospital_split": len(allocations) > 1,
        "allocations": allocations
    }

