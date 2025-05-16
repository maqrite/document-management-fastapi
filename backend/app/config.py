from pydantic_settings import BaseSettings
from typing import ClassVar
from pathlib import Path
import os

class Settings(BaseSettings):
    ALGORITHM: ClassVar[str] = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: ClassVar[int] = 30

    SECRET_KEY: str

    BASE_DIR: Path = Path(__file__).resolve().parent.parent

    UPLOAD_DIR_NAME: str = os.getenv("UPLOAD_DIR_NAME", "uploads")
    UPLOAD_DIR: Path = BASE_DIR / UPLOAD_DIR_NAME

    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///./{os.getenv('DB_NAME', 'document_flow.db')}")

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore'

settings = Settings()