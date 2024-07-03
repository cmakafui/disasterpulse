# app/api/v1/api.py
from fastapi import APIRouter
from app.api.v1.endpoints import disasters, reports

api_router = APIRouter()
api_router.include_router(disasters.router, prefix="/disasters", tags=["disasters"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
