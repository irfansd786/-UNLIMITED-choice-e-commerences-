"""
Utility script to populate additional Men's Streetwear products.
"""
from backend.app.core.seed import seed_db

if __name__ == "__main__":
    print("Syncing Men's Streetwear products catalog...")
    seed_db()
