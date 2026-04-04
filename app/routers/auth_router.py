from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_


from ..backend.dependencies import db_dep
from fastapi.security import OAuth2PasswordRequestForm
from ..models.user_model import User
from ..backend.security import verify_token, create_access_token, verify_password, create_refresh_token
from ..schemas.auth_schemas import RefreshTokenRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/refresh")
async def get_refresh_token(
        token_data:RefreshTokenRequest,
        db : db_dep
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не вдалося перевірити refresh токен",
        headers={"WWW-Authenticate": "Bearer"}
    )


    username = verify_token(token_data.refresh_token)

    if not username:
        raise credentials_exception


    stmt = select(User).filter(User.username == username)
    query_result = await db.execute(stmt)
    user = query_result.scalar_one_or_none()

    if user is None:
        raise credentials_exception


    new_access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=15)
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.post('/login')
async def user_login(
        user_credentials: Annotated[OAuth2PasswordRequestForm, Depends()],
        db: db_dep
):

    query = select(User).filter(

            User.username == user_credentials.username
        )


    query_result = await db.execute(query)
    user = query_result.scalars().first()


    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )


    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )


    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=15)
    )
    refresh_token = create_refresh_token(
        data={"sub": user.username}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }