from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import secrets

from .. import schemas, models, utils, oauth2
from ..database import get_db
from ..config import settings

router = APIRouter(tags=['Authentication'])

@router.post('/login', response_model=schemas.Token)
def login(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.username).first()
    print(user.username)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    if not utils.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid password Credentials")

    access_token = oauth2.create_access_token(data={"user_id": db_user.id})
    return {"access_token": access_token, "token_type": "bearer", "is_admin": db_user.is_admin, "first_name": db_user.first_name}

@router.post('/signup', status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
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
        password=user.password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post('/google-signup-login', response_model=schemas.Token)
def google_signup_login(google_user: schemas.GoogleUserCreate, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(google_user.google_id_token, requests.Request(), settings.google_client_id)
        # You can add more checks here if needed, e.g., idinfo['iss'] in ['accounts.google.com', 'https://accounts.google.com']
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google ID token")

    user_email = idinfo['email']
    user_first_name = idinfo.get('given_name', '')
    user_last_name = idinfo.get('family_name', '')
    user_phone_number = google_user.phone_number # Use phone number from the request if provided

    db_user = db.query(models.User).filter(models.User.email == user_email).first()

    if db_user:
        # User exists, log them in
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
            is_admin=False # Google sign-ups are not admins by default
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        access_token = oauth2.create_access_token(data={"user_id": new_user.id})
        return {"access_token": access_token, "token_type": "bearer", "is_admin": new_user.is_admin, "first_name": new_user.first_name}
