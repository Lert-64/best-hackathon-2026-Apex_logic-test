from jose import jwt, JWTError
import os
from datetime import timedelta, UTC, datetime
from passlib.context import CryptContext

SECRET_KEY = os.getenv("SECRET_KEY", "57da982b76ede4c3ef8caeaa7b5b4431a6f9a200effc80363a4eefd5de8ec5e9")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated='auto')


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expires = datetime.now(UTC) + expires_delta
    else:
        expires = datetime.now(UTC) + timedelta(minutes=15)

    to_encode.update({"exp": expires})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict):
    expires = datetime.now(UTC) + timedelta(days=7)
    to_encode = data.copy()
    to_encode.update({"exp": expires, "type": "refresh"})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


