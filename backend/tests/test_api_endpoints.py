import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_api_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "HEALTHY"

@pytest.mark.asyncio
async def test_predictions_grid_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/predictions/india-grid")
        assert res.status_code == 200
        data = res.json()
        assert data["type"] == "FeatureCollection"
        assert len(data["features"]) >= 10

@pytest.mark.asyncio
async def test_osint_feed_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/osint/live-feed")
        assert res.status_code == 200
        reports = res.json()
        assert len(reports) >= 5

@pytest.mark.asyncio
async def test_hospitals_network_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/hospitals/network-status")
        assert res.status_code == 200
        hospitals = res.json()
        assert len(hospitals) >= 15

@pytest.mark.asyncio
async def test_local_llm_sitrep_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/llm/generate-sitrep", json={"active_sos_count": 5})
        assert res.status_code == 200
        data = res.json()
        assert "sitrep_content" in data
        assert "HQ INTEGRATED DEFENCE STAFF" in data["sitrep_content"]

