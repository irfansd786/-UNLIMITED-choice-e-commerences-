import logging
import os
import sys
from contextlib import asynccontextmanager

# Ensure backend root directory is in sys.path
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_PARENT_DIR = os.path.dirname(_CURRENT_DIR)
if _PARENT_DIR not in sys.path:
    sys.path.insert(0, _PARENT_DIR)

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings, ROOT_DIR, BACKEND_DIR
from app.core.database import Base, engine
from app.core.seed import seed_db

# Import all API routers
from app.api.auth import router as auth_router
from app.api.categories import router as categories_router
from app.api.products import router as products_router
from app.api.cart import router as cart_router
from app.api.wishlist import router as wishlist_router
from app.api.addresses import router as addresses_router
from app.api.orders import router as orders_router
from app.api.reviews import router as reviews_router
from app.api.coupons import router as coupons_router
from app.api.admin import router as admin_router
from app.api.ai_assistant import router as ai_assistant_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("varshi_enterprises")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed data
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    try:
        seed_db()
        logger.info("Seed data ready.")
    except Exception as e:
        logger.error(f"Error during seeding: {e}")
    yield
    logger.info("Application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Varshi Enterprises - Men's Fashion & Streetwear E-Commerce Backend API",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https:\/\/.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Storage Directories (/media for storage, /images for customer images)
if os.path.exists(settings.STORAGE_DIR):
    app.mount("/media", StaticFiles(directory=settings.STORAGE_DIR), name="media")

customer_images_dir = os.path.join(ROOT_DIR, "customer", "public", "images")
if os.path.exists(customer_images_dir):
    app.mount("/images", StaticFiles(directory=customer_images_dir), name="images")
elif os.path.exists(settings.STORAGE_DIR):
    app.mount("/images", StaticFiles(directory=settings.STORAGE_DIR), name="images")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(categories_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(cart_router, prefix=settings.API_V1_STR)
app.include_router(wishlist_router, prefix=settings.API_V1_STR)
app.include_router(addresses_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(reviews_router, prefix=settings.API_V1_STR)
app.include_router(coupons_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant_router, prefix=settings.API_V1_STR)

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Varshi Enterprises E-Commerce API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
