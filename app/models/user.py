import enum
from sqlalchemy import String, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.backend.db import Base


class RoleEnum(str, enum.Enum):
    DRIVER = "DRIVER"
    DISPATCHER = "DISPATCHER"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    role: Mapped[RoleEnum] = mapped_column(
        SQLEnum(RoleEnum),
        default=RoleEnum.DRIVER,
        nullable=False
    )