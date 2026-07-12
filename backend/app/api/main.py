from fastapi import APIRouter

from app.api.routes import login, users, upload, orders, reports
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(upload.router)
api_router.include_router(orders.router)
api_router.include_router(reports.router)