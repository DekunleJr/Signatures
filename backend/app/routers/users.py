from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from typing import List, Optional

from .. import schemas, models, oauth2
from ..database import get_db

router = APIRouter(tags=['Dashboard'], prefix="/api")

@router.get("/dashboard", response_model=schemas.UserDashboard)
def get_user_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    """
    Retrieves dashboard data for the current authenticated user,
    including their liked works.
    """
    # Efficiently fetch user with their liked works using a single query
    user_with_likes = db.query(models.User).options(
        joinedload(models.User.liked_works).joinedload(models.LikedWork.work)
    ).filter(models.User.id == current_user.id).first()

    if not user_with_likes:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Manually construct the list of liked works from the relationship
    liked_works_list = [liked.work for liked in user_with_likes.liked_works]

    # Create a dictionary with the user's data and the liked works list
    dashboard_data = {
        "id": user_with_likes.id,
        "email": user_with_likes.email,
        "first_name": user_with_likes.first_name,
        "last_name": user_with_likes.last_name,
        "phone_number": user_with_likes.phone_number,
        "is_admin": user_with_likes.is_admin,
        "created_at": user_with_likes.created_at,
        "liked_works": liked_works_list 
    }

    return dashboard_data


@router.post("/like/{work_id}", status_code=status.HTTP_201_CREATED)
def like_work(work_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    # 1. Check if the work exists first
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")

    # 2. Check if the user has already liked this work
    like = db.query(models.LikedWork).filter(models.LikedWork.user_id == current_user.id, models.LikedWork.work_id == work_id).first()
    if like:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Work already liked")

    db_like = models.LikedWork(user_id=current_user.id, work_id=work_id)
    db.add(db_like)
    db.commit()
    db.refresh(db_like)
    return {"message": "Work liked successfully", "like": db_like}

@router.get("/like/{work_id}", response_model=schemas.LikeStatus)
def get_liked_work(work_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    # It's good practice to ensure the work exists, though the primary goal is checking the 'like'
    work_exists = db.query(models.Work.id).filter(models.Work.id == work_id).first()
    if not work_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")

    # A more efficient way to check for existence
    like_exists = db.query(db.query(models.LikedWork).filter(
        models.LikedWork.user_id == current_user.id, models.LikedWork.work_id == work_id
    ).exists()).scalar()

    return {"liked": like_exists}