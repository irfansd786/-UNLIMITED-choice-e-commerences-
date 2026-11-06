from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON, Enum
from sqlalchemy.orm import relationship
import enum
from backend.app.core.database import Base

class OrderStatus(str, enum.Enum):
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    RETURN_REQUESTED = "RETURN_REQUESTED"
    RETURNED = "RETURNED"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    
    status = Column(String(50), default=OrderStatus.PLACED.value, nullable=False)
    subtotal = Column(Float, nullable=False, default=0.0)
    discount = Column(Float, nullable=False, default=0.0)
    delivery_fee = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    
    coupon_code = Column(String(50), nullable=True)
    shipping_address = Column(JSON, nullable=False) # Snapshot of delivery address
    customer_notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Status timeline history
    status_history = Column(JSON, default=list, nullable=False) # [{"status": "PLACED", "timestamp": "...", "note": "Order placed"}]

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=False)
    product_image = Column(String(1024), nullable=True)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
