from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.core.database import get_db
from app.core.deps import get_current_admin_user
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    featured_only: bool = False,
    include_inactive: bool = False,
    supported_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Category)
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    if featured_only:
        query = query.filter(Category.is_featured == True)
    
    categories = query.order_by(Category.display_order.asc(), Category.name.asc()).all()
    
    # Calculate product count for each category
    result = []
    for cat in categories:
        p_count = db.query(func.count(Product.id)).filter(
            Product.category_id == cat.id,
            Product.status == "PUBLISHED"
        ).scalar() or 0
        
        if supported_only and p_count == 0:
            continue
            
        cat_dict = {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "image_url": cat.image_url,
            "is_featured": cat.is_featured,
            "is_active": cat.is_active,
            "display_order": cat.display_order,
            "parent_id": cat.parent_id,
            "product_count": p_count,
            "created_at": cat.created_at,
            "updated_at": cat.updated_at,
        }
        result.append(CategoryResponse(**cat_dict))
    
    return result

@router.get("/{slug_or_id}", response_model=CategoryResponse)
def get_category(slug_or_id: str, db: Session = Depends(get_db)):
    cat = None
    if slug_or_id.isdigit():
        cat = db.query(Category).filter(Category.id == int(slug_or_id)).first()
    if not cat:
        cat = db.query(Category).filter(Category.slug == slug_or_id).first()
    
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    p_count = db.query(func.count(Product.id)).filter(
        Product.category_id == cat.id,
        Product.status == "PUBLISHED"
    ).scalar() or 0
    
    return CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image_url=cat.image_url,
        is_featured=cat.is_featured,
        is_active=cat.is_active,
        display_order=cat.display_order,
        parent_id=cat.parent_id,
        product_count=p_count,
        created_at=cat.created_at,
        updated_at=cat.updated_at,
    )

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    existing = db.query(Category).filter((Category.slug == cat_in.slug) | (Category.name == cat_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name or slug already exists")
    
    cat = Category(**cat_in.dict())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image_url=cat.image_url,
        is_featured=cat.is_featured,
        display_order=cat.display_order,
        parent_id=cat.parent_id,
        product_count=0,
        created_at=cat.created_at,
        updated_at=cat.updated_at,
    )

@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(
    cat_id: int,
    cat_in: CategoryUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = cat_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cat, field, value)
    
    db.commit()
    db.refresh(cat)
    
    p_count = db.query(func.count(Product.id)).filter(
        Product.category_id == cat.id,
        Product.status == "PUBLISHED"
    ).scalar() or 0
    
    return CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image_url=cat.image_url,
        is_featured=cat.is_featured,
        display_order=cat.display_order,
        parent_id=cat.parent_id,
        product_count=p_count,
        created_at=cat.created_at,
        updated_at=cat.updated_at,
    )

@router.delete("/{cat_id}", status_code=status.HTTP_200_OK)
def delete_category(
    cat_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    product_count = db.query(Product).filter(Product.category_id == cat_id).count()
    if product_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category that contains products. Reassign or delete products first.")
    
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}
