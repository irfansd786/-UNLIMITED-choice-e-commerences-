# UNLIMITED choice — Men's Fashion & Contemporary Streetwear Platform

> **Wear More • Choose Better**  
> Complete Customer Marketplace + Unified Administrator Operations Console + Asynchronous FastAPI Backend Engine.

---

## 🏛️ System Architecture

The project is structured into **TWO CORE APPLICATION FOLDERS**:
1. `customer/` — Unified React frontend application hosting both the **Customer Storefront** (`/`) and **Administrator Operations Console** (`/admin`) on **one single port** (`5173`).
2. `backend/` — Asynchronous FastAPI backend API (`port 8000`), canonical SQLite database, and static storage bucket.

```
                    UNLIMITED choice
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
     CUSTOMER STOREFRONT           ADMIN DASHBOARD
    (Served at: /)              (Served at: /admin)
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
                  UNIFIED SINGLE PORT
               (customer/ - Port 5173)
                           │
                           ▼
                    FASTAPI BACKEND
              (backend/app/ - Port 8000)
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   CANONICAL DATABASE              STORAGE BUCKET
(backend/database/varshi.db)    (backend/storage/)
```

### Key Architectural Principles
* **Single-Port Unified Frontend**: Both the Customer Store (`/`) and the Admin Console (`/admin`) run on **port 5173**. No need to remember or launch two different ports.
* **1-Click Demo Sign-In**: The sign-in page at `http://localhost:5173/login` provides **1-click** buttons for both **Demo Customer** and **Login as Admin**. Clicking them auto-fills the credentials and opens the corresponding experience.
* **One Canonical Database**: Both storefront and admin operations connect to the **same FastAPI backend** and database (`backend/database/varshi.db`). Modifying stock in the Admin Console updates the customer store in real time.
* **Real Physical Inventory**: Authentic stock tracking with immediate inventory deduction upon order placement and automatic inventory restoral upon cancellation.
* **Jarvis Voice AI Engine**: Groq LLM + ElevenLabs speech synthesis for hands-free voice diagnostics, product drafting, and coupon generation in the Admin Console.

---

## 📂 Project Organization

```
e-commerces/
├── customer/                   # Frontend React Application (Port 5173)
│   ├── src/                    # Customer storefront pages & components
│   ├── src/admin/              # Nested Admin Operations Console
│   ├── public/                 # Transparent logo and media assets
│   ├── package.json            # React, Vite, Tailwind, Recharts dependencies
│   ├── vite.config.js          # Vite config (Port 5173)
│   └── README.md               # 📖 Detailed Frontend Documentation
│
├── backend/                    # Backend FastAPI Application (Port 8000)
│   ├── app/                    # FastAPI routes, models, services, seed data
│   ├── database/               # Canonical SQLite database (varshi.db)
│   ├── storage/                # Media storage (products, variants, categories)
│   ├── scripts/                # Database inspection and utility scripts
│   ├── requirements.txt        # Python dependencies
│   └── README.md               # 📖 Detailed Backend Documentation
│
└── README.md                   # 📖 Root Project Documentation (This file)
```

---

## 🔑 Demo Access Credentials

Access the unified login page at **`http://localhost:5173/login`**:

| Role | Email (ID) | Password | 1-Click Action Button | Destination |
| :--- | :--- | :--- | :--- | :--- |
| **Store Customer** | `customer@varshienterprises.com` | `customer123` | **"Demo Customer"** | Customer Storefront (`http://localhost:5173/`) |
| **Administrator** | `admin@varshienterprises.com` | `admin123` | **"Login as Admin"** | Admin Console (`http://localhost:5173/admin`) |

*Clicking either button automatically populates the form below and immediately opens the appropriate portal.*

---

## 🚀 Quick Start Guide

### Step 1: Start Backend API Server (Port 8000)

**Windows (PowerShell):**
```powershell
backend\venv\Scripts\python -m uvicorn backend.app.main:app --port 8000 --reload
```

**macOS / Linux:**
```bash
source backend/venv/bin/activate
python -m uvicorn backend.app.main:app --port 8000 --reload
```

* API Health Check: [http://localhost:8000/health](http://localhost:8000/health)
* Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Step 2: Start Unified Frontend (Port 5173)

```powershell
cd customer
npm install
npm run dev
```

Open your browser at:
* **Sign-In Portal**: [http://localhost:5173/login](http://localhost:5173/login)
* **Customer Storefront**: [http://localhost:5173](http://localhost:5173)
* **Admin Operations Console**: [http://localhost:5173/admin](http://localhost:5173/admin)

---

### Step 3: Production Build (Optional)

```powershell
cd customer
npm run build
```
Creates an optimized single-port bundle inside `customer/dist/`.

---

## 📦 Master Product Categories

* **Hoodies**: Heavyweight 450GSM loopback cotton fleece, oversized drop-shoulder fits, and zip-ups.
* **T-Shirts**: Heavyweight 240–280GSM combed compact cotton, boxy vintage tees, and luxury knit zip polos.
* **Shorts**: Casual raw-hem sweatshorts, tactical multi-pocket cargo shorts, and athletic shorts.
* **Shoes**: Heritage court sneakers, chunky street runners, and minimal low-top casual skate shoes.
* **Bottomwear**: Tapered heavyweight joggers, relaxed wide-leg denim jeans, and tactical cargo trousers.
* **Jackets**: Reversible urban bombers, durable canvas chore jackets, and tech-shell windbreakers.
* **Accessories**: Washed cotton dad caps, full-grain leather bifold wallets, and tactical utility webbing belts.

---

## 🎟️ Active Promotional Coupons

* `WELCOME10`: 10% off on first orders above ₹999 (Max discount: ₹500)
* `STREET500`: Flat ₹500 off on streetwear orders above ₹2,999
* `DROP20`: 20% off on premium hoodies and footwear above ₹3,999

---

## 📚 Dedicated Documentation Links

* **Frontend Documentation**: See [customer/README.md](file:///C:/Users/irfan/OneDrive/Attachments/Desktop/e-commerces/customer/README.md) for full details on customer UI, nested admin components, Jarvis AI, and Zustand state.
* **Backend Documentation**: See [backend/README.md](file:///C:/Users/irfan/OneDrive/Attachments/Desktop/e-commerces/backend/README.md) for database schemas, models, API endpoints, and authentication security.
