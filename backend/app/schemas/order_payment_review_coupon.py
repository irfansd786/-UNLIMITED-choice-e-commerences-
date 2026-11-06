from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.product import ProductResponse

# ORDERS
class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    product_name: str
    product_sku: str
    product_image: Optional[str] = None
    unit_price: float
    quantity: int
    total_price: float
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    order_id: int
    payment_method: str
    amount: float
    status: str
    transaction_reference: str
    payment_gateway: str
    payment_details: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    status: str
    subtotal: float
    discount: float
    delivery_fee: float
    total_amount: float
    coupon_code: Optional[str] = None
    shipping_address: Dict[str, Any]
    customer_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    status_history: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    payment: Optional[PaymentResponse] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    address_id: int
    payment_method: str # UPI, CARD, NET_BANKING, COD
    coupon_code: Optional[str] = None
    customer_notes: Optional[str] = None
    # For mock simulation:
    simulate_payment_failure: Optional[bool] = False

class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None

# REVIEWS
class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    title: Optional[str] = None
    comment: str

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    user_name: Optional[str] = None
    order_id: Optional[int] = None
    rating: int
    title: Optional[str] = None
    comment: str
    is_verified_purchase: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# COUPONS
class CouponValidateRequest(BaseModel):
    code: str
    cart_amount: float

class CouponValidateResponse(BaseModel):
    is_valid: bool
    code: str
    discount_type: str
    discount_value: float
    discount_amount: float
    message: str

class CouponBase(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str = "PERCENTAGE"
    discount_value: float
    min_order_value: float = 0.0
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    is_active: bool = True
    valid_until: Optional[datetime] = None

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_value: Optional[float] = None
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = None
    valid_until: Optional[datetime] = None

class CouponResponse(CouponBase):
    id: int
    times_used: int
    valid_from: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ADMIN ANALYTICS
class DashboardStatsResponse(BaseModel):
    total_revenue: float
    paid_revenue: Optional[float] = 0.0
    total_orders: int
    active_orders: Optional[int] = 0
    cancelled_orders: Optional[int] = 0
    fulfillment_rate: Optional[float] = 100.0
    total_customers: int
    total_products: int
    low_stock_count: int
    pending_orders: int
    delivered_orders: int
    recent_orders: List[OrderResponse] = []
    top_selling_products: List[Dict[str, Any]] = []
    monthly_sales: List[Dict[str, Any]] = []
    orders_by_status: Dict[str, int] = {}
    payment_methods: Optional[Dict[str, Any]] = {}
