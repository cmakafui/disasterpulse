import asyncio
import httpx
from sqlalchemy import delete, and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import logging
from typing import Dict, Any, List
from db.session import AsyncSessionLocal
from models.disaster import Disaster
from models.report import Report
from config import settings

logger = logging.getLogger(__name__)


class APIClient:
    def __init__(self, base_url: str, app_name: str):
        self.base_url = base_url
        self.app_name = app_name
        self.client = httpx.AsyncClient()

    async def post(self, endpoint: str, json: Dict[str, Any] = None) -> Dict[str, Any]:
        url = f"{self.base_url}/{endpoint}?appname={self.app_name}"
        response = await self.client.post(url, json=json)
        response.raise_for_status()
        return response.json()

    async def close(self):
        await self.client.aclose()


class DisasterPulseSync:
    def __init__(self):
        self.relief_web_api = APIClient(
            settings.RELIEF_WEB_API_URL, settings.RELIEFWEB_APP_NAME
        )
        self.retention_period = timedelta(days=settings.RETENTION_PERIOD_DAYS)

    async def make_api_request(
        self, endpoint: str, params: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        try:
            data = await self.relief_web_api.post(endpoint, params)
            return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred: {e}")
            await asyncio.sleep(5)  # Wait before retrying in case of rate limit
            return None
        except httpx.RequestError as e:
            logger.error(f"An error occurred while requesting {e.request.url!r}: {e}")
            return None

    async def sync_disasters(self):
        params = {
            "filter": {"field": "status", "value": ["alert", "ongoing"]},
            "profile": "full",
            "sort": ["date:desc"],
            "limit": 10,
        }
        disasters_data = await self.make_api_request("disasters", params)
        if not disasters_data:
            return

        async with AsyncSessionLocal() as session:
            async with session.begin():
                active_disaster_ids = []
                for disaster_item in disasters_data["data"]:
                    disaster = await self.update_or_create_disaster(
                        session, disaster_item["fields"]
                    )
                    active_disaster_ids.append(disaster.id)
                    logger.info(f"Synchronized disaster ID: {disaster.id}")
                    await self.sync_disaster_reports(session, disaster)
                await self.cleanup_old_data(session, active_disaster_ids)

    async def update_or_create_disaster(
        self, session: AsyncSession, disaster_data: Dict[str, Any]
    ) -> Disaster:
        result = await session.execute(
            select(Disaster).where(Disaster.id == disaster_data["id"])
        )
        disaster = result.scalar_one_or_none()

        processed_data = {
            "id": disaster_data.get("id"),
            "name": disaster_data.get("name"),
            "description": disaster_data.get("description"),
            "status": disaster_data.get("status"),
            "glide": disaster_data.get("glide"),
            "related_glide": disaster_data.get("related_glide", []),
            "url": disaster_data.get("url"),
            "url_alias": disaster_data.get("url_alias"),
            "date_created": self.parse_date(
                disaster_data.get("date", {}).get("created")
            ),
            "date_changed": self.parse_date(
                disaster_data.get("date", {}).get("changed")
            ),
            "date_event": self.parse_date(disaster_data.get("date", {}).get("event")),
            "primary_country": disaster_data.get("primary_country"),
            "affected_countries": disaster_data.get("country", []),
            "primary_type": disaster_data.get("primary_type"),
            "profile": disaster_data.get("profile"),
        }

        if disaster:
            for key, value in processed_data.items():
                setattr(disaster, key, value)
        else:
            disaster = Disaster(**processed_data)
            session.add(disaster)
        return disaster

    async def sync_disaster_reports(self, session: AsyncSession, disaster: Disaster):
        params = {
            "filter": {
                "operator": "AND",
                "conditions": [
                    {"field": "disaster.id", "value": disaster.id},
                    {
                        "field": "format.id",
                        "value": [10, 12],
                    },  # 10 for Situation Report, 12 for Map
                ],
            },
            "profile": "full",
            "sort": ["date:desc"],
            "limit": 20,  # Adjust this value as needed
        }
        reports_data = await self.make_api_request("reports", params)
        if not reports_data:
            return

        synced_report_ids = []
        for report_item in reports_data["data"]:
            report_data = report_item["fields"]
            report = await self.update_or_create_report(
                session, disaster.id, report_data
            )
            synced_report_ids.append(report.id)
            logger.info(
                f"Synchronized report ID: {report.id} for disaster ID: {disaster.id}"
            )

        # Delete old reports not in the latest sync
        await session.execute(
            delete(Report).where(
                and_(
                    Report.disaster_id == disaster.id,
                    Report.id.notin_(synced_report_ids),
                )
            )
        )

    @staticmethod
    def parse_date(date_string: str) -> datetime:
        if date_string:
            dt = datetime.fromisoformat(date_string.replace("Z", "+00:00"))
            return dt.replace(tzinfo=None)  # Convert to timezone-naive
        return None

    async def update_or_create_report(
        self, session: AsyncSession, disaster_id: int, report_data: Dict[str, Any]
    ) -> Report:
        result = await session.execute(
            select(Report).where(Report.id == report_data["id"])
        )
        report = result.scalar_one_or_none()

        processed_data = {
            "id": report_data.get("id"),
            "disaster_id": disaster_id,
            "title": report_data.get("title"),
            "body": report_data.get("body"),
            "url": report_data.get("url"),
            "url_alias": report_data.get("url_alias"),
            "date_created": self.parse_date(report_data.get("date", {}).get("created")),
            "date_changed": self.parse_date(report_data.get("date", {}).get("changed")),
            "date_original": self.parse_date(
                report_data.get("date", {}).get("original")
            ),
            "status": report_data.get("status"),
            "language": report_data.get("language"),
            "source": report_data.get("source"),
            "theme": report_data.get("theme"),
            "file": report_data.get("file"),
            "primary_country": report_data.get("primary_country"),
            "affected_countries": report_data.get("country", []),
        }

        # Extract format id and name
        if report_data.get("format") and len(report_data["format"]) > 0:
            processed_data["content_format_id"] = report_data["format"][0].get("id")
            processed_data["content_format_name"] = report_data["format"][0].get("name")

        if report:
            for key, value in processed_data.items():
                setattr(report, key, value)
        else:
            report = Report(**processed_data)
            session.add(report)
        return report

    async def cleanup_old_data(
        self, session: AsyncSession, active_disaster_ids: List[int]
    ):
        cutoff_date = datetime.now() - self.retention_period
        await session.execute(
            delete(Disaster).where(
                and_(
                    Disaster.id.notin_(active_disaster_ids),
                    Disaster.date_created < cutoff_date,
                )
            )
        )
        await session.execute(delete(Report).where(Report.date_created < cutoff_date))

    async def start(self):
        while True:
            try:
                await self.sync_disasters()
                logger.info("Sync completed successfully")
            except Exception as e:
                logger.error(f"Sync failed: {str(e)}")
            finally:
                await asyncio.sleep(timedelta(hours=12).total_seconds())

    async def close(self):
        await self.relief_web_api.close()
