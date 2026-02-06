from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket: str = "docgram-files"

    secret_key: str
    algorithm: str
    access_token_expire_days: int
    stage: str = "dev"
    debug: bool= True

    gemini_api_key: str
    pinecone_api_key: str

    class Config:
        env_file = ".env"


settings = Settings()
