# DisasterPulse API

DisasterPulse Backend is a FastAPI-based application designed to provide real-time information and analysis on disasters from various sources, including ReliefWeb.

## Features

- Fetch and store disaster information
- Retrieve disaster details and associated reports
- Generate AI-powered analysis of disaster reports and maps
- Extract text and images from PDF reports
- Multilingual support for analysis (English, Spanish, French)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/cmakafui/disasterpulse.git
   cd disasterpulse/backend
   ```

2. Create a virtual environment and activate it:

   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```
   DATABASE_URL=your_database_url
   ANTHROPIC_API_KEY=your_anthropic_api_key
   RELIEF_WEB_API_URL=https://api.reliefweb.int/v1
   ```

## Usage

1. Start the FastAPI server:

   ```
   uvicorn app.main:app --reload
   ```

2. Access the API documentation at `http://localhost:8000/docs`

## API Endpoints

- `/api/v1/disasters`: Get a list of disasters
- `/api/v1/disasters/{disaster_id}`: Get details of a specific disaster
- `/api/v1/disasters/{disaster_id}/analysis`: Generate AI analysis for a disaster
- `/api/v1/reports`: Get a list of reports
- `/api/v1/reports/{report_id}`: Get details of a specific report
- `/api/v1/reports/{report_id}/text`: Extract text from a PDF report
- `/api/v1/reports/{report_id}/maps`: Extract images from a PDF map

## Project Structure

- `app/`: Main application package
  - `api/`: API route definitions
  - `core/`: Core configuration and settings
  - `db/`: Database models and session management
  - `models/`: SQLAlchemy ORM models
  - `schemas/`: Pydantic models for request/response validation
  - `utils/`: Utility functions for PDF extraction and AI analysis
- `main.py`: FastAPI application entry point

## Technologies Used

- FastAPI: Web framework for building APIs
- SQLAlchemy: ORM for database operations
- Pydantic: Data validation and settings management
- Anthropic Claude: AI model for generating disaster analysis
- PyMuPDF: PDF processing library
