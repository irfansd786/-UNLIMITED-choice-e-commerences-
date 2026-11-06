from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.cart import Cart, CartItem
from backend.app.models.product import Product
from backend.app.schemas.cart_wishlist_address import (
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
    CartResponse,
)
from backend.app.api.products import format_product_response

router = APIRouter(prefix="/cart", tags=["Cart"])

FREE_SHIPPING_THRESHOLD = 999.0
STANDARD_DELIVERY_FEE = 99.0

def build_cart_response(cart: Cart, db: Session) -> CartResponse:
    items_response = []
    subtotal = 0.0
    
    for item in cart.items:
        # Load product with relations
        prod = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.images),
            joinedload(Product.variants)
        ).filter(Product.id == item.product_id).first()
        
        if not prod or prod.status != "PUBLISHED":
            db.delete(item)
            continue
            
        prod_resp = format_product_response(prod, db)
        item_total = prod.price * item.quantity
        subtotal += item_total
        
        items_response.append(
            CartItemResponse(
                id=item.id,
                cart_id=cart.id,
                product_id=prod.id,
                quantity=item.quantity,
                product=prod_resp,
                item_total=item_total,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
        )
        
    delivery_fee = 0.0 if (subtotal >= FREE_SHIPPING_THRESHOLD or subtotal == 0) else STANDARD_DELIVERY_FEE
    total_amount = subtotal + delivery_fee
    item_count = sum(it.quantity for it in items_response)
    free_shipping_eligible = subtotal >= FREE_SHIPPING_THRESHOLD
    amount_needed = max(0.0, FREE_SHIPPING_THRESHOLD - subtotal)
    db.commit()
    
    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        items=items_response,
        subtotal=subtotal,
        discount=0.0,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        item_count=item_count,
        free_shipping_eligible=free_shipping_eligible,
        amount_needed_for_free_shipping=amount_needed,
    )

@router.get("", response_model=CartResponse)
def get_user_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        
    return build_cart_response(cart, db)

@router.post("/items", response_model=CartResponse)
def add_item_to_cart(
    item_in: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product or product.status != "PUBLISHED":
        raise HTTPException(status_code=404, detail="Product not found or unavailable")
        
    available_stock = max(0, product.stock - product.reserved_stock)
    if available_stock <= 0:
        raise HTTPException(status_code=400, detail="This item is currently out of stock.")
        
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        
    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_in.product_id
    ).first()
    
    new_quantity = item_in.quantity
    if cart_item:
        new_quantity = cart_item.quantity + item_in.quantity
        if new_quantity > available_stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {available_stock} units available in stock. Cannot add more."
            )
        cart_item.quantity = new_quantity
    else:
        if new_quantity > available_stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {available_stock} units available in stock."
            )
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity
        )
        db.add(cart_item)
        
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart, db)

@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    if item_update.quantity <= 0:
        db.delete(cart_item)
    else:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        available_stock = max(0, product.stock - product.reserved_stock)
        if item_update.quantity > available_stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {available_stock} units available in stock."
            )
        cart_item.quantity = item_update.quantity
        
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart, db)

@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    if cart_item:
        db.delete(cart_item)
        db.commit()
        db.refresh(cart)
        
    return build_cart_response(cart, db)

@router.delete("", response_model=CartResponse)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
        db.refresh(cart)
    return build_cart_response(cart, db)
