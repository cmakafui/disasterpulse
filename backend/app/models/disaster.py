from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base


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
    affected_countries = Column(JSON)
    primary_type = Column(JSON)
    related_glide = Column(JSON)

    # AI Fields
    report_analysis = Column(JSON)
    map_analysis = Column(JSON)
    news_analysis = Column(JSON)

    reports = relationship("Report", back_populates="disaster")
