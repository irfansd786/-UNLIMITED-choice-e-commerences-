from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
import enum
from backend.app.core.database import Base

class DiscountType(str, enum.Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    
    discount_type = Column(String(20), default=DiscountType.PERCENTAGE.value, nullable=False)
    discount_value = Column(Float, nullable=False) # e.g. 15 for 15% or 500 for ₹500
    
    min_order_value = Column(Float, default=0.0, nullable=False)
    max_discount_amount = Column(Float, nullable=True) # cap on percentage discount
    
    usage_limit = Column(Integer, nullable=True) # total number of times coupon can be used
    times_used = Column(Integer, default=0, nullable=False)
    
    is_active = Column(Boolean, default=True, nullable=False)
    valid_from = Column(DateTime, default=datetime.utcnow, nullable=False)
    valid_until = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
