from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update

from app.backend.dependencies import is_driver, db_dep
from app.models.order_model import Order, OrderStatusEnum
from app.models.warehouse_model import Warehouse
from app.schemas.order_schemas import OrderResponse, ForceMajeureRequest
from app.services.math_engine import MathEngine


from app.services.ai_parser import AIService, AIInputContext, WarehouseSchema

router = APIRouter(prefix="/api/driver", tags=["Driver"])



@router.get("/orders/current", response_model=list[OrderResponse], status_code=status.HTTP_200_OK)
async def get_current_order(user: is_driver, db: db_dep):

    stmt = select(Order).filter(
        Order.driver_id == user.id,
        Order.status.in_([
            OrderStatusEnum.IN_PROGRESS,
            OrderStatusEnum.NEEDS_ATTENTION,
            OrderStatusEnum.REROUTED
        ])
    ).order_by(Order.id.desc())

    result = await db.execute(stmt)


    orders = result.scalars().all()

    if not orders:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Активних рейсів не знайдено"
        )

    return orders
@router.post("/orders/{order_id}/accept", status_code=status.HTTP_200_OK)
async def accept_order(order_id: int, user: is_driver, db: db_dep):
    result = await db.execute(
        update(Order)
        .where(Order.id == order_id)
        .values(status=OrderStatusEnum.IN_PROGRESS)
    )

    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Замовлення не знайдено")

    await db.commit()
    return {"status": "success", "message": "Рейс прийнято в роботу"}


@router.post("/orders/{order_id}/force_majeure", status_code=status.HTTP_200_OK)
async def report_force_majeure(order_id: int, data: ForceMajeureRequest, user: is_driver, db: db_dep):

    res_order = await db.execute(select(Order).where(Order.id == order_id))
    order = res_order.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Замовлення не знайдено")


    res_wh = await db.execute(select(Warehouse))
    warehouses = res_wh.scalars().all()
    warehouse_schemas = [
        WarehouseSchema(id=w.id, name=w.name, location_desc=w.location_desc)
        for w in warehouses
    ]


    ai_context = AIInputContext(
        driver_comment=data.driver_comment,
        current_destination_id=order.destination_id,
        cargo_type=order.cargo_type,
        cargo_quantity=order.cargo_quantity,
        available_warehouses=warehouse_schemas
    )
    resolution = await AIService.analyze_incident(ai_context)


    await db.execute(
        update(Order)
        .where(Order.id == order_id)
        .values(
            driver_comment=data.driver_comment,
            status=OrderStatusEnum.NEEDS_ATTENTION,
            ai_proposed_action=resolution.action,
            ai_proposed_dest_id=resolution.new_destination_id,
            ai_proposed_priority=resolution.priority,
            ai_reasoning=resolution.reasoning
        )
    )
    await db.commit()

    return {"status": "ai_draft_created", "message": "Форс-мажор зафіксовано, ШІ підготував рішення"}


@router.post("/orders/{order_id}/complete", status_code=status.HTTP_200_OK)
async def complete_order(order_id: int, user: is_driver, db: db_dep):
    res = await db.execute(select(Order).where(Order.id == order_id))
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Замовлення не знайдено")

    await MathEngine.process_order_completion(
        session=db,
        destination_id=order.destination_id,
        item_type=order.cargo_type,
        quantity=order.cargo_quantity
    )

    await db.execute(
        update(Order)
        .where(Order.id == order_id)
        .values(status=OrderStatusEnum.COMPLETED)
    )

    await db.commit()
    return {"status": "success", "message": "Рейс завершено, товар зараховано на склад"}