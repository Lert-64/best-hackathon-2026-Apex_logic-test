from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update

from ..backend.dependencies import is_driver, db_dep
from ..models.order_model import Order, OrderStatusEnum
from ..schemas.order_schemas import OrderResponse, ForceMajeureRequest
from ..services.math_engine import MathEngine

router = APIRouter(prefix="/api/driver", tags=["Driver"])


@router.get("/orders/current", response_model=OrderResponse, status_code=status.HTTP_200_OK)
async def get_current_order(user: is_driver, db: db_dep):
    stmt = select(Order).filter(
        Order.driver_id == user.id,
        Order.status == OrderStatusEnum.IN_PROGRESS
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Активний рейс не знайдено"
        )
    return order


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

    result = await db.execute(
        update(Order)
        .where(Order.id == order_id)
        .values(driver_comment=data.driver_comment)
    )

    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Замовлення не знайдено")

    await db.commit()

    return {"status": "ai_draft_created", "message": "Форс-мажор зафіксовано, ШІ готує рішення"}


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