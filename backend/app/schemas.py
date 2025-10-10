from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Literal, List
from fastapi import UploadFile, File
from pydantic import Field


class GoogleUserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    google_id_token: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None

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
    is_admin: bool
    phone_number: Optional[str] = None
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

class Work(BaseModel):
    id: int
    title: str
    description: str
    liked_by_user: bool # Added field to indicate if the current user liked the work
    img_url: str
    other_image_urls: List[str] = Field(default_factory=list) # New field for other image URLs
    created_at: datetime

class WorkEdit(BaseModel):
    id: int
    title: str
    description: str
    img_url: str
    other_image_urls: List[str] = Field(default_factory=list) # New field for other image URLs
    created_at: datetime

class WorkCreate(BaseModel):
    title: str
    description: str
    # img_url will be handled as a file upload in the router, not directly in the schema
    # other_images will be handled as a list of file uploads in the router

class Service(BaseModel):
    id: int
    title: str
    description: str
    img_url: str
    created_at: datetime

class ServiceCreate(BaseModel):
    title: str
    description: str
    img_url: str

class UserDashboard(UserOut):
    is_admin: bool
    # The Work schema now includes 'liked_by_user', so this list should correctly serialize.
    liked_works: List[Work] = []


class LikeStatus(BaseModel):
    liked: bool
