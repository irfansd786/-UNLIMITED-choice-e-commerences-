from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from backend.app.schemas.product import ProductResponse

# CART
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    cart_id: int
    product_id: int
    quantity: int
    product: ProductResponse
    item_total: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = []
    subtotal: float = 0.0
    discount: float = 0.0
    delivery_fee: float = 0.0
    total_amount: float = 0.0
    item_count: int = 0
    free_shipping_eligible: bool = False
    amount_needed_for_free_shipping: float = 0.0

    class Config:
        from_attributes = True

# WISHLIST
class WishlistItemResponse(BaseModel):
    id: int
    wishlist_id: int
    product_id: int
    product: ProductResponse
    created_at: datetime

    class Config:
        from_attributes = True

class WishlistResponse(BaseModel):
    id: int
    user_id: int
    items: List[WishlistItemResponse] = []
    count: int = 0

    class Config:
        from_attributes = True

# ADDRESS
class AddressBase(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: str
    state: str
    postal_code: str
    address_type: str = "HOME"
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    address_type: Optional[str] = None
    is_default: Optional[bool] = None

class AddressResponse(AddressBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
