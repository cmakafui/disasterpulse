from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportUpdate, ReportInDB
from app.api import deps
from app.utils.pdf_extractor import extract_text_from_pdf_url, pdf_to_base64_pngs

router = APIRouter()


@router.get("/", response_model=List[ReportInDB])
async def read_reports(
    db: AsyncSession = Depends(deps.get_db), skip: int = 0, limit: int = 100
) -> Any:
    result = await db.execute(select(Report).offset(skip).limit(limit))
    reports = result.scalars().all()
    return [ReportInDB.model_validate(report) for report in reports]


@router.get("/{report_id}", response_model=ReportInDB)
async def read_report(report_id: int, db: AsyncSession = Depends(deps.get_db)) -> Any:
    result = await db.execute(select(Report).filter(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportInDB.model_validate(report)


@router.post("/", response_model=ReportInDB)
async def create_report(
    report: ReportCreate, db: AsyncSession = Depends(deps.get_db)
) -> Any:
    db_report = Report(**report.model_dump())
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    return ReportInDB.model_validate(db_report)


@router.put("/{report_id}", response_model=ReportInDB)
async def update_report(
    report_id: int, report: ReportUpdate, db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(Report).filter(Report.id == report_id))
    db_report = result.scalar_one_or_none()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    update_data = report.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_report, field, value)
    await db.commit()
    await db.refresh(db_report)
    return ReportInDB.model_validate(db_report)


@router.delete("/{report_id}", response_model=dict)
async def delete_report(report_id: int, db: AsyncSession = Depends(deps.get_db)) -> Any:
    result = await db.execute(select(Report).filter(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    await db.delete(report)
    await db.commit()
    return {"ok": True}


@router.get("/{report_id}/text", response_model=dict)
async def extract_report_pdf(
    report_id: int, db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(Report).filter(Report.id == report_id))
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.file or not isinstance(report.file, list) or len(report.file) == 0:
        raise HTTPException(status_code=404, detail="No PDF file found for this report")

    pdf_url = report.file[0].get("url")
    if not pdf_url:
        raise HTTPException(
            status_code=404, detail="No valid PDF URL found for this report"
        )

    extracted_text = await extract_text_from_pdf_url(pdf_url)

    report.extracted_report = extracted_text
    await db.commit()

    return {"text": extracted_text}


@router.get("/{report_id}/maps", response_model=dict)
async def extract_report_images(
    report_id: int, db: AsyncSession = Depends(deps.get_db)
) -> dict:
    # Get the report from the database and make sure it's a Map PDF
    result = await db.execute(
        select(Report).filter(
            Report.id == report_id,
            Report.content_format_id == settings.CONTENT_FORMAT_MAP,
        )
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.file or not isinstance(report.file, list) or len(report.file) == 0:
        raise HTTPException(status_code=404, detail="No PDF file found for this report")

    pdf_url = report.file[0].get("url")
    if not pdf_url:
        raise HTTPException(
            status_code=404, detail="No valid PDF URL found for this report"
        )

    base64_pngs = await pdf_to_base64_pngs(pdf_url)

    report.extracted_maps = base64_pngs
    await db.commit()

    return {"images": base64_pngs}
