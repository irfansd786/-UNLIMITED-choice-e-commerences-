import sqlite3
import json
import datetime

conn = sqlite3.connect('varshi.db')
cur = conn.cursor()

# Get category map
cats = cur.execute("SELECT slug, id FROM categories WHERE is_active = 1").fetchall()
cat_map = dict(cats)
print("Active categories:", cat_map)

now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

hanging_items = [
    {
        "name": "Cryptic Celestis Oversized Hoodie",
        "slug": "cryptic-celestis-oversized-hoodie",
        "short_description": "Oversized hoodie in washed vintage black with custom 450GSM loopback cotton fleece.",
        "description": "The Cryptic Celestis Hoodie is engineered from ultra-dense 450GSM loopback cotton fleece for an architectural, boxy drape. Cut with dropped shoulders, a double-layered hood without drawstrings, and reinforced ribbing. Hand-finished in washed onyx black.",
        "category_slug": "hoodies",
        "price": 2899.0,
        "compare_at_price": 4499.0,
        "cost_price": 1350.0,
        "sku": "VE-HD-CC-BLK",
        "stock": 25,
        "brand": "Varshi Streetwear",
        "material": "100% Heavy French Terry Cotton (450 GSM)",
        "front_image": "https://static.joonsite.com/storage/42826/media/2610071101472773.webp",
        "back_image": "https://static.joonsite.com/storage/42826/media/2610071101430110.webp",
        "side_image": "https://static.joonsite.com/storage/42826/media/2610071101516777.webp",
    },
    {
        "name": "Midnight Navy Work Chore Jacket",
        "slug": "midnight-navy-work-chore-jacket",
        "short_description": "Heavyweight 14oz brushed duck canvas chore jacket with antique brass buttons.",
        "description": "Constructed from rugged 14oz brushed cotton duck canvas, this streetwear chore jacket features reinforced patch pockets, triple-needle stitching, and custom antique hardware. Built to soften with wear while holding an authoritative silhouette.",
        "category_slug": "jackets",
        "price": 3899.0,
        "compare_at_price": 5499.0,
        "cost_price": 1800.0,
        "sku": "VE-JK-CHORE-NVY",
        "stock": 16,
        "brand": "Varshi Outerwear",
        "material": "14oz Brushed Cotton Duck Canvas",
        "front_image": "https://static.joonsite.com/storage/42826/media/2610071514560224.webp",
        "back_image": "https://static.joonsite.com/storage/42826/media/2610071514492742.webp",
        "side_image": "https://static.joonsite.com/storage/42826/media/2610071515248388.webp",
    },
    {
        "name": "Heather Grey Heavy Fleece Hoodie",
        "slug": "heather-grey-heavy-fleece-hoodie",
        "short_description": "Dense 450GSM melange loopback fleece pullover with structured dropped shoulders.",
        "description": "A daily wardrobe centerpiece milled in grey melange cotton terry. Cut wide through the chest and shoulders with high-tension cuffs that maintain their form through every wear.",
        "category_slug": "hoodies",
        "price": 2899.0,
        "compare_at_price": 4499.0,
        "cost_price": 1350.0,
        "sku": "VE-HD-MEL-GRY",
        "stock": 22,
        "brand": "Varshi Streetwear",
        "material": "100% Combed Melange Cotton Fleece (450 GSM)",
        "front_image": "https://static.joonsite.com/storage/42826/media/2610071514403809.webp",
        "back_image": "https://static.joonsite.com/storage/42826/media/2610071514388245.webp",
        "side_image": "https://static.joonsite.com/storage/42826/media/2610071514447647.webp",
    },
    {
        "name": "Jet Black Compact Drop-Shoulder Tee",
        "slug": "jet-black-compact-drop-shoulder-tee",
        "short_description": "260GSM combed compact cotton boxy tee with reinforced ribbed collar.",
        "description": "Engineered for an exact boxy streetwear fit. Custom knit from 260GSM dense compact cotton with zero transparency, dropped shoulders, and a thick 1-inch rib crewneck collar that never sags.",
        "category_slug": "t-shirts",
        "price": 1299.0,
        "compare_at_price": 1999.0,
        "cost_price": 550.0,
        "sku": "VE-TS-BOXY-BLK",
        "stock": 35,
        "brand": "Varshi Basics",
        "material": "100% Combed Compact Cotton (260 GSM)",
        "front_image": "https://static.joonsite.com/storage/42826/media/2610071515314737.webp",
        "back_image": "https://static.joonsite.com/storage/42826/media/2610071515554298.webp",
        "side_image": "https://static.joonsite.com/storage/42826/media/2610071516549024.webp",
    },
    {
        "name": "Forest Green Box-Fit Hoodie",
        "slug": "forest-green-box-fit-hoodie",
        "short_description": "Deep bottle green heavyweight 450GSM pullover hoodie with boxy proportions.",
        "description": "Rich forest green fleece saturated using non-toxic reactive dyes. Cut with wide armholes, seamless kangaroo pockets, and high-density ribbed trims.",
        "category_slug": "hoodies",
        "price": 2899.0,
        "compare_at_price": 4499.0,
        "cost_price": 1350.0,
        "sku": "VE-HD-BOX-GRN",
        "stock": 19,
        "brand": "Varshi Streetwear",
        "material": "100% French Terry Cotton Fleece (450 GSM)",
        "front_image": "https://static.joonsite.com/storage/42826/media/2610071516592552.webp",
        "back_image": "https://static.joonsite.com/storage/42826/media/2610071517017451.webp",
        "side_image": "https://static.joonsite.com/storage/42826/media/2610071517049148.webp",
    },
    {
        "name": "Classic Cream Supima Boxy Tee",
        "slug": "classic-cream-supima-boxy-tee",
        "short_description": "Ultra-soft premium Supima cotton box-cut tee in natural off-white bone.",
        "description": "Crafted from long-staple Indian Supima cotton for unparalleled softness and drape. Tailored with dropped shoulders and a clean double-needle hem.",
        "category_slug": "t-shirts",
        "price": 1399.0,
        "compare_at_price": 2199.0,
        "cost_price": 600.0,
        "sku": "VE-TS-SUP-CRM",
        "stock": 28,
        "brand": "Varshi Basics",
        "material": "100% Long-Staple Supima Cotton (240 GSM)",
        "front_image": "https://static.joonsite.com/storage/42826/media/2610071517318112.webp",
        "back_image": "https://static.joonsite.com/storage/42826/media/2610071517292954.webp",
        "side_image": "https://static.joonsite.com/storage/42826/media/2610071517384792.webp",
    },
    {
        "name": "Vintage Mineral Acid-Wash Hoodie",
        "slug": "vintage-mineral-acid-wash-hoodie",
        "short_description": "Individually mineral-washed acid fade hoodie with vintage sage undertones.",
        "description": "Each hoodie undergoes an artisanal mineral tumble-wash process, giving it an authentic vintage patina. 420GSM fleece with relaxed drop-shoulder cut.",
        "category_slug": "hoodies",
        "price": 2999.0,
        "compare_at_price": 4699.0,
        "cost_price": 1400.0,
        "sku": "VE-HD-WSH-SGE2",
        "stock": 18,
        "brand": "Varshi Streetwear",
        "material": "100% Mineral-Washed Fleece Cotton (420 GSM)",
        "front_image": "https://static.joonsite.com/storage/42826/media/2610071514351513.webp",
        "back_image": "https://static.joonsite.com/storage/42826/media/2610071514369515.webp",
        "side_image": "https://static.joonsite.com/storage/42826/media/2610071514272856.webp",
    },
    {
        "name": "Cyber Tokyo Typographic Graphic Tee",
        "slug": "cyber-tokyo-typographic-graphic-tee",
        "short_description": "Japanese futuristic street graphic tee with 3D high-density puff print.",
        "description": "Featuring tactile high-density puff screen prints on the front chest and reverse spine. Built on a heavyweight 260GSM combed cotton blank.",
        "category_slug": "t-shirts",
        "price": 1499.0,
        "compare_at_price": 2399.0,
        "cost_price": 650.0,
        "sku": "VE-TS-CYBER-BLK",
        "stock": 30,
        "brand": "Varshi Streetwear",
        "material": "100% Combed Cotton with High-Density Puff Print (260 GSM)",
        "front_image": "https://static.joonsite.com/storage/42826/media/2610071517510556.webp",
        "back_image": "https://static.joonsite.com/storage/42826/media/2610071517430836.webp",
        "side_image": "https://static.joonsite.com/storage/42826/media/2610071517558243.png",
    },
    {
        "name": "Textured Waffle-Knit Streetwear Polo",
        "slug": "textured-waffle-knit-streetwear-polo",
        "short_description": "Breathable 280GSM honeycomb waffle knit polo with relaxed open camp collar.",
        "description": "A refined casual street polo knitted with a textured honeycomb waffle structure. Features a retro open notch collar, drop shoulders, and mother-of-pearl style buttons.",
        "category_slug": "t-shirts",
        "price": 1799.0,
        "compare_at_price": 2699.0,
        "cost_price": 750.0,
        "sku": "VE-TS-WAFFLE-POLO",
        "stock": 20,
        "brand": "Varshi Streetwear",
        "material": "100% Breathable Honeycomb Waffle Cotton (280 GSM)",
        "front_image": "https://static.joonsite.com/storage/42826/media/2610071516100782.webp",
        "back_image": "https://static.joonsite.com/storage/42826/media/2610071516137018.webp",
        "side_image": "https://static.joonsite.com/storage/42826/media/2610071516260505.webp",
    }
]

synced_count = 0
for item in hanging_items:
    cat_id = cat_map[item["category_slug"]]
    
    # Check if exists by slug
    existing = cur.execute("SELECT id FROM products WHERE slug = ?", (item["slug"],)).fetchone()
    
    specs_json = json.dumps({
        "Fit": "Boxy Streetwear Fit",
        "Fabric": item["material"],
        "Sizing": "S, M, L, XL, XXL",
        "Care": "Machine wash cold inside out, hang dry"
    })
    
    if existing:
        prod_id = existing[0]
        cur.execute("""
            UPDATE products SET 
                name = ?, short_description = ?, description = ?, category_id = ?,
                price = ?, compare_at_price = ?, cost_price = ?, sku = ?,
                stock = ?, brand = ?, material = ?, specifications = ?,
                status = 'PUBLISHED', is_featured = 1, is_new_arrival = 1,
                has_real_photography = 1, updated_at = ?
            WHERE id = ?
        """, (
            item["name"], item["short_description"], item["description"], cat_id,
            item["price"], item["compare_at_price"], item["cost_price"], item["sku"],
            item["stock"], item["brand"], item["material"], specs_json,
            now, prod_id
        ))
        print(f"Updated product ID {prod_id}: {item['name']}")
    else:
        cur.execute("""
            INSERT INTO products (
                name, slug, short_description, description, category_id,
                price, compare_at_price, cost_price, sku, stock, reserved_stock, low_stock_threshold,
                status, brand, material, specifications, is_featured, is_new_arrival,
                is_deal_of_the_day, has_real_photography, stock_last_verified_at,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 5, 'PUBLISHED', ?, ?, ?, 1, 1, 0, 1, ?, ?, ?)
        """, (
            item["name"], item["slug"], item["short_description"], item["description"], cat_id,
            item["price"], item["compare_at_price"], item["cost_price"], item["sku"],
            item["stock"], item["brand"], item["material"], specs_json,
            now, now, now
        ))
        prod_id = cur.lastrowid
        print(f"Inserted new product ID {prod_id}: {item['name']}")
    
    # Update images for this product (Delete existing images and set the 3 real studio images)
    cur.execute("DELETE FROM product_images WHERE product_id = ?", (prod_id,))
    
    # Add front image (primary)
    cur.execute("""
        INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary, created_at)
        VALUES (?, ?, ?, 0, 1, ?)
    """, (prod_id, item["front_image"], f"{item['name']} - Front View", now))
    
    # Add back image
    cur.execute("""
        INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary, created_at)
        VALUES (?, ?, ?, 1, 0, ?)
    """, (prod_id, item["back_image"], f"{item['name']} - Back View", now))
    
    # Add side image
    cur.execute("""
        INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary, created_at)
        VALUES (?, ?, ?, 2, 0, ?)
    """, (prod_id, item["side_image"], f"{item['name']} - Rail Profile View", now))
    
    synced_count += 1

conn.commit()
print(f"Successfully synced {synced_count} hanging products to database!")
