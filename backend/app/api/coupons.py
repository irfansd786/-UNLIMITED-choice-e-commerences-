from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_admin_user, get_current_user_optional
from app.models.coupon import Coupon, DiscountType
from app.schemas.order_payment_review_coupon import (
    CouponValidateRequest,
    CouponValidateResponse,
    CouponCreate,
    CouponUpdate,
    CouponResponse,
)

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(req: CouponValidateRequest, db: Session = Depends(get_db)):
    code_clean = req.code.strip().upper()
    coupon = db.query(Coupon).filter(
        Coupon.code == code_clean,
        Coupon.is_active == True
    ).first()
    
    if not coupon:
        return CouponValidateResponse(
            is_valid=False,
            code=req.code,
            discount_type="NONE",
            discount_value=0.0,
            discount_amount=0.0,
            message="Invalid or inactive coupon code."
        )
        
    now = datetime.utcnow()
    if coupon.valid_until and coupon.valid_until < now:
        return CouponValidateResponse(
            is_valid=False,
            code=req.code,
            discount_type="NONE",
            discount_value=0.0,
            discount_amount=0.0,
            message="This coupon has expired."
        )
        
    if coupon.usage_limit and coupon.times_used >= coupon.usage_limit:
        return CouponValidateResponse(
            is_valid=False,
            code=req.code,
            discount_type="NONE",
            discount_value=0.0,
            discount_amount=0.0,
            message="This coupon has reached its maximum redemption limit."
        )
        
    if req.cart_amount < coupon.min_order_value:
        return CouponValidateResponse(
            is_valid=False,
            code=req.code,
            discount_type="NONE",
            discount_value=0.0,
            discount_amount=0.0,
            message=f"Minimum order value of ₹{int(coupon.min_order_value)} required to apply this coupon."
        )
        
    if coupon.discount_type == DiscountType.PERCENTAGE.value:
        discount = (req.cart_amount * coupon.discount_value) / 100.0
        if coupon.max_discount_amount and discount > coupon.max_discount_amount:
            discount = coupon.max_discount_amount
    else: # FIXED
        discount = min(coupon.discount_value, req.cart_amount)
        
    discount = round(discount, 2)
    
    return CouponValidateResponse(
        is_valid=True,
        code=coupon.code,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        discount_amount=discount,
        message=f"Coupon applied! You saved ₹{int(discount)}."
    )

@router.get("", response_model=List[CouponResponse])
def get_coupons(db: Session = Depends(get_db), admin=Depends(get_current_admin_user)):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()

@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    c_in: CouponCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    existing = db.query(Coupon).filter(Coupon.code == c_in.code.upper().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
        
    coupon = Coupon(
        code=c_in.code.upper().strip(),
        description=c_in.description,
        discount_type=c_in.discount_type,
        discount_value=c_in.discount_value,
        min_order_value=c_in.min_order_value,
        max_discount_amount=c_in.max_discount_amount,
        usage_limit=c_in.usage_limit,
        is_active=c_in.is_active,
        valid_until=c_in.valid_until,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon

@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: int,
    c_in: CouponUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
        
    for field, value in c_in.dict(exclude_unset=True).items():
        setattr(coupon, field, value)
        
    db.commit()
    db.refresh(coupon)
    return coupon

@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
        
    db.delete(coupon)
    db.commit()
    return {"message": "Coupon deleted successfully"}
