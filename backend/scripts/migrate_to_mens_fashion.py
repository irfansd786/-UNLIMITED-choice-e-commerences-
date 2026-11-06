import sqlite3
import datetime

con = sqlite3.connect('varshi.db')
cur = con.cursor()

# 1. Check if is_active column exists in categories
cat_cols = [c[1] for c in cur.execute("PRAGMA table_info(categories);").fetchall()]
if "is_active" not in cat_cols:
    print("Adding is_active column to categories table...")
    cur.execute("ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT 1 NOT NULL;")
    con.commit()
    print("is_active column added.")
else:
    print("is_active column already exists.")

# 2. Archive all previous products (women's ethnic, jewellery, home decor, and legacy kurtas)
print("Archiving legacy products...")
cur.execute("UPDATE products SET status = 'ARCHIVED' WHERE status != 'ARCHIVED';")
archived_count = cur.rowcount
print(f"Archived {archived_count} legacy products. Historical orders preserved.")

# 3. Deactivate legacy categories
print("Deactivating legacy categories...")
cur.execute("UPDATE categories SET is_active = 0;")
con.commit()

# 4. Insert or update the 7 official Men's Streetwear categories
mens_categories = [
    {
        "name": "Hoodies",
        "slug": "hoodies",
        "description": "Heavyweight 450GSM cotton fleece, oversized drop-shoulder fits, pullovers, and clean zip-up streetwear hoodies.",
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        "is_featured": True,
        "is_active": 1,
        "display_order": 1
    },
    {
        "name": "T-Shirts",
        "slug": "t-shirts",
        "description": "Heavyweight 240-280GSM combed cotton, oversized graphic cuts, boxy vintage tees, and luxury knit zip polos.",
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        "is_featured": True,
        "is_active": 1,
        "display_order": 2
    },
    {
        "name": "Shorts",
        "slug": "shorts",
        "description": "Casual raw-hem sweatshorts, tactical multi-pocket cargo shorts, and lightweight athletic performance shorts.",
        "image_url": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
        "is_featured": True,
        "is_active": 1,
        "display_order": 3
    },
    {
        "name": "Shoes",
        "slug": "shoes",
        "description": "Premium court sneakers, chunky street runners, minimal low-top casual trainers, and urban tactical sports shoes.",
        "image_url": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
        "is_featured": True,
        "is_active": 1,
        "display_order": 4
    },
    {
        "name": "Bottomwear",
        "slug": "bottomwear",
        "description": "Tapered heavyweight joggers, relaxed wide-leg denim jeans, tactical utilitarian cargo pants, and track trousers.",
        "image_url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
        "is_featured": True,
        "is_active": 1,
        "display_order": 5
    },
    {
        "name": "Jackets",
        "slug": "jackets",
        "description": "Reversible urban bombers, durable canvas chore jackets, tech-shell windbreakers, and streetwear overshirts.",
        "image_url": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80",
        "is_featured": True,
        "is_active": 1,
        "display_order": 6
    },
    {
        "name": "Accessories",
        "slug": "accessories",
        "description": "Washed cotton dad caps, full-grain leather wallets, tactical utility webbing belts, and heavyweight ribbed crew socks.",
        "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
        "is_featured": True,
        "is_active": 1,
        "display_order": 7
    }
]

cat_id_map = {}
for cat in mens_categories:
    existing = cur.execute("SELECT id FROM categories WHERE slug = ?", (cat["slug"],)).fetchone()
    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    if existing:
        cat_id = existing[0]
        cur.execute("""
            UPDATE categories 
            SET name = ?, description = ?, image_url = ?, is_featured = ?, is_active = ?, display_order = ?, updated_at = ?
            WHERE id = ?
        """, (cat["name"], cat["description"], cat["image_url"], cat["is_featured"], cat["is_active"], cat["display_order"], now_str, cat_id))
    else:
        cur.execute("""
            INSERT INTO categories (name, slug, description, image_url, is_featured, is_active, display_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (cat["name"], cat["slug"], cat["description"], cat["image_url"], cat["is_featured"], cat["is_active"], cat["display_order"], now_str, now_str))
        cat_id = cur.lastrowid
    cat_id_map[cat["slug"]] = cat_id

con.commit()
print("Men's categories synced successfully:", cat_id_map)
