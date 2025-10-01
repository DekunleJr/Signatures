from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from .. import schemas, models
from ..database import get_db

router = APIRouter(tags=['Service'], prefix="/api/services")

@router.post("/",status_code=status.HTTP_201_CREATED, response_model=schemas.Service)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    db_title = db.query(models.Service).filter(models.Service.title == service.title).first()
    if db_title:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Service with this title already exists")
    
    db_service = models.Service(
        title=service.title,
        description=service.description,
        img_url=service.img_url
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
def delete_service(service_id: int, db: Session = Depends(get_db)):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    db.delete(db_service)
    db.commit()
    return

@router.put("/{service_id}", response_model=schemas.Service)
def update_service(service_id: int, service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    db_service.title = service.title
    db_service.description = service.description
    db_service.img_url = service.img_url

    db.commit()
    db.refresh(db_service)
    return db_service