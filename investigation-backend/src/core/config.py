from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "Investigation"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    TESTING: bool = False
    SECRET_KEY: str = Field(..., min_length=32)

    API_V1_PREFIX: str = "/api/v1"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    DATABASE_URL: str = Field(..., description="Async database URL")

    WECHAT_APP_ID: str = ""
    WECHAT_APP_SECRET: str = ""
    WECHAT_API_BASE: str = "https://api.weixin.qq.com"

    STORAGE_PROVIDER: str = "local"
    LOCAL_STORAGE_PATH: str = "storage"
    LOCAL_STORAGE_BASE_URL: str = "http://localhost:18432/media"
    MAX_UPLOAD_SIZE_MB: int = 10
    CORS_ALLOW_ORIGINS: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
