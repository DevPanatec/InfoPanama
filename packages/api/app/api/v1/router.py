"""
API V1 Router
"""

from fastapi import APIRouter

from app.api.v1.endpoints import claims, verdicts, actors, ingest

api_router = APIRouter()

# Include endpoints
api_router.include_router(claims.router, prefix="/claims", tags=["claims"])
api_router.include_router(verdicts.router, prefix="/verdicts", tags=["verdicts"])
api_router.include_router(actors.router, prefix="/actors", tags=["actors"])
api_router.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
