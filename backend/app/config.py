from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    database_hostname: str
    database_port: str
    database_password: str
    database_name: str
    database_username: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    google_client_id: str
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str

    model_config = ConfigDict(env_file=".env")

settings = Settings()