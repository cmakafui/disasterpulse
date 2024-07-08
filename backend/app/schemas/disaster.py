from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class DisasterBase(BaseModel):
    id: int
    name: str
    status: str
    glide: Optional[str] = None
    url: Optional[str] = None
    url_alias: Optional[str] = None
    date_event: datetime
    primary_country: Optional[dict] = None
    primary_type: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


class DisasterList(BaseModel):
    id: int
    name: str
    status: str
    date_event: datetime
    date_changed: datetime
    primary_country: Optional[dict] = None
    primary_type: Optional[dict] = None
    report_analysis: Optional[dict] = None
    model_config = ConfigDict(from_attributes=True)


class DisasterDetail(DisasterBase):
    description: Optional[str] = None
    date_created: datetime
    date_changed: datetime
    related_glide: Optional[list] = None
    report_analysis: Optional[dict] = None
    map_analysis: Optional[dict] = None
    news_analysis: Optional[dict] = None
    model_config = ConfigDict(from_attributes=True)


class Disaster(DisasterDetail):
    pass
