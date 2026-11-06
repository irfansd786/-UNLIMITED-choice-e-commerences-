from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.schemas.category import CategoryResponse

class ProductImageBase(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    display_order: int = 0
    is_primary: bool = False

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProductVariantBase(BaseModel):
    title: str
    sku: str
    price: Optional[float] = None
    stock: int = 0
    options: Dict[str, Any] = Field(default_factory=dict)

class ProductVariantCreate(ProductVariantBase):
    pass

class ProductVariantResponse(ProductVariantBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    slug: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: int
    price: float
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    sku: str
    stock: int = 0
    low_stock_threshold: int = 5
    status: str = "PUBLISHED"
    brand: str = "Varshi Enterprises"
    material: Optional[str] = None
    specifications: Dict[str, Any] = Field(default_factory=dict)
    is_featured: bool = False
    is_new_arrival: bool = False
    is_deal_of_the_day: bool = False
    has_real_photography: bool = True

class ProductCreate(ProductBase):
    images: Optional[List[ProductImageCreate]] = []
    variants: Optional[List[ProductVariantCreate]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    sku: Optional[str] = None
    stock: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    status: Optional[str] = None
    brand: Optional[str] = None
    material: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    is_featured: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    is_deal_of_the_day: Optional[bool] = None
    has_real_photography: Optional[bool] = None
    images: Optional[List[ProductImageCreate]] = None

class ProductResponse(ProductBase):
    id: int
    discount_percentage: Optional[int] = 0
    is_in_stock: bool = True
    available_stock: int = 0
    rating_average: float = 0.0
    review_count: int = 0
    stock_last_verified_at: datetime
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
