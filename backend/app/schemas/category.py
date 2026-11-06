from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    display_order: int = 0
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    display_order: int = None
    parent_id: Optional[int] = None

class CategoryResponse(CategoryBase):
    id: int
    is_active: bool = True
    product_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
