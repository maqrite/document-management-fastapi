from fastapi import APIRouter
from .files.routes import router as files_router

router = APIRouter()
router.include_router(router=files_router, prefix="/files")