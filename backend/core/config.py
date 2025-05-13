from pathlib import Path
from os import getenv
from pydantic_settings import BaseSettings

# BASE_DIR = Path(__file__).parent.parent.parent

class Setting(BaseSettings):
    api_v1_prefix: str = "/api/v1"
    db_url: str = "sqlite+aiosqlite:///db.sqlite3"
    db_echo: bool = True

settings = Setting()

settings.db_url
