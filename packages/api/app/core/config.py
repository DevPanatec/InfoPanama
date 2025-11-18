"""
Configuración de la aplicación
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # General
    PROJECT_NAME: str = "InfoPanama API"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # Convex
    CONVEX_DEPLOYMENT: str = ""
    CONVEX_URL: str = ""

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_MAX_TOKENS: int = 4096

    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "infopanama_vectors"

    # DigitalOcean Spaces
    DO_SPACES_KEY: str = ""
    DO_SPACES_SECRET: str = ""
    DO_SPACES_ENDPOINT: str = ""
    DO_SPACES_BUCKET: str = ""
    DO_SPACES_REGION: str = "nyc3"

    # ProxyScrape
    PROXYSCRAPE_API_KEY: str = ""

    # Sentry
    SENTRY_DSN: str = ""

    # Security
    API_SECRET_KEY: str = ""
    API_ALGORITHM: str = "HS256"
    API_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Rate Limiting
    RATE_LIMIT_MAX_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # Feature Flags
    ENABLE_AGENT_MODE: bool = False
    ENABLE_AUTO_PUBLISH: bool = False
    ENABLE_DD_MODULE: bool = True
    ENABLE_HB_DETECTION: bool = True


settings = Settings()
