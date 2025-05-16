from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import create_db_and_tables
from .routers import documents, users
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database and tables...")
    create_db_and_tables()
    print("Database and tables created.")
    print(f"Ensuring upload directory exists: {settings.UPLOAD_DIR}")
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    print("Upload directory ensured.")
    yield
    print("Application shutdown.")

app = FastAPI(lifespan=lifespan, title="Система Документооборота")

app.include_router(users.router)
app.include_router(documents.router)

@app.get("/")
async def root():
    return {"message": "Добро пожаловать в систему документооборота!"}