from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from typing import Annotated


from ..backend.dependencies import is_dispatcher, db_dep
from ..models.order_model import Order
from ..schemas.order_schemas import (
    OrderResponse,
    OrderCreateRequest,
    OrderManualUpdateRequest
)

router = APIRouter(prefix="/api/dispatcher", tags=["Dispatcher"])


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreateRequest,
    user= is_dispatcher,
    db = db_dep
):
    new_order = Order(
        driver_id=data.driver_id,
        origin_id=data.origin_id,
        destination_id=data.destination_id,
        cargo_type=data.cargo_type,
        cargo_quantity=data.cargo_quantity,
        priority=data.priority
    )
    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)
    return new_order


@router.put("/orders/{order_id}", status_code=status.HTTP_200_OK)
async def update_order_manually(
    order_id: int,
    data: OrderManualUpdateRequest,
    user= is_dispatcher,
    db = db_dep
):
    update_fields = {}
    if data.new_destination_id is not None:
        update_fields["destination_id"] = data.new_destination_id
    if data.new_priority is not None:
        update_fields["priority"] = data.new_priority

    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Немає даних для зміни"
        )

    await db.execute(
        update(Order)
        .where(Order.id == order_id)
        .values(update_fields)
    )
    await db.commit()
    return {"status": "success", "updated_fields": list(update_fields.keys())}


@router.post("/orders/{order_id}/approve_ai", status_code=status.HTTP_200_OK)
async def approve_ai_proposal(
    order_id: int,
    user= is_dispatcher,
    db= db_dep
):
    res = await db.execute(select(Order).where(Order.id == order_id))
    order = res.scalar_one_or_none()

    if not order or not order.ai_proposed_dest_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Драфт ШІ не знайдено"
        )

    await db.execute(
        update(Order)
        .where(Order.id == order_id)
        .values(
            destination_id=order.ai_proposed_dest_id,
            priority=order.ai_proposed_priority if order.ai_proposed_priority else order.priority,
            ai_proposed_dest_id=None,
            ai_proposed_priority=None,
            ai_reasoning=f"Виконано: {order.ai_reasoning}"
        )
    )
    await db.commit()
    return {"status": "ai_approved"}