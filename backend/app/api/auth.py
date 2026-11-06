from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.core.config import settings
from backend.app.core.deps import get_current_user
from backend.app.models.user import User, UserRole
from backend.app.models.cart import Cart
from backend.app.models.wishlist import Wishlist
from backend.app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    Token,
    PasswordResetRequest,
    PasswordResetConfirm,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        phone=user_in.phone.strip() if user_in.phone else None,
        role=UserRole.CUSTOMER.value,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize cart and wishlist for customer
    cart = Cart(user_id=user.id)
    wishlist = Wishlist(user_id=user.id)
    db.add(cart)
    db.add(wishlist)
    db.commit()

    access_token = create_access_token(subject=str(user.id))
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.from_orm(user))

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account has been deactivated. Please contact support.",
        )
    
    # Ensure cart and wishlist exist
    if not user.cart:
        db.add(Cart(user_id=user.id))
    if not user.wishlist:
        db.add(Wishlist(user_id=user.id))
    db.commit()

    access_token = create_access_token(subject=str(user.id))
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.from_orm(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name.strip()
    if user_update.phone is not None:
        current_user.phone = user_update.phone.strip()
    if user_update.password:
        current_user.hashed_password = get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    # Always return success to prevent email enumeration
    return {
        "message": "If an account matches that email address, password reset instructions have been generated.",
        "mock_reset_token": f"reset-token-{user.id}" if user else None
    }

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    if req.token.startswith("reset-token-"):
        try:
            user_id = int(req.token.replace("reset-token-", ""))
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.hashed_password = get_password_hash(req.new_password)
                db.commit()
                return {"message": "Password successfully updated. You may now log in with your new credentials."}
        except Exception:
            pass
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")
