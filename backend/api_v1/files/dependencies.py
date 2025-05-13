from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Depends, Path
from typing import Annotated
from core.models import db_helper
from . import crud
from core.models import File


async def get_file_by_id(
    file_id: Annotated[int, Path],
    session: AsyncSession = Depends(db_helper.scoped_session_dependency),
    ) -> File:
    file = await crud.get_file(session=session, file_id=file_id)
    if file is not None:
        return file
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f'File {file_id} not found!'
    )

    