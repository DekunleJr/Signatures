from .database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text
from datetime import datetime, timedelta


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    otp = Column(String, nullable=False)
    expires_at = Column(TIMESTAMP(timezone=True), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

    user = relationship("User")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone_number = Column(String, unique=True)
    password = Column(String)
    status = Column(String, default="pending", nullable=False)
    verification_token = Column(String, nullable=True, unique=True) # New field for verification token
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    __table_args__ = (
        CheckConstraint(status.in_(['pending', 'active', 'blocked']), name='user_status_check'),
    )


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, unique=True)
    description = Column(String)
    img_url = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, unique=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

     # ✅ Relationship to Works
    works = relationship("Work", back_populates="category", cascade="all, delete-orphan")

class Work(Base):
    __tablename__ = "works"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, server_default=text("1"))
    description = Column(String)
    img_url = Column(String)
    other_image_urls = Column(JSON, nullable=True) # New field for other image URLs
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

    # Define the relationship with LikedWork for cascade deletion
    liked_by_users = relationship("LikedWork", backref="work_item", cascade="all, delete-orphan")
    category = relationship("Category", back_populates="works")

class LikedWork(Base):
    __tablename__ = "liked_works"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    work_id = Column(Integer, ForeignKey("works.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

    user = relationship("User", backref="liked_works")
    work = relationship("Work", overlaps="liked_by_users,work_item")
