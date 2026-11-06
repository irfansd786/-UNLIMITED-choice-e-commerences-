from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.wishlist import Wishlist, WishlistItem
from app.models.product import Product
from app.schemas.cart_wishlist_address import (
    WishlistResponse,
    WishlistItemResponse,
)
from app.api.products import format_product_response

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

def build_wishlist_response(wishlist: Wishlist, db: Session) -> WishlistResponse:
    items_response = []
    for item in wishlist.items:
        prod = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.variants)
        ).filter(Product.id == item.product_id).first()
        
        if not prod:
            continue
            
        prod_resp = format_product_response(prod, db)
        items_response.append(
            WishlistItemResponse(
                id=item.id,
                wishlist_id=wishlist.id,
                product_id=prod.id,
                product=prod_resp,
                created_at=item.created_at,
            )
        )
        
    return WishlistResponse(
        id=wishlist.id,
        user_id=wishlist.user_id,
        items=items_response,
        count=len(items_response)
    )

@router.get("", response_model=WishlistResponse)
def get_user_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()
    if not wishlist:
        wishlist = Wishlist(user_id=current_user.id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)
        
    return build_wishlist_response(wishlist, db)

@router.post("/toggle/{product_id}", response_model=WishlistResponse)
def toggle_wishlist_item(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()
    if not wishlist:
        wishlist = Wishlist(user_id=current_user.id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)
        
    existing_item = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wishlist.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if existing_item:
        db.delete(existing_item)
    else:
        new_item = WishlistItem(wishlist_id=wishlist.id, product_id=product_id)
        db.add(new_item)
        
    db.commit()
    db.refresh(wishlist)
    return build_wishlist_response(wishlist, db)

@router.delete("/{product_id}", response_model=WishlistResponse)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()
    if wishlist:
        db.query(WishlistItem).filter(
            WishlistItem.wishlist_id == wishlist.id,
            WishlistItem.product_id == product_id
        ).delete()
        db.commit()
        db.refresh(wishlist)
    return build_wishlist_response(wishlist, db)
