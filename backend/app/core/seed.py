import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product, ProductImage, ProductVariant
from app.models.cart import Cart
from app.models.wishlist import Wishlist
from app.models.address import Address
from app.models.coupon import Coupon, DiscountType
from app.models.review import Review
from app.models.order import Order, OrderItem, OrderStatus
from app.models.payment import Payment, PaymentStatus

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # 1. Admin & Customer Users
        admin = db.query(User).filter(User.email == "admin@varshienterprises.com").first()
        if not admin:
            admin = User(
                email="admin@varshienterprises.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Varshi Admin",
                phone="+91 98765 43210",
                role=UserRole.ADMIN.value,
                is_active=True,
            )
            db.add(admin)
            db.flush()
            db.add(Cart(user_id=admin.id))
            db.add(Wishlist(user_id=admin.id))

        customer = db.query(User).filter(User.email == "customer@varshienterprises.com").first()
        if not customer:
            customer = User(
                email="customer@varshienterprises.com",
                hashed_password=get_password_hash("customer123"),
                full_name="Aarav Sharma",
                phone="+91 98234 56789",
                role=UserRole.CUSTOMER.value,
                is_active=True,
            )
            db.add(customer)
            db.flush()
            db.add(Cart(user_id=customer.id))
            db.add(Wishlist(user_id=customer.id))
            
            # Default Address
            db.add(Address(
                user_id=customer.id,
                full_name="Aarav Sharma",
                phone="+91 98234 56789",
                address_line1="Flat 402, Urban Palms Residency",
                address_line2="Near Cyber City, MG Road",
                landmark="Opposite Metro Station",
                city="Bengaluru",
                state="Karnataka",
                postal_code="560001",
                address_type="HOME",
                is_default=True,
            ))
            
        db.commit()

        # 2. Categories — 7 Men's Streetwear Categories
        categories_data = [
            {
                "name": "Hoodies",
                "slug": "hoodies",
                "description": "Heavyweight 450GSM cotton fleece, oversized drop-shoulder fits, pullovers, and clean zip-up streetwear hoodies.",
                "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
                "is_featured": True,
                "is_active": True,
                "display_order": 1,
            },
            {
                "name": "T-Shirts",
                "slug": "t-shirts",
                "description": "Heavyweight 240-280GSM combed cotton, oversized graphic cuts, boxy vintage tees, and luxury knit zip polos.",
                "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                "is_featured": True,
                "is_active": True,
                "display_order": 2,
            },
            {
                "name": "Shorts",
                "slug": "shorts",
                "description": "Casual raw-hem sweatshorts, tactical multi-pocket cargo shorts, and lightweight athletic performance shorts.",
                "image_url": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
                "is_featured": True,
                "is_active": True,
                "display_order": 3,
            },
            {
                "name": "Shoes",
                "slug": "shoes",
                "description": "Premium court sneakers, chunky street runners, minimal low-top casual trainers, and urban tactical sports shoes.",
                "image_url": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
                "is_featured": True,
                "is_active": True,
                "display_order": 4,
            },
            {
                "name": "Bottomwear",
                "slug": "bottomwear",
                "description": "Tapered heavyweight joggers, relaxed wide-leg denim jeans, tactical utilitarian cargo pants, and track trousers.",
                "image_url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
                "is_featured": True,
                "is_active": True,
                "display_order": 5,
            },
            {
                "name": "Jackets",
                "slug": "jackets",
                "description": "Reversible urban bombers, durable canvas chore jackets, tech-shell windbreakers, and streetwear overshirts.",
                "image_url": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80",
                "is_featured": True,
                "is_active": True,
                "display_order": 6,
            },
            {
                "name": "Accessories",
                "slug": "accessories",
                "description": "Washed cotton dad caps, full-grain leather wallets, tactical utility webbing belts, and heavyweight ribbed crew socks.",
                "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
                "is_featured": True,
                "is_active": True,
                "display_order": 7,
            },
        ]

        cat_map = {}
        for cat_data in categories_data:
            cat = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not cat:
                cat = Category(**cat_data)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            else:
                for k, v in cat_data.items():
                    setattr(cat, k, v)
                db.commit()
                db.refresh(cat)
            cat_map[cat.slug] = cat

        # 3. Master Products Data (Men's Fashion & Streetwear)
        from scripts.seed_mens_products import products as mens_prods_list
        for pdata in mens_prods_list:
            cat = cat_map.get(pdata["category_slug"])
            if not cat:
                continue
            prod = db.query(Product).filter(Product.slug == pdata["slug"]).first()
            if not prod:
                prod = Product(
                    name=pdata["name"],
                    slug=pdata["slug"],
                    short_description=pdata["short_description"],
                    description=pdata["description"],
                    category_id=cat.id,
                    price=pdata["price"],
                    compare_at_price=pdata["compare_at_price"],
                    cost_price=pdata["cost_price"],
                    sku=pdata["sku"],
                    stock=pdata["stock"],
                    low_stock_threshold=pdata["low_stock_threshold"],
                    status=pdata["status"],
                    brand=pdata["brand"],
                    material=pdata["material"],
                    specifications=pdata["specifications"],
                    is_featured=pdata["is_featured"],
                    is_new_arrival=pdata["is_new_arrival"],
                    is_deal_of_the_day=pdata["is_deal_of_the_day"],
                    has_real_photography=True,
                    stock_last_verified_at=datetime.datetime.utcnow(),
                )
                db.add(prod)
                db.commit()
                db.refresh(prod)
                
                for idx, img_url in enumerate(pdata["images"]):
                    db.add(ProductImage(
                        product_id=prod.id,
                        image_url=img_url,
                        alt_text=f"{prod.name} - View {idx+1}",
                        display_order=idx,
                        is_primary=(idx == 0)
                    ))
                db.commit()

        # 4. Coupons
        coupons_data = [
            {
                "code": "WELCOME10",
                "description": "10% off on your first order above ₹999",
                "discount_type": DiscountType.PERCENTAGE.value,
                "discount_value": 10.0,
                "min_order_value": 999.0,
                "max_discount_amount": 500.0,
                "usage_limit": 1000,
                "is_active": True,
            },
            {
                "code": "STREET500",
                "description": "Flat ₹500 discount on streetwear orders above ₹2,999",
                "discount_type": DiscountType.FIXED.value,
                "discount_value": 500.0,
                "min_order_value": 2999.0,
                "max_discount_amount": 500.0,
                "usage_limit": 500,
                "is_active": True,
            },
            {
                "code": "DROP20",
                "description": "20% off on premium hoodies and sneakers above ₹3,999",
                "discount_type": DiscountType.PERCENTAGE.value,
                "discount_value": 20.0,
                "min_order_value": 3999.0,
                "max_discount_amount": 1000.0,
                "usage_limit": 200,
                "is_active": True,
            }
        ]

        for cdata in coupons_data:
            c = db.query(Coupon).filter(Coupon.code == cdata["code"]).first()
            if not c:
                db.add(Coupon(**cdata))
        db.commit()

        # 5. Verified Review
        first_prod = db.query(Product).filter(Product.status == "PUBLISHED").first()
        if first_prod and customer:
            rev = db.query(Review).filter(Review.product_id == first_prod.id, Review.user_id == customer.id).first()
            if not rev:
                db.add(Review(
                    product_id=first_prod.id,
                    user_id=customer.id,
                    rating=5,
                    title="Incredible heavyweight fleece quality!",
                    comment="Received in 3 days. The fabric is ultra-dense, drop shoulder cut is perfectly proportioned, and the stitching is pristine. Best streetwear drop this year.",
                    is_verified_purchase=True,
                    status="APPROVED"
                ))
                db.commit()

        print("Varshi Enterprises Men's Fashion database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
