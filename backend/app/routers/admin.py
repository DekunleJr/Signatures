from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import schemas, models, oauth2
from ..database import get_db

router = APIRouter(tags=['Admin'], prefix="/api/admin")

@router.get("/", response_model=list[schemas.UserOut])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_admin_user)):
    users = db.query(models.User).all()
    return users

@router.put("/{user_id}", status_code=status.HTTP_200_OK, response_model=schemas.UserOut)
def update_user(
    user_id: int,
    email: str = Form(None),
    first_name: str = Form(None),
    last_name: str = Form(None),
    phone_number: str = Form(None),
    password: str = Form(None),
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
    if password:
        user.password = password
    
    db.commit()
    db.refresh(user)
    return user