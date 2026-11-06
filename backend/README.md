# UNLIMITED choice — FastAPI Backend API & Data Engine

> **High-Performance Asynchronous Python REST API**  
> Powers both the customer storefront and administrator console with unified business logic, SQLite canonical database, and AI integrations.

---

## 🏛️ Architecture & Core Principles

The backend is built with **FastAPI**, **SQLAlchemy ORM**, **Pydantic v2**, and **Uvicorn**.

* **Canonical Database**: Stored at `backend/database/varshi.db`.
* **Zero Discrepancy**: Modifying inventory or updating order status in the Admin Console immediately reflects on the Customer Store.
* **Real Physical Inventory**: Stock deduction happens when an order is placed. If an order is cancelled, stock is automatically returned to the active inventory.
* **Static Media Storage**: File uploads and product assets are mounted at `/media` from `backend/storage/`.

```
                    FASTAPI API ENGINE
                 (Port 8000 - /api/...)
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
    CANONICAL DATABASE              STORAGE BUCKET
  (backend/database/varshi.db)    (backend/storage/)
             │                             │
    • Users & Patrons             • /products/
    • Categories & Products       • /variants/
    • Carts & Wishlists           • /categories/
    • Orders & Payments           • /uploads/
    • Coupons & Reviews           • /banners/
```

---

## 📂 Backend Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application, CORS, static mounts, lifespan
│   ├── core/
│   │   ├── config.py           # App settings, paths, JWT secret, CORS origins
│   │   ├── database.py         # SQLAlchemy engine & session factory
│   │   ├── security.py         # Password hashing (bcrypt) & JWT token encoding
│   │   └── seed.py             # Automatic database seeding on initial startup
│   ├── api/                    # API Endpoints
│   │   ├── auth.py             # Login, register, profile, password reset
│   │   ├── categories.py       # Category listing & admin CRUD
│   │   ├── products.py         # Catalog, search suggestions, filters, deals
│   │   ├── cart.py             # Server cart management & guest cart sync
│   │   ├── wishlist.py         # Customer wishlist toggle & listing
│   │   ├── addresses.py        # Customer shipping address management
│   │   ├── orders.py           # Order creation, details, cancellation
│   │   ├── reviews.py          # Product reviews & admin moderation
│   │   ├── coupons.py          # Discount coupons validation & admin CRUD
│   │   ├── admin.py            # Dashboard metrics, sales breakdown, reports
│   │   └── ai_assistant.py     # Groq LLM business intelligence & voice endpoints
│   ├── models/                 # SQLAlchemy Database Models
│   │   ├── user.py             # User model with role (CUSTOMER vs ADMIN)
│   │   ├── category.py         # Category model
│   │   ├── product.py          # Product, ProductImage, ProductVariant
│   │   ├── cart.py             # Cart & CartItem models
│   │   ├── order.py            # Order, OrderItem, Payment, ShippingAddress
│   │   ├── review.py           # Review model
│   │   └── coupon.py           # Coupon model
│   └── services/               # External Services (Groq, ElevenLabs)
│
├── database/
│   └── varshi.db               # Canonical SQLite database file
├── storage/                    # Static asset storage directory
├── scripts/                    # Maintenance & diagnostic scripts
├── requirements.txt            # Python dependencies
└── venv/                       # Python virtual environment
```

---

## 📡 API Endpoints Reference

Base URL: `http://localhost:8000/api`

| Prefix | Method | Description |
| :--- | :--- | :--- |
| `/auth/login` | `POST` | Authenticate customer or administrator and return JWT token |
| `/auth/register` | `POST` | Register a new customer account |
| `/auth/me` | `GET` / `PUT` | Retrieve or update current user profile |
| `/categories` | `GET` | List all active product categories |
| `/products` | `GET` | Filter products by category, size, price, search, deals, or new arrivals |
| `/products/{id_or_slug}` | `GET` | Retrieve complete product details with colorways & variants |
| `/cart` | `GET` / `POST` | Retrieve cart, add items, update quantity, remove item |
| `/cart/sync` | `POST` | Synchronize guest cart items upon customer login |
| `/orders` | `POST` / `GET` | Create a new order with stock validation; list customer orders |
| `/orders/{order_number}` | `GET` | Get detailed order status, timeline, and tracking info |
| `/orders/{id}/cancel` | `POST` | Cancel order and automatically restore product stock |
| `/coupons/validate` | `POST` | Validate promotional coupon (`WELCOME10`, `STREET500`, `DROP20`) |
| `/admin/dashboard` | `GET` | Executive dashboard stats (Revenue, orders, inventory alerts) |
| `/admin/orders` | `GET` / `PUT` | List all customer orders and update dispatch status |
| `/admin/inventory` | `GET` / `PUT` | Audit stock levels and update replenishment numbers |
| `/ai/chat` | `POST` | Groq AI operations executive query & voice intent processing |

---

## 🔑 Pre-Seeded Default Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@varshienterprises.com` | `admin123` | Full Admin Console & Operations (`ADMIN` role) |
| **Verified Customer** | `customer@varshienterprises.com` | `customer123` | Storefront Shopping & Orders (`CUSTOMER` role) |

---

## 🚀 Getting Started

### 1. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
backend\venv\Scripts\activate
```

**macOS / Linux:**
```bash
source backend/venv/bin/activate
```

### 2. Install Dependencies (If needed)
```bash
pip install -r backend/requirements.txt
```

### 3. Start FastAPI Server
```powershell
backend\venv\Scripts\python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

* **API Health Check**: `http://localhost:8000/health`
* **Interactive Swagger UI**: `http://localhost:8000/docs`
* **Alternative ReDoc UI**: `http://localhost:8000/redoc`
