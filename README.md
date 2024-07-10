# DisasterPulse

DisasterPulse is a comprehensive real-time disaster monitoring and analysis platform that empowers communities with AI-driven insights and global coverage of disaster events. The project consists of three main components: a FastAPI backend, an asynchronous data synchronization service, and a Next.js frontend.

Visit live platform: https://disasterpulse.guatanga.xyz

## Features

- **Global Coverage**: Monitor disasters worldwide with our comprehensive tracking system.
- **Real-time Alerts**: Receive instant notifications about emerging threats and updates.
- **AI-Powered Insights**: Gain valuable insights with our advanced AI analysis of disaster data.
- **Interactive Map**: Visualize disaster events on a global map with detailed information.
- **Detailed Disaster Pages**: Access comprehensive information about each disaster, including timelines, impact analysis, and needs assessment.
- **Multilingual Support**: Analysis available in English, Spanish, and French.

## Project Structure

The DisasterPulse project is divided into three main components:

1. Backend (FastAPI)
2. DataSync (Asynchronous data fetcher)
3. Frontend (Next.js)

### Backend

The backend is a FastAPI-based application designed to provide real-time information and analysis on disasters from various sources, including ReliefWeb.

#### Features

- Fetch and store disaster information
- Retrieve disaster details and associated reports
- Generate AI-powered analysis of disaster reports and maps
- Extract text and images from PDF reports

#### API Endpoints

- `/api/v1/disasters`: Get a list of disasters
- `/api/v1/disasters/{disaster_id}`: Get details of a specific disaster
- `/api/v1/disasters/{disaster_id}/analysis`: Generate AI analysis for a disaster
- `/api/v1/reports`: Get a list of reports
- `/api/v1/reports/{report_id}`: Get details of a specific report
- `/api/v1/reports/{report_id}/text`: Extract text from a PDF report
- `/api/v1/reports/{report_id}/maps`: Extract images from a PDF map

#### Technologies Used

- FastAPI: Web framework for building APIs
- SQLAlchemy: ORM for database operations
- Pydantic: Data validation and settings management
- Anthropic Claude: AI model for generating disaster analysis
- PyMuPDF: PDF processing library

### DataSync

DisasterPulse DataSync is an asynchronous Python application that synchronizes disaster data from the ReliefWeb API.

#### Features

- Asynchronous data fetching from ReliefWeb API
- Automatic synchronization of disaster and report data
- Database storage using SQLAlchemy with PostgreSQL
- Periodic cleanup of old data
- Analysis of reports, maps, and news related to disasters

### Frontend

The frontend is built with Next.js and provides an intuitive user interface for accessing disaster information and insights.

#### Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Clerk for authentication
- Google Maps API
- Lucide React for icons
- Shadcn UI components

## Installation and Setup

1. Clone the repository:

   ```
   git clone https://github.com/cmakafui/disasterpulse.git
   cd disasterpulse
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory and add the necessary variables for each component.

3. Build and run the Docker containers:

   For development:

   ```
   make dev-up
   ```

   For production:

   ```
   make up
   ```

## Usage

- Backend API: Access the API documentation at `http://localhost:8808/docs`
- Frontend: Access the web application at `http://localhost:3303`

## Development

Use the following make commands for managing the development environment:

- `make dev-up`: Start the development environment
- `make dev-down`: Stop the development environment
- `make dev-logs`: View logs
- `make dev-rebuild`: Rebuild and restart containers
- `make dev-restart`: Restart the development environment

Similar commands are available for the production environment (e.g., `make up`, `make down`, etc.).

## Acknowledgments

- Data sourced from ReliefWeb API

---

Built with ❤️ by the DisasterPulse team
