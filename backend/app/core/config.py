# app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DisasterPulse API"
    VERSION: str = "0.1.0"
    RELIEFWEB_APP_NAME: str = "rw-user-0"
    DATABASE_URL: str
    ANTHROPIC_API_KEY: str
    RELIEF_WEB_API_URL: str = "https://api.reliefweb.int/v1"
    RETENTION_PERIOD_DAYS: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
