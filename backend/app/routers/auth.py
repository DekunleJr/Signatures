from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import secrets

from .. import schemas, models, utils, oauth2
from ..database import get_db
from ..config import settings
from ..email_utils import send_otp_email, send_verification_email 
from datetime import datetime, timedelta, timezone
import random

router = APIRouter(tags=['Authentication'])

@router.post('/login', response_model=schemas.Token)
def login(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.username).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    if not utils.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid password Credentials")

    if db_user.status == "pending":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account not verified. Please check your email for a verification link.")
    if db_user.status == "blocked":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account blocked. Please contact support.")

    access_token = oauth2.create_access_token(data={"user_id": db_user.id})
    return {"access_token": access_token, "token_type": "bearer", "is_admin": db_user.is_admin, "first_name": db_user.first_name, "status": db_user.status}

@router.post('/signup', status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
async def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    db_number = db.query(models.User).filter(models.User.phone_number == user.phone_number).first()
    if db_number:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number already registered")
    
    user.password = utils.hash_password(user.password)

    new_user = models.User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        password=user.password,
        status="pending" # Set status to pending
    )
    
    # Generate and store verification token
    verification_token = secrets.token_urlsafe(32)
    new_user.verification_token = verification_token

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send verification email
    verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
    await send_verification_email(new_user.email, "Verify Your Account", verification_url)

    return new_user


@router.post('/google-signup-login', response_model=schemas.Token)
def google_signup_login(google_user: schemas.GoogleUserCreate, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(google_user.google_id_token, requests.Request(), settings.google_client_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google ID token")

    user_email = idinfo['email']
    user_first_name = idinfo.get('given_name', '')
    user_last_name = idinfo.get('family_name', '')
    user_phone_number = google_user.phone_number # Use phone number from the request if provided

    db_user = db.query(models.User).filter(models.User.email == user_email).first()

    if db_user:
        # User exists, log them in
        if db_user.status == "pending":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account not verified. Please check your email for a verification link.")
        if db_user.status == "blocked":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account blocked. Please contact support.")
        
        access_token = oauth2.create_access_token(data={"user_id": db_user.id})
        return {"access_token": access_token, "token_type": "bearer", "is_admin": db_user.is_admin, "first_name": db_user.first_name}
    else:
        # User does not exist, create a new user
        # Generate a random password for Google authenticated users
        random_password = secrets.token_urlsafe(16)
        hashed_password = utils.hash_password(random_password)

        new_user = models.User(
            email=user_email,
            first_name=user_first_name,
            last_name=user_last_name,
            phone_number=user_phone_number,
            password=hashed_password,
            is_admin=False,
            status="active"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        access_token = oauth2.create_access_token(data={"user_id": new_user.id})
        return {"access_token": access_token, "token_type": "bearer", "is_admin": new_user.is_admin, "first_name": new_user.first_name}


@router.post('/forgot-password', status_code=status.HTTP_200_OK)
async def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    password_reset = models.PasswordReset(
        user_id=user.id,
        otp=otp,
        expires_at=expires_at
    )
    db.add(password_reset)
    db.commit()

    await send_otp_email(user.email, otp)

    return {"message": "OTP sent to your email"}

@router.get('/api/verify-email', status_code=status.HTTP_200_OK, response_model=schemas.Token)
async def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.verification_token == token).first()

    if not user:
        print("User not found or token invalid/expired.") # Debugging
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")
    
    print(f"User found: {user.email}, current status: {user.status}") # Debugging

    if user.status == "active":
        print("User already active, logging in.") # Debugging
        access_token = oauth2.create_access_token(data={"user_id": user.id})
        return {"access_token": access_token, "token_type": "bearer", "is_admin": user.is_admin, "first_name": user.first_name, "status": user.status}

    user.status = "active"
    user.verification_token = None # Clear the token after successful verification
    db.commit()
    db.refresh(user)

    print(f"User {user.email} status updated to active. New status: {user.status}") # Debugging
    access_token = oauth2.create_access_token(data={"user_id": user.id})
    print(f"Returning token for user: {user.email}") # Debugging
    return {"access_token": access_token, "token_type": "bearer", "is_admin": user.is_admin, "first_name": user.first_name, "status": user.status}


@router.post('/resend-verification', status_code=status.HTTP_200_OK)
async def resend_verification_link(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.status == "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is already active.")
    
    # Generate a new verification token
    new_verification_token = secrets.token_urlsafe(32)
    user.verification_token = new_verification_token
    db.commit()
    db.refresh(user)

    # Send new verification email
    verification_url = f"{settings.frontend_url}/verify-email?token={new_verification_token}"
    await send_verification_email(user.email, "Verify Your Account", verification_url)

    return {"message": "New verification link sent to your email."}


@router.post('/reset-password', status_code=status.HTTP_200_OK)
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    password_reset = db.query(models.PasswordReset).filter(
        models.PasswordReset.user_id == user.id,
        models.PasswordReset.otp == request.otp
    ).first()

    if not password_reset or password_reset.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    user.password = utils.hash_password(request.new_password)
    db.delete(password_reset)
    db.commit()

    return {"message": "Password reset successful"}
