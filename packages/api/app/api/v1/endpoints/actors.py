"""
Actors & Due Diligence endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_actors():
    """List actors"""
    # TODO: Implement
    return []


@router.get("/{actor_id}")
async def get_actor(actor_id: str):
    """Get actor by ID"""
    # TODO: Implement
    return {"message": "Not implemented yet"}
