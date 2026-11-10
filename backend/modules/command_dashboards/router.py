from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db, ForceDeployment, SafeZone, Hospital

router = APIRouter(prefix="/dashboards", tags=["Multi-Role Command Dashboards"])

@router.get("/forces-deployments")
async def get_forces_deployments(session: AsyncSession = Depends(get_db)):
    """
    Returns active deployment status of Army HADR columns, NDRF Battalions, IAF SAR, and Fire divisions.
    """
    result = await session.execute(select(ForceDeployment))
    forces = result.scalars().all()
    return [
        {
            "id": f.id,
            "unit_name": f.unit_name,
            "branch": f.branch,
            "district_id": f.district_id,
            "lat": f.lat,
            "lon": f.lon,
            "personnel_count": f.personnel_count,
            "equipment": f.equipment,
            "status": f.status
        }
        for f in forces
    ]

@router.post("/dispatch-force")
async def dispatch_force_unit(
    payload: Dict[str, Any] = Body(...),
    session: AsyncSession = Depends(get_db)
):
    """
    Dispatches a rescue unit to an active SOS coordinate.
    Payload: {"unit_id": "UNIT-NDRF-01-PUN", "target_lat": 18.5204, "target_lon": 73.8567}
    """
    unit_id = payload.get("unit_id")
    result = await session.execute(select(ForceDeployment).where(ForceDeployment.id == unit_id))
    unit = result.scalars().first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    unit.status = "EN_ROUTE"
    unit.lat = payload.get("target_lat", unit.lat)
    unit.lon = payload.get("target_lon", unit.lon)
    await session.commit()

    return {"status": "SUCCESS", "message": f"{unit.unit_name} dispatched to coordinates.", "unit": unit.unit_name}

@router.get("/safe-shelters")
async def get_safe_shelters(session: AsyncSession = Depends(get_db)):
    """Returns all safe zones and current occupancies."""
    result = await session.execute(select(SafeZone))
    zones = result.scalars().all()
    return [
        {
            "id": z.id,
            "name": z.name,
            "district_id": z.district_id,
            "lat": z.lat,
            "lon": z.lon,
            "capacity_max": z.capacity_max,
            "current_occupancy": z.current_occupancy,
            "helipad_available": z.helipad_available,
            "elevation_m": z.elevation_m
        }
        for z in zones
    ]

