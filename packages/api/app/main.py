"""
FastAPI Backend para InfoPanama
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

from app.core.config import settings
from app.api.v1.router import api_router

# Initialize Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1,
        environment=settings.ENVIRONMENT,
    )

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API para verificación de información y análisis mediático en Panamá",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root() -> JSONResponse:
    """Root endpoint"""
    return JSONResponse(
        content={
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "running",
            "environment": settings.ENVIRONMENT,
        }
    )


@app.get("/health")
async def health() -> JSONResponse:
    """Health check endpoint"""
    return JSONResponse(
        content={
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level="info",
    )
