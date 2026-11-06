from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
import uuid
import random
from typing import List, Optional

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.address import Address
from app.models.order import Order, OrderItem, OrderStatus
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.coupon import Coupon, DiscountType
from app.schemas.order_payment_review_coupon import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderStatusUpdate,
    PaymentResponse,
)
from app.api.cart import FREE_SHIPPING_THRESHOLD, STANDARD_DELIVERY_FEE

router = APIRouter(prefix="/orders", tags=["Orders"])

def build_order_response(order: Order) -> OrderResponse:
    items_resp = []
    for it in order.items:
        items_resp.append(
            OrderItemResponse(
                id=it.id,
                order_id=it.order_id,
                product_id=it.product_id,
                product_name=it.product_name,
                product_sku=it.product_sku,
                product_image=it.product_image,
                unit_price=it.unit_price,
                quantity=it.quantity,
                total_price=it.total_price,
                created_at=it.created_at,
            )
        )
        
    pay_resp = None
    if order.payment:
        pay_resp = PaymentResponse(
            id=order.payment.id,
            order_id=order.payment.order_id,
            payment_method=order.payment.payment_method,
            amount=order.payment.amount,
            status=order.payment.status,
            transaction_reference=order.payment.transaction_reference,
            payment_gateway=order.payment.payment_gateway,
            payment_details=order.payment.payment_details or {},
            created_at=order.payment.created_at,
            updated_at=order.payment.updated_at,
        )
        
    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        status=order.status,
        subtotal=order.subtotal,
        discount=order.discount,
        delivery_fee=order.delivery_fee,
        total_amount=order.total_amount,
        coupon_code=order.coupon_code,
        shipping_address=order.shipping_address,
        customer_notes=order.customer_notes,
        admin_notes=order.admin_notes,
        status_history=order.status_history or [],
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items_resp,
        payment=pay_resp,
    )

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch user's cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Your cart is empty.")
        
    # 2. Fetch shipping address
    address = db.query(Address).filter(
        Address.id == order_in.address_id,
        Address.user_id == current_user.id
    ).first()
    if not address:
        raise HTTPException(status_code=400, detail="Please select a valid shipping address.")
        
    address_snapshot = {
        "full_name": address.full_name,
        "phone": address.phone,
        "address_line1": address.address_line1,
        "address_line2": address.address_line2,
        "landmark": address.landmark,
        "city": address.city,
        "state": address.state,
        "postal_code": address.postal_code,
        "address_type": address.address_type,
    }
    
    # 3. Validate stock for all cart items
    subtotal = 0.0
    order_items_to_create = []
    
    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.status != "PUBLISHED":
            raise HTTPException(status_code=400, detail=f"Item {product.name if product else 'Unknown'} is no longer available.")
            
        available_stock = max(0, product.stock - product.reserved_stock)
        if item.quantity > available_stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {available_stock} units available for '{product.name}'. Please update your cart."
            )
            
        item_total = product.price * item.quantity
        subtotal += item_total
        
        primary_image = None
        if product.images:
            primary_image = product.images[0].image_url
            for img in product.images:
                if img.is_primary:
                    primary_image = img.image_url
                    break
                    
        order_items_to_create.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
            "total_price": item_total,
            "product_name": product.name,
            "product_sku": product.sku,
            "product_image": primary_image
        })
        
    # 4. Coupon Calculation
    discount = 0.0
    applied_coupon = None
    if order_in.coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == order_in.coupon_code.strip().upper(),
            Coupon.is_active == True
        ).first()
        if coupon:
            if coupon.discount_type == DiscountType.PERCENTAGE.value:
                discount = (subtotal * coupon.discount_value) / 100.0
                if coupon.max_discount_amount and discount > coupon.max_discount_amount:
                    discount = coupon.max_discount_amount
            else:
                discount = min(coupon.discount_value, subtotal)
            applied_coupon = coupon
            
    delivery_fee = 0.0 if (subtotal >= FREE_SHIPPING_THRESHOLD) else STANDARD_DELIVERY_FEE
    total_amount = max(0.0, round(subtotal - discount + delivery_fee, 2))
    
    # 5. Generate Order Number
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_suffix = ''.join(random.choices('0123456789ABCDEF', k=6))
    order_number = f"VE-{date_str}-{random_suffix}"
    
    # Payment status calculation
    is_cod = order_in.payment_method.upper() == "COD"
    payment_status = PaymentStatus.PENDING.value if is_cod else (
        PaymentStatus.FAILED.value if order_in.simulate_payment_failure else PaymentStatus.PAID.value
    )
    
    if order_in.simulate_payment_failure and not is_cod:
        raise HTTPException(
            status_code=400,
            detail="Mock Payment Simulator: Transaction was declined by bank. No charges were made."
        )
        
    # 6. Deduct Inventory & create Order
    for item_data in order_items_to_create:
        prod = item_data["product"]
        prod.stock = max(0, prod.stock - item_data["quantity"])
        prod.stock_last_verified_at = datetime.utcnow()
        
    now = datetime.utcnow()
    initial_history = [
        {
            "status": OrderStatus.PLACED.value,
            "timestamp": now.isoformat(),
            "note": "Order placed successfully by customer."
        }
    ]
    if not is_cod and payment_status == PaymentStatus.PAID.value:
        initial_history.append({
            "status": OrderStatus.CONFIRMED.value,
            "timestamp": now.isoformat(),
            "note": "Payment verified via Mock Gateway. Order confirmed."
        })
        order_status = OrderStatus.CONFIRMED.value
    else:
        order_status = OrderStatus.PLACED.value
        
    order = Order(
        order_number=order_number,
        user_id=current_user.id,
        status=order_status,
        subtotal=subtotal,
        discount=discount,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        coupon_code=applied_coupon.code if applied_coupon else None,
        shipping_address=address_snapshot,
        customer_notes=order_in.customer_notes,
        status_history=initial_history,
        created_at=now,
        updated_at=now,
    )
    db.add(order)
    db.flush() # get order.id
    
    # Add order items
    for item_data in order_items_to_create:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product"].id,
            product_name=item_data["product_name"],
            product_sku=item_data["product_sku"],
            product_image=item_data["product_image"],
            unit_price=item_data["unit_price"],
            quantity=item_data["quantity"],
            total_price=item_data["total_price"],
            created_at=now,
        )
        db.add(order_item)
        
    # Create Payment record
    txn_ref = f"MOCK-VE-{uuid.uuid4().hex[:12].upper()}"
    payment = Payment(
        order_id=order.id,
        payment_method=order_in.payment_method.upper(),
        amount=total_amount,
        status=payment_status,
        transaction_reference=txn_ref,
        payment_gateway="MOCK_SIMULATOR",
        payment_details={
            "method": order_in.payment_method.upper(),
            "currency": "INR",
            "mock_mode": True,
            "timestamp": now.isoformat(),
        },
        created_at=now,
        updated_at=now,
    )
    db.add(payment)
    
    # Increment coupon usage
    if applied_coupon:
        applied_coupon.times_used += 1
        
    # Clear user cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(order)
    return build_order_response(order)

@router.get("", response_model=List[OrderResponse])
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    ).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()
    
    return [build_order_response(o) for o in orders]

@router.get("/{order_id_or_number}", response_model=OrderResponse)
def get_order_details(
    order_id_or_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    )
    
    order = None
    if order_id_or_number.isdigit():
        order = query.filter(Order.id == int(order_id_or_number)).first()
    if not order:
        order = query.filter(Order.order_number == order_id_or_number).first()
        
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied")
        
    return build_order_response(order)

@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    reason: Optional[str] = "Cancelled by customer",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied")
        
    if order.status in [OrderStatus.SHIPPED.value, OrderStatus.DELIVERED.value, OrderStatus.CANCELLED.value]:
        raise HTTPException(status_code=400, detail=f"Order cannot be cancelled in status '{order.status}'")
        
    # Restore stock
    for item in order.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if prod:
            prod.stock += item.quantity
            prod.stock_last_verified_at = datetime.utcnow()
            
    now = datetime.utcnow()
    order.status = OrderStatus.CANCELLED.value
    order.updated_at = now
    
    history = list(order.status_history or [])
    history.append({
        "status": OrderStatus.CANCELLED.value,
        "timestamp": now.isoformat(),
        "note": reason or "Order cancelled."
    })
    order.status_history = history
    
    if order.payment and order.payment.status == PaymentStatus.PAID.value:
        order.payment.status = PaymentStatus.REFUNDED.value
        order.payment.updated_at = now
        
    db.commit()
    db.refresh(order)
    return build_order_response(order)

@router.post("/{order_id}/request-return", response_model=OrderResponse)
def request_order_return(
    order_id: int,
    reason: Optional[str] = "Return requested by customer",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    if order.status != OrderStatus.DELIVERED.value:
        raise HTTPException(status_code=400, detail="Return can only be requested for delivered orders.")
        
    now = datetime.utcnow()
    order.status = OrderStatus.RETURN_REQUESTED.value
    order.updated_at = now
    
    history = list(order.status_history or [])
    history.append({
        "status": OrderStatus.RETURN_REQUESTED.value,
        "timestamp": now.isoformat(),
        "note": reason or "Return request initiated."
    })
    order.status_history = history
    
    db.commit()
    db.refresh(order)
    return build_order_response(order)
