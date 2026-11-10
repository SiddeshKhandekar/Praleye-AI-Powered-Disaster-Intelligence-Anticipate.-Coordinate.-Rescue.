import os
import pytest
from sqlalchemy.future import select
from core.database import (
    engine, Base, AsyncSessionLocal, District, Hospital, SafeZone, ForceDeployment
)
from seed.seeder import seed_database_if_empty

@pytest.mark.asyncio
async def test_database_init_and_seeding():
    # 1. Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Run seeder
    await seed_database_if_empty()

    # 3. Verify seeded records
    async with AsyncSessionLocal() as session:
        # Districts
        d_res = await session.execute(select(District))
        districts = d_res.scalars().all()
        assert len(districts) >= 20, f"Expected >=20 districts, found {len(districts)}"
        
        # Verify Pune
        pune = next((d for d in districts if d.name == "Pune"), None)
        assert pune is not None
        assert pune.state == "Maharashtra"
        assert pune.lat == 18.5204

        # Hospitals
        h_res = await session.execute(select(Hospital))
        hospitals = h_res.scalars().all()
        assert len(hospitals) >= 15, f"Expected >=15 hospitals, found {len(hospitals)}"
        
        # Verify AIIMS Delhi
        aiims = next((h for h in hospitals if "AIIMS" in h.name and "Delhi" in h.name), None)
        assert aiims is not None
        assert aiims.icu_total >= 50
        assert aiims.helipad_available is True

        # Safe Zones
        sz_res = await session.execute(select(SafeZone))
        safe_zones = sz_res.scalars().all()
        assert len(safe_zones) >= 10, f"Expected >=10 safe zones, found {len(safe_zones)}"

        # Forces
        f_res = await session.execute(select(ForceDeployment))
        forces = f_res.scalars().all()
        assert len(forces) >= 5, f"Expected >=5 forces, found {len(forces)}"
