import sqlite3

con = sqlite3.connect('varshi.db')
cur = con.cursor()

tables = [row[0] for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
print("Tables:", tables)

for t in ['categories', 'products', 'orders', 'order_items']:
    print(f"\n--- PRAGMA {t} ---")
    cols = cur.execute(f"PRAGMA table_info({t});").fetchall()
    print([c[1] for c in cols])

print("\n--- CATEGORIES DATA ---")
cats = cur.execute("SELECT id, name, slug FROM categories;").fetchall()
for c in cats:
    print(c)

print("\n--- PRODUCTS DATA ---")
prods = cur.execute("SELECT id, name, slug, category_id, status FROM products;").fetchall()
for p in prods:
    print(p)

print("\n--- ORDERS DATA ---")
orders = cur.execute("SELECT * FROM orders;").fetchall()
print(f"Total orders: {len(orders)}")
for o in orders:
    print(o)

print("\n--- ORDER ITEMS DATA ---")
order_items = cur.execute("SELECT * FROM order_items;").fetchall()
print(f"Total order items: {len(order_items)}")
for oi in order_items:
    print(oi)
