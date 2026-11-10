from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db, Hospital, TriageAssignment
from modules.medical_triage.auto_bed_allocator import allocate_emergency_beds

router = APIRouter(prefix="/hospitals", tags=["Hospital Network & Bed Triage"])

@router.get("/network-status")
async def get_hospital_network_status(session: AsyncSession = Depends(get_db)):
    """
    Returns live bed inventories and critical oxygen/generator reserves across all Indian apex hospitals.
    """
    result = await session.execute(select(Hospital))
    hospitals = result.scalars().all()
    
    return [
        {
            "id": h.id,
            "name": h.name,
            "chain_type": h.chain_type,
            "district_id": h.district_id,
            "lat": h.lat,
            "lon": h.lon,
            "icu": {"available": h.icu_available, "total": h.icu_total},
            "trauma": {"available": h.trauma_available, "total": h.trauma_total},
            "ventilator": {"available": h.ventilator_available, "total": h.ventilator_total},
            "general": {"available": h.general_available, "total": h.general_total},
            "burn": {"available": h.burn_available, "total": h.burn_total},
            "oxygen_reserve_hours": h.oxygen_reserve_hours,
            "backup_generator_fuel_hours": h.backup_generator_fuel_hours,
            "helipad_available": h.helipad_available,
            "structural_status": h.structural_status
        }
        for h in hospitals
    ]

@router.post("/auto-assign-beds")
async def auto_assign_emergency_beds(
    payload: Dict[str, Any] = Body(...),
    session: AsyncSession = Depends(get_db)
):
    """
    Executes atomic multi-variable emergency bed triage and batch splitting.
    Payload: {
        "casualty_count": 25,
        "severity": "TRAUMA",
        "lat": 18.5204,
        "lon": 73.8567,
        "airlift_required": false
    }
    """
    count = payload.get("casualty_count", 1)
    severity = payload.get("severity", "TRAUMA").upper()
    lat = payload.get("lat", 18.5204)
    lon = payload.get("lon", 73.8567)
    airlift = payload.get("airlift_required", False)

    result = await session.execute(select(Hospital))
    hospitals = [
        {
            "id": h.id,
            "name": h.name,
            "lat": h.lat,
            "lon": h.lon,
            "icu_available": h.icu_available,
            "icu_total": h.icu_total,
            "trauma_available": h.trauma_available,
            "trauma_total": h.trauma_total,
            "ventilator_available": h.ventilator_available,
            "ventilator_total": h.ventilator_total,
            "general_available": h.general_available,
            "general_total": h.general_total,
            "burn_available": h.burn_available,
            "burn_total": h.burn_total,
            "oxygen_reserve_hours": h.oxygen_reserve_hours,
            "helipad_available": h.helipad_available,
            "structural_status": h.structural_status
        }
        for h in result.scalars().all()
    ]

    triage_result = allocate_emergency_beds(
        casualty_count=count,
        severity=severity,
        disaster_lat=lat,
        disaster_lon=lon,
        candidate_hospitals=hospitals,
        airlift_required=airlift
    )

    return triage_result
