from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from core.auth import authenticate_user, create_access_token  # You'll implement these

router = APIRouter()

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user_by_username(form_data.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

@router.post("/register")
async def register(user_data: UserCreate):
    existing = await get_user_by_username(user_data.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = hash_password(user_data.password)
    new_user = await create_user(username=user_data.username, hashed_password=hashed)
    return {"username": new_user.username}
