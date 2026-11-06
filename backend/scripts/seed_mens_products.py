import sqlite3
import json
import datetime

con = sqlite3.connect('varshi.db')
cur = con.cursor()

# Get category IDs
cat_rows = cur.execute("SELECT id, slug FROM categories WHERE is_active = 1").fetchall()
cat_map = {row[1]: row[0] for row in cat_rows}
print("Active categories:", cat_map)

now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

products = [
    # --- 1. HOODIES ---
    {
        "name": "Heavyweight 450GSM Oversized Pullover Hoodie",
        "slug": "heavyweight-450gsm-oversized-pullover-hoodie",
        "short_description": "Ultra-dense 450GSM loopback cotton fleece with dropped shoulders and double-layered hood.",
        "description": "Constructed from custom-milled 450GSM heavyweight French terry cotton, this oversized pullover hoodie is engineered for a structured drape that holds its shape. Features clean double-needle seam stitching, rib-knit cuffs, and no drawstrings for a minimal streetwear profile.",
        "category_slug": "hoodies",
        "price": 2899.0,
        "compare_at_price": 4499.0,
        "cost_price": 1350.0,
        "sku": "VE-HD-450-BLK",
        "stock": 24,
        "low_stock_threshold": 5,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "100% Combed Heavy French Terry Cotton (450 GSM)",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": True,
        "specifications": {
            "Weight": "450 GSM",
            "Fit": "Boxy Oversized Drop Shoulder",
            "Fabric": "100% Cotton French Terry",
            "Hood": "Double-Layer Seamless Hood",
            "Care": "Machine wash cold inside out, hang dry"
        },
        "images": [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Vintage Acid-Wash Box-Fit Pullover Hoodie",
        "slug": "vintage-acid-wash-box-fit-hoodie",
        "short_description": "Mineral washed heavyweight cotton pullover with distressed ribbed cuffs and kangaroo pocket.",
        "description": "Individually hand-dyed and mineral washed for a one-of-a-kind vintage fade. Designed with a wide boxy body cut and slightly cropped hem for effortless layering over oversized streetwear tees.",
        "category_slug": "hoodies",
        "price": 2999.0,
        "compare_at_price": 4699.0,
        "cost_price": 1400.0,
        "sku": "VE-HD-WSH-SGE",
        "stock": 18,
        "low_stock_threshold": 4,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "100% Mineral-Washed Fleece Cotton (420 GSM)",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": False,
        "specifications": {
            "Weight": "420 GSM",
            "Fit": "Box Cut Relaxed",
            "Wash": "Acid Mineral Fade",
            "Pocket": "Reinforced Kangaroo Front",
            "Care": "Cold wash with dark colors"
        },
        "images": [
            "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Minimalist Heavy French Terry Zip-Up Hoodie",
        "slug": "minimalist-heavy-french-terry-zip-hoodie",
        "short_description": "Two-way matte black metal zipper hoodie with structured storm collar and concealed pockets.",
        "description": "Featuring a custom antique black dual zipper, this heavyweight zip hoodie transitions seamlessly from outdoor streetwear styling to refined urban comfort. Clean finish interior with flatlock seams.",
        "category_slug": "hoodies",
        "price": 3199.0,
        "compare_at_price": 4999.0,
        "cost_price": 1500.0,
        "sku": "VE-HD-ZIP-CHL",
        "stock": 20,
        "low_stock_threshold": 4,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "100% Organic Loopback Cotton (400 GSM)",
        "is_featured": True,
        "is_new_arrival": False,
        "is_deal_of_the_day": False,
        "specifications": {
            "Weight": "400 GSM",
            "Closure": "Two-Way Matte Metal Zip",
            "Fit": "Regular Oversized",
            "Care": "Dry flat, cool iron"
        },
        "images": [
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80"
        ]
    },

    # --- 2. T-SHIRTS ---
    {
        "name": "Heavyweight 260GSM Drop-Shoulder Streetwear Tee",
        "slug": "heavyweight-260gsm-drop-shoulder-streetwear-tee",
        "short_description": "Substantial 260GSM combed compact cotton with high ribbed collar and anti-twist seam.",
        "description": "The quintessential street tee. Cut from heavyweight 260GSM combed yarn with a tight weave that drapes clean without clinging. Built with a snug 1.25-inch ribbed mock collar that never sags after washing.",
        "category_slug": "t-shirts",
        "price": 1299.0,
        "compare_at_price": 1999.0,
        "cost_price": 550.0,
        "sku": "VE-TS-260-BLK",
        "stock": 35,
        "low_stock_threshold": 8,
        "status": "PUBLISHED",
        "brand": "Varshi Basics",
        "material": "100% Compact Combed Cotton (260 GSM)",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": True,
        "specifications": {
            "Weight": "260 GSM",
            "Collar": "Tight 32mm High Ribbed Neck",
            "Fit": "Drop Shoulder Relaxed Fit",
            "Pre-Shrunk": "Yes"
        },
        "images": [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Cyber Tokyo Typographic Graphic Street Tee",
        "slug": "cyber-tokyo-distressed-graphic-tee",
        "short_description": "Silkscreen puff-print graphic oversized tee with vintage wash effect.",
        "description": "Inspired by Tokyo nightscapes and retro-futuristic urban typography. High-density silkscreen puff print on back and chest using eco-friendly water-based inks that age gracefully with wear.",
        "category_slug": "t-shirts",
        "price": 1499.0,
        "compare_at_price": 2299.0,
        "cost_price": 650.0,
        "sku": "VE-TS-GFX-TKY",
        "stock": 28,
        "low_stock_threshold": 6,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "100% Ring-Spun Cotton (240 GSM)",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": False,
        "specifications": {
            "Weight": "240 GSM",
            "Print": "Water-based Screenprint & Puff Print",
            "Fit": "Oversized Street Cut",
            "Care": "Turn inside out before washing"
        },
        "images": [
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Luxury Supima Cotton Basic Boxy Crewneck Tee",
        "slug": "luxury-supima-cotton-basic-crewneck-tee",
        "short_description": "Silky extra-long staple Supima cotton basic tee in muted bone white.",
        "description": "Woven with certified American Supima extra-long staple cotton for unmatched hand feel and natural luster. Clean minimal silhouette ideal for styling standalone or beneath jackets.",
        "category_slug": "t-shirts",
        "price": 1399.0,
        "compare_at_price": 2199.0,
        "cost_price": 600.0,
        "sku": "VE-TS-SUP-BNE",
        "stock": 30,
        "low_stock_threshold": 5,
        "status": "PUBLISHED",
        "brand": "Varshi Basics",
        "material": "100% Certified American Supima Cotton (220 GSM)",
        "is_featured": False,
        "is_new_arrival": True,
        "is_deal_of_the_day": False,
        "specifications": {
            "Fit": "Clean Boxy Fit",
            "Feel": "Silky Butter-Soft Texture",
            "Color": "Bone Off-White"
        },
        "images": [
            "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Textured Waffle-Knit Relaxed Streetwear Polo",
        "slug": "textured-waffle-knit-relaxed-polo-tee",
        "short_description": "Breathable honeycomb textured open-collar polo with drop shoulders.",
        "description": "Elevating the classic polo into contemporary street style. Crafted from breathable cotton-poly honeycomb waffle knit with an open camp-style collar and relaxed drop-shoulder cut.",
        "category_slug": "t-shirts",
        "price": 1799.0,
        "compare_at_price": 2799.0,
        "cost_price": 800.0,
        "sku": "VE-TS-POL-OLV",
        "stock": 22,
        "low_stock_threshold": 4,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "Textured Waffle Cotton Blend (280 GSM)",
        "is_featured": True,
        "is_new_arrival": False,
        "is_deal_of_the_day": True,
        "specifications": {
            "Collar": "Placket-Free Johnny Collar",
            "Texture": "Deep Honeycomb Waffle Weave",
            "Fit": "Relaxed Streetwear Fit"
        },
        "images": [
            "https://images.unsplash.com/photo-1625910513413-728b7e04a7b5?auto=format&fit=crop&w=1000&q=80"
        ]
    },

    # --- 3. SHORTS ---
    {
        "name": "Heavy French Terry Casual Raw-Hem Sweatshorts",
        "slug": "heavy-french-terry-casual-raw-hem-sweatshorts",
        "short_description": "400GSM loopback cotton sweatshorts with raw edge hem and extra-long drawstrings.",
        "description": "Cut from ultra-soft 400GSM cotton fleece with an above-the-knee length. Features deep side pockets, a rear patch pocket, and thick elastic waistband with dipped silicone-tipped drawcords.",
        "category_slug": "shorts",
        "price": 1699.0,
        "compare_at_price": 2599.0,
        "cost_price": 750.0,
        "sku": "VE-SH-SWT-BLK",
        "stock": 25,
        "low_stock_threshold": 5,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "100% French Terry Cotton (400 GSM)",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": False,
        "specifications": {
            "Length": "6.5 Inch Inseam (Above Knee)",
            "Hem": "Raw Unfinished Look",
            "Waistband": "Thick Encased Elastic with Drawcord"
        },
        "images": [
            "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Pro-Movement 2-in-1 Athletic Gym & Street Shorts",
        "slug": "pro-movement-breathable-athletic-shorts",
        "short_description": "4-way stretch water-repellent shell with built-in compression liner and phone pocket.",
        "description": "Engineered for training, running, and all-day street agility. The ultra-light ripstop outer shell is paired with an anti-chafe compression inner liner equipped with a secure bounce-free phone slot.",
        "category_slug": "shorts",
        "price": 1899.0,
        "compare_at_price": 2899.0,
        "cost_price": 850.0,
        "sku": "VE-SH-ATH-FOR",
        "stock": 20,
        "low_stock_threshold": 4,
        "status": "PUBLISHED",
        "brand": "Varshi Athletics",
        "material": "90% Nylon, 10% Spandex 4-Way Stretch",
        "is_featured": False,
        "is_new_arrival": True,
        "is_deal_of_the_day": True,
        "specifications": {
            "Liner": "Integrated Spandex Compression",
            "Water Resistance": "DWR Coated",
            "Pockets": "Zipper Side Pockets + Interior Phone Sleeve"
        },
        "images": [
            "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Multi-Pocket Tactical Utility Cargo Shorts",
        "slug": "multi-pocket-tactical-cargo-shorts",
        "short_description": "Heavy cotton twill cargo shorts with snap-button bellow pockets and D-ring loop.",
        "description": "Constructed from rugged 300GSM cotton canvas twill. Features 6 functional utility pockets, matte metal hardware, and an integrated nylon key clip for utilitarian street aesthetics.",
        "category_slug": "shorts",
        "price": 1999.0,
        "compare_at_price": 3199.0,
        "cost_price": 900.0,
        "sku": "VE-SH-CRG-KHK",
        "stock": 22,
        "low_stock_threshold": 5,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "100% Heavy Duty Cotton Twill (300 GSM)",
        "is_featured": True,
        "is_new_arrival": False,
        "is_deal_of_the_day": False,
        "specifications": {
            "Pockets": "6 Utilitarian Cargo Pockets",
            "Hardware": "Matte Black Metal Snaps & D-Ring",
            "Fit": "Relaxed Straight Cut"
        },
        "images": [
            "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1000&q=80"
        ]
    },

    # --- 4. SHOES ---
    {
        "name": "Apex Retro Leather Court Sneakers",
        "slug": "apex-retro-court-leather-sneakers",
        "short_description": "Full-grain white leather with forest green suede overlays and gum rubber sole.",
        "description": "Channeling heritage court heritage with modern street craft. Handcrafted from supple full-grain calf leather paired with hairy suede accents and an anti-slip vulcanized natural gum rubber cupsole.",
        "category_slug": "shoes",
        "price": 3999.0,
        "compare_at_price": 6499.0,
        "cost_price": 1800.0,
        "sku": "VE-SH-CRT-WHT",
        "stock": 16,
        "low_stock_threshold": 3,
        "status": "PUBLISHED",
        "brand": "Varshi Footwear",
        "material": "Full-Grain Italian Calfskin & Gum Rubber",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": True,
        "specifications": {
            "Upper": "100% Genuine Full-Grain Leather",
            "Insole": "Removable Memory Foam Footbed",
            "Outsole": "Reinforced Stitched Cupsole",
            "Sizes Available": "UK 7, 8, 9, 10, 11"
        },
        "images": [
            "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Vulcanized Low-Top Casual Skate Shoes",
        "slug": "vulcanized-suede-low-top-skate-shoes",
        "short_description": "Triple-black durable pigskin suede with padded collar and textured foxing tape.",
        "description": "Classic low-profile skate shoe built with heavy 14oz canvas and reinforced suede toe caps to withstand abrasive street wear. Features waffle grip traction and cushioned heel cushioning.",
        "category_slug": "shoes",
        "price": 2699.0,
        "compare_at_price": 3999.0,
        "cost_price": 1200.0,
        "sku": "VE-SH-SKT-BLK",
        "stock": 20,
        "low_stock_threshold": 4,
        "status": "PUBLISHED",
        "brand": "Varshi Footwear",
        "material": "Suede Leather & Heavy Canvas Upper",
        "is_featured": False,
        "is_new_arrival": False,
        "is_deal_of_the_day": False,
        "specifications": {
            "Sole": "High-Density Vulcanized Waffle Rubber",
            "Collar": "Padded Leather Lining",
            "Sizes Available": "UK 7, 8, 9, 10, 11"
        },
        "images": [
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Phantom Stealth Tactical Sports Trainers",
        "slug": "phantom-stealth-tactical-running-shoes",
        "short_description": "Engineered knit sports runners with EVA cloud cushioning and carbon-look stability plate.",
        "description": "Merging futuristic techwear silhouettes with high-performance cushioning. Breathable jacquard mesh upper with reflective piping, TPU heel clip, and ultra-responsive rebound midsole.",
        "category_slug": "shoes",
        "price": 3499.0,
        "compare_at_price": 5499.0,
        "cost_price": 1600.0,
        "sku": "VE-SH-RUN-BLK",
        "stock": 18,
        "low_stock_threshold": 4,
        "status": "PUBLISHED",
        "brand": "Varshi Footwear",
        "material": "Engineered Jacquard Knit & High-Rebound EVA",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": False,
        "specifications": {
            "Cushioning": "Air-Infused High-Rebound EVA",
            "Upper": "Seamless Jacquard Knit with TPU Cage",
            "Sizes Available": "UK 7, 8, 9, 10, 11"
        },
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80"
        ]
    },

    # --- 5. BOTTOMWEAR ---
    {
        "name": "Heavyweight Fleece Cuffed Relaxed Joggers",
        "slug": "heavyweight-fleece-cuffed-relaxed-joggers",
        "short_description": "420GSM tapered streetwear sweatpants with concealed zip pockets and heavy rib cuffs.",
        "description": "Tailored for the modern street silhouette. Roomy through the thigh with a clean taper down to chunky ribbed ankles that accentuate high-top sneakers. Deep waterproof zippered side pockets keep phone and keys safe.",
        "category_slug": "bottomwear",
        "price": 2299.0,
        "compare_at_price": 3499.0,
        "cost_price": 1050.0,
        "sku": "VE-BW-JOG-CHL",
        "stock": 26,
        "low_stock_threshold": 6,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "100% Heavy French Terry Cotton (420 GSM)",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": True,
        "specifications": {
            "Weight": "420 GSM",
            "Fit": "Relaxed Tapered Cut",
            "Ankles": "Snug 2x2 Rib-Knit Cuffs",
            "Pockets": "Concealed Waterproof YKK Zippers"
        },
        "images": [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Tactical Multi-Pocket Utility Cargo Pants",
        "slug": "tactical-multi-pocket-utility-cargo-pants",
        "short_description": "Heavyweight ripstop cargo pants with 8 tactical pockets and adjustable toggle hems.",
        "description": "Engineered with military-grade 320GSM cotton-nylon ripstop weave. Features 8 utility pockets with webbing strap accents and elastic bungee cord toggles at the ankles for alternating between straight-leg and stacked jogger styles.",
        "category_slug": "bottomwear",
        "price": 2799.0,
        "compare_at_price": 4299.0,
        "cost_price": 1300.0,
        "sku": "VE-BW-CRG-OLV",
        "stock": 22,
        "low_stock_threshold": 4,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "65% Cotton, 35% Nylon Ripstop (320 GSM)",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": False,
        "specifications": {
            "Fabric": "Anti-Tear Ripstop Weave",
            "Ankles": "Adjustable Bungee Shock Cords",
            "Pockets": "8 Total Tactical Storage Compartments"
        },
        "images": [
            "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Wide-Leg Vintage Washed Selvedge Denim Jeans",
        "slug": "wide-leg-vintage-washed-selvedge-denim-jeans",
        "short_description": "13.5oz non-stretch Japanese selvedge denim in an authentic washed indigo stone finish.",
        "description": "Crafted from authentic 13.5oz shuttle-loomed cotton denim. Features a mid-rise waist, relaxed wide-leg straight cut, genuine copper rivets, and a classic 5-pocket construction designed to stack perfectly over sneakers.",
        "category_slug": "bottomwear",
        "price": 3299.0,
        "compare_at_price": 4999.0,
        "cost_price": 1500.0,
        "sku": "VE-BW-DNM-IND",
        "stock": 18,
        "low_stock_threshold": 4,
        "status": "PUBLISHED",
        "brand": "Varshi Denim",
        "material": "100% Cotton Selvedge Denim (13.5 oz)",
        "is_featured": False,
        "is_new_arrival": False,
        "is_deal_of_the_day": False,
        "specifications": {
            "Weight": "13.5 oz Ring-Spun Denim",
            "Fit": "Relaxed Wide Leg Straight Cut",
            "Hardware": "Antiqued Copper Rivets & Button Fly"
        },
        "images": [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80"
        ]
    },

    # --- 6. JACKETS ---
    {
        "name": "Reversible Quilted Urban Bomber Jacket",
        "slug": "reversible-quilted-urban-bomber-jacket",
        "short_description": "Matte forest green satin shell reversing to diamond-quilted obsidian black flight lining.",
        "description": "An iconic MA-1 flight silhouette adapted for modern streetwear. Heavy insulated batting keeps warmth locked in. Features heavy brass reversible zipper, utility arm pocket with red ribbon, and thick ribbing at collar and cuffs.",
        "category_slug": "jackets",
        "price": 4499.0,
        "compare_at_price": 6999.0,
        "cost_price": 2100.0,
        "sku": "VE-JK-BMB-REV",
        "stock": 15,
        "low_stock_threshold": 3,
        "status": "PUBLISHED",
        "brand": "Varshi Outerwear",
        "material": "100% Water-Resistant Flight Nylon & Thermal Fill",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": True,
        "specifications": {
            "Design": "Reversible 2-in-1 Dual Colorway",
            "Hardware": "Heavy-Duty Brass Reversible Zipper",
            "Fit": "Slightly Cropped Boxy Bomber Fit"
        },
        "images": [
            "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Heavy Cotton Canvas Street Chore Jacket",
        "slug": "heavy-cotton-canvas-street-chore-jacket",
        "short_description": "14oz washed cotton duck canvas with corduroy collar and triple-stitched seams.",
        "description": "Utilitarian workwear re-imagined for city streetwear. Heavy 14oz brushed duck canvas with a soft corduroy collar, copper donut buttons, and four oversized front patch pockets for daily carry items.",
        "category_slug": "jackets",
        "price": 3899.0,
        "compare_at_price": 5799.0,
        "cost_price": 1800.0,
        "sku": "VE-JK-CHR-SND",
        "stock": 17,
        "low_stock_threshold": 4,
        "status": "PUBLISHED",
        "brand": "Varshi Outerwear",
        "material": "100% Heavy Cotton Duck Canvas (14 oz)",
        "is_featured": False,
        "is_new_arrival": True,
        "is_deal_of_the_day": False,
        "specifications": {
            "Collar": "Soft 8-Wale Cotton Corduroy",
            "Reinforcement": "Bar-tacked Pockets & Triple Seams",
            "Fit": "Standard Boxy Overshirt Fit"
        },
        "images": [
            "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=80"
        ]
    },

    # --- 7. ACCESSORIES ---
    {
        "name": "Washed Cotton Low-Profile Streetwear Dad Cap",
        "slug": "washed-cotton-low-profile-streetwear-dad-cap",
        "short_description": "Unstructured 6-panel washed cotton twill cap with antique brass metal slider.",
        "description": "A relaxed, unstructured 6-panel dad hat constructed from enzyme-washed cotton twill. Features an embroidered tonal eyelet system and an adjustable fabric tuck strap with embossed brass metal clasp.",
        "category_slug": "accessories",
        "price": 899.0,
        "compare_at_price": 1499.0,
        "cost_price": 350.0,
        "sku": "VE-AC-CAP-BLK",
        "stock": 35,
        "low_stock_threshold": 8,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "100% Enzyme-Washed Cotton Twill",
        "is_featured": True,
        "is_new_arrival": True,
        "is_deal_of_the_day": False,
        "specifications": {
            "Crown": "Low-Profile Unstructured 6-Panel",
            "Closure": "Self-Fabric Strap with Antique Brass Buckle",
            "Size": "One Size Fits All (Adjustable)"
        },
        "images": [
            "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Full-Grain Vegetable-Tanned Leather Bifold Wallet",
        "slug": "full-grain-vegetable-tanned-leather-bifold-wallet",
        "short_description": "Handcrafted full-grain saddle leather with RFID blocking foil and 8 card slots.",
        "description": "Handcrafted from rich full-grain vegetable-tanned leather that develops a magnificent amber patina over years of use. Reinforced with anti-theft RFID blocking shield and hand-burnished edges.",
        "category_slug": "accessories",
        "price": 1499.0,
        "compare_at_price": 2499.0,
        "cost_price": 600.0,
        "sku": "VE-AC-WLT-BRN",
        "stock": 25,
        "low_stock_threshold": 5,
        "status": "PUBLISHED",
        "brand": "Varshi Leather",
        "material": "100% Genuine Full-Grain Vegetable-Tanned Cowhide",
        "is_featured": False,
        "is_new_arrival": False,
        "is_deal_of_the_day": True,
        "specifications": {
            "Capacity": "8 Card Slots, 2 Slip Compartments, 1 Cash Billfold",
            "Protection": "Integrated RFID Signal Blocking Layer",
            "Finish": "Hand-Waxed Burnished Edge"
        },
        "images": [
            "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Tactical Military Quick-Release Webbing Belt",
        "slug": "military-nylon-quick-release-buckle-belt",
        "short_description": "Heavy-duty 1000D nylon webbing strap with matte alloy cobra quick-release buckle.",
        "description": "Engineered for durability and utilitarian aesthetics. High-tensile 1000D breathable nylon webbing with an instant one-second quick-release alloy buckle that stays locked under extreme tension.",
        "category_slug": "accessories",
        "price": 999.0,
        "compare_at_price": 1699.0,
        "cost_price": 400.0,
        "sku": "VE-AC-BLT-BLK",
        "stock": 30,
        "low_stock_threshold": 6,
        "status": "PUBLISHED",
        "brand": "Varshi Street",
        "material": "1000D High-Tensile Tactical Nylon & Zinc Alloy",
        "is_featured": False,
        "is_new_arrival": True,
        "is_deal_of_the_day": False,
        "specifications": {
            "Width": "1.5 Inches (38mm)",
            "Buckle": "Heavy Duty Zinc Alloy Cobra Clip",
            "Size": "Adjustable up to 44 Inches Waist"
        },
        "images": [
            "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80"
        ]
    },
    {
        "name": "Cushioned Heavy Rib Streetwear Crew Socks (3-Pack)",
        "slug": "cushioned-heavy-rib-streetwear-crew-socks-3pack",
        "short_description": "Thick ribbed athletic crew socks in Tri-Pack: Bone White, Forest Green, Charcoal Black.",
        "description": "Designed to complement high-top and low-top sneakers. Features terry loop sole cushioning for impact absorption, arch compression band, and stay-up ribbed leg that prevents bunching.",
        "category_slug": "accessories",
        "price": 799.0,
        "compare_at_price": 1299.0,
        "cost_price": 300.0,
        "sku": "VE-AC-SOX-3PK",
        "stock": 40,
        "low_stock_threshold": 10,
        "status": "PUBLISHED",
        "brand": "Varshi Basics",
        "material": "82% Combed Cotton, 15% Polyester, 3% Elastane",
        "is_featured": True,
        "is_new_arrival": False,
        "is_deal_of_the_day": False,
        "specifications": {
            "Pack": "3 Pairs Included (Bone, Forest, Charcoal)",
            "Height": "Mid-Calf Athletic Crew",
            "Sole": "High-Density Terry Cushioning"
        },
        "images": [
            "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=1000&q=80"
        ]
    }
]

inserted_count = 0
for prod in products:
    category_id = cat_map.get(prod["category_slug"])
    if not category_id:
        print(f"Warning: Category {prod['category_slug']} not found!")
        continue
    
    # Check if product exists by slug
    existing = cur.execute("SELECT id FROM products WHERE slug = ?", (prod["slug"],)).fetchone()
    if existing:
        prod_id = existing[0]
        cur.execute("""
            UPDATE products SET
                name = ?, short_description = ?, description = ?, category_id = ?, price = ?,
                compare_at_price = ?, cost_price = ?, sku = ?, stock = ?, low_stock_threshold = ?,
                status = ?, brand = ?, material = ?, specifications = ?, is_featured = ?,
                is_new_arrival = ?, is_deal_of_the_day = ?, updated_at = ?
            WHERE id = ?
        """, (
            prod["name"], prod["short_description"], prod["description"], category_id,
            prod["price"], prod["compare_at_price"], prod["cost_price"], prod["sku"],
            prod["stock"], prod["low_stock_threshold"], prod["status"], prod["brand"],
            prod["material"], json.dumps(prod["specifications"]), prod["is_featured"],
            prod["is_new_arrival"], prod["is_deal_of_the_day"], now, prod_id
        ))
    else:
        cur.execute("""
            INSERT INTO products (
                name, slug, short_description, description, category_id, price,
                compare_at_price, cost_price, sku, stock, reserved_stock, low_stock_threshold,
                status, brand, material, specifications, is_featured, is_new_arrival,
                is_deal_of_the_day, stock_last_verified_at, has_real_photography, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        """, (
            prod["name"], prod["slug"], prod["short_description"], prod["description"], category_id,
            prod["price"], prod["compare_at_price"], prod["cost_price"], prod["sku"],
            prod["stock"], prod["low_stock_threshold"], prod["status"], prod["brand"],
            prod["material"], json.dumps(prod["specifications"]), prod["is_featured"],
            prod["is_new_arrival"], prod["is_deal_of_the_day"], now, now, now
        ))
        prod_id = cur.lastrowid
        inserted_count += 1
        
    # Re-sync images
    cur.execute("DELETE FROM product_images WHERE product_id = ?", (prod_id,))
    for idx, img_url in enumerate(prod["images"]):
        cur.execute("""
            INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (prod_id, img_url, prod["name"], idx, 1 if idx == 0 else 0, now))

con.commit()
print(f"Products seeded successfully! Total products in catalog: {len(products)} (Newly inserted: {inserted_count})")
