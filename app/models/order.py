from sqlalchemy import Integer, Float, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
import enum
from app.backend.db import Base
from app.models.warehouse import ItemTypeEnum


class OrderStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    NEEDS_ATTENTION = "NEEDS_ATTENTION"
    REROUTED = "REROUTED"
    COMPLETED = "COMPLETED"


class PriorityEnum(str, enum.Enum):
    NORMAL = "NORMAL"
    ELEVATED = "ELEVATED"
    CRITICAL = "CRITICAL"


class AIActionEnum(str, enum.Enum):
    REROUTE = "REROUTE"
    RESTOCK = "RESTOCK"
    WAIT = "WAIT"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    driver_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    origin_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"))
    destination_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"))
    cargo_type: Mapped[ItemTypeEnum] = mapped_column(SQLEnum(ItemTypeEnum))
    cargo_quantity: Mapped[float] = mapped_column(Float)
    status: Mapped[OrderStatusEnum] = mapped_column(SQLEnum(OrderStatusEnum), default=OrderStatusEnum.PENDING)
    priority: Mapped[PriorityEnum] = mapped_column(SQLEnum(PriorityEnum), default=PriorityEnum.NORMAL)
    driver_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    ai_proposed_action: Mapped[AIActionEnum | None] = mapped_column(SQLEnum(AIActionEnum), nullable=True)
    ai_proposed_dest_id: Mapped[int | None] = mapped_column(ForeignKey("warehouses.id"), nullable=True)
    ai_proposed_priority: Mapped[PriorityEnum | None] = mapped_column(SQLEnum(PriorityEnum), nullable=True)
    ai_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_proposed_delta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)