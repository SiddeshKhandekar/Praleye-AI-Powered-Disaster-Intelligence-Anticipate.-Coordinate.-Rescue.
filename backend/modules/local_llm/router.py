from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db, District, Hospital
from modules.local_llm.ollama_client import generate_military_sitrep_llm

router = APIRouter(prefix="/llm", tags=["Local LLM Military SITREP"])

@router.post("/generate-sitrep")
async def generate_sitrep_briefing(
    payload: Dict[str, Any] = Body(default={}),
    session: AsyncSession = Depends(get_db)
):
    """
    Generates structured All-India Defense & NDMA Daily SITREP using local Ollama LLM
    or rule-based fallback.
    """
    # Fetch top districts
    res_d = await session.execute(select(District).limit(5))
    districts = [
        {"name": d.name, "state": d.state, "p_flood": 78.5 if "Wayanad" in d.name else 25.0, "risk_level": "HIGH" if "Wayanad" in d.name else "LOW"}
        for d in res_d.scalars().all()
    ]

    # Fetch hospital bed saturation
    res_h = await session.execute(select(Hospital))
    hospitals = res_h.scalars().all()
    total_icu = sum(h.icu_total for h in hospitals) or 100
    avail_icu = sum(h.icu_available for h in hospitals) or 30
    saturation_pct = ((total_icu - avail_icu) / total_icu) * 100.0

    sos_count = payload.get("active_sos_count", 6)

    return await generate_military_sitrep_llm(districts, sos_count, saturation_pct)
