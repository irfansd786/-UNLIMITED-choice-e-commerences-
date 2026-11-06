from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, desc, asc
from typing import List, Optional
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_admin_user, get_current_user_optional
from backend.app.models.product import Product, ProductImage, ProductVariant
from backend.app.models.category import Category
from backend.app.models.review import Review
from backend.app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductImageCreate,
    ProductImageResponse,
    ProductVariantResponse,
)

router = APIRouter(prefix="/products", tags=["Products"])

def format_product_response(product: Product, db: Session) -> ProductResponse:
    # Calculate discount percentage
    discount_pct = 0
    if product.compare_at_price and product.compare_at_price > product.price:
        discount_pct = int(round(((product.compare_at_price - product.price) / product.compare_at_price) * 100))
    
    # Calculate rating stats from real approved reviews
    rev_stats = db.query(
        func.count(Review.id).label("count"),
        func.avg(Review.rating).label("avg_rating")
    ).filter(
        Review.product_id == product.id,
        Review.status == "APPROVED"
    ).first()
    
    review_count = rev_stats.count if rev_stats and rev_stats.count else 0
    rating_avg = round(float(rev_stats.avg_rating), 1) if rev_stats and rev_stats.avg_rating else 0.0
    
    available_stock = max(0, product.stock - product.reserved_stock)
    is_in_stock = available_stock > 0

    return ProductResponse(
        id=product.id,
        name=product.name,
        slug=product.slug,
        short_description=product.short_description,
        description=product.description,
        category_id=product.category_id,
        price=product.price,
        compare_at_price=product.compare_at_price,
        cost_price=product.cost_price,
        sku=product.sku,
        stock=product.stock,
        available_stock=available_stock,
        is_in_stock=is_in_stock,
        low_stock_threshold=product.low_stock_threshold,
        status=product.status,
        brand=product.brand,
        material=product.material,
        specifications=product.specifications or {},
        is_featured=product.is_featured,
        is_new_arrival=product.is_new_arrival,
        is_deal_of_the_day=product.is_deal_of_the_day,
        has_real_photography=product.has_real_photography,
        discount_percentage=discount_pct,
        rating_average=rating_avg,
        review_count=review_count,
        stock_last_verified_at=product.stock_last_verified_at or product.updated_at,
        created_at=product.created_at,
        updated_at=product.updated_at,
        category=product.category,
        images=[ProductImageResponse.from_orm(img) for img in product.images],
        variants=[ProductVariantResponse.from_orm(v) for v in product.variants],
    )

@router.get("", response_model=ProductListResponse)
def get_products(
    category_slug: Optional[str] = None,
    category_id: Optional[int] = None,
    q: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: Optional[bool] = False,
    featured_only: Optional[bool] = False,
    new_arrivals_only: Optional[bool] = False,
    deals_only: Optional[bool] = False,
    intent: Optional[str] = None, # "under-999", "trending", "heritage", etc.
    sort_by: Optional[str] = "newest", # "newest", "price_asc", "price_desc", "rating", "popularity"
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=200),
    include_all_statuses: bool = False,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_optional)
):
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.variants)
    )
    
    # Customer visibility check
    is_admin = admin and admin.role == "ADMIN"
    if not (include_all_statuses and is_admin):
        query = query.filter(Product.status == "PUBLISHED")
    
    # Category filter
    if category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
    elif category_id:
        query = query.filter(Product.category_id == category_id)
        
    # Search query
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(term),
                Product.short_description.ilike(term),
                Product.description.ilike(term),
                Product.sku.ilike(term),
                Product.material.ilike(term),
                Product.brand.ilike(term)
            )
        )
        
    # Price range
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
        
    # Stock status
    if in_stock_only:
        query = query.filter(Product.stock > Product.reserved_stock)
        
    # Flags
    if featured_only:
        query = query.filter(Product.is_featured == True)
    if new_arrivals_only:
        query = query.filter(Product.is_new_arrival == True)
    if deals_only:
        query = query.filter(Product.is_deal_of_the_day == True)
        
    # Intent shortcuts
    if intent == "under-999":
        query = query.filter(Product.price < 999)
    elif intent == "premium":
        query = query.filter(Product.price >= 2000)
    elif intent == "trending":
        query = query.filter(Product.is_featured == True)
        
    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "oldest":
        query = query.order_by(Product.created_at.asc())
    else: # newest default
        query = query.order_by(Product.created_at.desc())
        
    total = query.count()
    items_raw = query.offset((page - 1) * page_size).limit(page_size).all()
    
    items = [format_product_response(p, db) for p in items_raw]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    
    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/search/suggestions")
def get_search_suggestions(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    term = f"%{q.strip()}%"
    products = db.query(Product.name, Product.slug, Product.price).filter(
        Product.status == "PUBLISHED",
        Product.name.ilike(term)
    ).limit(5).all()
    
    categories = db.query(Category.name, Category.slug).filter(
        Category.is_active == True,
        Category.name.ilike(term)
    ).limit(3).all()
    
    return {
        "products": [{"name": p.name, "slug": p.slug, "price": p.price} for p in products],
        "categories": [{"name": c.name, "slug": c.slug} for c in categories]
    }

@router.get("/{slug_or_id}", response_model=ProductResponse)
def get_product(
    slug_or_id: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_optional)
):
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.variants)
    )
    
    product = None
    if slug_or_id.isdigit():
        product = query.filter(Product.id == int(slug_or_id)).first()
    if not product:
        product = query.filter(Product.slug == slug_or_id).first()
        
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    is_admin = admin and admin.role == "ADMIN"
    if product.status != "PUBLISHED" and not is_admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    return format_product_response(product, db)

@router.get("/{product_id}/related", response_model=List[ProductResponse])
def get_related_products(product_id: int, limit: int = 4, db: Session = Depends(get_db)):
    target = db.query(Product).filter(Product.id == product_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Product not found")
        
    related = db.query(Product).filter(
        Product.category_id == target.category_id,
        Product.id != target.id,
        Product.status == "PUBLISHED"
    ).limit(limit).all()
    
    # Fallback to any published products if same category has few items
    if len(related) < limit:
        extra = db.query(Product).filter(
            Product.id != target.id,
            Product.status == "PUBLISHED",
            ~Product.id.in_([p.id for p in related])
        ).limit(limit - len(related)).all()
        related.extend(extra)
        
    return [format_product_response(p, db) for p in related]

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    prod_in: ProductCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    existing = db.query(Product).filter((Product.slug == prod_in.slug) | (Product.sku == prod_in.sku)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this slug or SKU already exists")
        
    category = db.query(Category).filter(Category.id == prod_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Specified category does not exist")
        
    product_data = prod_in.dict(exclude={"images", "variants"})
    product = Product(**product_data)
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Add images
    if prod_in.images:
        for idx, img in enumerate(prod_in.images):
            db_img = ProductImage(
                product_id=product.id,
                image_url=img.image_url,
                alt_text=img.alt_text or product.name,
                display_order=img.display_order if img.display_order else idx,
                is_primary=img.is_primary if img.is_primary else (idx == 0)
            )
            db.add(db_img)
            
    # Add variants
    if prod_in.variants:
        for var in prod_in.variants:
            db_var = ProductVariant(
                product_id=product.id,
                title=var.title,
                sku=var.sku,
                price=var.price if var.price is not None else product.price,
                stock=var.stock,
                options=var.options
            )
            db.add(db_var)
            
    db.commit()
    db.refresh(product)
    return format_product_response(product, db)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    prod_in: ProductUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    update_data = prod_in.dict(exclude_unset=True, exclude={"images"})
    for field, value in update_data.items():
        setattr(product, field, value)
        
    if prod_in.stock is not None:
        product.stock_last_verified_at = datetime.utcnow()
        
    if prod_in.images is not None:
        # Replace images
        db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
        for idx, img in enumerate(prod_in.images):
            db_img = ProductImage(
                product_id=product.id,
                image_url=img.image_url,
                alt_text=img.alt_text or product.name,
                display_order=img.display_order if img.display_order else idx,
                is_primary=img.is_primary if img.is_primary else (idx == 0)
            )
            db.add(db_img)
            
    db.commit()
    db.refresh(product)
    return format_product_response(product, db)

@router.patch("/{product_id}/stock")
def update_product_stock(
    product_id: int,
    stock: int = Query(..., ge=0),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.stock = stock
    product.stock_last_verified_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    return {"message": "Stock updated successfully", "product_id": product.id, "new_stock": product.stock}

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check if product is in any orders before physical delete to preserve audit history
    from backend.app.models.order import OrderItem
    has_orders = db.query(OrderItem).filter(OrderItem.product_id == product.id).first() is not None
    if has_orders:
        product.status = "ARCHIVED"
        db.commit()
        return {"message": "Product has historical orders and was safely archived", "status": "ARCHIVED"}
        
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
