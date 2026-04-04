from pydantic import BaseModel
from  models.order_model import ItemTypeEnum


class InventoryDeltaItem(BaseModel):
    warehouse_id: int
    item_type: ItemTypeEnum
    delta: float
    reason: str