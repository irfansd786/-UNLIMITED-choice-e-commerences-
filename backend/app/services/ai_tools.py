import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from backend.app.models.order import Order, OrderItem, OrderStatus
from backend.app.models.product import Product, ProductImage, ProductVariant
from backend.app.models.category import Category
from backend.app.models.payment import Payment, PaymentStatus
from backend.app.models.review import Review
from backend.app.models.user import User
from backend.app.services.business_intelligence import get_business_kpis

# Tool declarations matching OpenAI / Groq function-calling specification
GROQ_TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_daily_summary",
            "description": "Fetch real-time comprehensive business briefing: revenue today, orders breakdown, financial metrics, inventory alerts, and customer complaints.",
            "parameters": {
                "type": "object",
                "properties": {
                    "offset_minutes": {
                        "type": "integer",
                        "description": "Local timezone offset in minutes (default is 330 for India Standard Time)."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_orders_by_status",
            "description": "Retrieve actual customer orders filtered by lifecycle status (e.g. PLACED, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURN_REQUESTED).",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "description": "Order status to filter by (e.g. 'CONFIRMED', 'PROCESSING', 'CANCELLED', 'RETURN_REQUESTED'). Leave empty for all recent orders."
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of orders to return (default 10)."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_order_details",
            "description": "Fetch complete records for a specific order by order reference (e.g. 'VE-20261105-CA89BA') or numeric ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_identifier": {
                        "type": "string",
                        "description": "The order number (e.g. VE-...) or database ID."
                    }
                },
                "required": ["order_identifier"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "prepare_packing_list",
            "description": "Compile a structured packing manifest of all active orders currently waiting for packaging and fulfillment. Groups items and customer shipping details without modifying order status.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_inventory_audit",
            "description": "Audit store inventory: identify low-stock items, out-of-stock products, or audit stock levels in a category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "low_stock_only": {
                        "type": "boolean",
                        "description": "If true, only returns products at or below their low stock threshold."
                    },
                    "category_slug": {
                        "type": "string",
                        "description": "Optional category slug (e.g. 'hoodies', 'shoes', 't-shirts') to filter."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_feedback",
            "description": "Inspect customer complaints, negative reviews (1-3 stars), and return requests to understand customer problems.",
            "parameters": {
                "type": "object",
                "properties": {
                    "max_rating": {
                        "type": "integer",
                        "description": "Maximum star rating to filter (e.g. 3 for issues and complaints)."
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of reviews to retrieve (default 10)."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "draft_product",
            "description": "Collect and validate details for creating a new product. Generates a structured preview draft and asks the admin for explicit confirmation before saving.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Product title (e.g. 'Heavyweight Onyx Street Hoodie')."
                    },
                    "category": {
                        "type": "string",
                        "description": "Category name or slug (e.g. 'Hoodies', 'T-Shirts', 'Shoes', 'Bottomwear', 'Jackets')."
                    },
                    "price": {
                        "type": "number",
                        "description": "Selling price in INR (e.g. 1499)."
                    },
                    "compare_at_price": {
                        "type": "number",
                        "description": "Optional original/strikethrough MRP price in INR."
                    },
                    "stock": {
                        "type": "integer",
                        "description": "Initial inventory quantity available."
                    },
                    "description": {
                        "type": "string",
                        "description": "Product craftsmanship and styling description."
                    },
                    "sizes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Available garment sizes (e.g. ['S', 'M', 'L', 'XL'] or shoes ['40', '41', '42'])."
                    },
                    "color": {
                        "type": "string",
                        "description": "Primary colorway (e.g. 'Onyx Black', 'Cream', 'Forest Green')."
                    },
                    "material": {
                        "type": "string",
                        "description": "Fabric material (e.g. '100% French Terry Cotton (450 GSM)')."
                    }
                },
                "required": ["name", "price", "stock"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "request_order_status_update",
            "description": "Prepare a formal status update for an order (e.g. marking as SHIPPED, CANCELLED, or RETURNED) and request admin confirmation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_number": {
                        "type": "string",
                        "description": "The order number to update."
                    },
                    "new_status": {
                        "type": "string",
                        "description": "Target status: CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED."
                    },
                    "note": {
                        "type": "string",
                        "description": "Reason or courier note for the status change."
                    }
                },
                "required": ["order_number", "new_status"]
            }
        }
    }
]

# -----------------------------------------------------------------------------
# TOOL EXECUTION IMPLEMENTATIONS (READ & PREPARE ONLY)
# -----------------------------------------------------------------------------

def execute_tool(tool_name: str, arguments: Dict[str, Any], db: Session) -> Dict[str, Any]:
    """Routes and executes a validated AI backend tool against real database state."""
    if tool_name == "get_daily_summary":
        offset = arguments.get("offset_minutes", 330)
        return get_business_kpis(db, offset_minutes=offset)

    elif tool_name == "get_orders_by_status":
        status_filter = arguments.get("status")
        limit = min(int(arguments.get("limit", 10)), 50)
        query = db.query(Order).options(
            joinedload(Order.items),
            joinedload(Order.payment)
        )
        if status_filter:
            query = query.filter(Order.status == status_filter.strip().upper())
        orders = query.order_by(Order.created_at.desc()).limit(limit).all()

        return {
            "filter": status_filter or "ALL",
            "count": len(orders),
            "orders": [
                {
                    "id": o.id,
                    "order_number": o.order_number,
                    "status": o.status,
                    "total_amount": round(o.total_amount, 2),
                    "payment_method": o.payment.payment_method if o.payment else "UPI",
                    "payment_status": o.payment.status if o.payment else "PENDING",
                    "created_at": o.created_at.strftime("%d %b %Y, %I:%M %p"),
                    "customer_name": o.shipping_address.get("full_name") if isinstance(o.shipping_address, dict) else "Customer",
                    "city": o.shipping_address.get("city") if isinstance(o.shipping_address, dict) else "",
                    "items": [
                        {
                            "name": it.product_name,
                            "sku": it.product_sku,
                            "quantity": it.quantity,
                            "price": round(it.unit_price, 2)
                        } for it in o.items
                    ]
                }
                for o in orders
            ]
        }

    elif tool_name == "get_order_details":
        ident = str(arguments.get("order_identifier", "")).strip()
        query = db.query(Order).options(
            joinedload(Order.items),
            joinedload(Order.payment)
        )
        if ident.isdigit():
            order = query.filter((Order.id == int(ident)) | (Order.order_number == ident)).first()
        else:
            order = query.filter(Order.order_number == ident).first()

        if not order:
            return {"error": f"No order found matching identifier '{ident}'."}

        return {
            "order_number": order.order_number,
            "status": order.status,
            "created_at": order.created_at.strftime("%d %b %Y, %I:%M %p"),
            "subtotal": round(order.subtotal, 2),
            "discount": round(order.discount, 2),
            "total_amount": round(order.total_amount, 2),
            "customer": {
                "name": order.shipping_address.get("full_name") if isinstance(order.shipping_address, dict) else "",
                "phone": order.shipping_address.get("phone") if isinstance(order.shipping_address, dict) else "",
                "address": f"{order.shipping_address.get('address_line1', '')}, {order.shipping_address.get('city', '')}, {order.shipping_address.get('state', '')} {order.shipping_address.get('postal_code', '')}" if isinstance(order.shipping_address, dict) else ""
            },
            "payment": {
                "method": order.payment.payment_method if order.payment else "UPI",
                "status": order.payment.status if order.payment else "PENDING",
                "transaction_ref": order.payment.transaction_reference if order.payment else ""
            },
            "items": [
                {
                    "product_name": it.product_name,
                    "sku": it.product_sku,
                    "quantity": it.quantity,
                    "unit_price": round(it.unit_price, 2),
                    "total_price": round(it.total_price, 2)
                } for it in order.items
            ],
            "timeline": order.status_history or []
        }

    elif tool_name == "prepare_packing_list":
        # Only orders that need packaging
        eligible_orders = db.query(Order).options(
            joinedload(Order.items)
        ).filter(
            Order.status.in_([OrderStatus.CONFIRMED.value, OrderStatus.PROCESSING.value, OrderStatus.PLACED.value])
        ).order_by(Order.created_at.asc()).all()

        total_orders = len(eligible_orders)
        item_manifest: Dict[str, Dict[str, Any]] = {}
        packing_manifest: List[Dict[str, Any]] = []

        for o in eligible_orders:
            order_items_list = []
            for it in o.items:
                order_items_list.append({
                    "sku": it.product_sku,
                    "name": it.product_name,
                    "quantity": it.quantity
                })
                # Aggregate for bulk picking
                if it.product_sku in item_manifest:
                    item_manifest[it.product_sku]["total_units"] += it.quantity
                else:
                    item_manifest[it.product_sku] = {
                        "name": it.product_name,
                        "sku": it.product_sku,
                        "total_units": it.quantity
                    }

            addr = o.shipping_address if isinstance(o.shipping_address, dict) else {}
            packing_manifest.append({
                "order_number": o.order_number,
                "customer_name": addr.get("full_name", "Patron"),
                "city": addr.get("city", "Bengaluru"),
                "postal_code": addr.get("postal_code", ""),
                "items": order_items_list
            })

        total_units_to_pick = sum(m["total_units"] for m in item_manifest.values())

        return {
            "summary": f"Packing list compiled for {total_orders} orders ({total_units_to_pick} total pieces to pick and pack).",
            "total_orders": total_orders,
            "total_units": total_units_to_pick,
            "bulk_pick_list": list(item_manifest.values()),
            "orders": packing_manifest
        }

    elif tool_name == "get_inventory_audit":
        low_only = arguments.get("low_stock_only", True)
        cat_slug = arguments.get("category_slug")

        query = db.query(Product).options(joinedload(Product.category))
        if cat_slug:
            query = query.join(Category).filter(Category.slug == cat_slug.strip().lower())
        if low_only:
            query = query.filter(Product.stock <= Product.low_stock_threshold)

        products = query.order_by(Product.stock.asc()).limit(30).all()

        return {
            "count": len(products),
            "low_stock_threshold_rule": "stock <= low_stock_threshold (5)",
            "items": [
                {
                    "id": p.id,
                    "name": p.name,
                    "sku": p.sku,
                    "category": p.category.name if p.category else "Unassigned",
                    "stock": p.stock,
                    "low_stock_threshold": p.low_stock_threshold,
                    "price": round(p.price, 2),
                    "is_out_of_stock": p.stock <= 0
                }
                for p in products
            ]
        }

    elif tool_name == "get_customer_feedback":
        max_rating = arguments.get("max_rating", 3)
        limit = min(int(arguments.get("limit", 10)), 30)

        reviews = db.query(Review).options(
            joinedload(Review.product),
            joinedload(Review.user)
        ).filter(Review.rating <= max_rating).order_by(Review.created_at.desc()).limit(limit).all()

        return {
            "unresolved_issues_count": len(reviews),
            "complaints": [
                {
                    "id": r.id,
                    "product_name": r.product.name if r.product else "Garment",
                    "rating": r.rating,
                    "title": r.title or "Customer Issue",
                    "comment": r.comment,
                    "customer_name": r.user.full_name if r.user else "Patron",
                    "created_at": r.created_at.strftime("%d %b %Y")
                }
                for r in reviews
            ]
        }

    elif tool_name == "draft_product":
        # Prepare structured product creation draft without writing to DB
        name = arguments.get("name", "").strip()
        price = float(arguments.get("price", 0.0))
        compare_at_price = arguments.get("compare_at_price")
        stock = int(arguments.get("stock", 0))
        cat_str = arguments.get("category", "Hoodies").strip()
        description = arguments.get("description") or f"Crafted with heavyweight luxury material, designed for streetwear elegance by Varshi Enterprises."
        sizes = arguments.get("sizes") or ["S", "M", "L", "XL"]
        color = arguments.get("color") or "Standard"
        material = arguments.get("material") or "100% Heavy French Terry Cotton"

        # Match category from DB
        category = db.query(Category).filter(
            (Category.slug.ilike(f"%{cat_str.lower()}%")) | (Category.name.ilike(f"%{cat_str}%"))
        ).first()

        if not category:
            # Fallback to first available category
            category = db.query(Category).first()

        slug = re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')
        sku = f"VE-{category.slug.upper()[:3] if category else 'GEN'}-{slug.upper()[:6]}-{datetime.utcnow().strftime('%m%d')}"

        draft_payload = {
            "name": name,
            "slug": slug,
            "category_id": category.id if category else 1,
            "category_name": category.name if category else "Streetwear",
            "price": price,
            "compare_at_price": float(compare_at_price) if compare_at_price else round(price * 1.35, 2),
            "stock": stock,
            "sku": sku,
            "description": description,
            "sizes": sizes,
            "color": color,
            "material": material,
            "brand": "Varshi Enterprises",
            "image_url": "/images/variants/classic-cream-supima-boxy-tee_original_front.webp"
        }

        return {
            "status": "PREPARED_FOR_CONFIRMATION",
            "requires_confirmation": True,
            "action_type": "PUBLISH_PRODUCT",
            "draft_product": draft_payload,
            "message": f"Chief, I have prepared your new product draft: '{name}' in category '{category.name if category else 'Streetwear'}' at ₹{price:,.2f} with {stock} units in stock. Please review and confirm to publish it to the live store."
        }

    elif tool_name == "request_order_status_update":
        order_num = arguments.get("order_number", "").strip()
        new_status = arguments.get("new_status", "").strip().upper()
        note = arguments.get("note", "Administrative status update requested via AI assistant.")

        order = db.query(Order).filter(Order.order_number == order_num).first()
        if not order:
            return {"error": f"Order '{order_num}' does not exist in the database."}

        return {
            "status": "PREPARED_FOR_CONFIRMATION",
            "requires_confirmation": True,
            "action_type": "UPDATE_ORDER_STATUS",
            "payload": {
                "order_id": order.id,
                "order_number": order.order_number,
                "current_status": order.status,
                "target_status": new_status,
                "note": note
            },
            "message": f"Chief, would you like me to update order {order_num} from {order.status} to {new_status}?"
        }

    return {"error": f"Tool '{tool_name}' is not recognized."}

# -----------------------------------------------------------------------------
# EXECUTE CONFIRMED ACTIONS (AUTHORIZED EXECUTION AFTER ADMIN CONFIRMATION)
# -----------------------------------------------------------------------------

def execute_confirmed_action(action_type: str, payload: Dict[str, Any], db: Session) -> Dict[str, Any]:
    """
    Executes a sensitive administrative action only after explicit authorization.
    Creates real database rows or updates actual inventory/orders.
    """
    if action_type == "PUBLISH_PRODUCT":
        # 1. Product creation in database
        name = payload.get("name")
        slug = payload.get("slug")
        # Ensure unique slug
        existing_slug = db.query(Product).filter(Product.slug == slug).first()
        if existing_slug:
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

        new_product = Product(
            name=name,
            slug=slug,
            category_id=int(payload.get("category_id", 1)),
            price=float(payload.get("price", 0.0)),
            compare_at_price=float(payload.get("compare_at_price")) if payload.get("compare_at_price") else None,
            cost_price=float(payload.get("price", 0.0)) * 0.45,  # Estimated baseline
            sku=payload.get("sku"),
            stock=int(payload.get("stock", 0)),
            low_stock_threshold=5,
            status="PUBLISHED",
            brand=payload.get("brand", "Varshi Enterprises"),
            material=payload.get("material", "100% Premium Cotton"),
            short_description=f"{name} by Varshi Enterprises.",
            description=payload.get("description", ""),
            is_new_arrival=True,
            is_featured=True,
            specifications={
                "Sizes": ", ".join(payload.get("sizes", ["Free Size"])),
                "Color": payload.get("color", "Standard"),
                "Fabric": payload.get("material", "Heavy Cotton")
            }
        )
        db.add(new_product)
        db.flush()

        # Primary Image
        img_url = payload.get("image_url", "/images/variants/classic-cream-supima-boxy-tee_original_front.webp")
        db.add(ProductImage(
            product_id=new_product.id,
            image_url=img_url,
            alt_text=f"{name} front view",
            display_order=1,
            is_primary=True
        ))

        # Variants for sizes
        sizes = payload.get("sizes", ["S", "M", "L", "XL"])
        stock_per_size = max(1, int(payload.get("stock", 0)) // len(sizes))
        for sz in sizes:
            db.add(ProductVariant(
                product_id=new_product.id,
                title=f"{name} / Size {sz}",
                sku=f"{new_product.sku}-{sz}",
                price=new_product.price,
                stock=stock_per_size,
                options={"size": sz, "color": payload.get("color", "Standard")}
            ))

        db.commit()
        db.refresh(new_product)

        return {
            "success": True,
            "message": f"Successfully published '{new_product.name}' to the live store catalogue (ID #{new_product.id}, SKU: {new_product.sku}).",
            "product_id": new_product.id,
            "slug": new_product.slug,
            "price": new_product.price,
            "stock": new_product.stock
        }

    elif action_type == "UPDATE_ORDER_STATUS":
        order_num = payload.get("order_number")
        target_status = payload.get("target_status")
        note = payload.get("note", "Updated via AI Executive Assistant.")

        order = db.query(Order).options(joinedload(Order.items)).filter(Order.order_number == order_num).first()
        if not order:
            return {"success": False, "error": f"Order {order_num} not found."}

        # If cancelled, restore inventory
        if target_status == OrderStatus.CANCELLED.value and order.status != OrderStatus.CANCELLED.value:
            for it in order.items:
                prod = db.query(Product).filter(Product.id == it.product_id).first()
                if prod:
                    prod.stock += it.quantity

        now = datetime.utcnow()
        order.status = target_status
        order.updated_at = now

        history = list(order.status_history or [])
        history.append({
            "status": target_status,
            "timestamp": now.isoformat(),
            "note": note
        })
        order.status_history = history

        db.commit()
        db.refresh(order)

        return {
            "success": True,
            "message": f"Order {order_num} status successfully updated to {target_status}.",
            "order_number": order_num,
            "new_status": target_status
        }

    elif action_type == "RESTOCK_PRODUCT":
        product_id = payload.get("product_id")
        units_to_add = int(payload.get("units_to_add", 0))

        prod = db.query(Product).filter(Product.id == product_id).first()
        if not prod:
            return {"success": False, "error": f"Product #{product_id} not found."}

        prod.stock += units_to_add
        prod.stock_last_verified_at = datetime.utcnow()
        db.commit()
        db.refresh(prod)

        return {
            "success": True,
            "message": f"Restocked '{prod.name}'. New warehouse balance is {prod.stock} units.",
            "product_id": prod.id,
            "new_stock": prod.stock
        }

    return {"success": False, "error": f"Unknown action type '{action_type}'."}

