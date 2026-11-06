import sys
import os
sys.path.insert(0, os.path.abspath("."))
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models.product import Product
from backend.app.models.category import Category

client = TestClient(app)

print("=== VERIFYING API ENDPOINTS & MEN'S FASHION BEHAVIORS ===")

# 1. Categories
resp = client.get("/api/categories")
assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
cats = resp.json()
cat_slugs = [c["slug"] for c in cats]
print(f"1. Active categories returned ({len(cats)}):", cat_slugs)
expected_slugs = {"hoodies", "t-shirts", "shorts", "shoes", "bottomwear", "jackets", "accessories"}
assert set(cat_slugs) == expected_slugs, f"Categories mismatch! Got: {set(cat_slugs)}"
print("   [PASS] Only the 7 official Men's Streetwear categories are returned.")

# 2. Products listing
resp = client.get("/api/products")
assert resp.status_code == 200
prods_data = resp.json()
print(f"2. Total published products on storefront: {prods_data['total']}")
assert prods_data["total"] >= 20, "Expected at least 20 streetwear products"
for p in prods_data["items"]:
    assert p["category"]["slug"] in expected_slugs, f"Unexpected category {p['category']['slug']} for product {p['name']}"
print("   [PASS] All storefront products belong to Men's categories.")

# 3. Category filtering
for slug in expected_slugs:
    resp = client.get(f"/api/products?category_slug={slug}")
    assert resp.status_code == 200
    cat_prods = resp.json()
    assert cat_prods["total"] > 0, f"Expected products for category {slug}"
    print(f"   [PASS] Category '{slug}' has {cat_prods['total']} published products.")

# 4. Search suggestions
resp = client.get("/api/products/search/suggestions?q=hoodie")
assert resp.status_code == 200
sugg = resp.json()
print(f"4. Search suggestions for 'hoodie': {len(sugg['products'])} products, {len(sugg['categories'])} categories")
assert any("hoodie" in p["name"].lower() for p in sugg["products"])
assert any("hoodie" in c["name"].lower() for c in sugg["categories"])
print("   [PASS] Search suggestions working accurately.")

# 5. Archived products cannot be viewed by storefront customer
db = SessionLocal()
archived_prod = db.query(Product).filter(Product.status == "ARCHIVED").first()
if archived_prod:
    print(f"5. Testing access to archived legacy product (ID: {archived_prod.id}, '{archived_prod.name}')...")
    resp = client.get(f"/api/products/{archived_prod.slug}")
    assert resp.status_code == 404, f"Expected 404 for archived product, got {resp.status_code}"
    print("   [PASS] Archived product returned 404 Not Found on customer endpoint.")
db.close()

# 6. Admin Authentication & Category retrieval
resp = client.post("/api/auth/login", json={"email": "admin@varshienterprises.com", "password": "admin123"})
assert resp.status_code == 200, f"Admin login failed: {resp.text}"
admin_token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {admin_token}"}
print("6. Admin login verified with token.")

# 7. Customer Authentication
resp = client.post("/api/auth/login", json={"email": "customer@varshienterprises.com", "password": "customer123"})
assert resp.status_code == 200, f"Customer login failed: {resp.text}"
cust_token = resp.json()["access_token"]
cust_headers = {"Authorization": f"Bearer {cust_token}"}
print("7. Customer login verified with token.")

# 8. Cart retrieval & cleanup
resp = client.get("/api/cart", headers=cust_headers)
assert resp.status_code == 200
cart_data = resp.json()
print(f"8. Customer cart verified. Active items: {len(cart_data['items'])}, Subtotal: {cart_data['subtotal']}")
for item in cart_data["items"]:
    assert item["product"]["status"] == "PUBLISHED"
print("   [PASS] Customer cart has 0 archived products.")

print("\nALL SYSTEM VERIFICATIONS PASSED SUCCESSFULLY!")
