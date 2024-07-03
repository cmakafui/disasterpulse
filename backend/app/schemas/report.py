from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ReportBase(BaseModel):
    disaster_id: int
    title: str
    body: Optional[str] = None
    url: Optional[str] = None
    url_alias: Optional[str] = None
    status: str
    date_original: datetime
    language: Optional[list] = None
    source: Optional[list] = None
    theme: Optional[list] = None
    file: Optional[list] = None
    extracted_content: Optional[str] = None
    headline: Optional[list] = None
    content_format_id: Optional[int] = None
    content_format_name: Optional[str] = None


class ReportCreate(ReportBase):
    pass


class ReportUpdate(ReportBase):
    pass


class ReportInDBBase(ReportBase):
    id: int
    date_created: datetime
    date_changed: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportInDB(ReportInDBBase):
    pass


class Report(ReportInDBBase):
    pass
