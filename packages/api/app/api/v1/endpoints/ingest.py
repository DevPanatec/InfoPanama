"""
Ingest endpoints for scrapers
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class ArticleIngest(BaseModel):
    """Article ingest request"""

    title: str
    url: str
    content: str
    source: str
    author: str = ""
    publishedDate: int


@router.post("/article", status_code=status.HTTP_201_CREATED)
async def ingest_article(article: ArticleIngest):
    """Ingest scraped article"""
    # TODO: Implement
    # 1. Validate article
    # 2. Check for duplicates
    # 3. Store in Convex
    # 4. Generate embeddings
    # 5. Extract claims
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet",
    )
