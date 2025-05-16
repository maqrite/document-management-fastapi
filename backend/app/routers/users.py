from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from datetime import timedelta
from app import crud, models, schemas, auth, dependencies
from app.config import settings

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/register/", response_model=models.UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: models.UserCreate,
    session: Session = Depends(dependencies.get_session)
):
    db_user = crud.get_user_by_email(session, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    created_user = crud.create_user(session=session, user_in=user_in)
    return models.UserRead.model_validate(created_user)


@router.post("/login/", response_model=schemas.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(dependencies.get_session)
):
    user = crud.authenticate_user(session, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me/", response_model=models.UserRead)
async def read_users_me(
    current_user: Annotated[models.User, Depends(auth.get_current_active_user)]
):
    return models.UserRead.model_validate(current_user)

@router.get("/{user_id}/", response_model=models.UserRead)
def read_user_info(
    user_id: int,
    current_user: Annotated[models.User, Depends(auth.get_current_active_user)],
    session: Session = Depends(dependencies.get_session),
):
    user = crud.get_user(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return models.UserRead.model_validate(user)