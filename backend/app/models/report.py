# app/models/report.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base


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
    language = Column(JSON)
    source = Column(JSON)
    theme = Column(JSON)
    file = Column(JSON)
    headline = Column(JSON)

    content_format_id = Column(Integer, index=True)
    content_format_name = Column(String, index=True)

    disaster = relationship("Disaster", back_populates="reports")