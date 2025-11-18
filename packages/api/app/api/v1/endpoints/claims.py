"""
Claims endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class ClaimCreate(BaseModel):
    """Create claim request"""

    title: str
    description: str
    claimText: str
    category: Optional[str] = None
    tags: List[str] = []
    sourceUrl: Optional[str] = None


class ClaimResponse(BaseModel):
    """Claim response"""

    id: str
    title: str
    description: str
    claimText: str
    status: str
    riskLevel: str
    createdAt: int


@router.get("/", response_model=List[ClaimResponse])
async def list_claims(
    status: Optional[str] = None,
    limit: int = 20,
) -> List[ClaimResponse]:
    """List claims"""
    # TODO: Implement with Convex
    return []


@router.get("/{claim_id}", response_model=ClaimResponse)
async def get_claim(claim_id: str) -> ClaimResponse:
    """Get claim by ID"""
    # TODO: Implement with Convex
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Claim not found",
    )


@router.post("/", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
async def create_claim(claim: ClaimCreate) -> ClaimResponse:
    """Create new claim"""
    # TODO: Implement with Convex
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet",
    )
