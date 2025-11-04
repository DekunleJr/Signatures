from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from .. import schemas, models
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/api/home", tags=["Home routes"])

@router.get("/", status_code=status.HTTP_200_OK, response_model=schemas.HomeWorksResponse)
async def show_works_by_category(db: Session = Depends(get_db)):
    """Fetch and return works, optionally filtered by category."""
    categories = db.query(models.Category).all()
    if not categories:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No categories found")
    result = {}
    for category in categories:
        works = db.query(models.Work).filter(models.Work.category_id == category.id).order_by(models.Work.created_at.desc()).limit(4).all()

        result[category.title] = [
            schemas.HomeWork(
                id=work.id,
                title=work.title,
                description=work.description,
                img_url=work.img_url
            )
            for work in works
        ]
    return schemas.HomeWorksResponse(works_by_category=result)