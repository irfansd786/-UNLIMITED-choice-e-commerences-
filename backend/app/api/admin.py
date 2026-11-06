from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import get_current_admin_user
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.payment import Payment, PaymentStatus
from app.models.review import Review
from app.schemas.order_payment_review_coupon import (
    DashboardStatsResponse,
    OrderResponse,
    OrderStatusUpdate,
)
from app.api.orders import build_order_response

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    # Total Active Non-Cancelled Gross Revenue
    gross_revenue_res = db.query(func.sum(Order.total_amount)).filter(
        Order.status != OrderStatus.CANCELLED.value
    ).scalar()
    total_revenue = float(gross_revenue_res) if gross_revenue_res else 0.0
    
    # Paid Online Revenue
    paid_revenue_res = db.query(func.sum(Order.total_amount)).join(Payment).filter(
        Payment.status == PaymentStatus.PAID.value,
        Order.status != OrderStatus.CANCELLED.value
    ).scalar()
    paid_revenue = float(paid_revenue_res) if paid_revenue_res else 0.0
    
    # Real Counts
    total_orders = db.query(Order).count()
    cancelled_orders = db.query(Order).filter(Order.status == OrderStatus.CANCELLED.value).count()
    active_orders = total_orders - cancelled_orders
    fulfillment_rate = round((active_orders / total_orders * 100.0), 1) if total_orders > 0 else 100.0

    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER.value).count()
    total_products = db.query(Product).count()
    low_stock_count = db.query(Product).filter(Product.stock <= Product.low_stock_threshold).count()
    pending_orders = db.query(Order).filter(Order.status.in_([OrderStatus.PLACED.value, OrderStatus.CONFIRMED.value, OrderStatus.PROCESSING.value])).count()
    delivered_orders = db.query(Order).filter(Order.status == OrderStatus.DELIVERED.value).count()
    
    # Recent orders
    recent_orders_raw = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    ).order_by(Order.created_at.desc()).limit(10).all()
    recent_orders = [build_order_response(o) for o in recent_orders_raw]
    
    # Real Payment Channel Breakdown across non-cancelled orders
    active_orders_list = db.query(Order).options(joinedload(Order.payment)).filter(
        Order.status != OrderStatus.CANCELLED.value
    ).all()
    cod_count = 0
    online_count = 0
    for o in active_orders_list:
        method = (o.payment.payment_method if o.payment else 'COD') or 'COD'
        if 'cod' in method.lower() or 'cash' in method.lower():
            cod_count += 1
        else:
            online_count += 1
    total_active = len(active_orders_list) or 1
    payment_methods = {
        "cod_count": cod_count,
        "online_count": online_count,
        "cod_percentage": round((cod_count / total_active) * 100, 1),
        "online_percentage": round((online_count / total_active) * 100, 1),
    }

    # Orders by status breakdown
    status_counts = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    orders_by_status = {s: c for s, c in status_counts}
    
    # Top selling products (authentic orders only, excluding cancelled)
    top_items = db.query(
        OrderItem.product_id,
        OrderItem.product_name,
        func.sum(OrderItem.quantity).label("total_sold"),
        func.sum(OrderItem.total_price).label("total_sales")
    ).join(Order, OrderItem.order_id == Order.id).filter(
        Order.status != OrderStatus.CANCELLED.value
    ).group_by(
        OrderItem.product_id,
        OrderItem.product_name
    ).order_by(desc("total_sold")).limit(5).all()
    
    overall_sold = sum(int(it.total_sold) for it in top_items) or 1
    top_selling = []
    for it in top_items:
        prod = db.query(Product).filter(Product.id == it.product_id).first()
        primary_img = None
        category_name = prod.category.name if (prod and prod.category) else "Streetwear"
        if prod and prod.images:
            for im in prod.images:
                if getattr(im, 'is_primary', False):
                    primary_img = im.image_url
                    break
            if not primary_img and len(prod.images) > 0:
                primary_img = prod.images[0].image_url
        
        sold_qty = int(it.total_sold)
        share_pct = round((sold_qty / overall_sold) * 100, 1)
        
        top_selling.append({
            "product_id": it.product_id,
            "product_name": it.product_name,
            "total_sold": sold_qty,
            "total_sales": float(it.total_sales),
            "share_percentage": share_pct,
            "product_image": primary_img,
            "category": category_name
        })
    
    # Monthly sales / 7-day sales breakdown
    sales_by_day = []
    for i in range(6, -1, -1):
        day_start = datetime.utcnow().date() - timedelta(days=i)
        day_total = db.query(func.sum(Order.total_amount)).filter(
            func.date(Order.created_at) == day_start,
            Order.status != OrderStatus.CANCELLED.value
        ).scalar() or 0.0
        sales_by_day.append({
            "date": day_start.strftime("%b %d"),
            "revenue": float(day_total),
        })
        
    return DashboardStatsResponse(
        total_revenue=total_revenue,
        paid_revenue=paid_revenue,
        total_orders=total_orders,
        active_orders=active_orders,
        cancelled_orders=cancelled_orders,
        fulfillment_rate=fulfillment_rate,
        total_customers=total_customers,
        total_products=total_products,
        low_stock_count=low_stock_count,
        pending_orders=pending_orders,
        delivered_orders=delivered_orders,
        recent_orders=recent_orders,
        top_selling_products=top_selling,
        monthly_sales=sales_by_day,
        orders_by_status=orders_by_status,
        payment_methods=payment_methods,
    )

@router.get("/orders", response_model=List[OrderResponse])
def admin_get_all_orders(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    query = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    )
    
    if status_filter:
        query = query.filter(Order.status == status_filter.upper())
        
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            (Order.order_number.ilike(term)) | 
            (Order.coupon_code.ilike(term))
        )
        
    orders = query.order_by(Order.created_at.desc()).all()
    return [build_order_response(o) for o in orders]

@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def admin_update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    new_status = status_update.status.upper()
    valid_statuses = [s.value for s in OrderStatus]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    # If transitioning to CANCELLED from non-cancelled, restore inventory
    if new_status == OrderStatus.CANCELLED.value and order.status != OrderStatus.CANCELLED.value:
        for item in order.items:
            prod = db.query(Product).filter(Product.id == item.product_id).first()
            if prod:
                prod.stock += item.quantity
                prod.stock_last_verified_at = datetime.utcnow()
                
    now = datetime.utcnow()
    order.status = new_status
    order.updated_at = now
    
    history = list(order.status_history or [])
    history.append({
        "status": new_status,
        "timestamp": now.isoformat(),
        "note": status_update.note or f"Order status updated to {new_status} by administrator."
    })
    order.status_history = history
    
    db.commit()
    db.refresh(order)
    return build_order_response(order)

@router.get("/customers")
def admin_get_customers(db: Session = Depends(get_db), admin=Depends(get_current_admin_user)):
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER.value).order_by(User.created_at.desc()).all()
    
    result = []
    for c in customers:
        order_stats = db.query(
            func.count(Order.id).label("total_orders"),
            func.sum(Order.total_amount).label("total_spent")
        ).filter(
            Order.user_id == c.id,
            Order.status != OrderStatus.CANCELLED.value
        ).first()
        
        result.append({
            "id": c.id,
            "email": c.email,
            "full_name": c.full_name,
            "phone": c.phone,
            "is_active": c.is_active,
            "total_orders": order_stats.total_orders if order_stats and order_stats.total_orders else 0,
            "total_spent": float(order_stats.total_spent) if order_stats and order_stats.total_spent else 0.0,
            "created_at": c.created_at,
        })
        
    return result

@router.get("/inventory")
def admin_get_inventory(
    low_stock_only: bool = False,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    query = db.query(Product).options(joinedload(Product.category))
    if low_stock_only:
        query = query.filter(Product.stock <= Product.low_stock_threshold)
        
    products = query.order_by(Product.stock.asc()).all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category.name if p.category else "Unassigned",
            "price": p.price,
            "stock": p.stock,
            "reserved_stock": p.reserved_stock,
            "low_stock_threshold": p.low_stock_threshold,
            "status": p.status,
            "is_low_stock": p.stock <= p.low_stock_threshold,
            "stock_last_verified_at": p.stock_last_verified_at,
        }
        for p in products
    ]
