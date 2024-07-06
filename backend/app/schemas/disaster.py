from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class DisasterBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str
    glide: Optional[str] = None
    url: Optional[str] = None
    url_alias: Optional[str] = None
    date_event: datetime
    primary_country: Optional[dict] = None
    primary_type: Optional[dict] = None
    related_glide: Optional[list] = None
    report_analysis: Optional[dict] = None
    map_analysis: Optional[dict] = None

    class Config:
        from_attributes = True


class DisasterCreate(DisasterBase):
    pass


class DisasterUpdate(DisasterBase):
    pass


class DisasterInDBBase(DisasterBase):
    id: int
    date_created: datetime
    date_changed: datetime

    model_config = ConfigDict(from_attributes=True)


class DisasterInDB(DisasterInDBBase):
    pass


class Disaster(DisasterInDBBase):
    pass
