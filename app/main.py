from fastapi import FastAPI
from .routers import auth_router,dispatcher_router,driver_router
app = FastAPI(
    title="Apex Logic API",
    description="Інтелектуальний диспетчерський хаб (Хакатон Innovate)",
    version="1.0.0"
)










app.include_router(auth_router.router)
app.include_router(dispatcher_router.router)
app.include_router(driver_router.router)