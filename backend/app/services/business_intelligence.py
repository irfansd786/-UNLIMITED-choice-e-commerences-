import math
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, and_, or_

from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product, ProductImage, ProductVariant
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.review import Review
from app.models.category import Category
from app.models.user import User, UserRole

def get_store_time(offset_minutes: int = 330) -> datetime:
    """Returns the current local store time based on minute offset (default: +330 for IST)."""
    tz = timezone(timedelta(minutes=offset_minutes))
    return datetime.now(tz)

def get_business_kpis(db: Session, offset_minutes: int = 330) -> Dict[str, Any]:
    """
    Fetches real business intelligence figures directly from the Varshi Enterprises database.
    Calculates sales, orders, finance, inventory alerts, returns, and customer satisfaction.
    """
    now_local = get_store_time(offset_minutes)
    today_date = now_local.date()
    yesterday_date = today_date - timedelta(days=1)

    # -------------------------------------------------------------------------
    # 1. SALES & REVENUE (TODAY vs YESTERDAY)
    # -------------------------------------------------------------------------
    all_orders = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment)
    ).all()

    today_orders: List[Order] = []
    yesterday_orders: List[Order] = []
    lifetime_paid_revenue = 0.0

    for o in all_orders:
        created_local = (o.created_at + timedelta(minutes=offset_minutes)).date()
        if created_local == today_date:
            today_orders.append(o)
        elif created_local == yesterday_date:
            yesterday_orders.append(o)

        if o.payment and o.payment.status == PaymentStatus.PAID.value:
            lifetime_paid_revenue += float(o.total_amount or 0.0)

    # Today's metrics
    today_revenue = sum(
        float(o.total_amount or 0.0)
        for o in today_orders
        if o.status != OrderStatus.CANCELLED.value
    )
    today_order_count = len(today_orders)
    today_paid_orders = [
        o for o in today_orders
        if o.payment and o.payment.status == PaymentStatus.PAID.value
    ]
    today_items_sold = sum(
        sum(item.quantity for item in o.items)
        for o in today_orders
        if o.status != OrderStatus.CANCELLED.value
    )
    today_aov = round(today_revenue / today_order_count, 2) if today_order_count > 0 else 0.0

    # Yesterday's comparison
    yesterday_revenue = sum(
        float(o.total_amount or 0.0)
        for o in yesterday_orders
        if o.status != OrderStatus.CANCELLED.value
    )
    yesterday_order_count = len(yesterday_orders)
    revenue_growth_pct = 0.0
    if yesterday_revenue > 0:
        revenue_growth_pct = round(((today_revenue - yesterday_revenue) / yesterday_revenue) * 100, 1)

    # -------------------------------------------------------------------------
    # 2. ORDERS PIPELINE BREAKDOWN
    # -------------------------------------------------------------------------
    status_counts: Dict[str, int] = {s.value: 0 for s in OrderStatus}
    ready_to_pack_orders: List[Dict[str, Any]] = []
    return_requests: List[Dict[str, Any]] = []

    for o in all_orders:
        curr_status = o.status
        status_counts[curr_status] = status_counts.get(curr_status, 0) + 1

        # Ready to pack: Confirmed or Processing orders
        if curr_status in [OrderStatus.CONFIRMED.value, OrderStatus.PROCESSING.value, OrderStatus.PLACED.value]:
            ready_to_pack_orders.append({
                "id": o.id,
                "order_number": o.order_number,
                "status": o.status,
                "total_amount": round(o.total_amount, 2),
                "items_count": sum(it.quantity for it in o.items),
                "items_summary": ", ".join(f"{it.product_name} x{it.quantity}" for it in o.items[:3]),
                "customer_name": o.shipping_address.get("full_name") if isinstance(o.shipping_address, dict) else "Patron",
                "city": o.shipping_address.get("city") if isinstance(o.shipping_address, dict) else "",
                "created_at": o.created_at.strftime("%d %b, %I:%M %p")
            })

        if curr_status == OrderStatus.RETURN_REQUESTED.value:
            return_requests.append({
                "id": o.id,
                "order_number": o.order_number,
                "total_amount": round(o.total_amount, 2),
                "customer_name": o.shipping_address.get("full_name") if isinstance(o.shipping_address, dict) else "Patron",
                "customer_notes": o.customer_notes or "Customer requested return for size/fit"
            })

    # -------------------------------------------------------------------------
    # 3. FINANCIAL BREAKDOWN (GROSS, NET, COD vs UPI)
    # -------------------------------------------------------------------------
    gross_sales_today = sum(float(o.subtotal or 0.0) for o in today_orders if o.status != OrderStatus.CANCELLED.value)
    discounts_today = sum(float(o.discount or 0.0) for o in today_orders if o.status != OrderStatus.CANCELLED.value)
    net_sales_today = today_revenue

    cod_orders_today = [
        o for o in today_orders
        if o.payment and o.payment.payment_method == PaymentMethod.COD.value and o.status != OrderStatus.CANCELLED.value
    ]
    online_orders_today = [
        o for o in today_orders
        if o.payment and o.payment.payment_method != PaymentMethod.COD.value and o.status != OrderStatus.CANCELLED.value
    ]

    outstanding_cod_amount = sum(float(o.total_amount or 0.0) for o in cod_orders_today if o.status != OrderStatus.DELIVERED.value)

    # -------------------------------------------------------------------------
    # 4. INVENTORY INTELLIGENCE (LOW STOCK, ZERO STOCK, FAST SELLERS)
    # -------------------------------------------------------------------------
    products = db.query(Product).options(joinedload(Product.category)).all()
    total_active_products = len(products)
    total_units_in_stock = sum(p.stock for p in products)

    low_stock_items: List[Dict[str, Any]] = []
    out_of_stock_items: List[Dict[str, Any]] = []

    for p in products:
        if p.stock <= 0:
            out_of_stock_items.append({
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "category": p.category.name if p.category else "Unassigned",
                "price": round(p.price, 2)
            })
        elif p.stock <= p.low_stock_threshold:
            low_stock_items.append({
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "category": p.category.name if p.category else "Unassigned",
                "price": round(p.price, 2),
                "stock": p.stock,
                "threshold": p.low_stock_threshold
            })

    # Top selling products lifetime / 7 days
    top_items_raw = db.query(
        OrderItem.product_id,
        OrderItem.product_name,
        func.sum(OrderItem.quantity).label("units_sold"),
        func.sum(OrderItem.total_price).label("sales_val")
    ).group_by(OrderItem.product_id, OrderItem.product_name).order_by(desc("units_sold")).limit(5).all()

    top_selling_products = [
        {
            "product_id": r.product_id,
            "product_name": r.product_name,
            "units_sold": int(r.units_sold),
            "sales_value": round(float(r.sales_val), 2)
        }
        for r in top_items_raw
    ]

    # -------------------------------------------------------------------------
    # 5. CUSTOMER SATISFACTION & REVIEWS AUDIT
    # -------------------------------------------------------------------------
    reviews = db.query(Review).order_by(Review.created_at.desc()).limit(15).all()
    unresolved_complaints: List[Dict[str, Any]] = []
    avg_rating = 0.0
    if reviews:
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1)
        for r in reviews:
            if r.rating <= 3:
                unresolved_complaints.append({
                    "id": r.id,
                    "rating": r.rating,
                    "title": r.title or "Quality Issue",
                    "comment": r.comment,
                    "status": r.status,
                    "created_at": r.created_at.strftime("%d %b")
                })

    return {
        "local_date": today_date.strftime("%A, %d %B %Y"),
        "local_time": now_local.strftime("%I:%M %p"),
        "sales": {
            "today_revenue": round(today_revenue, 2),
            "today_orders": today_order_count,
            "today_paid_orders": len(today_paid_orders),
            "today_items_sold": today_items_sold,
            "today_aov": today_aov,
            "yesterday_revenue": round(yesterday_revenue, 2),
            "yesterday_orders": yesterday_order_count,
            "revenue_growth_pct": revenue_growth_pct,
            "gross_sales_today": round(gross_sales_today, 2),
            "discounts_today": round(discounts_today, 2),
            "net_sales_today": round(net_sales_today, 2),
            "lifetime_paid_revenue": round(lifetime_paid_revenue, 2)
        },
        "orders_pipeline": {
            "total_orders": len(all_orders),
            "placed": status_counts.get(OrderStatus.PLACED.value, 0),
            "confirmed": status_counts.get(OrderStatus.CONFIRMED.value, 0),
            "processing": status_counts.get(OrderStatus.PROCESSING.value, 0),
            "ready_to_pack_count": len(ready_to_pack_orders),
            "shipped": status_counts.get(OrderStatus.SHIPPED.value, 0),
            "out_for_delivery": status_counts.get(OrderStatus.OUT_FOR_DELIVERY.value, 0),
            "delivered": status_counts.get(OrderStatus.DELIVERED.value, 0),
            "cancelled": status_counts.get(OrderStatus.CANCELLED.value, 0),
            "return_requested": len(return_requests),
            "ready_to_pack_orders": ready_to_pack_orders[:10]
        },
        "finance": {
            "cod_orders_count": len(cod_orders_today),
            "online_orders_count": len(online_orders_today),
            "outstanding_cod_amount": round(outstanding_cod_amount, 2)
        },
        "inventory": {
            "total_active_products": total_active_products,
            "total_units_in_stock": total_units_in_stock,
            "low_stock_count": len(low_stock_items),
            "out_of_stock_count": len(out_of_stock_items),
            "low_stock_items": low_stock_items[:8],
            "out_of_stock_items": out_of_stock_items[:8],
            "top_selling_products": top_selling_products
        },
        "customer_care": {
            "average_rating": avg_rating,
            "recent_reviews_count": len(reviews),
            "complaints_count": len(unresolved_complaints),
            "unresolved_complaints": unresolved_complaints[:5],
            "pending_returns": return_requests[:5]
        }
    }

