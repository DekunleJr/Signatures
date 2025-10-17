from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import EmailStr

from .. import schemas, models, oauth2
from ..database import get_db
from ..email_utils import send_email

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

@router.put("/block-unblock/{user_id}", status_code=status.HTTP_200_OK, response_model=schemas.UserOut)
def block_unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.status == "active":
        user.status = "blocked"
    else:
        user.status = "active"
    
    db.commit()
    db.refresh(user)
    return user

@router.post("/broadcast-email", status_code=status.HTTP_200_OK)
async def broadcast_email(
    request: schemas.BroadcastEmailRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can broadcast emails")

    all_users = db.query(models.User).all()
    recipient_emails = []

    if request.send_option == "all_except_admin":
        for user_obj in all_users:
            if not user_obj.is_admin:
                recipient_emails.append(user_obj.email)
    elif request.send_option == "all_except_selected":
        selected_emails_set = set(request.selected_emails or [])
        for user_obj in all_users:
            if user_obj.email not in selected_emails_set:
                recipient_emails.append(user_obj.email)
    elif request.send_option == "only_selected":
        if not request.selected_emails:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No emails provided for 'only_selected' option")
        recipient_emails = [email for email in request.selected_emails if db.query(models.User).filter(models.User.email == email).first()]
        if not recipient_emails:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No valid selected emails found in the database")

    if not recipient_emails:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No recipients found for the selected option")

    try:
        await send_email(recipient_emails, request.subject, request.message)
        return {"message": f"Email broadcast successfully to {len(recipient_emails)} recipients."}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to send emails: {e}")

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
