from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    RELIEFWEB_APP_NAME: str
    DATABASE_URL: str
    CONTENT_FORMAT_SITUATION_REPORT: int = 10
    CONTENT_FORMAT_MAP: int = 12
    API_BASE_URL: str
    SYNC_INTERVAL_HOURS: int
    ANTHROPIC_API_KEY: str
    RELIEF_WEB_API_URL: str = "https://api.reliefweb.int/v1"
    RETENTION_PERIOD_DAYS: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
