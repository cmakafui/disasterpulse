from typing import Any, List, Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.models.disaster import Disaster
from app.models.report import Report
from app.schemas.disaster import DisasterCreate, DisasterUpdate, DisasterInDB
from app.api import deps
from app.utils.pdf_extractor import extract_text_from_pdf_url, pdf_to_base64_pngs
from app.utils.ai_analysis import generate_map_analysis, generate_report_analysis
from enum import Enum

router = APIRouter()


class Language(str, Enum):
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"


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


@router.get("/{disaster_id}/analysis", response_model=DisasterInDB)
async def get_latest_report_analysis(
    disaster_id: int,
    analysis_type: Literal["report", "map"] = Query(
        ..., description="Type of analysis to perform"
    ),
    lang: Language = Query(Language.ENGLISH, description="Language for the analysis"),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    # Check if the disaster exists
    disaster_result = await db.execute(
        select(Disaster).filter(Disaster.id == disaster_id)
    )
    disaster = disaster_result.scalar_one_or_none()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")

    match analysis_type:
        case "report":
            if not disaster.report_analysis:
                disaster.report_analysis = await analyze_report(
                    disaster_id, disaster.name, lang, db
                )
        case "map":
            if not disaster.map_analysis:
                disaster.map_analysis = await analyze_map(
                    disaster_id, disaster.name, lang, db
                )

    # Commit the changes to the database
    await db.commit()
    await db.refresh(disaster)
    return DisasterInDB.model_validate(disaster)


async def analyze_report(
    disaster_id: int, disaster_name: str, lang: str, db: AsyncSession
) -> dict:
    # Get the latest situation report for the disaster
    report_result = await db.execute(
        select(Report)
        .filter(
            Report.disaster_id == disaster_id,
            Report.content_format_id == settings.CONTENT_FORMAT_SITUATION_REPORT,
        )
        .order_by(desc(Report.date_created))
        .limit(1)
    )
    latest_report = report_result.scalar_one_or_none()
    if not latest_report:
        raise HTTPException(
            status_code=404, detail="No situation report found for this disaster"
        )

    # Extract the text from the situation report
    if latest_report.extracted_report:
        extracted_text = latest_report.extracted_report
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
        # Update the report with the extracted text
        latest_report.extracted_report = extracted_text
        await db.commit()
    else:
        raise HTTPException(
            status_code=404,
            detail="No content available for analysis in the latest report",
        )

    # Perform AI analysis on the extracted text
    report_analysis = await generate_report_analysis(
        disaster_name, latest_report.title, extracted_text, lang
    )

    # Return the analysis results
    return {
        "latest_report_id": latest_report.id,
        "latest_report_title": latest_report.title,
        "latest_report_date": latest_report.date_created.isoformat(),
        "type": "report",
        "analysis": report_analysis.model_dump(),
    }


async def analyze_map(disaster_id: int, disaster_name : str, lang: str, db: AsyncSession) -> dict:
    # Get the latest map for the disaster
    map_result = await db.execute(
        select(Report)
        .filter(
            Report.disaster_id == disaster_id,
            Report.content_format_id == settings.CONTENT_FORMAT_MAP,
        )
        .order_by(desc(Report.date_created))
        .limit(1)
    )
    latest_map = map_result.scalar_one_or_none()
    if not latest_map:
        raise HTTPException(
            status_code=404, detail="No Map found for this disaster"
        )
    # Extract the images from the Map PDF
    if latest_map.extracted_maps:
        extracted_images = latest_map.extracted_maps
    elif (
        latest_map.file
        and isinstance(latest_map.file, list)
        and len(latest_map.file) > 0
    ):
        pdf_url = latest_map.file[0].get("url")
        if not pdf_url:
            raise HTTPException(
                status_code=404, detail="No valid PDF URL found for the latest Map"
            )
        extracted_images = await pdf_to_base64_pngs(pdf_url)
        # Update the map with the extracted images
        latest_map.extracted_maps = extracted_images
        await db.commit()
    else:
        raise HTTPException(
            status_code=404,
            detail="No images available for analysis in the latest map",
        )


    # Perform AI analysis on the map images
    map_analysis = await generate_map_analysis(
        disaster_name, latest_map.title, latest_map.extracted_maps, lang
    )

    # Return the map analysis data
    return {
        "disaster_id": disaster_id,
        "latest_map_date": latest_map.date_created.isoformat(),
        "type": "map",
        "analysis": map_analysis.model_dump(),
    }
