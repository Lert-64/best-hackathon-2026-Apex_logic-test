from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from typing import List, Dict, Any

from app.models.warehouse_model import Inventory, ItemTypeEnum
from app.models.order_model import Order, AIActionEnum, OrderStatusEnum
from app.schemas.inventory_schemas import InventoryDeltaItem


class MathEngine:
    @staticmethod
    async def reserve_on_dispatch(
            session: AsyncSession,
            origin_id: int,
            item_type: ItemTypeEnum,
            quantity: float
    ) -> None:
        stmt = select(Inventory).where(
            Inventory.warehouse_id == origin_id,
            Inventory.item_type == item_type
        ).with_for_update()

        result = await session.execute(stmt)
        inventory = result.scalar_one_or_none()

        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"На складі з ID {origin_id} немає запису про товар типу {item_type.value}"
            )

        if inventory.quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Недостатньо товару на складі. Доступно: {inventory.quantity}, потрібно: {quantity}"
            )

        inventory.quantity -= quantity
        session.add(inventory)

    @staticmethod
    async def process_order_completion(
            session: AsyncSession,
            destination_id: int,
            item_type: ItemTypeEnum,
            quantity: float
    ) -> None:
        stmt = select(Inventory).where(
            Inventory.warehouse_id == destination_id,
            Inventory.item_type == item_type
        ).with_for_update()

        result = await session.execute(stmt)
        inventory = result.scalar_one_or_none()

        if not inventory:
            inventory = Inventory(
                warehouse_id=destination_id,
                item_type=item_type,
                quantity=quantity
            )
        else:
            inventory.quantity += quantity

        session.add(inventory)

    @staticmethod
    def generate_ai_delta(
            order: Order,
            proposed_action: AIActionEnum,
            new_dest_id: int | None = None
    ) -> List[Dict[str, Any]]:
        deltas = []

        if proposed_action == AIActionEnum.REROUTE and new_dest_id:
            deltas.append({
                "warehouse_id": order.destination_id,
                "item_type": order.cargo_type.value,
                "delta": -order.cargo_quantity,
                "reason": "AI_REROUTE_CANCELLED"
            })
            deltas.append({
                "warehouse_id": new_dest_id,
                "item_type": order.cargo_type.value,
                "delta": order.cargo_quantity,
                "reason": "AI_REROUTE_NEW"
            })

        elif proposed_action == AIActionEnum.RESTOCK:
            deltas.append({
                "warehouse_id": order.origin_id,
                "item_type": order.cargo_type.value,
                "delta": order.cargo_quantity,
                "reason": "AI_RESTOCK_RETURN"
            })

        return deltas

    @staticmethod
    async def approve_ai_draft(
            session: AsyncSession,
            order: Order
    ) -> None:
        if not order.ai_proposed_action:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Немає активної пропозиції ШІ для затвердження."
            )

        if order.ai_proposed_action == AIActionEnum.REROUTE and order.ai_proposed_dest_id:
            order.destination_id = order.ai_proposed_dest_id

        if order.ai_proposed_priority:
            order.priority = order.ai_proposed_priority

        order.status = OrderStatusEnum.REROUTED

        order.ai_proposed_action = None
        order.ai_proposed_dest_id = None
        order.ai_proposed_priority = None
        order.ai_reasoning = None
        order.ai_proposed_delta = None

        session.add(order)

    @staticmethod
    async def reject_ai_draft(
            session: AsyncSession,
            order: Order
    ) -> None:
        order.ai_proposed_action = None
        order.ai_proposed_dest_id = None
        order.ai_proposed_priority = None
        order.ai_reasoning = None
        order.ai_proposed_delta = None

        session.add(order)