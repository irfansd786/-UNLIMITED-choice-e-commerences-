import sys
import os
sys.path.insert(0, os.path.abspath("."))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=== VERIFYING ADMIN PRODUCT CREATION & STOREFRONT SYNC ===")

# Admin Login
resp = client.post("/api/auth/login", json={"email": "admin@varshienterprises.com", "password": "admin123"})
assert resp.status_code == 200
admin_token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {admin_token}"}

# Get Hoodies category id
resp = client.get("/api/categories")
cats = resp.json()
hoodie_cat = next(c for c in cats if c["slug"] == "hoodies")

# Create test product as Admin
test_sku = "VE-TEST-HD-099"
new_prod_payload = {
    "name": "Admin Test Thermal Streetwear Zip Hoodie",
    "slug": "admin-test-thermal-streetwear-zip-hoodie",
    "short_description": "Admin test hoodie with heavy waffle lining.",
    "description": "Created by administrator console to verify live synchronization with the customer marketplace.",
    "category_id": hoodie_cat["id"],
    "price": 2799.0,
    "compare_at_price": 4199.0,
    "cost_price": 1200.0,
    "sku": test_sku,
    "stock": 15,
    "low_stock_threshold": 3,
    "status": "PUBLISHED",
    "brand": "Varshi Street",
    "material": "100% Heavyweight Thermal Cotton",
    "specifications": {"Fit": "Boxy", "Weight": "450 GSM"},
    "is_featured": True,
    "is_new_arrival": True,
    "is_deal_of_the_day": False,
    "images": [
        {"image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80", "alt_text": "Admin Test Hoodie", "is_primary": True}
    ]
}

resp = client.post("/api/products", json=new_prod_payload, headers=headers)
assert resp.status_code == 201, f"Product creation failed: {resp.text}"
created = resp.json()
print(f"Product created by Admin: ID {created['id']}, SKU: {created['sku']}")

# Verify product appears on customer storefront
resp = client.get(f"/api/products/{created['slug']}")
assert resp.status_code == 200, "Created product not found on storefront!"
storefront_prod = resp.json()
assert storefront_prod["name"] == new_prod_payload["name"]
assert storefront_prod["stock"] == 15
print("   [PASS] Newly created admin product appears live on customer storefront.")

# Update stock as Admin
resp = client.patch(f"/api/products/{created['id']}/stock?stock=25", headers=headers)
assert resp.status_code == 200
print("Updated stock to 25 as Admin.")

# Verify customer storefront sees updated stock
resp = client.get(f"/api/products/{created['slug']}")
assert resp.json()["stock"] == 25
print("   [PASS] Live stock update reflected on customer storefront.")

# Clean up test product
resp = client.delete(f"/api/products/{created['id']}", headers=headers)
assert resp.status_code == 200
print("   [PASS] Test product cleaned up successfully.")

print("\nALL ADMIN-TO-CUSTOMER SYNC TESTS PASSED!")
