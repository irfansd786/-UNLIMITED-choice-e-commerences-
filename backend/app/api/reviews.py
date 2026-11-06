from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user, get_current_admin_user
from backend.app.models.user import User
from backend.app.models.product import Product
from backend.app.models.review import Review
from backend.app.models.order import Order, OrderItem, OrderStatus
from backend.app.schemas.order_payment_review_coupon import (
    ReviewCreate,
    ReviewResponse,
)

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(
        Review.product_id == product_id,
        Review.status == "APPROVED"
    ).order_by(Review.created_at.desc()).all()
    
    result = []
    for r in reviews:
        user_name = r.user.full_name if r.user else "Verified Customer"
        result.append(
            ReviewResponse(
                id=r.id,
                product_id=r.product_id,
                user_id=r.user_id,
                user_name=user_name,
                order_id=r.order_id,
                rating=r.rating,
                title=r.title,
                comment=r.comment,
                is_verified_purchase=r.is_verified_purchase,
                status=r.status,
                created_at=r.created_at,
            )
        )
    return result

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    rev_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if rev_in.rating < 1 or rev_in.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5 stars")
        
    product = db.query(Product).filter(Product.id == rev_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check if user actually ordered this product
    eligible_order = db.query(Order).join(OrderItem).filter(
        Order.user_id == current_user.id,
        OrderItem.product_id == rev_in.product_id,
        Order.status.in_([OrderStatus.CONFIRMED.value, OrderStatus.PROCESSING.value, OrderStatus.SHIPPED.value, OrderStatus.OUT_FOR_DELIVERY.value, OrderStatus.DELIVERED.value])
    ).first()
    
    is_verified = eligible_order is not None
    order_id = eligible_order.id if eligible_order else None
    
    review = Review(
        product_id=rev_in.product_id,
        user_id=current_user.id,
        order_id=order_id,
        rating=rev_in.rating,
        title=rev_in.title,
        comment=rev_in.comment,
        is_verified_purchase=is_verified,
        status="APPROVED", # Default approved for authentic verified feedback
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return ReviewResponse(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        user_name=current_user.full_name,
        order_id=review.order_id,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        is_verified_purchase=review.is_verified_purchase,
        status=review.status,
        created_at=review.created_at,
    )

@router.get("/admin", response_model=List[ReviewResponse])
def admin_get_all_reviews(db: Session = Depends(get_db), admin=Depends(get_current_admin_user)):
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        user_name = r.user.full_name if r.user else "Customer"
        result.append(
            ReviewResponse(
                id=r.id,
                product_id=r.product_id,
                user_id=r.user_id,
                user_name=user_name,
                order_id=r.order_id,
                rating=r.rating,
                title=r.title,
                comment=r.comment,
                is_verified_purchase=r.is_verified_purchase,
                status=r.status,
                created_at=r.created_at,
            )
        )
    return result

@router.patch("/admin/{review_id}/status")
def admin_update_review_status(
    review_id: int,
    status_val: str, # APPROVED, REJECTED, PENDING
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.status = status_val.upper()
    db.commit()
    return {"message": "Review status updated", "status": review.status}

@router.delete("/admin/{review_id}")
def admin_delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}
