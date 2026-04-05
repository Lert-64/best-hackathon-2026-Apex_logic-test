from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from .routers import auth_router, driver_router, dispatcher_router

app = FastAPI(title="LogiFlow Apex Ultra", version="2.0.0")

# Монтуємо статику (JS/CSS)
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# --- FRONTEND ROUTES ---
@app.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/dispatcher", response_class=HTMLResponse)
async def dispatcher_page(request: Request):
    return templates.TemplateResponse("dispatcher.html", {"request": request})

@app.get("/driver", response_class=HTMLResponse)
async def driver_page(request: Request):
    return templates.TemplateResponse("driver.html", {"request": request})

# --- API ROUTES ---
app.include_router(auth_router.router)
app.include_router(dispatcher_router.router)
app.include_router(driver_router.router)