"""
Verdicts endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/{claim_id}")
async def get_verdict(claim_id: str):
    """Get verdict for claim"""
    # TODO: Implement
    return {"message": "Not implemented yet"}
