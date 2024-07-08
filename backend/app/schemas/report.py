from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ReportBase(BaseModel):
    disaster_id: int
    title: str
    status: str
    date_original: datetime
    content_format_id: Optional[int] = None
    content_format_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ReportList(ReportBase):
    id: int


class ReportDetail(ReportBase):
    id: int
    body: Optional[str] = None
    url: Optional[str] = None
    url_alias: Optional[str] = None
    date_created: datetime
    date_changed: datetime
    language: Optional[list] = None
    source: Optional[list] = None
    theme: Optional[list] = None
    file: Optional[list] = None
    extracted_report: Optional[str] = None
    extracted_maps: Optional[list] = None


class Report(ReportDetail):
    pass
