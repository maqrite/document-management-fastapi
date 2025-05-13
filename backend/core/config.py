import os

class Settings:
    api_v1_prefix = "/api/v1"
    db_url = os.getenv("DATABASE_URL")
    db_echo = True

settings = Settings()
