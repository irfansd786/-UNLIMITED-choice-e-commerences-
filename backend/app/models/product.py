from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    short_description = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    
    price = Column(Float, nullable=False, default=0.0)
    compare_at_price = Column(Float, nullable=True)
    cost_price = Column(Float, nullable=True)
    
    sku = Column(String(100), unique=True, index=True, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    reserved_stock = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=5, nullable=False)
    
    status = Column(String(50), default="PUBLISHED", nullable=False) # DRAFT, PUBLISHED, ARCHIVED
    brand = Column(String(100), default="Varshi Enterprises", nullable=False)
    material = Column(String(100), nullable=True)
    specifications = Column(JSON, default=dict, nullable=False) # e.g. {"Fabric": "Pure Silk", "Weave": "Kalamkari Handblock", "Care": "Dry Clean"}
    
    is_featured = Column(Boolean, default=False, nullable=False)
    is_new_arrival = Column(Boolean, default=False, nullable=False)
    is_deal_of_the_day = Column(Boolean, default=False, nullable=False)
    
    # Trust & Real stock verification metadata
    stock_last_verified_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    has_real_photography = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.display_order")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(1024), nullable=False)
    alt_text = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="images")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False) # e.g. "Emerald Green / Free Size"
    sku = Column(String(100), unique=True, nullable=False)
    price = Column(Float, nullable=True)
    stock = Column(Integer, default=0, nullable=False)
    options = Column(JSON, default=dict, nullable=False) # e.g. {"color": "Emerald Green", "size": "Free Size"}
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="variants")
