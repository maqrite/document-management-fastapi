from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.engine import Result
from core.models import File
from .FileModels import FileCreate, FileUpdate, FileUpdatePartial

async def get_files(session: AsyncSession) -> list[File]:
    statement = select(File).order_by(File.id)
    result: Result = await session.execute(statement)
    files = result.scalars().all()
    return list(files)

async def get_file(session: AsyncSession, file_id: int) -> File | None:
    return await session.get(File, file_id)

async def create_file(session: AsyncSession, file: FileCreate) -> File | Exception:
    file = File(**file.model_dump())
    session.add(file)
    await session.commit()
    # await session.refresh(file)
    return file

async def update_file(
        session: AsyncSession, 
        file: File, 
        file_update: FileUpdate | FileUpdatePartial,
        partial: bool = False,
    ) -> File:
    
    for name, value in file_update.model_dump(exclude_unset=partial).items():
        setattr(file, name, value)
    await session.commit()
    return file

async def delete_file(
        session: AsyncSession, 
        file: File
    ) -> None:
    await session.delete(file)
    await session.commit()
    