# UNLIMITED choice — Frontend Storefront & Admin Operations Console

> **Wear More • Choose Better**  
> Unified React application delivering both the customer marketplace and the administrator console on a **single port**.

---

## 🌟 Overview & Key Architecture

The frontend application is built with **React 18**, **Vite**, and **Tailwind CSS**. It provides a single, high-performance web client that hosts both customer shopping and store operations on **port 5173**.

```
                   http://localhost:5173
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
      CUSTOMER STOREFRONT           ADMIN DASHBOARD
     URL: http://localhost:5173/   URL: http://localhost:5173/admin
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
              AUTHENTICATION & SIGN-IN PORTAL
               URL: http://localhost:5173/login
        (1-Click "Demo Customer" & "Login as Admin")
```

---

## 🔑 Single-Port Sign-In Portal (`/login`)

The sign-in portal at `http://localhost:5173/login` features two prominent 1-click access buttons:

| Button | Auto-Filled Credentials | Destination | Experience |
| :--- | :--- | :--- | :--- |
| **Demo Customer** | `customer@varshienterprises.com` / `customer123` | `/` | Opens the customer storefront, restores wishlist, and syncs cart items to the server. |
| **Login as Admin** | `admin@varshienterprises.com` / `admin123` | `/admin` | Authenticates with administrator privileges and opens the Admin Operations Console. |

* **Manual Credentials Entry**: Typing credentials manually automatically checks the authenticated user role. Administrators are directed to `/admin`, and patrons are directed to the storefront (`/`).
* **Header Shortcut**: Authenticated administrators also see a direct **"Admin Operations Console"** shortcut inside the account dropdown on the customer navigation bar.

---

## 🛍️ Customer Storefront Features

1. **"On The Rail" Interactive Hanging Clothes Showcase**:
   - Metallic rail with rotating streetwear apparel, realistic pendulum drag physics, and hover price tags.
   - Click to inspect in the 360° Studio; double-click to view product details.
2. **Interactive 3D Floating Sneakers Showcase**:
   - Smooth curved sneaker showcase with live stock badges, colorways, and instant add-to-cart.
3. **Interactive 360° Product Studio (`/studio/:slug`)**:
   - Full 360-degree interactive garment inspection.
4. **Interactive Men's Outfit Studio (`/outfit-studio`)**:
   - Virtual mannequin allowing customers to mix & match tops, bottoms, jackets, and footwear.
5. **Real Physical Inventory Transparency**:
   - Live inventory counters backed directly by the database with real-time stock allocation and deduction.
6. **Frictionless Multi-Step Checkout**:
   - Address management, delivery estimation, Cash on Delivery (COD), Card, and dynamic UPI QR code generator.
7. **Order Tracking & Invoices**:
   - Step-by-step dispatch timeline, printable thermal POS invoices (`/printer`), and order history.

---

## 🛡️ Admin Operations Console Features (`/admin`)

1. **Executive Operations Dashboard (`/admin`)**:
   - Live gross revenue, prepaid online vs. COD payment split, active fulfillment count, and low-stock indicators.
2. **Catalog & Inventory Management (`/admin/products`, `/admin/inventory`)**:
   - Create, edit, and audit products, sizes, prices, compare-at prices, and real stock quantities.
3. **Order Fulfillment (`/admin/orders`)**:
   - Complete orders register with status workflow: `PENDING` → `CONFIRMED` → `PACKED` → `SHIPPED` → `DELIVERED`.
   - Cancellation with automatic inventory replenishment.
4. **Customer & Review Management (`/admin/customers`, `/admin/reviews`)**:
   - Verified patron directory and customer review moderation.
5. **Promotional Coupons (`/admin/coupons`)**:
   - Create and manage discount codes (percentage or flat amount).
6. **Jarvis Voice AI Engine**:
   - Integrated AI assistant powered by Groq and ElevenLabs TTS.
   - Voice commands for store diagnostics, navigation, voice product drafting, and coupon generation.

---

## 📂 Frontend Directory Structure

```
customer/
├── public/
│   ├── logo.png                # High-definition transparent brand logo
│   └── images/                 # Local media assets and categories
│
├── src/
│   ├── admin/                  # Nested Administrator Console
│   │   ├── components/         # Admin layout, sidebar, topbar, Jarvis voice orb & modals
│   │   ├── pages/              # Dashboard, Products, Inventory, Orders, Customers, Coupons, Settings
│   │   ├── services/           # Admin API connector & speech synthesis
│   │   └── store/              # Admin auth and Jarvis Zustand stores
│   │
│   ├── components/
│   │   └── common/             # BrandLogo, Header, Footer, HangingRackShowcase, SneakerShowcase
│   │
│   ├── context/                # Fly-to-cart animation context
│   ├── pages/                  # Home, Products, ProductDetails, Studio, OutfitStudio, Cart, Checkout, Login
│   ├── services/               # Axios API client connecting to http://localhost:8000/api
│   ├── store/                  # useAuthStore, useCartStore, useWishlistStore, useToastStore
│   ├── App.jsx                 # Unified routing configuration for customer & admin
│   ├── index.css               # Tailwind CSS & custom styling
│   └── main.jsx                # Application root entry point
│
├── package.json                # Dependencies and build scripts
├── tailwind.config.js          # Theme colors (forest, gold, charcoal, luxury)
└── vite.config.js              # Vite server configuration (Port 5173)
```

---

## 🛠️ Technology Stack

| Library | Version | Purpose |
| :--- | :--- | :--- |
| **React** | 18.2.0 | Core UI library |
| **Vite** | 5.1.6 | Fast dev server & production bundler |
| **React Router DOM** | 6.22.3 | Client-side routing with nested layouts |
| **Tailwind CSS** | 3.4.1 | Utility-first styling & responsive layouts |
| **TanStack React Query** | 5.28.4 | Server state synchronization & cache |
| **Zustand** | 4.5.2 | Lightweight client state management |
| **Lucide React** | 0.359.0 | Icon library |
| **Framer Motion** | 11.0.8 | Smooth UI animations |
| **Recharts** | 2.12.3 | Admin analytical charts |
| **Axios** | 1.6.8 | HTTP client with JWT interceptors |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd customer
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
* **Customer Storefront**: `http://localhost:5173`
* **Admin Console**: `http://localhost:5173/admin`
* **Sign-In Page**: `http://localhost:5173/login`

### 3. Production Build
```bash
npm run build
```
Generates an optimized single-port bundle inside `customer/dist/`.
