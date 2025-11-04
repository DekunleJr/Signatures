import requests
import base64
from io import BytesIO
from PIL import Image # Import Pillow
from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import schemas, models, oauth2
from ..database import get_db
from ..cloudinary_utils import upload_image, upload_multiple_images, delete_image
from ..email_utils import send_email_via_resend
from ..config import settings

router = APIRouter(tags=['Portfolio'], prefix="/api/portfolio")


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.WorkEdit)
async def create_work(
    title: str = Form(...),
    description: str = Form(...),
    category_id: int = Form(...),
    img_url: UploadFile = File(...),
    other_images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    db_title = db.query(models.Work).filter(models.Work.title == title).first()
    if db_title:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Work with this title already exists")
    
    main_image_url = upload_image(img_url)
    
    other_image_urls = []
    if other_images:
        other_image_urls = upload_multiple_images(other_images)

    db_work = models.Work(
        title=title,
        description=description,
        img_url=main_image_url,
        other_image_urls=other_image_urls,
        category_id=category_id
    )
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work

@router.post("/{work_id}/order", status_code=status.HTTP_200_OK)
async def order_work(
    work_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")

    # Download, compress, and embed the image
    image_html = ""
    try:
        response = requests.get(db_work.img_url)
        response.raise_for_status() # Raise an exception for bad status codes
        image_content = response.content

        # Open image with Pillow
        img = Image.open(BytesIO(image_content))

        # Resize and compress image
        max_size = (800, 600) # Max dimensions for email
        img.thumbnail(max_size, Image.Resampling.LANCZOS) # Use LANCZOS for high-quality downsampling

        # Save to a BytesIO object to get compressed content
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format=img.format if img.format else "JPEG", quality=75) # Adjust quality as needed
        img_byte_arr = img_byte_arr.getvalue()

        # Encode compressed image to base64
        encoded_image = base64.b64encode(img_byte_arr).decode("utf-8")
        image_html = f'<img src="data:image/{img.format.lower() if img.format else "jpeg"};base64,{encoded_image}" alt="{db_work.title}" style="max-width: 100%; height: auto;">'
    except requests.exceptions.RequestException as e:
        print(f"Error downloading image for compression: {e}")
        image_html = f'<p>Could not load image: {db_work.img_url}</p>'
    except Exception as e:
        print(f"Error processing image with Pillow: {e}")
        image_html = f'<p>Could not process image: {db_work.img_url}</p>'

    sender_email = "order@nonreply.2125signature.com"
    subject = f"{current_user.first_name} {current_user.last_name} orders {db_work.title}"
    body = f"""
    <h2>New Work Request</h2>
    <p><strong>User:</strong> {current_user.first_name} {current_user.last_name} ({current_user.email})</p>
    <p><strong>Number:</strong> {current_user.phone_number}</p>
    <p><strong>Work Title:</strong> {db_work.title}</p>
    <p><strong>Work Description:</strong> {db_work.description}</p>
    {image_html}
    """

    try:
        await send_email_via_resend(sender_email, settings.mail_to, subject, body)
        return {"message": "Order request sent successfully!"}
    except Exception as e:
        import traceback
        print(f"Error sending order email: {e}")
        traceback.print_exc() # Print full traceback
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to send order email.")


@router.get("/", response_model=schemas.WorkPaginationResponse)
def get_works(
    skip: int = 0, 
    limit: int = 12, 
    db: Session = Depends(get_db), 
    current_user: Optional[models.User] = Depends(oauth2.get_current_user_optional)
):
    query = db.query(models.Work).order_by(models.Work.created_at.desc())
    total_works = query.count() # Get total count before applying limit and offset
    
    works = query.offset(skip).limit(limit).all()
    
    # Get the user's liked work IDs for efficient checking if the user is logged in
    liked_work_ids = set()
    if current_user and current_user.liked_works:
        liked_work_ids = {like.work_id for like in current_user.liked_works}

    # Map SQLAlchemy Work objects to Pydantic schemas.Work, populating liked_by_user
    response_works = []
    for work in works:
        # Create a Pydantic Work object from the SQLAlchemy model
        work_schema = schemas.Work(
            id=work.id,
            title=work.title,
            category_id=work.category_id,
            description=work.description,
            img_url=work.img_url,
            other_image_urls=work.other_image_urls if work.other_image_urls else [],
            created_at=work.created_at,
            liked_by_user=work.id in liked_work_ids
        )
        response_works.append(work_schema)
        
    return {"total_works": total_works, "works": response_works}


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    title: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    db_category = models.Category(title=title)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/categories", response_model=List[schemas.Category])
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()
    return categories

@router.get("/search/{category_id}", response_model=schemas.WorkPaginationResponse)
async def search_by_category(
    category_id: int,
    skip: int = 0, 
    limit: int = 12,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(oauth2.get_current_user_optional)
):
    works = db.query(models.Work).filter(models.Work.category_id == category_id).offset(skip).limit(limit).all()

    # Get the user's liked work IDs for efficient checking if the user is logged in
    liked_work_ids = set()
    if current_user and current_user.liked_works:
        liked_work_ids = {like.work_id for like in current_user.liked_works}

    response_works = []
    for work in works:
        work_schema = schemas.Work(
            id=work.id,
            title=work.title,
            category_id=work.category_id,
            description=work.description,
            img_url=work.img_url,
            other_image_urls=work.other_image_urls if work.other_image_urls else [],
            created_at=work.created_at,
            liked_by_user=work.id in liked_work_ids
        )
        response_works.append(work_schema)

    return {"total_works": len(response_works), "works": response_works}

@router.get("/category/{category_id}", response_model=schemas.Category)
async def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return db_category

@router.put("/category/{category_id}", status_code=status.HTTP_200_OK)
async def update_category(
    category_id: int,
    title: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    db_category.title = title
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/category/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return

@router.put("/{work_id}", response_model=schemas.WorkEdit)
async def update_work(
    work_id: int,
    title: str = Form(...),
    category_id: int = Form(...),
    description: str = Form(...),
    img_url: Optional[UploadFile] = File(None),
    other_images: Optional[List[UploadFile]] = File(None),
    images_to_delete: Optional[List[str]] = Form(None), # New parameter for images to delete
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_admin_user)
):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    
    db_work.title = title
    db_work.category_id = category_id
    db_work.description = description

    if img_url:
        # Delete old main image from Cloudinary if a new one is provided
        if db_work.img_url:
            delete_image(db_work.img_url)
        db_work.img_url = upload_image(img_url)
    
    # Initialize other_image_urls if it's None
    if db_work.other_image_urls is None:
        db_work.other_image_urls = []

    # Handle image deletion
    if images_to_delete:
        for url_to_delete in images_to_delete:
            delete_image(url_to_delete) # Delete from Cloudinary
        db_work.other_image_urls = [
            url for url in db_work.other_image_urls if url not in images_to_delete
        ]

    # Handle new image uploads
    if other_images:
        new_image_urls = upload_multiple_images(other_images)
        db_work.other_image_urls.extend(new_image_urls)

    db.commit()
    db.refresh(db_work)
    return db_work


@router.get("/{work_id}", response_model=schemas.WorkDetails)
def get_work(work_id: int, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(oauth2.get_current_user_optional)):
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")

    liked_by_user = False
    if current_user:
        # Check if the current user has liked this specific work
        like_exists = db.query(models.LikedWork).filter(
            models.LikedWork.user_id == current_user.id,
            models.LikedWork.work_id == work_id
        ).first()
        if like_exists:
            liked_by_user = True

    category_list = db.query(models.Category).filter(models.Category.id == db_work.category_id).first()
    category = category_list.title if category_list else "Uncategorized"
    
    # Map SQLAlchemy Work object to Pydantic schemas.Work, populating liked_by_user
    response_work = schemas.WorkDetails(
        id=db_work.id,
        title=db_work.title,
        category=category,
        category_id=db_work.category_id,
        description=db_work.description,
        img_url=db_work.img_url,
        other_image_urls=db_work.other_image_urls if db_work.other_image_urls else [],
        created_at=db_work.created_at,
        liked_by_user=liked_by_user
    )
    return response_work

@router.delete("/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work(work_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_admin_user)):
    liked_work = db.query(models.LikedWork).filter(models.LikedWork.work_id == work_id).all()
    if liked_work:
        for like in liked_work:
            db.delete(like)
        db.commit()
    db_work = db.query(models.Work).filter(models.Work.id == work_id).first()
    if db_work.img_url:
        delete_image(db_work.img_url)
        
    if db_work.other_image_urls:
        for url in db_work.other_image_urls:
            delete_image(url)

    if not db_work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
    db.delete(db_work)
    db.commit()
    return
