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
