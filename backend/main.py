import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import engine, Base
from core.websocket_manager import ws_manager
from seed.seeder import seed_database_if_empty

# Routers
from modules.weather_ingestion.router import router as weather_router
from modules.prediction_engine.router import router as prediction_router
from modules.osint_scraper.router import router as osint_router
from modules.medical_triage.router import router as hospital_router
from modules.alert_comms.router import router as alert_router
from modules.command_dashboards.router import router as dashboard_router
from modules.local_llm.router import router as llm_router

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
logger = logging.getLogger("praleye.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed database
    logger.info("Initializing Praleye Database Schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database_if_empty()
    logger.info("Praleye System Ready.")
    yield
    # Shutdown
    await engine.dispose()
    logger.info("Praleye Database Connection Closed.")

app = FastAPI(
    title="PRALEYE (प्रलय-दृष्टि)",
    description="Autonomous Multi-Hazard Disaster Intelligence, OSINT Rescue Geolocation, & Tactical Command Platform for India",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular Routers under /api/v1
app.include_router(prediction_router, prefix="/api/v1")
app.include_router(weather_router, prefix="/api/v1")
app.include_router(osint_router, prefix="/api/v1")
app.include_router(hospital_router, prefix="/api/v1")
app.include_router(alert_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(llm_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "platform": "PRALEYE Core",
        "version": "1.0.0",
        "mode": "ZERO_CONFIG_LOCAL_WAL"
    }

@app.websocket("/ws/live-telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive & handle incoming pings
            data = await websocket.receive_text()
            await websocket.send_text(f'{{"ack": true, "received": {data}}}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

