from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from .base import Base

class Disaster(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    status = Column(String, index=True)
    glide = Column(String, index=True)
    url = Column(String)
    url_alias = Column(String)
    date_created = Column(DateTime(timezone=True))
    date_changed = Column(DateTime(timezone=True))
    date_event = Column(DateTime(timezone=True), index=True)

    primary_country = Column(JSON)
    primary_type = Column(JSON)
    profile = Column(JSON)
    related_glide = Column(JSON)

    reports = relationship("Report", back_populates="disaster")