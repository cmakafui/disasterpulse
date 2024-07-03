from typing import Any, List, Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.disaster import Disaster
from app.models.report import Report
from app.schemas.disaster import DisasterCreate, DisasterUpdate, DisasterInDB
from app.api import deps
from app.utils.pdf_extractor import extract_text_from_pdf_url

router = APIRouter()


@router.get("/", response_model=List[DisasterInDB])
async def read_disasters(
    db: AsyncSession = Depends(deps.get_db), skip: int = 0, limit: int = 100
) -> Any:
    result = await db.execute(select(Disaster).offset(skip).limit(limit))
    disasters = result.scalars().all()
    return [DisasterInDB.model_validate(disaster) for disaster in disasters]


@router.get("/{disaster_id}", response_model=DisasterInDB)
async def read_disaster(
    disaster_id: int, db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(Disaster).filter(Disaster.id == disaster_id))
    disaster = result.scalar_one_or_none()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    return DisasterInDB.model_validate(disaster)


@router.post("/", response_model=DisasterInDB)
async def create_disaster(
    disaster: DisasterCreate, db: AsyncSession = Depends(deps.get_db)
) -> Any:
    db_disaster = Disaster(**disaster.model_dump())
    db.add(db_disaster)
    await db.commit()
    await db.refresh(db_disaster)
    return DisasterInDB.model_validate(db_disaster)


@router.put("/{disaster_id}", response_model=DisasterInDB)
async def update_disaster(
    disaster_id: int, disaster: DisasterUpdate, db: AsyncSession = Depends(deps.get_db)
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
    disaster_id: int, db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(Disaster).filter(Disaster.id == disaster_id))
    disaster = result.scalar_one_or_none()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    await db.delete(disaster)
    await db.commit()
    return {"ok": True}


@router.get("/{disaster_id}/analysis", response_model=dict)
async def get_disaster_analysis(
    disaster_id: int,
    analysis_type: Literal["report", "map"] = Query(
        ..., description="Type of analysis to perform"
    ),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    # Check if the disaster exists
    disaster_result = await db.execute(
        select(Disaster).filter(Disaster.id == disaster_id)
    )
    disaster = disaster_result.scalar_one_or_none()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")

    if analysis_type == "report":
        return await analyze_report(disaster_id, db)
    elif analysis_type == "map":
        return await analyze_map(disaster_id, db)


async def analyze_report(disaster_id: int, db: AsyncSession) -> dict:
    # Get the latest situation report for the disaster
    report_result = await db.execute(
        select(Report)
        .filter(Report.disaster_id == disaster_id, Report.content_format_id == 10)
        .order_by(desc(Report.date_created))
        .limit(1)
    )
    latest_report = report_result.scalar_one_or_none()
    if not latest_report:
        raise HTTPException(
            status_code=404, detail="No situation report found for this disaster"
        )

    # Extract the text from the situation report
    if latest_report.extracted_content:
        extracted_text = latest_report.extracted_content
    elif (
        latest_report.file
        and isinstance(latest_report.file, list)
        and len(latest_report.file) > 0
    ):
        pdf_url = latest_report.file[0].get("url")
        if not pdf_url:
            raise HTTPException(
                status_code=404, detail="No valid PDF URL found for the latest report"
            )
        extracted_text = await extract_text_from_pdf_url(pdf_url)
        # Update the report with the extracted content
        latest_report.extracted_content = extracted_text
        await db.commit()
    else:
        raise HTTPException(
            status_code=404,
            detail="No content available for analysis in the latest report",
        )

    # Perform basic analysis (word count)
    word_count = len(extracted_text.split())

    # Return the analysis results
    return {
        "disaster_id": disaster_id,
        "latest_report_id": latest_report.id,
        "latest_report_date": latest_report.date_created.isoformat(),
        "analysis_type": "report",
        "analysis": {
            "word_count": word_count,
        },
    }


async def analyze_map(disaster_id: int, db: AsyncSession) -> dict:
    # Retrieve the disaster to access the map_analysis field
    disaster_result = await db.execute(
        select(Disaster).filter(
            Disaster.id == disaster_id, Report.content_format_id == 12
        )
    )
    disaster = disaster_result.scalar_one_or_none()

    if not disaster or not disaster.map_analysis:
        raise HTTPException(
            status_code=404, detail="No map analysis available for this disaster"
        )

    # Return the map analysis data
    return {
        "disaster_id": disaster_id,
        "analysis_type": "map",
        "analysis": disaster.map_analysis,
    }
