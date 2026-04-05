from sqlalchemy.sql.annotation import Annotated
from .db_depends import get_db
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status

from   app.models.user_model import RoleEnum
from   app.models.user_model import User

from fastapi.security import OAuth2PasswordBearer
from .security import verify_token
from sqlalchemy import select

db_dep = Annotated[AsyncSession,Depends(get_db)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: db_dep
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )




    username = verify_token(token)
    if not username:
        raise credentials_exception


    stmt = select(User).filter(User.username == username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()


    if not user:
        raise credentials_exception

    return user

CurrentUser = Annotated[User,Depends(get_current_user)]




class CheckRole:


    def __init__(self,allowed_roles:list[RoleEnum]):
            self.allowed_roles = allowed_roles



    def __call__(self,user:CurrentUser):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Доступ обмежено. Ваша роль: {user.role.value}"
            )
        return user

is_dispatcher =  Annotated[User,Depends(CheckRole([RoleEnum.DISPATCHER]))]
is_driver =  Annotated[User,Depends(CheckRole([RoleEnum.DRIVER]))]
is_driver_or_dispatcher =  Annotated[User,Depends(CheckRole([RoleEnum.DRIVER, RoleEnum.DISPATCHER]))]