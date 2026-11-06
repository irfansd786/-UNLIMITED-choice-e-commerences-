from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
import enum
from backend.app.core.database import Base

class PaymentMethod(str, enum.Enum):
    UPI = "UPI"
    CARD = "CARD"
    NET_BANKING = "NET_BANKING"
    COD = "COD"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    payment_method = Column(String(50), nullable=False) # UPI, CARD, NET_BANKING, COD
    amount = Column(Float, nullable=False)
    status = Column(String(50), default=PaymentStatus.PENDING.value, nullable=False) # PENDING, PAID, FAILED, REFUNDED
    transaction_reference = Column(String(100), unique=True, index=True, nullable=False) # MOCK-TXN-XXXXXX
    payment_gateway = Column(String(50), default="MOCK_GATEWAY", nullable=False)
    payment_details = Column(JSON, default=dict, nullable=False) # e.g. {"upi_id": "user@okaxis", "card_last4": "4242"}
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="payment")
