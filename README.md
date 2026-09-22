# MEDRENTIA (Medical Equipment Rental Startup Platform)

> **"Medical Equipment. When You Need It."**  
> India's premier verified healthcare equipment rental marketplace connecting patients and caregivers with certified medical device providers.

---

## 🌟 Overview & Highlights

MedRentia is a production-ready, full-stack medical equipment rental platform operating in **Indian Rupees (₹ / INR)**. It eliminates prohibitive upfront medical device purchasing costs for post-operative recovery, chronic respiratory management, and geriatric care by offering flexible multi-tier rentals with hospital-grade sanitization guarantees.

- **Currency**: Indian Rupees (`₹` INR) throughout the application.
- **Strict Equipment Image Accuracy**: Certified image mapping ensuring wheelchairs display wheelchairs, oxygen concentrators display oxygen concentrators, and ventilators display ventilators.
- **Dynamic Pricing Plans**: Daily, Weekly, Monthly, 6-Month, and Yearly rates with automatic deposit calculation.
- **Razorpay Integration**: Native Razorpay Test Mode checkout with SHA-256 HMAC cryptographic signature verification and fallback simulation.
- **7-Stage Live Delivery Tracking**: Order Confirmed → Preparing Equipment → Sanitization & Quality Check → Packed → Out for Delivery → Delivered → Returned.
- **Downloadable PDF Receipts**: High-resolution tax invoices with MedRentia letterhead, GST (18%), refundable deposit escrow logs, and transaction hashes.
- **Role-Based Workflows**: Dedicated interfaces for Patients (`customer`), Equipment Suppliers (`provider`), and Platform Administrators (`admin`).

---

## 📁 Project Architecture & Structure

```
medrentia/
├── package.json               # Root orchestration (concurrently runs frontend & backend)
├── README.md                  # Complete documentation & startup guide
│
├── backend/                   # Node.js + Express + MongoDB REST API
│   ├── .env.example           # Backend environment template
│   ├── .env                   # Local development environment configuration
│   ├── package.json           # Backend dependencies
│   ├── server.js              # Server entry point & DB connection
│   ├── app.js                 # Express app, middleware, routes, security headers
│   └── src/
│       ├── config/            # Database connection (Mongoose)
│       │   └── db.js
│       ├── models/            # MongoDB Schemas
│       │   ├── User.js        # User model (Customer, Provider, Admin with bcrypt)
│       │   ├── Category.js    # 9 Medical categories
│       │   ├── Equipment.js   # Equipment listings with multi-tier pricing in ₹
│       │   ├── Cart.js        # Persistent customer rental carts
│       │   ├── Order.js       # Customer rental orders
│       │   ├── Payment.js     # Razorpay payment records
│       │   ├── Rental.js      # Active rental lifecycle & extension logs
│       │   ├── Delivery.js    # 7-stage delivery timeline & driver info
│       │   ├── Review.js      # Verified customer reviews & ratings
│       │   ├── Notification.js# In-app notifications
│       │   └── Maintenance.js # Hospital sterilization & calibration logs
│       ├── controllers/       # REST API Business logic
│       │   ├── authController.js
│       │   ├── equipmentController.js
│       │   ├── categoryController.js
│       │   ├── cartController.js
│       │   ├── orderController.js
│       │   ├── paymentController.js
│       │   ├── rentalController.js
│       │   ├── deliveryController.js
│       │   ├── reviewController.js
│       │   ├── providerController.js
│       │   ├── adminController.js
│       │   └── notificationController.js
│       ├── routes/            # Express route endpoints
│       │   ├── authRoutes.js
│       │   ├── equipmentRoutes.js
│       │   ├── categoryRoutes.js
│       │   ├── cartRoutes.js
│       │   ├── orderRoutes.js
│       │   ├── paymentRoutes.js
│       │   ├── rentalRoutes.js
│       │   ├── deliveryRoutes.js
│       │   ├── reviewRoutes.js
│       │   ├── providerRoutes.js
│       │   ├── adminRoutes.js
│       │   └── notificationRoutes.js
│       ├── middleware/        # JWT auth, error handling, file upload
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   └── upload.js
│       ├── services/          # Razorpay, PDFKit invoices, Cloudinary, Nodemailer
│       │   ├── razorpayService.js
│       │   ├── pdfService.js
│       │   ├── cloudinaryService.js
│       │   └── emailService.js
│       └── utils/             # Database seeding scripts
│           └── seedData.js
│
└── frontend/                  # React 18 + Vite + Tailwind CSS SPA
    ├── .env.example           # Frontend environment template
    ├── .env                   # Local development API endpoint
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration with API proxy
    ├── tailwind.config.js     # Medical Blue, Healthcare Green & Accent palette
    ├── postcss.config.js
    ├── index.html             # HTML entry with Razorpay script
    └── src/
        ├── main.jsx           # DOM mounting
        ├── App.jsx            # React Router v6 route matrix
        ├── index.css          # Tailwind directives & healthcare styling
        ├── services/          # Axios client with automated JWT header injection
        │   └── api.js
        ├── context/           # Global application state
        │   ├── AuthContext.jsx
        │   ├── CartContext.jsx
        │   └── NotificationContext.jsx
        ├── components/
        │   └── common/        # Shared components
        │       ├── Navbar.jsx
        │       ├── Footer.jsx
        │       ├── ProtectedRoute.jsx
        │       ├── RazorpayModal.jsx
        │       ├── LoadingSkeleton.jsx
        │       └── EmptyState.jsx
        └── pages/             # Application views
            ├── LandingPage.jsx
            ├── MarketplacePage.jsx
            ├── EquipmentDetailPage.jsx
            ├── CartPage.jsx
            ├── CheckoutPage.jsx
            ├── PaymentSuccessPage.jsx
            ├── DeliveryTrackingPage.jsx
            ├── auth/
            │   ├── LoginPage.jsx
            │   └── RegisterPage.jsx
            ├── customer/
            │   └── CustomerDashboard.jsx
            ├── provider/
            │   ├── ProviderDashboard.jsx
            │   ├── ProviderEquipment.jsx
            │   ├── ProviderAddEquipment.jsx
            │   └── ProviderAnalytics.jsx
            ├── admin/
            │   └── AdminDashboard.jsx
            └── info/
                ├── HowItWorksPage.jsx
                ├── AboutPage.jsx
                └── ContactPage.jsx
```

---

## 🔑 Development Demo Accounts

The database seeder comes preloaded with ready-to-use accounts for all roles:

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Customer / Patient** | `customer@medrentia.test` | `MedRentia@123` | `/customer/dashboard` |
| **Equipment Provider** | `provider@medrentia.test` | `MedRentia@123` | `/provider/dashboard` |
| **Platform Admin** | `admin@medrentia.test` | `MedRentia@123` | `/admin/dashboard` |

*(You can also use the one-click demo login buttons on the `/login` page).*

---

## 🚀 Step-by-Step Installation & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or free MongoDB Atlas cloud cluster.

### 2. Clone & Install Dependencies
From the root directory:
```bash
# Install root, backend, and frontend packages
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3. Seed Database with 15+ Verified Medical Devices
Populate categories, equipment with exact images, and demo accounts:
```bash
npm run seed --prefix backend
```

### 4. Start Development Servers
You can run both backend (Port 5000) and frontend (Port 5173) concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend API
npm run dev --prefix backend

# Terminal 2: React Frontend
npm run dev --prefix frontend
```

Visit the application at: **`http://localhost:5173`**

---

## 💳 Payment Gateway Setup (Razorpay Test Mode)

MedRentia supports Razorpay in **Test Mode**:

1. Create a free account at [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** from the top right toggle.
3. Navigate to **Settings** → **API Keys** → **Generate Test Key**.
4. Copy your `Key ID` and `Key Secret` into `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
   ```
5. Update `frontend/.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
   ```
6. *Note: If test keys are omitted, MedRentia automatically runs in simulated test mode with cryptographic signature validation enabled.*

---

## ☁️ Cloudinary Image Storage Setup

1. Sign up at [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
3. Paste into `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new customer or provider account.
- `POST /api/auth/login`: Authenticate user and receive JWT.
- `GET /api/auth/me`: Fetch authenticated user profile.
- `PUT /api/auth/profile`: Update contact address and phone.

### Medical Equipment (`/api/equipment`)
- `GET /api/equipment`: Filter listings by search query, category, price in ₹, condition, city, rating.
- `GET /api/equipment/featured`: Top rented equipment for landing page.
- `GET /api/equipment/:id`: Complete device details, specifications, and pricing.
- `POST /api/equipment`: List new equipment (Provider/Admin).
- `PUT /api/equipment/:id`: Update price, stock, or maintenance status.
- `DELETE /api/equipment/:id`: Remove equipment listing.

### Shopping Cart (`/api/cart`)
- `GET /api/cart`: Retrieve user's cart with duration breakdown.
- `POST /api/cart`: Add equipment with daily/weekly/monthly rental duration.
- `PUT /api/cart/:itemId`: Update duration or quantity.
- `DELETE /api/cart/:itemId`: Remove item from cart.
- `DELETE /api/cart`: Clear entire cart.

### Payments & Orders (`/api/payments` & `/api/orders`)
- `POST /api/payments/create-order`: Generates internal order and Razorpay order ID.
- `POST /api/payments/verify`: Verifies SHA256 HMAC signature, captures payment, creates rental, updates inventory stock, and starts delivery tracking.
- `GET /api/orders`: List user's rental orders.
- `GET /api/orders/:id/receipt`: Generates and streams branded downloadable PDF receipt.

### Delivery Tracking (`/api/delivery`)
- `GET /api/delivery/:orderId`: Returns 7-stage live delivery timeline, driver info, and sterilization certificate.
- `PUT /api/delivery/:id/stage`: Progress delivery status (Provider/Admin/Logistics).

### Rentals & Extensions (`/api/rentals`)
- `GET /api/rentals`: List active and completed rentals.
- `PUT /api/rentals/:id/extend`: Extend rental duration and calculate additional fee.
- `PUT /api/rentals/:id/return`: Request return pickup or mark inspected and returned.

---

## 🌐 Production Deployment Guide

### Deploy Backend to Render

1. Create a **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Set the following settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add the following Environment Variables in the Render dashboard:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/medrentia?retryWrites=true&w=majority`
   - `JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET`
   - `FRONTEND_URL=https://your-medrentia-app.vercel.app`
   - `RAZORPAY_KEY_ID=rzp_live_...`
   - `RAZORPAY_KEY_SECRET=...`

### Deploy Frontend to Vercel

1. Import your repository into [Vercel](https://vercel.com/).
2. Select **Framework Preset**: `Vite`.
3. Set **Root Directory**: `frontend`.
4. Configure Environment Variables:
   - `VITE_API_BASE_URL=https://your-backend-app.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID=rzp_live_...`
5. Click **Deploy**.

---

## ✅ Final Quality & Acceptance Verification Checklist

- [x] **Indian Rupee Currency (₹)** used consistently across all price plans and invoices.
- [x] **100% Medical Equipment Image Accuracy** (Wheelchair → Wheelchair, Oxygen Concentrator → Oxygen Concentrator).
- [x] **Dynamic Multi-Tier Rental Calculation** (Daily, Weekly, Monthly, 6-Month, Yearly).
- [x] **Verified Razorpay Checkout & Cryptographic Signature Validation**.
- [x] **Automatic Inventory Stock Decrement** and anti-double booking protection.
- [x] **Downloadable PDF Invoices** generated with GST, refundable deposit, and transaction ID.
- [x] **7-Stage Live Delivery Tracker** with sterilization certification logs.
- [x] **Role-Based Protected Dashboards** for Customers, Providers, and Administrators.
- [x] **Responsive Mobile, Tablet, and Desktop UX** with medical healthcare color styling.
- [x] **Zero Dead Buttons** — all filters, forms, tabs, and action links fully functional.
