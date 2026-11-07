import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

# Absolute paths to ensure consistency regardless of working directory
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) # .../backend
ROOT_DIR = os.path.dirname(BACKEND_DIR) # .../e-commerces
CANONICAL_DB_PATH = os.path.join(BACKEND_DIR, "database", "varshi.db")
# Storage directory located in customer folder for easy Vercel CDN deployment
CUSTOMER_STORAGE_PATH = os.path.join(ROOT_DIR, "customer", "public", "storage")
if os.path.exists(CUSTOMER_STORAGE_PATH):
    STORAGE_DIR_PATH = CUSTOMER_STORAGE_PATH
elif os.path.exists(os.path.join(ROOT_DIR, "customer", "storage")):
    STORAGE_DIR_PATH = os.path.join(ROOT_DIR, "customer", "storage")
else:
    STORAGE_DIR_PATH = os.path.join(BACKEND_DIR, "storage")

os.makedirs(os.path.dirname(CANONICAL_DB_PATH), exist_ok=True)
os.makedirs(STORAGE_DIR_PATH, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "UNLIMITED choice API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database - Default to canonical backend/database/varshi.db
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{CANONICAL_DB_PATH}")
    
    # Storage Directory
    STORAGE_DIR: str = STORAGE_DIR_PATH
    
    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_varshi_enterprises_jwt_key_2025_secure")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://unlimited-choice-customer.vercel.app",'https://unlimited-choice-customer-git-main-irfansd786s-projects.vercel.app'
        "http://unlimited-choice-customer.vercel.app",
        "https://varshienterprises.com",
        "https://admin.varshienterprises.com",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return v
    
    # Cloudinary (Optional)
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # AI Integration: Groq
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    GROQ_FALLBACK_MODEL: str = os.getenv("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b")

    # Voice AI: ElevenLabs
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")
    ELEVENLABS_MODEL_ID: str = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")

    # Executive Persona
    ADMIN_PREFERRED_TITLE: str = os.getenv("ADMIN_PREFERRED_TITLE", "Chief")
    STORE_TIMEZONE: str = os.getenv("STORE_TIMEZONE", "Asia/Kolkata")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
