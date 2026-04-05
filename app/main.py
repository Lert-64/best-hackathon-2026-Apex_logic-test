from fastapi import FastAPI
from .routers import auth_router,driver_router,dispatcher_router
app = FastAPI(
    title="Apex Logic API",
    version="1.0.0"
)










app.include_router(auth_router.router)
app.include_router(dispatcher_router.router)
app.include_router(driver_router.router)