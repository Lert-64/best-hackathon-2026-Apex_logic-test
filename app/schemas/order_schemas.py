from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

from models.order_model import (
    ItemTypeEnum,
    PriorityEnum,
    OrderStatusEnum,
    AIActionEnum
)

from schemas.inventory_schemas import InventoryDeltaItem


class OrderCreateRequest(BaseModel):
    driver_id: int
    origin_id: int
    destination_id: int

    cargo_type: ItemTypeEnum
    cargo_quantity: float = Field(..., gt=0)

    priority: PriorityEnum = PriorityEnum.NORMAL


class OrderManualUpdateRequest(BaseModel):
    new_destination_id: Optional[int] = None
    new_priority: Optional[PriorityEnum] = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    driver_id: int
    origin_id: int
    destination_id: int

    cargo_type: ItemTypeEnum
    cargo_quantity: float

    status: OrderStatusEnum
    priority: PriorityEnum

    driver_comment: Optional[str] = None

    ai_proposed_action: Optional[AIActionEnum] = None
    ai_proposed_dest_id: Optional[int] = None
    ai_proposed_priority: Optional[PriorityEnum] = None
    ai_reasoning: Optional[str] = None

    ai_proposed_delta: Optional[List[InventoryDeltaItem]] = None

class ForceMajeureRequest(BaseModel):
        driver_comment: str