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
def get_works(db: Session = Depends(get_db)):
    works = db.query(models.Work).all()
    return works

@router.get("/{work_id}", response_model=schemas.Work)
def get_work(work_id: int, db: Session = Depends(get_db)):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    return db_work

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
