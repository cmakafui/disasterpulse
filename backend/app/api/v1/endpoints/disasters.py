from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.disaster import Disaster
from app.schemas.disaster import DisasterCreate, DisasterUpdate, DisasterInDB
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[DisasterInDB])
async def read_disasters(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    result = await db.execute(select(Disaster).offset(skip).limit(limit))
    disasters = result.scalars().all()
    return [DisasterInDB.model_validate(disaster) for disaster in disasters]

@router.get("/{disaster_id}", response_model=DisasterInDB)
async def read_disaster(
    disaster_id: int,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(Disaster).filter(Disaster.id == disaster_id))
    disaster = result.scalar_one_or_none()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    return DisasterInDB.model_validate(disaster)

@router.post("/", response_model=DisasterInDB)
async def create_disaster(
    disaster: DisasterCreate,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    db_disaster = Disaster(**disaster.model_dump())
    db.add(db_disaster)
    await db.commit()
    await db.refresh(db_disaster)
    return DisasterInDB.model_validate(db_disaster)

@router.put("/{disaster_id}", response_model=DisasterInDB)
async def update_disaster(
    disaster_id: int,
    disaster: DisasterUpdate,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(Disaster).filter(Disaster.id == disaster_id))
    db_disaster = result.scalar_one_or_none()
    if not db_disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    update_data = disaster.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_disaster, field, value)
    await db.commit()
    await db.refresh(db_disaster)
    return DisasterInDB.model_validate(db_disaster)

@router.delete("/{disaster_id}", response_model=dict)
async def delete_disaster(
    disaster_id: int,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(Disaster).filter(Disaster.id == disaster_id))
    disaster = result.scalar_one_or_none()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    await db.delete(disaster)
    await db.commit()
    return {"ok": True}