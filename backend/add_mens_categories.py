"""
Script to verify and sync Men's Streetwear categories.
"""
from backend.app.core.seed import seed_db

if __name__ == "__main__":
    print("Syncing Men's Streetwear categories...")
    seed_db()
