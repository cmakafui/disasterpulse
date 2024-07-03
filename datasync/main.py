import asyncio
from disaster_pulse_sync import DisasterPulseSync
from db.session import engine
from models.base import Base

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    sync_manager = DisasterPulseSync()
    await sync_manager.start()

if __name__ == "__main__":
    asyncio.run(main())