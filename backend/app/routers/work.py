from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from .. import schemas, models
from ..database import get_db

router = APIRouter(tags=['Portfolio'], prefix="/api/portfolio")


@router.post("/",status_code=status.HTTP_201_CREATED, response_model=schemas.Work)
def create_work(work: schemas.WorkCreate, db: Session = Depends(get_db)):
    db_title = db.query(models.Work).filter(models.Work.title == work.title).first()
    if db_title:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Work with this title already exists")
    
    db_work = models.Work(
        title=work.title,
        description=work.description,
        img_url=work.img_url
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
def delete_work(work_id: int, db: Session = Depends(get_db)):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    db.delete(db_work)
    db.commit()
    return

@router.put("/{work_id}", response_model=schemas.Work)
def update_work(work_id: int, work: schemas.WorkCreate, db: Session = Depends(get_db)):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    
    db_work.title = work.title
    db_work.description = work.description
    db_work.img_url = work.img_url

    db.commit()
    db.refresh(db_work)
    return db_work