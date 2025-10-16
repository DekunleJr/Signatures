from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import schemas, models, oauth2
from ..database import get_db

router = APIRouter(tags=['Admin'], prefix="/api/admin")

@router.get("/", response_model=schemas.UserPaginationResponse)
def get_users(
    skip: int = 0, 
    limit: int = 10,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    query = db.query(models.User).order_by(models.User.id.asc())
    total_users = query.count()
    users = query.offset(skip).limit(limit).all()
    return {"total_users": total_users, "users": users}

@router.put("/{user_id}", status_code=status.HTTP_200_OK, response_model=schemas.UserOut)
def update_user(
    user_id: int,
    email: str = Form(None),
    first_name: str = Form(None),
    last_name: str = Form(None),
    phone_number: str = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if email:
        user.email = email
    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    if phone_number:
        user.phone_number = phone_number
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return

@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
