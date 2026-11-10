import json
import logging
from pathlib import Path
from sqlalchemy.future import select
from core.database import (
    AsyncSessionLocal, District, Hospital, SafeZone, ForceDeployment, HazardTelemetry
)

logger = logging.getLogger("praleye.seeder")

SEED_DIR = Path(__file__).resolve().parent

async def seed_database_if_empty():
    """
    Auto-seeds SQLite database with Indian districts, hospitals, safe zones,
    and forces on initial boot if empty.
    """
    async with AsyncSessionLocal() as session:
        # Check if districts exist
        result = await session.execute(select(District).limit(1))
        existing_district = result.scalars().first()

        if existing_district:
            logger.info("Database already contains seed data. Skipping auto-seeding.")
            return

        logger.info("Seeding database with Indian disaster intelligence baseline...")

        # 1. Seed Districts
        districts_file = SEED_DIR / "seed_districts_india.json"
        if not districts_file.exists():
            districts_file = SEED_DIR.parent / "data" / "seed_districts_india.json"

        if districts_file.exists():
            with open(districts_file, "r", encoding="utf-8") as f:
                districts_data = json.load(f)
                for item in districts_data:
                    district = District(
                        id=item["id"],
                        name=item["name"],
                        state=item["state"],
                        lat=item["lat"],
                        lon=item["lon"],
                        slope_deg=item.get("slope_deg", 5.0),
                        elevation_m=item.get("elevation_m", 100.0),
                        population=item.get("population", 500000)
                    )
                    session.add(district)
                    
                    # Pre-seed initial nominal hazard telemetry
                    telemetry = HazardTelemetry(
                        district_id=district.id,
                        rain_24h_mm=0.0,
                        soil_moisture=0.25,
                        river_discharge_m3s=15.0,
                        wind_gust_kmh=12.0,
                        temperature_c=29.0,
                        p_flood=0.05,
                        p_landslide=0.02,
                        p_cyclone=0.01,
                        p_seismic=0.03,
                        p_heat=0.10,
                        risk_level="LOW"
                    )
                    session.add(telemetry)
            await session.commit()
            logger.info(f"Seeded {len(districts_data)} Indian districts.")

        # 2. Seed Hospitals
        hospitals_file = SEED_DIR / "seed_hospitals_india.json"
        if not hospitals_file.exists():
            hospitals_file = SEED_DIR.parent / "data" / "seed_hospitals_india.json"

        if hospitals_file.exists():
            with open(hospitals_file, "r", encoding="utf-8") as f:
                hospitals_data = json.load(f)
                for item in hospitals_data:
                    hospital = Hospital(
                        id=item["id"],
                        name=item["name"],
                        chain_type=item.get("chain_type", "CIVIL"),
                        district_id=item["district_id"],
                        lat=item["lat"],
                        lon=item["lon"],
                        icu_total=item.get("icu_total", 20),
                        icu_available=item.get("icu_available", 5),
                        trauma_total=item.get("trauma_total", 30),
                        trauma_available=item.get("trauma_available", 10),
                        ventilator_total=item.get("ventilator_total", 15),
                        ventilator_available=item.get("ventilator_available", 4),
                        general_total=item.get("general_total", 100),
                        general_available=item.get("general_available", 25),
                        burn_total=item.get("burn_total", 10),
                        burn_available=item.get("burn_available", 2),
                        oxygen_reserve_hours=item.get("oxygen_reserve_hours", 24.0),
                        backup_generator_fuel_hours=item.get("backup_generator_fuel_hours", 48.0),
                        helipad_available=item.get("helipad_available", False),
                        structural_status=item.get("structural_status", "OPERATIONAL")
                    )
                    session.add(hospital)
            await session.commit()
            logger.info(f"Seeded {len(hospitals_data)} Indian hospitals.")

        # 3. Seed Safe Zones
        safe_zones_file = SEED_DIR / "seed_safe_zones.json"
        if not safe_zones_file.exists():
            safe_zones_file = SEED_DIR.parent / "data" / "seed_safe_zones.json"

        if safe_zones_file.exists():
            with open(safe_zones_file, "r", encoding="utf-8") as f:
                safe_zones_data = json.load(f)
                for item in safe_zones_data:
                    safe_zone = SafeZone(
                        id=item["id"],
                        name=item["name"],
                        district_id=item["district_id"],
                        lat=item["lat"],
                        lon=item["lon"],
                        capacity_max=item.get("capacity_max", 5000),
                        current_occupancy=item.get("current_occupancy", 100),
                        helipad_available=item.get("helipad_available", False),
                        elevation_m=item.get("elevation_m", 50.0)
                    )
                    session.add(safe_zone)
            await session.commit()
            logger.info(f"Seeded {len(safe_zones_data)} Indian safe zones.")

        # 4. Seed Force Deployments
        forces_file = SEED_DIR / "seed_forces_units.json"
        if not forces_file.exists():
            forces_file = SEED_DIR.parent / "data" / "seed_forces_units.json"

        if forces_file.exists():
            with open(forces_file, "r", encoding="utf-8") as f:
                forces_data = json.load(f)
                for item in forces_data:
                    force = ForceDeployment(
                        id=item["id"],
                        unit_name=item["unit_name"],
                        branch=item.get("branch", "NDRF"),
                        district_id=item.get("district_id"),
                        lat=item["lat"],
                        lon=item["lon"],
                        personnel_count=item.get("personnel_count", 30),
                        equipment=item.get("equipment", ""),
                        status=item.get("status", "STANDBY")
                    )
                    session.add(force)
            await session.commit()
            logger.info(f"Seeded {len(forces_data)} Defense and NDRF units.")
