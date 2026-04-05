import asyncio
from sqlalchemy import select

from app.backend.db import AsyncSessionLocal
from app.backend.security import hash_password

from app.models.user_model import User, RoleEnum
from app.models.warehouse_model import Warehouse, Inventory, ItemTypeEnum


async def seed():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("База даних вже наповнена.")
            return

        print("Починаємо наповнення бази даних...")

        demo_password = hash_password("1234")

        users = [
            User(username="dispatcher_1", password_hash=demo_password, role=RoleEnum.DISPATCHER),
            User(username="dispatcher_2", password_hash=demo_password, role=RoleEnum.DISPATCHER),
            User(username="driver_ivan", password_hash=demo_password, role=RoleEnum.DRIVER),
            User(username="driver_petro", password_hash=demo_password, role=RoleEnum.DRIVER),
            User(username="driver_teodor", password_hash=demo_password, role=RoleEnum.DRIVER),
            User(username="driver_mykola", password_hash=demo_password, role=RoleEnum.DRIVER),
        ]
        session.add_all(users)
        await session.flush()
        print("2 Диспетчери та 4 Водії створені (пароль: '1234').")

        warehouses_data = [
            {"name": "Склад А (Північ)", "location_desc": "Північна магістраль, зручний під'їзд"},
            {"name": "Склад Б (Південь)", "location_desc": "Південний Хаб, біля кордону"},
            {"name": "Склад В (Схід)", "location_desc": "Східна промзона (небезпечна зона)"},
            {"name": "Склад Г (Захід)", "location_desc": "Західний резерв"},
            {"name": "Склад Д (Центр)", "location_desc": "Головний розподільчий центр"},
            {"name": "Склад Е (Об'їзна)", "location_desc": "Резервний склад на об'їзній"},
            {"name": "Склад Є (Вокзал)", "location_desc": "Близько до головного вокзалу Львова"},
            {"name": "Склад Ж (Аеропорт)", "location_desc": "Близько до головного терміналу Льовова"},
        ]

        warehouses = [Warehouse(**data) for data in warehouses_data]
        session.add_all(warehouses)
        await session.flush()
        print("8 Логістичних складів створено.")

        inventory_items = [
            # Склад А
            Inventory(warehouse_id=1, item_type=ItemTypeEnum.FUEL, quantity=5000.0),
            Inventory(warehouse_id=1, item_type=ItemTypeEnum.FOOD, quantity=2000.0),
            Inventory(warehouse_id=1, item_type=ItemTypeEnum.MEDS, quantity=500.0),

            # Склад Б
            Inventory(warehouse_id=2, item_type=ItemTypeEnum.FOOD, quantity=1000.0),
            Inventory(warehouse_id=2, item_type=ItemTypeEnum.MEDS, quantity=150.0),

            # Склад В
            Inventory(warehouse_id=3, item_type=ItemTypeEnum.FUEL, quantity=1000.0),

            # Склад Д (Центр)
            Inventory(warehouse_id=5, item_type=ItemTypeEnum.FUEL, quantity=10000.0),
        ]

        session.add_all(inventory_items)

        await session.commit()
        print("Початкові залишки товарів додані.")
        print("Сідінг завершено")


if __name__ == "__main__":
    asyncio.run(seed())