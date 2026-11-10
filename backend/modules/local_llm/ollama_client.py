import logging
from typing import Dict, Any, List
import httpx
from core.config import settings
from modules.local_llm.sitrep_template import build_deterministic_military_sitrep

logger = logging.getLogger("praleye.llm.client")

async def generate_military_sitrep_llm(
    top_districts: List[Dict[str, Any]],
    sos_count: int,
    icu_saturation_pct: float
) -> Dict[str, Any]:
    """
    RAG Local LLM Generator (Doc 05 Section 1):
    Connects to local Ollama instance (llama3.2:3b / qwen2.5:7b-instruct).
    Seamlessly falls back to deterministic template if Ollama is unreachable.
    """
    prompt = f"""You are the Chief Intelligence Officer at HQ Integrated Defence Staff (IDS) and NDMA India.
Synthesize the following live telemetry into a formal Military Daily SITREP:

Top Monitored Districts: {top_districts[:5]}
Scraped Civilian SOS Incidents: {sos_count}
National ICU Bed Saturation: {icu_saturation_pct}%

Generate a structured 4-part military operational briefing:
1. EXECUTIVE THREAT ASSESSMENT (NEXT 24-72H)
2. PRIORITY ZONES REQUIRING FORCES PRE-POSITIONING
3. ACTIVE OSINT RESCUE HOTSPOTS
4. MEDICAL & LOGISTICS BOTTLENECKS
Keep it concise, authoritative, and actionable for Army/NDRF Commanders."""

    try:
        url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                result = resp.json().get("response", "")
                return {
                    "engine": f"LOCAL_OLLAMA_{settings.OLLAMA_MODEL.upper()}",
                    "sitrep_content": result
                }
    except Exception as e:
        logger.info(f"Ollama connection unavailable ({e}). Triggering deterministic tactical briefing fallback.")

    return build_deterministic_military_sitrep(top_districts, sos_count, icu_saturation_pct)

