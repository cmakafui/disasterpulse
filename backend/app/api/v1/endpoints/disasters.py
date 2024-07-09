from typing import Any, List, Literal, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.models.disaster import Disaster
from app.models.report import Report
from app.schemas.disaster import DisasterList, DisasterDetail
from app.api import deps
from app.utils.pdf_extractor import extract_text_from_pdf_url, pdf_to_base64_pngs
from app.utils.ai_analysis import generate_map_analysis, generate_report_analysis
from enum import Enum

router = APIRouter()


class Language(str, Enum):
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"


@router.get("/", response_model=List[DisasterList])
async def read_disasters(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[Literal["alert", "ongoing"]] = None,
) -> Any:
    query = (
        select(Disaster).order_by(desc(Disaster.date_changed)).offset(skip).limit(limit)
    )
    if status:
        query = query.filter(Disaster.status == status)
    result = await db.execute(query)
    disasters = result.scalars().all()
    return [DisasterList.model_validate(disaster) for disaster in disasters]


@router.get("/filter", response_model=List[DisasterList])
async def filter_disasters(
    db: AsyncSession = Depends(deps.get_db),
    status: Literal["alert", "ongoing"] = Query(..., description="Status to filter by"),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    query = (
        select(Disaster)
        .filter(Disaster.status == status)
        .order_by(desc(Disaster.date_changed))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    disasters = result.scalars().all()
    return [DisasterList.model_validate(disaster) for disaster in disasters]


@router.get("/{disaster_id}", response_model=DisasterDetail)
async def read_disaster(
    disaster_id: int, db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(Disaster).filter(Disaster.id == disaster_id))
    disaster = result.scalar_one_or_none()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found")
    return DisasterDetail.model_validate(disaster)


@router.put("/{disaster_id}/analysis", response_model=DisasterDetail)
async def get_latest_report_analysis(
    disaster_id: int,
    analysis_type: Literal["report", "map", "news"] = Query(
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
        case "news":
            if not disaster.news_analysis:
                disaster.news_analysis = await analyze_news(
                    disaster_id, disaster.name, lang, db
                )

    # Commit the changes to the database
    await db.commit()
    await db.refresh(disaster)
    return DisasterDetail.model_validate(disaster)


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
        "latest_report_url": latest_report.url,
        "latest_report_sources": latest_report.source,
        "type": "report",
        "analysis": report_analysis.model_dump(),
    }


async def analyze_map(
    disaster_id: int, disaster_name: str, lang: str, db: AsyncSession
) -> dict:
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
        raise HTTPException(status_code=404, detail="No Map found for this disaster")
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
        "latest_map_title": latest_map.title,
        "latest_map_date": latest_map.date_created.isoformat(),
        "latest_map_url": latest_map.url,
        "latest_map_image_url": latest_map.file[0].get("preview").get("url"),
        "type": "map",
        "analysis": map_analysis.model_dump(),
    }


async def analyze_news(
    disaster_id: int, disaster_name: str, lang: str, db: AsyncSession
) -> dict:
    # Perform extraction of latest news articles related to the disaster
    news_result = await db.execute(
        select(Report)
        .filter(
            Report.disaster_id == disaster_id,
            Report.content_format_id == settings.CONTENT_FORMAT_NEWS,
        )
        .order_by(desc(Report.date_created))
        .limit(1)
    )
    latest_news = news_result.scalar_one_or_none()
    if not latest_news:
        raise HTTPException(status_code=404, detail="No News found for this disaster")

    # Return the news analysis data

    return {
        "disaster_id": disaster_id,
        "type": "news",
        "latest_news_title": latest_news.title,
        "latest_news_date": latest_news.date_created.isoformat(),
        "latest_news_content": latest_news.body,
        "latest_news_url": latest_news.url,
    }
