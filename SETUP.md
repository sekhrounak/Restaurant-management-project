# Aura Table & Bar — Local Machine Setup Guide

A complete, modern, professional **Restaurant Management SaaS System** built with **Angular 21**, **TypeScript**, **Signals**, **Reactive Forms**, **Tailwind CSS**, and **LocalStorage persistence**.

---

## 📋 System Prerequisites

Before running the application locally, ensure you have the following installed:

1. **Node.js**: `v20.x` or `v22.x` (LTS recommended)
   * Verify by running:
     ```bash
     node -v
     ```
2. **npm**: `v9.x` or `v10.x`
   * Verify by running:
     ```bash
     npm -v
     ```
3. *(`Optional`)* **Angular CLI**:
   ```bash
   npm install -g @angular/cli@latest
   ```

---

## 🚀 Quick Start (Local Run)

### 1. Download or Extract the Project
Extract the zip/archive into your desired directory on your local machine, or clone the repository:
```bash
cd restaurant-management-system
```

### 2. Install Dependencies
Run the standard npm installation to download all required Angular packages and UI dependencies:
```bash
npm install
```

> **Note**: If you encounter any peer dependency warnings on specific npm versions, run:
> ```bash
> npm install --legacy-peer-deps
> ```

### 3. Start the Development Server
Run the development command:
```bash
npm run dev
```
*(Or alternatively: `npm start`)*

### 4. Open in Your Browser
Once the server has compiled, open:
```
http://localhost:3000
```
*(If port 3000 is occupied on your machine, Angular will bind to `http://localhost:4200`)*.

---

## 🔑 Demo Access & Login Credentials

The application includes simulated authentication with instant role-switching and pre-configured demo users stored in your browser's `LocalStorage`.

### 1-Click Fast Switcher
* You can switch between **Customer View** and **Admin Portal** at any time by clicking the toggle pill in the top header navbar!

### Manual Sign In:
| Role | Name | Email | Password |
|---|---|---|---|
| **Customer (VIP)** | Eleanor Vance | `eleanor.vance@example.com` | `password123` |
| **Customer (Standard)** | Marcus Sterling | `marcus.sterling@example.com` | `password123` |
| **Executive Admin** | Chef Antoine Rousseau | `admin@aurarestaurant.com` | `password123` |

*(You can also register any new customer or admin account using the "Create Account" tab on `/auth/login`)*.

---

## 📱 Application Modules & Pages

### 🍽️ Customer Module
* **Dashboard** (`/customer/dashboard`): Personal metrics, active bookings, recent orders, seasonal menu promotions.
* **Table Reservation** (`/customer/booking`): Select date, time slot, party size, and table on the **Interactive Floor Plan** (with real-time conflict prevention for already-booked tables).
* **Artisanal Food Menu** (`/customer/menu`): Search dishes, filter by course (*Starters, Main, Pizza, Burgers, Drinks, Desserts*), view dietary tags (*Chef Special, Vegetarian, Gluten-Free*), and add to cart.
* **Cart & Checkout** (`/customer/cart`): Modify quantities, calculate 8.5% culinary tax, choose dining service (*Dine-In, Takeaway, Delivery*), tableside notes, and generate order receipts.
* **My Reservations** (`/customer/reservations`): View all bookings, cancel eligible reservations, and display printable digital passes.
* **My Orders** (`/customer/orders`): Live 5-stage kitchen status tracker (*Received → Confirmed → Preparing → Ready → Delivered*) with printable dining receipts.

### 🛡️ Admin & Manager Portal
* **Operations Dashboard** (`/admin/dashboard`): Live revenue analytics, total bookings, table occupancy rate, and live kitchen dispatch queue.
* **Reservation Management** (`/admin/reservations`): Hostess stand table view with status filters (*Confirmed, Pending, Completed, Cancelled*), date filters (*Today, Tomorrow, All*), and approval controls.
* **Kitchen & Order Management** (`/admin/orders`): Kitchen Display System (KDS) showing active line items; advancing order status updates the customer's order tracker in real-time.
* **Food Menu Management** (`/admin/menu-management`): Full CRUD to add courses, edit pricing/descriptions/prep times, delete items, and toggle 86'd (out-of-stock) availability.
* **Floor & Table Layout** (`/admin/table-management`): Configure dining floor sections, seating capacity, shapes, minimum spend, and live occupancy status.
* **Guest Directory & CRM** (`/admin/customers`): Patron directory with registration date, lifetime dining spend, and full dining folios.

---

## 🛠️ Available NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| **Development** | `npm run dev` | Runs the dev server with hot compilation on port 3000 |
| **Standard Serve**| `npm start` | Default Angular dev server (`ng serve`) |
| **Production Build** | `npm run build` | Compiles optimized production bundle in `dist/` |
| **Lint Check** | `npm run lint` | Runs Angular ESLint validation rules |
| **Unit Tests** | `npm test` | Runs Vitest / Karma unit test suites |

---

## 💾 Data Storage & Local Persistence

* **No Backend or Database Server Required**: All data is saved automatically to your browser's `localStorage` (`aura_tables_v1`, `aura_food_items_v1`, `aura_reservations_v1`, `aura_orders_v1`, `aura_users_v1`, `aura_cart_v1`).
* **Resetting Data**: If you ever want to reset the application back to initial demo seeds, simply open your browser's Developer Tools (`F12`), go to **Application** &rarr; **Local Storage** &rarr; **Clear Storage**, and refresh the page.

---

## 📁 Key File Structure

```
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/        # TypeScript interfaces & initial mock seed data
│   │   │   └── services/      # Storage, Auth, Table, Food, Cart, Booking, Order, Toast
│   │   ├── features/
│   │   │   ├── auth/          # Login & registration portal
│   │   │   ├── customer/      # Dashboard, Booking, Menu, Cart, Reservations, Orders
│   │   │   └── admin/         # Dashboard, Bookings, KDS Orders, Menu & Table Management, CRM
│   │   ├── shared/
│   │   │   └── components/    # Navbar, Toast Notifications, Printable Receipt Pass Modal
│   │   ├── app.routes.ts      # Lazy-loaded standalone routing
│   │   └── app.ts             # Main root layout & luxury footer
│   ├── index.html             # Shell with Cormorant Garamond & Plus Jakarta Sans fonts
│   └── styles.css             # Theme variables, custom scrollbars, print stylesheet
├── angular.json               # Angular CLI project configuration
├── package.json               # Project dependencies and scripts
└── SETUP.md                   # This local installation guide
```

---

## ❓ Troubleshooting

1. **Port 3000 is already in use**:
   * Stop the conflicting process, or run Angular on an alternate port:
     ```bash
     npx ng serve --port 4200
     ```
2. **Node Version Compatibility**:
   * Ensure you are running Node 20.x or 22.x. If you use `nvm` (Node Version Manager):
     ```bash
     nvm use 20
     ```
3. **Printing Receipts & Booking Passes**:
   * The app includes a `@media print` CSS stylesheet. When you click **"Print Folio / Pass"**, your browser's native print dialog will open with only the formal restaurant letterhead and receipt sheet visible.

Enjoy running **Aura Table & Bar**!
