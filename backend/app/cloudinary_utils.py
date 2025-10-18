import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from typing import List

from .config import settings

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True
)

def upload_image(file: UploadFile):
    upload_result = cloudinary.uploader.upload(file.file)
    return upload_result.get("secure_url")

def upload_multiple_images(files: List[UploadFile]):
    urls = []
    for file in files:
        url = upload_image(file)
        if url:
            urls.append(url)
    return urls

def delete_image(image_url: str):
    try:
        public_id_with_extension = image_url.split('/')[-1]
        public_id = public_id_with_extension.split('.')[0]
        
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"Error deleting image from Cloudinary: {e}")
        return False
