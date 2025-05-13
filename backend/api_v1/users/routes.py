from fastapi import APIRouter
import api_v1.users.crud as crud
from api_v1.users.UserModels import UserLoginForm

router = APIRouter(prefix="/User", tags=["User"])

@router.post("/login")
def login(user: UserLoginForm):
    return crud.create_user(user=user)
