from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import schemas, models, oauth2
from ..database import get_db
from ..cloudinary_utils import upload_image, upload_multiple_images

router = APIRouter(tags=['Portfolio'], prefix="/api/portfolio")


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.Work)
async def create_work(
    title: str = Form(...),
    description: str = Form(...),
    img_url: UploadFile = File(...),
    other_images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    db_title = db.query(models.Work).filter(models.Work.title == title).first()
    if db_title:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Work with this title already exists")
    
    main_image_url = upload_image(img_url)
    
    other_image_urls = []
    if other_images:
        other_image_urls = upload_multiple_images(other_images)

    db_work = models.Work(
        title=title,
        description=description,
        img_url=main_image_url,
        other_image_urls=other_image_urls
    )
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work

@router.get("/", response_model=list[schemas.Work])
def get_works(db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(oauth2.get_current_user_optional)):
    works = db.query(models.Work).all()
    
    # Get the user's liked work IDs for efficient checking if the user is logged in
    liked_work_ids = set()
    if current_user and current_user.liked_works:
        liked_work_ids = {like.work_id for like in current_user.liked_works}

    # Map SQLAlchemy Work objects to Pydantic schemas.Work, populating liked_by_user
    response_works = []
    for work in works:
        # Create a Pydantic Work object from the SQLAlchemy model
        work_schema = schemas.Work(
            id=work.id,
            title=work.title,
            description=work.description,
            img_url=work.img_url,
            other_image_urls=work.other_image_urls if work.other_image_urls else [],
            created_at=work.created_at,
            liked_by_user=work.id in liked_work_ids
        )
        response_works.append(work_schema)
        
    return response_works

@router.get("/{work_id}", response_model=schemas.Work)
def get_work(work_id: int, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(oauth2.get_current_user_optional)):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")

    liked_by_user = False
    if current_user:
        # Check if the current user has liked this specific work
        like_exists = db.query(models.LikedWork).filter(
            models.LikedWork.user_id == current_user.id,
            models.LikedWork.work_id == work_id
        ).first()
        if like_exists:
            liked_by_user = True

    # Map SQLAlchemy Work object to Pydantic schemas.Work, populating liked_by_user
    response_work = schemas.Work(
        id=db_work.id,
        title=db_work.title,
        description=db_work.description,
        img_url=db_work.img_url,
        other_image_urls=db_work.other_image_urls if db_work.other_image_urls else [],
        created_at=db_work.created_at,
        liked_by_user=liked_by_user
    )
    return response_work

@router.delete("/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work(work_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_admin_user)):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    db.delete(db_work)
    db.commit()
    return

@router.put("/{work_id}", response_model=schemas.Work)
async def update_work(
    work_id: int,
    title: str = Form(...),
    description: str = Form(...),
    img_url: Optional[UploadFile] = File(None),
    other_images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    
    db_work.title = title
    db_work.description = description

    if img_url:
        db_work.img_url = upload_image(img_url)
    
    if other_images:
        db_work.other_image_urls = upload_multiple_images(other_images)

    db.commit()
    db.refresh(db_work)
    return db_work
