from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Literal




class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool
    first_name: str

class TokenData(BaseModel):
    id: Optional[str] = None
