from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update, insert
from app.backend.dependencies import is_dispatcher, db_dep
from app.models.order_model import Order, OrderStatusEnum
from app.schemas.order_schemas import (
    OrderResponse,
    OrderCreateRequest,
    OrderManualUpdateRequest
)
from app.services.math_engine import MathEngine
from app.models.warehouse_model import Inventory
router = APIRouter(prefix="/api/dispatcher", tags=["Dispatcher"])




@router.get("/inventory", status_code=status.HTTP_200_OK)
async def get_all_inventory(
    user: is_dispatcher,
    db: db_dep
):



    result = await db.execute(select(Inventory))
    return result.scalars().all()


@router.get("/orders", response_model=list[OrderResponse], status_code=status.HTTP_200_OK)
async def get_all_orders(
    user: is_dispatcher,
    db: db_dep
):
    result = await db.execute(select(Order).order_by(Order.id.desc()))
    return result.scalars().all()





@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
        data: OrderCreateRequest,
        user: is_dispatcher,
        db: db_dep
):
    await MathEngine.reserve_on_dispatch(
        session=db,
        origin_id=data.origin_id,
        item_type=data.cargo_type,
        quantity=data.cargo_quantity
    )

    stmt = insert(Order).values(
        driver_id=data.driver_id,
        origin_id=data.origin_id,
        destination_id=data.destination_id,
        cargo_type=data.cargo_type,
        cargo_quantity=data.cargo_quantity,
        priority=data.priority,
        status=OrderStatusEnum.PENDING
    ).returning(Order)

    result = await db.execute(stmt)
    await db.commit()

    return result.scalar_one()


@router.put("/orders/{order_id}", status_code=status.HTTP_200_OK)
async def update_order_manually(
        order_id: int,
        data: OrderManualUpdateRequest,
        user: is_dispatcher,
        db: db_dep
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
        .values(**update_fields)
    )
    await db.commit()
    return {"status": "success", "updated_fields": list(update_fields.keys())}


@router.post("/orders/{order_id}/approve_ai", status_code=status.HTTP_200_OK)
async def approve_ai_proposal(
        order_id: int,
        user: is_dispatcher,
        db: db_dep
):

    res = await db.execute(select(Order).where(Order.id == order_id))
    order = res.scalar_one_or_none()

    if not order or not order.ai_proposed_action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Драфт ШІ не знайдено"
        )


    ai_reason = order.ai_reasoning
    ai_action = order.ai_proposed_action
    ai_dest = order.ai_proposed_dest_id
    ai_priority = order.ai_proposed_priority
    ai_delta = order.ai_proposed_delta


    await MathEngine.approve_ai_draft(session=db, order=order)


    update_vals = {
        "status": OrderStatusEnum.REROUTED,
        "priority": ai_priority if ai_priority else order.priority,
        "ai_reasoning": f"ІНСТРУКЦІЯ ШІ (ЗАТВЕРДЖЕНО): {ai_reason}",

        "ai_proposed_action": ai_action,
        "ai_proposed_dest_id": ai_dest,
        "ai_proposed_priority": ai_priority,
        "ai_proposed_delta": ai_delta
    }


    if ai_dest:
        update_vals["destination_id"] = ai_dest


    await db.execute(
        update(Order)
        .where(Order.id == order_id)
        .values(**update_vals)
    )
    await db.commit()

    return {"status": "ai_approved"}


@router.post("/orders/{order_id}/reject_ai", status_code=status.HTTP_200_OK)
async def reject_ai_proposal(
        order_id: int,
        user: is_dispatcher,
        db: db_dep
):
    res = await db.execute(select(Order).where(Order.id == order_id))
    order = res.scalar_one_or_none()

    if not order or not order.ai_proposed_action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Драфт ШІ не знайдено"
        )


    await db.execute(
        update(Order)
        .where(Order.id == order_id)
        .values(
            status=OrderStatusEnum.IN_PROGRESS,
            ai_proposed_action=None,
            ai_proposed_dest_id=None,
            ai_proposed_priority=None,
            ai_reasoning=None
        )
    )
    await db.commit()
    return {"status": "ai_rejected", "message": "Драфт ШІ скасовано"}