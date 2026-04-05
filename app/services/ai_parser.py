import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from openai import AsyncOpenAI
from dotenv import load_dotenv

from app.models.order_model import AIActionEnum, PriorityEnum
from app.models.warehouse_model import ItemTypeEnum

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# -------------------------
# ВХІДНІ МОДЕЛІ (Сувора типізація)
# -------------------------
class WarehouseSchema(BaseModel):
    id: int
    name: str
    location_desc: str

class AIInputContext(BaseModel):
    driver_comment: str
    current_destination_id: int
    cargo_type: ItemTypeEnum
    cargo_quantity: float
    available_warehouses: List[WarehouseSchema]

    @field_validator('driver_comment')
    @classmethod
    def validate_comment(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Коментар водія не може бути порожнім")
        return v

# -------------------------
# ВИХІДНА МОДЕЛЬ (Контракт із ШІ)
# -------------------------
class AIResolution(BaseModel):
    action: AIActionEnum
    priority: PriorityEnum
    new_destination_id: Optional[int]
    reasoning: str

# -------------------------
# СЕРВІС
# -------------------------
class AIService:
    @staticmethod
    async def analyze_incident(data: AIInputContext) -> AIResolution:
        system_prompt = """Ти — диспетчер логістики 'Apex Logic'. Твоя мета — врятувати вантаж.
ПРАВИЛА:
1. Дорога перекрита/розмита -> REROUTE (на інший склад).
2. Авто зламане/аварія -> WAIT + пріоритет CRITICAL.
3. Вантаж не прийняли -> RESTOCK (повернення).
Відповідай коротко українською."""


        context_data = {
            "driver_comment": data.driver_comment,
            "current_destination_id": data.current_destination_id,
            "cargo_type": data.cargo_type.value,
            "cargo_quantity": data.cargo_quantity,
            "available_warehouses": [w.model_dump() for w in data.available_warehouses]
        }

        response = await client.beta.chat.completions.parse(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context JSON: {json.dumps(context_data, ensure_ascii=False)}"}
            ],
            response_format=AIResolution,
            temperature=0.2
        )

        result = response.choices[0].message.parsed

        # 🛡 БІЗНЕС-ГАРДИ (Guard Logic)
        if result.action == AIActionEnum.REROUTE and result.new_destination_id is None:
            # Якщо ШІ помилився, беремо перший доступний склад як fallback або кидаємо помилку
            if data.available_warehouses:
                result.new_destination_id = data.available_warehouses[0].id
            else:
                result.action = AIActionEnum.WAIT
                result.reasoning += " (Автоматично змінено на WAIT: немає доступних складів для перенаправлення)"

        if result.action in [AIActionEnum.WAIT, AIActionEnum.RESTOCK]:
            result.new_destination_id = None

        return result