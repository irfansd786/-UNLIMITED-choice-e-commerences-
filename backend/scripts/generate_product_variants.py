import os
import cv2
import numpy as np
import requests

OUT_DIR = os.path.join("customer", "public", "images", "variants")
CACHE_DIR = os.path.join("scratch", "orig_images")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

def fetch_image(url, fname):
    cache_path = os.path.join(CACHE_DIR, fname)
    if os.path.exists(cache_path):
        return cv2.imdecode(np.fromfile(cache_path, dtype=np.uint8), cv2.IMREAD_UNCHANGED)
    
    resp = requests.get(url, timeout=30)
    data = np.frombuffer(resp.content, np.uint8)
    with open(cache_path, "wb") as f:
        f.write(resp.content)
    return cv2.imdecode(data, cv2.IMREAD_UNCHANGED)

def preserve_hanger_and_text(img, new_bgr):
    """Keeps the hanger and crisp light text intact while recoloring fabric."""
    bgr = img[:, :, :3]
    alpha = img[:, :, 3]
    h, w = bgr.shape[:2]
    
    # Hanger mask: top 16% of height, center 55% of width
    hanger_y = int(h * 0.16)
    hanger_x_min = int(w * 0.22)
    hanger_x_max = int(w * 0.78)
    
    is_hanger = np.zeros((h, w), dtype=bool)
    is_hanger[:hanger_y, hanger_x_min:hanger_x_max] = True
    
    # Text / graphic preserve: where brightness is very high (> 200) and saturation is low
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    is_light_graphic = (hsv[:, :, 2] > 200) & (hsv[:, :, 1] < 50) & (alpha > 50)
    
    # Fabric mask is alpha > 30, not hanger, and not light white graphic
    fabric_mask = (alpha > 30) & (~is_hanger) & (~is_light_graphic)
    
    result = bgr.copy()
    result[fabric_mask] = new_bgr[fabric_mask]
    
    # Recombine with original alpha
    return np.dstack([result, alpha])

def create_charcoal_black(img):
    bgr = img[:, :, :3]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    # Scale down brightness for sleek deep charcoal/black
    black_val = np.clip(gray * 0.75, 18, 220).astype(np.uint8)
    new_bgr = cv2.merge([black_val, black_val, black_val])
    return preserve_hanger_and_text(img, new_bgr)

def create_tobacco_camel(img):
    bgr = img[:, :, :3].astype(np.float32)
    # Warm golden camel/tobacco: high red, medium green, low blue
    b = np.clip(bgr[:, :, 0] * 0.65, 0, 255)
    g = np.clip(bgr[:, :, 1] * 1.45 + 10, 0, 255)
    r = np.clip(bgr[:, :, 2] * 2.2 + 20, 0, 255)
    new_bgr = cv2.merge([b, g, r]).astype(np.uint8)
    return preserve_hanger_and_text(img, new_bgr)

def create_forest_pine(img):
    bgr = img[:, :, :3].astype(np.float32)
    # Forest pine green: rich green, subtle blue, low red
    b = np.clip(bgr[:, :, 0] * 0.75 + 10, 0, 255)
    g = np.clip(bgr[:, :, 1] * 1.6 + 25, 0, 255)
    r = np.clip(bgr[:, :, 2] * 0.7, 0, 255)
    new_bgr = cv2.merge([b, g, r]).astype(np.uint8)
    return preserve_hanger_and_text(img, new_bgr)

def create_vintage_plum(img):
    bgr = img[:, :, :3].astype(np.float32)
    # Dusty plum/rose: higher red, low green, medium blue
    b = np.clip(bgr[:, :, 0] * 1.2 + 20, 0, 255)
    g = np.clip(bgr[:, :, 1] * 0.85 + 10, 0, 255)
    r = np.clip(bgr[:, :, 2] * 1.8 + 35, 0, 255)
    new_bgr = cv2.merge([b, g, r]).astype(np.uint8)
    return preserve_hanger_and_text(img, new_bgr)

def create_midnight_navy(img):
    bgr = img[:, :, :3].astype(np.float32)
    # Deep midnight navy: strong blue, muted green, minimal red
    b = np.clip(bgr[:, :, 0] * 1.7 + 30, 0, 255)
    g = np.clip(bgr[:, :, 1] * 1.05 + 10, 0, 255)
    r = np.clip(bgr[:, :, 2] * 0.65, 0, 255)
    new_bgr = cv2.merge([b, g, r]).astype(np.uint8)
    return preserve_hanger_and_text(img, new_bgr)

def create_oatmeal_cream(img):
    bgr = img[:, :, :3].astype(np.float32)
    # Warm oatmeal bone / off-white: balanced light warm tone
    gray = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY).astype(np.float32)
    # Lift gray to high range ~ 190 - 240
    lifted = np.clip(160 + (gray * 0.35), 0, 245)
    b = np.clip(lifted * 0.90, 0, 255)
    g = np.clip(lifted * 0.96, 0, 255)
    r = np.clip(lifted * 1.00, 0, 255)
    new_bgr = cv2.merge([b, g, r]).astype(np.uint8)
    return preserve_hanger_and_text(img, new_bgr)

def create_peach_terracotta(img):
    bgr = img[:, :, :3].astype(np.float32)
    gray = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY).astype(np.float32)
    lifted = np.clip(130 + (gray * 0.45), 0, 255)
    b = np.clip(lifted * 0.65, 0, 255)
    g = np.clip(lifted * 0.82, 0, 255)
    r = np.clip(lifted * 1.15, 0, 255)
    new_bgr = cv2.merge([b, g, r]).astype(np.uint8)
    return preserve_hanger_and_text(img, new_bgr)

PRODUCTS = [
    {
        "slug": "midnight-navy-work-chore-jacket",
        "front_url": "https://static.joonsite.com/storage/42826/media/2610071514560224.webp",
        "back_url": "https://static.joonsite.com/storage/42826/media/2610071514492742.webp",
        "variants": [
            ("charcoal-black", create_charcoal_black),
            ("tobacco-camel", create_tobacco_camel),
        ]
    },
    {
        "slug": "forest-green-box-fit-hoodie",
        "front_url": "https://static.joonsite.com/storage/42826/media/2610071516592552.webp",
        "back_url": "https://static.joonsite.com/storage/42826/media/2610071517017451.webp",
        "variants": [
            ("onyx-black", create_charcoal_black),
            ("midnight-navy", create_midnight_navy),
        ]
    },
    {
        "slug": "heather-grey-heavy-fleece-hoodie",
        "front_url": "https://static.joonsite.com/storage/42826/media/2610071514403809.webp",
        "back_url": "https://static.joonsite.com/storage/42826/media/2610071514388245.webp",
        "variants": [
            ("charcoal-black", create_charcoal_black),
            ("oatmeal-cream", create_oatmeal_cream),
        ]
    },
    {
        "slug": "cryptic-celestis-oversized-hoodie",
        "front_url": "https://static.joonsite.com/storage/42826/media/2610071101472773.webp",
        "back_url": "https://static.joonsite.com/storage/42826/media/2610071101430110.webp",
        "variants": [
            ("vintage-plum", create_vintage_plum),
            ("forest-pine", create_forest_pine),
        ]
    },
    {
        "slug": "vintage-mineral-acid-wash-hoodie",
        "front_url": "https://static.joonsite.com/storage/42826/media/2610071514351513.webp",
        "back_url": "https://static.joonsite.com/storage/42826/media/2610071514369515.webp",
        "variants": [
            ("onyx-black", create_charcoal_black),
            ("forest-pine", create_forest_pine),
        ]
    },
    {
        "slug": "jet-black-compact-drop-shoulder-tee",
        "front_url": "https://static.joonsite.com/storage/42826/media/2610071515314737.webp",
        "back_url": "https://static.joonsite.com/storage/42826/media/2610071515554298.webp",
        "variants": [
            ("oatmeal-cream", create_oatmeal_cream),
            ("vintage-plum", create_vintage_plum),
        ]
    },
    {
        "slug": "classic-cream-supima-boxy-tee",
        "front_url": "https://static.joonsite.com/storage/42826/media/2610071517318112.webp",
        "back_url": "https://static.joonsite.com/storage/42826/media/2610071517292954.webp",
        "variants": [
            ("onyx-black", create_charcoal_black),
            ("peach-terracotta", create_peach_terracotta),
        ]
    },
    {
        "slug": "cyber-tokyo-typographic-graphic-tee",
        "front_url": "https://static.joonsite.com/storage/42826/media/2610071517510556.webp",
        "back_url": "https://static.joonsite.com/storage/42826/media/2610071517430836.webp",
        "variants": [
            ("oatmeal-cream", create_oatmeal_cream),
            ("forest-pine", create_forest_pine),
        ]
    },
    {
        "slug": "textured-waffle-knit-streetwear-polo",
        "front_url": "https://static.joonsite.com/storage/42826/media/2610071516100782.webp",
        "back_url": "https://static.joonsite.com/storage/42826/media/2610071516137018.webp",
        "variants": [
            ("oatmeal-cream", create_oatmeal_cream),
            ("forest-pine", create_forest_pine),
        ]
    }
]

def main():
    for prod in PRODUCTS:
        slug = prod["slug"]
        print(f"Processing {slug}...")
        
        front = fetch_image(prod["front_url"], f"{slug}_front_orig.webp")
        back = fetch_image(prod["back_url"], f"{slug}_back_orig.webp")
        
        # Save original normalized WebP as well for instant local serving
        cv2.imwrite(os.path.join(OUT_DIR, f"{slug}_original_front.webp"), front)
        cv2.imwrite(os.path.join(OUT_DIR, f"{slug}_original_back.webp"), back)
        
        for var_name, transform_fn in prod["variants"]:
            v_front = transform_fn(front)
            v_back = transform_fn(back)
            
            front_path = os.path.join(OUT_DIR, f"{slug}_{var_name}_front.webp")
            back_path = os.path.join(OUT_DIR, f"{slug}_{var_name}_back.webp")
            
            cv2.imwrite(front_path, v_front)
            cv2.imwrite(back_path, v_back)
            print(f"  Generated {var_name}: front & back")

if __name__ == "__main__":
    main()
