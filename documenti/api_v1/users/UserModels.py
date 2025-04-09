from fastapi import Path
from pydantic import BaseModel, EmailStr
from typing import Annotated

class UserLoginForm(BaseModel):
    email: EmailStr
    username: Annotated[str, Path(min_length=1, max_length=256)]
    password: Annotated[str, Path(min_length=1, max_length=256)]
