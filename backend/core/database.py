import os
import json
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import AsyncGenerator

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, event
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from core.config import settings

logger = logging.getLogger("praleye.database")

# Ensure sqlite data directory exists
if "sqlite" in settings.DATABASE_URL:
    db_path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "")
    db_dir = Path(db_path).parent
    db_dir.mkdir(parents=True, exist_ok=True)

# Async SQLite engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Enable SQLite WAL mode & optimizations on connect
@event.listens_for(engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if "sqlite" in settings.DATABASE_URL:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.execute("PRAGMA wal_autocheckpoint=1000;")
        cursor.close()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

# ==============================================================================
# Database Models (Matches ERD in README & Docs)
# ==============================================================================

class District(Base):
    __tablename__ = "districts"

    id = Column(String(50), primary_key=True)  # e.g., "IN-MH-PUN"
    name = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    slope_deg = Column(Float, default=5.0)
    elevation_m = Column(Float, default=100.0)
    population = Column(Integer, default=500000)

    telemetry = relationship("HazardTelemetry", back_populates="district", cascade="all, delete-orphan")
    safe_zones = relationship("SafeZone", back_populates="district", cascade="all, delete-orphan")
    hospitals = relationship("Hospital", back_populates="district", cascade="all, delete-orphan")
    sos_reports = relationship("OsintSosReport", back_populates="district")


class HazardTelemetry(Base):
    __tablename__ = "hazard_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_id = Column(String(50), ForeignKey("districts.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    rain_24h_mm = Column(Float, default=0.0)
    soil_moisture = Column(Float, default=0.0)
    river_discharge_m3s = Column(Float, default=0.0)
    wind_gust_kmh = Column(Float, default=0.0)
    temperature_c = Column(Float, default=28.0)
    relative_humidity = Column(Float, default=60.0)
    p_flood = Column(Float, default=0.0)
    p_landslide = Column(Float, default=0.0)
    p_cyclone = Column(Float, default=0.0)
    p_seismic = Column(Float, default=0.0)
    p_heat = Column(Float, default=0.0)
    risk_level = Column(String(20), default="LOW")  # LOW, MODERATE, HIGH, CRITICAL

    district = relationship("District", back_populates="telemetry")


class OsintSosReport(Base):
    __tablename__ = "osint_sos_reports"

    id = Column(String(100), primary_key=True)
    source = Column(String(50), default="TWITTER")  # TWITTER, TELEGRAM, NEWS, REDDIT, CITIZEN
    raw_text = Column(Text, nullable=False)
    extracted_location = Column(String(255), nullable=True)
    district_id = Column(String(50), ForeignKey("districts.id"), nullable=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    people_trapped = Column(Integer, default=1)
    urgency = Column(String(20), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    urgency_score = Column(Float, default=50.0)  # 0 to 100
    credibility_score = Column(Float, default=80.0)  # Weather Cross-Verified (0 to 100)
    status = Column(String(20), default="PENDING")  # PENDING, DISPATCHED, RESCUED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    district = relationship("District", back_populates="sos_reports")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(100), primary_key=True)  # e.g., "HOSP-AIIMS-DEL"
    name = Column(String(255), nullable=False)
    chain_type = Column(String(50), default="CIVIL")  # AIIMS, ARMED_FORCES, APOLLO, FORTIS, MANIPAL, CIVIL
    district_id = Column(String(50), ForeignKey("districts.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    
    icu_total = Column(Integer, default=20)
    icu_available = Column(Integer, default=5)
    trauma_total = Column(Integer, default=30)
    trauma_available = Column(Integer, default=10)
    ventilator_total = Column(Integer, default=15)
    ventilator_available = Column(Integer, default=4)
    general_total = Column(Integer, default=100)
    general_available = Column(Integer, default=25)
    burn_total = Column(Integer, default=10)
    burn_available = Column(Integer, default=2)
    
    oxygen_reserve_hours = Column(Float, default=24.0)
    backup_generator_fuel_hours = Column(Float, default=48.0)
    helipad_available = Column(Boolean, default=False)
    structural_status = Column(String(30), default="OPERATIONAL")  # OPERATIONAL, SURGE_CAPACITY, DAMAGED_EVACUATING

    district = relationship("District", back_populates="hospitals")
    assignments = relationship("TriageAssignment", back_populates="hospital")


class TriageAssignment(Base):
    __tablename__ = "triage_assignments"

    id = Column(String(100), primary_key=True)
    patient_ref = Column(String(100), nullable=False)
    sos_report_id = Column(String(100), nullable=True)
    hospital_id = Column(String(100), ForeignKey("hospitals.id"), nullable=False)
    bed_category = Column(String(30), default="ICU")  # ICU, TRAUMA, GENERAL, BURN, VENTILATOR
    patient_count = Column(Integer, default=1)
    distance_km = Column(Float, default=5.0)
    eta_minutes = Column(Float, default=15.0)
    route_geojson = Column(Text, nullable=True)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    hospital = relationship("Hospital", back_populates="assignments")


class SafeZone(Base):
    __tablename__ = "safe_zones"

    id = Column(String(100), primary_key=True)
    name = Column(String(255), nullable=False)
    district_id = Column(String(50), ForeignKey("districts.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    capacity_max = Column(Integer, default=1000)
    current_occupancy = Column(Integer, default=150)
    helipad_available = Column(Boolean, default=False)
    elevation_m = Column(Float, default=50.0)

    district = relationship("District", back_populates="safe_zones")


class CapAlert(Base):
    __tablename__ = "cap_alerts"

    id = Column(String(100), primary_key=True)
    district_id = Column(String(50), nullable=False)
    hazard_type = Column(String(50), nullable=False)
    severity = Column(String(20), default="SEVERE")  # EXTREME, SEVERE, MODERATE
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    translations_json = Column(Text, nullable=True)  # JSON dictionary for 11 Indian languages
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)


class ForceDeployment(Base):
    __tablename__ = "force_deployments"

    id = Column(String(100), primary_key=True)
    unit_name = Column(String(255), nullable=False)  # e.g., "1st NDRF Battalion - Alpha Team"
    branch = Column(String(50), default="NDRF")  # ARMY, IAF, NAVY, NDRF, SDRF, FIRE, POLICE
    district_id = Column(String(50), nullable=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    personnel_count = Column(Integer, default=30)
    equipment = Column(Text, default="Inflatable motorboats, SatPhones, Medical kits")
    status = Column(String(30), default="STANDBY")  # STANDBY, EN_ROUTE, DEPLOYED, RETURNING


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
