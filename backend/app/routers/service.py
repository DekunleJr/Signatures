from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import schemas, models, oauth2
from ..database import get_db
from ..cloudinary_utils import upload_image

router = APIRouter(tags=['Service'], prefix="/api/services")

@router.post("/",status_code=status.HTTP_201_CREATED, response_model=schemas.Service)
async def create_service(
    title: str = Form(...),
    description: str = Form(...),
    img_url: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)):

    db_title = db.query(models.Service).filter(models.Service.title == title).first()
    if db_title:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Service with this title already exists")
    
    image_url = upload_image(img_url)

    db_service = models.Service(
        title=title,
        description=description,
        img_url=image_url
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.get("/", response_model=list[schemas.Service])
def get_services(db: Session = Depends(get_db)):
    services = db.query(models.Service).all()
    return services

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    db.delete(db_service)
    db.commit()
    return

@router.put("/{service_id}", response_model=schemas.Service)
async def update_service(
    service_id: int,
    title: str = Form(...),
    description: str = Form(...),
    img_url: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    db_service.title = title
    db_service.description = description

    if img_url:
        db_service.img_url = upload_image(img_url)
    # If img_url is None, it means no new file was uploaded, so retain the existing one.
    # No explicit action needed here as it's already retained by not overwriting.

    db.commit()
    db.refresh(db_service)
    return db_service

@router.get("/{service_id}", response_model=schemas.Service)
def get_service(service_id: int, db: Session = Depends(get_db)):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return db_service
