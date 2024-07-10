# DisasterPulse DataSync Component

DisasterPulse DataSync is an asynchronous Python application that synchronizes disaster data from the ReliefWeb API. It fetches information about ongoing disasters, related reports, and analyzes the data to provide up-to-date insights.

## Features

- Asynchronous data fetching from ReliefWeb API
- Automatic synchronization of disaster and report data
- Database storage using SQLAlchemy with PostgreSQL
- Periodic cleanup of old data
- Analysis of reports, maps, and news related to disasters

## Prerequisites

- Python 3.9+
- PostgreSQL database
- ReliefWeb API access

## Project Structure

- `main.py`: The entry point of the application.
- `disaster_pulse_sync.py`: Contains the main `DisasterPulseSync` class that handles the synchronization process.
- `config.py`: Manages the application settings using Pydantic.
- `api_client.py`: A simple API client for making requests to the ReliefWeb API.
- `models/`: Contains SQLAlchemy models for the database.
  - `disaster.py`: Defines the Disaster model.
  - `report.py`: Defines the Report model.
  - `base.py`: Contains the base model for SQLAlchemy.
- `db/`: Contains database-related files.
  - `session.py`: Sets up the database engine and session.
