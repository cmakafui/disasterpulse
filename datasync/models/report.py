from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .base import Base

class Report(Base):
    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(Integer, ForeignKey("disaster.id"), index=True)
    title = Column(String, index=True)
    body = Column(String)
    url = Column(String)
    url_alias = Column(String)
    status = Column(String, index=True)

    date_created = Column(DateTime(timezone=True), index=True)
    date_changed = Column(DateTime(timezone=True))
    date_original = Column(DateTime(timezone=True))
    primary_country = Column(JSON)
    affected_countries = Column(JSON)
    language = Column(JSON)
    source = Column(JSON)
    theme = Column(JSON)
    file = Column(JSON)
    extracted_content = Column(Text)
    headline = Column(JSON)

    content_format_id = Column(Integer, index=True)
    content_format_name = Column(String, index=True)

    disaster = relationship("Disaster", back_populates="reports")