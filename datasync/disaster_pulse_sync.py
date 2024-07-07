import asyncio
import httpx
from sqlalchemy import delete, and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import logging
from typing import Dict, Any
from db.session import AsyncSessionLocal
from models.disaster import Disaster
from models.report import Report
from config import settings
from api_client import APIClient

logger = logging.getLogger(__name__)

class DisasterPulseSync:
    """
    A class to handle synchronization of disaster data with an external API.
    """

    def __init__(self):
        """
        Initialize the DisasterPulseSync object.
        """
        self.relief_web_api = APIClient(
            settings.RELIEF_WEB_API_URL, settings.RELIEFWEB_APP_NAME
        )
        self.retention_period = timedelta(days=settings.RETENTION_PERIOD_DAYS)
        self.api_client = httpx.AsyncClient(base_url=settings.API_BASE_URL, timeout=httpx.Timeout(timeout=60.0))

    async def make_api_request(
        self, endpoint: str, params: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Make a request to the external API and return the response data.

        :param endpoint: The API endpoint to request.
        :param params: The parameters to include in the request.
        :return: The response data as a dictionary.
        """
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

    def update_disaster_analysis(self, disaster_id):
        """
        Update the disaster analysis for a given disaster.

        :param disaster: The disaster object to update.
        """
        # Update report analysis
        self.update_analysis(disaster_id, "report")
        # Update map analysis
        self.update_analysis(disaster_id, "map")

    def update_analysis(self, disaster_id, analysis_type: str):
        """
        Update the specified type of analysis for a disaster.

        :param disaster_id: The ID of the disaster to update.
        :param analysis_type: The type of analysis to update ("report" or "map").
        """
        analysis_url = f"/disasters/{disaster_id}/analysis?analysis_type={analysis_type}"
        try:
            with httpx.Client(base_url=settings.API_BASE_URL, timeout=httpx.Timeout(timeout=120.0)) as client:
                response = client.put(analysis_url)
                response.raise_for_status()
            logger.info(f"Updated {analysis_type} analysis for disaster ID: {disaster_id}")
        except httpx.HTTPStatusError as e:
            logger.warning(
                f"Failed to update {analysis_type} analysis for disaster ID: {disaster_id}. Error: {e}"
            )

    async def sync_disasters(self):
        """
        Synchronize the disaster data with the external API.
        """
        params = {
            "filter": {"field": "status", "value": ["alert", "ongoing"]},
            "profile": "full",
            "sort": ["date:desc"],
            "limit": settings.DISASTER_LIMIT,
        }
        disasters_data = await self.make_api_request("disasters", params)
        if not disasters_data:
            return

        active_disaster_ids = []
        for disaster_item in disasters_data["data"]:
            try:
                disaster_id = await self.sync_single_disaster(disaster_item["fields"])
                if disaster_id:
                    active_disaster_ids.append(disaster_id)
            except Exception as e:
                logger.error(f"Failed to sync disaster: {e}")
        await self.cleanup_old_data(active_disaster_ids)

        # Update disaster analysis for each active disaster
        for disaster_id in active_disaster_ids:
            self.update_disaster_analysis(disaster_id)


    async def update_or_create_disaster(
        self, session: AsyncSession, disaster_data: Dict[str, Any]
    ) -> Disaster:
        """
        Update or create a disaster record in the database.

        :param session: The database session.
        :param disaster_data: The disaster data to update or create.
        :return: The disaster object.
        """
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
        }

        if disaster:
            for key, value in processed_data.items():
                setattr(disaster, key, value)
        else:
            disaster = Disaster(**processed_data)
            session.add(disaster)
        return disaster

    async def sync_single_disaster(self, disaster_fields):
        """
        Synchronize a single disaster with the external API.

        :param disaster_fields: The disaster data to sync.
        :return: The ID of the synchronized disaster.
        """
        async with AsyncSessionLocal() as session:
            try:
                async with session.begin():
                    disaster = await self.update_or_create_disaster(session, disaster_fields)
                    await self.sync_disaster_reports(session, disaster)
                    await session.commit()  # Add this line to commit the changes
                    logger.info(f"Synchronized disaster ID: {disaster.id}")
                return disaster.id
            except Exception as e:
                logger.error(f"Error syncing disaster {disaster_fields.get('id')}: {e}")
                return None
            
    async def sync_disaster_reports(self, session: AsyncSession, disaster: Disaster):
        """
        Synchronize the disaster reports for a given disaster.

        :param session: The database session.
        :param disaster: The disaster object to sync reports for.
        """
        params = {
            "filter": {
                "operator": "AND",
                "conditions": [
                    {"field": "disaster.id", "value": disaster.id},
                    {
                        "field": "format.id",
                        "value": [
                            settings.CONTENT_FORMAT_SITUATION_REPORT,
                            settings.CONTENT_FORMAT_MAP,
                        ],
                    },
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
        """
        Parse an ISO format date string into a datetime object.

        :param date_string: The ISO format date string.
        :return: The parsed datetime object.
        """
        if date_string:
            dt = datetime.fromisoformat(date_string.replace("Z", "+00:00"))
            return dt.replace(tzinfo=None)  # Convert to timezone-naive
        return None

    async def update_or_create_report(
        self, session: AsyncSession, disaster_id: int, report_data: Dict[str, Any]
    ) -> Report:
        """
        Update or create a report record in the database.

        :param session: The database session.
        :param disaster_id: The ID of the associated disaster.
        :param report_data: The report data to update or create.
        :return: The report object.
        """
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

    async def cleanup_old_data(self, active_disaster_ids):
        """
        Clean up old disaster and report data from the database.

        :param active_disaster_ids: List of currently active disaster IDs.
        """
        async with AsyncSessionLocal() as session:
            try:
                async with session.begin():
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
            except Exception as e:
                logger.error(f"Error cleaning up old data: {e}")

    async def start(self):
        """
        Start the synchronization process in an infinite loop.
        """
        while True:
            try:
                await self.sync_disasters()
                logger.info("Sync completed successfully")
            except Exception as e:
                logger.error(f"Sync failed: {str(e)}", exc_info=True)
            finally:
                await asyncio.sleep(
                    timedelta(hours=settings.SYNC_INTERVAL_HOURS).total_seconds()
                )

    async def close(self):
        """
        Close all resources used by the DisasterPulseSync object.
        """
        await self.relief_web_api.close()
        await self.api_client.aclose()