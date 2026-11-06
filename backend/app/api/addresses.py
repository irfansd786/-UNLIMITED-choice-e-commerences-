from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.address import Address
from backend.app.schemas.cart_wishlist_address import (
    AddressCreate,
    AddressUpdate,
    AddressResponse,
)

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.get("", response_model=List[AddressResponse])
def get_user_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Address).filter(
        Address.user_id == current_user.id
    ).order_by(Address.is_default.desc(), Address.created_at.desc()).all()

@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    addr_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # If first address or marked default, reset other defaults
    existing_count = db.query(Address).filter(Address.user_id == current_user.id).count()
    is_def = addr_in.is_default or existing_count == 0
    
    if is_def:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
        
    address = Address(
        user_id=current_user.id,
        full_name=addr_in.full_name,
        phone=addr_in.phone,
        address_line1=addr_in.address_line1,
        address_line2=addr_in.address_line2,
        landmark=addr_in.landmark,
        city=addr_in.city,
        state=addr_in.state,
        postal_code=addr_in.postal_code,
        address_type=addr_in.address_type,
        is_default=is_def,
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address

@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    addr_in: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    address = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
        
    update_data = addr_in.dict(exclude_unset=True)
    if update_data.get("is_default"):
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
        
    for field, value in update_data.items():
        setattr(address, field, value)
        
    db.commit()
    db.refresh(address)
    return address

@router.patch("/{address_id}/default", response_model=AddressResponse)
def set_default_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    address = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
        
    db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    address.is_default = True
    db.commit()
    db.refresh(address)
    return address

@router.delete("/{address_id}")
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    address = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
        
    was_default = address.is_default
    db.delete(address)
    db.commit()
    
    # If deleted address was default, set next available address as default
    if was_default:
        next_addr = db.query(Address).filter(Address.user_id == current_user.id).first()
        if next_addr:
            next_addr.is_default = True
            db.commit()
            
    return {"message": "Address deleted successfully"}
