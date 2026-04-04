from sqlalchemy import Integer, String, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
import enum
from ..backend.db import Base

class ItemTypeEnum(str, enum.Enum):
    MEDS = "MEDS"
    FOOD = "FOOD"
    FUEL = "FUEL"

class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    location_desc: Mapped[str] = mapped_column(String)

class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"))
    item_type: Mapped[ItemTypeEnum] = mapped_column(SQLEnum(ItemTypeEnum))
    quantity: Mapped[float] = mapped_column(Float, default=0.0)