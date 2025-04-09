from fastapi import APIRouter, Depends, status
from core.models import db_helper
from sqlalchemy.ext.asyncio import AsyncSession
from . import crud
from .FileModels import File, FileCreate, FileUpdate, FileUpdatePartial
from .dependencies import get_file_by_id

router = APIRouter(tags=["Files"])

@router.get("/", response_model=list[File])
async def get_files(
    session: AsyncSession = Depends(db_helper.scoped_session_dependency),
    ):
    return await crud.get_files(session=session)

@router.post("/", response_model=File, status_code=status.HTTP_201_CREATED,)
async def create_file(
    file: FileCreate,
    session: AsyncSession = Depends(db_helper.scoped_session_dependency),
    ):
    return await crud.create_file(session=session, file=file)

@router.get("/{file_id}/", response_model=File)
async def get_file(
        file = Depends(get_file_by_id),
    ):
        return file

@router.put("/{file_id}/")
async def update_file(
    file_update: FileUpdate,
    file: File = Depends(get_file_by_id),
    session: AsyncSession = Depends(db_helper.scoped_session_dependency),
):
    return await crud.update_file(
         session=session,
         file=file,
         file_update=file_update,
    )

@router.patch("/{file_id}/")
async def update_file_partial(
    file_update: FileUpdatePartial,
    file: File = Depends(get_file_by_id),
    session: AsyncSession = Depends(db_helper.scoped_session_dependency),
):
    return await crud.update_file(
         session=session,
         file=file,
         file_update=file_update,
         partial=True,
    )

@router.delete("/{file_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file: File = Depends(get_file_by_id),
    session: AsyncSession = Depends(db_helper.scoped_session_dependency),
) -> None:
     await crud.delete_file(session=session, file=file)