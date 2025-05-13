from fastapi import Path
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Annotated

class FileBase(BaseModel):
    name: Annotated[str, Path(min_length=1)]
    extension: Annotated[str, Path(min_length=1)]

class FileCreate(FileBase):
    pass

class FileUpdate(FileCreate):
    pass

class FileUpdatePartial(FileCreate):
    name: Annotated[str, Path(min_length=1)] | None = None
    extension: Annotated[str, Path(min_length=1)] | None = None

class File(FileBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
