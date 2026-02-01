from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    replicate_api_token: str = ""
    hume_api_key: str = ""
    elevenlabs_api_key: str = ""
    openai_api_key: str = ""
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
