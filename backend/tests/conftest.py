import pytest
from core.database import engine, Base
from seed.seeder import seed_database_if_empty

@pytest.fixture(scope="session", autouse=True)
async def init_test_database():
    """
    Auto-initializes tables and seeds the database before running any test.
    Ensures tests that query tables directly or via FastAPI client always have tables ready.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database_if_empty()

