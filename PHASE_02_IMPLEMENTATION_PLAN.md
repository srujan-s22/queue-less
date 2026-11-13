# QueueLess — Phase 2: Backend & Database Engineering Implementation Plan

**Project:** QueueLess — Smart Campus Canteen Pre-Ordering & Queue Management Platform  
**Phase:** Phase 2 (Backend & Persistent Database Engineering)  
**Author:** Lead Backend & Systems Architect (Antigravity)  
**Date:** November 13, 2026  
**Status:** Approved for Implementation  

---

## 1. Executive Summary & Objectives

In Phase 1 and Phase 1.1, the complete frontend foundation and premium monochrome design system of QueueLess were developed and verified across 26 App Router routes in Next.js 16 with React 19 and Tailwind CSS v4.

Phase 2 engineers the robust, production-grade backend infrastructure, persistent MongoDB database layer, and standalone background worker.

### Phase 2 Core Objectives
1. **Architecturally Decoupled Backend:** Build an independent Node.js + Express + TypeScript service in `/backend` listening on port `5000` with versioned REST APIs (`/api/v1/*`).
2. **Normalized & Indexed Database Layer:** Implement 8 core Mongoose models in MongoDB with strict validations, compound indexes, unique constraints, and referential integrity.
3. **Enterprise Security & Auth:** Implement bcrypt password hashing, HTTP-only secure cookie JWT sessions, rate limiting, Helmet headers, CORS allowlisting, and strict Role-Based Access Control (`student`, `staff`, `admin`).
4. **Authoritative Order & Inventory Engine:** The backend server independently calculates and validates dish availability, prices, add-ons, taxes, and packaging fees. Frontend-supplied financial calculations are never trusted.
5. **Atomic Slot Concurrency Control:** Prevent slot overbooking during high-volume break rush periods using atomic MongoDB updates and condition checks (`$inc`, `$lt` capacity).
6. **Resilient Background Worker:** Create an independent worker process in `/worker` that scans `READY_FOR_PICKUP` orders, evaluates the 10-minute grace period, and applies the ₹20 late fee exactly once using atomic updates.
7. **Comprehensive Test Suite:** Implement automated tests across authentication, menu management, order lifecycle, slot reservations, background worker late-fee processing, and admin reporting.
8. **Preservation of Existing Frontend:** The Next.js frontend in `/src` remains fully intact and operable with existing demo flows until Phase 3 integration.

---

## 2. Current Architecture Assessment

### 2.1 Existing Frontend Structure
- **Framework:** Next.js 16.4.6 App Router, React 19.3.0, TypeScript 5, Tailwind CSS v4.
- **Client Mock Services (`src/services/`):**
  - `storage.ts`: SSR-safe `localStorage` wrapper.
  - `orderService.ts`: In-memory and local-storage order generation (`QL-1042`, token `A-12`), status progression, late-fee calculation.
  - `menuService.ts`: Local catalog CRUD, category queries, Item 86 availability toggle.
  - `configService.ts`: Pickup slot throttle (capacity 30, interval 15m), canteen hours, late fee policy config.
- **Client Mock State (`src/context/`):**
  - `AuthContext.tsx`: Tracks active role (`student`, `staff`, `admin`) and mocked user profile.
  - `CartContext.tsx`: Local shopping tray with item quantities and client-side financial calculations.
  - `ToastContext.tsx`: Reactive notification dispatch.
- **Demo Seed Data (`src/data/mockData.ts`):**
  - Initial users: Aarav Sharma (`student`), Ramesh Patel (`staff`), Dr. Ananya Iyer (`admin`).
  - 12 campus canteen menu items across breakfast, meals, quick bites, beverages, desserts.
  - 6 pickup slots (12:30 PM to 2:00 PM).
  - Config: 10-min grace period, ₹20 late fee, 5% tax, ₹10 packaging fee.

### 2.2 Vulnerabilities & Limitations of Mock Architecture
- **Client-Side Financial Authority:** The frontend currently calculates subtotals, taxes, and totals, which can be tampered with in untrusted browser environments.
- **Concurrency & Overbooking:** Slot booking currently performs read-modify-write in local browser memory; multiple simultaneous students would easily overbook slots.
- **State Fragmentation:** Staff and student portals operate on distinct local-storage states unless executed within the exact same browser tab session.
- **Volatile Timers:** Pickup deadlines rely on in-browser countdowns; if a student closes their tab or the kitchen browser restarts, deadline evaluations pause.

---

## 3. Proposed Backend & Worker Architecture

```
                                  +---------------------------------------+
                                  |   Next.js 16 App Router (Port 3000)   |
                                  |   (Existing Frontend in /src)         |
                                  +---------------------------------------+
                                                      |
                                           REST API (JSON / Cookies)
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |   Express.js Backend API (Port 5000)  |
                                  |   (/backend/src/server.ts)            |
                                  +---------------------------------------+
                                    |       |       |        |        |
                                [Helmet] [CORS] [RateLim] [AuthJWT] [ZodVal]
                                    |       |       |        |        |
                                    v       v       v        v        v
                                  +---------------------------------------+
                                  |   Controllers & Domain Services       |
                                  |   - AuthService   - OrderService      |
                                  |   - MenuService   - SlotService       |
                                  |   - AdminService  - AnalyticsService  |
                                  +---------------------------------------+
                                                      |
                                                Mongoose ODM
                                                      |
                                                      v
+-----------------------+         +---------------------------------------+
|  Standalone Worker    | ======= |           MongoDB Database            |
|  (/worker/src)        | (Mongoose)          (Port 27017)                |
|  - Late Fee Engine    |         |   - users           - orders          |
|  - Deadline Scanner   |         |   - menu_items      - pickup_slots    |
|  - Atomic $set / $inc |         |   - counters        - canteen_settings|
+-----------------------+         |   - order_history   - audit_logs      |
                                  +---------------------------------------+
```

### 3.1 Repository Directory Layout
```
queueless/
├── src/                          # Existing Next.js 16 frontend (Untouched in Phase 2)
├── backend/                      # Express.js REST API Server
│   ├── src/
│   │   ├── config/               # db.ts, env.ts, logger.ts
│   │   ├── models/               # User, MenuItem, Order, PickupSlot, Counter, CanteenSettings, OrderStatusHistory, AuditLog
│   │   ├── controllers/          # auth, user, menu, order, slot, staff, admin, settings, analytics
│   │   ├── services/             # Domain logic (order calculation, slot booking, analytics aggregation)
│   │   ├── routes/               # Express versioned routers (/api/v1/*)
│   │   ├── middleware/           # auth.ts, role.ts, rateLimiter.ts, validate.ts, errorHandler.ts
│   │   ├── validators/           # Zod validation schemas
│   │   ├── utils/                # response.ts, token.ts, timezone.ts (Asia/Kolkata), errors.ts
│   │   ├── types/                # Backend TypeScript types
│   │   ├── scripts/              # seed.ts (Idempotent seed script for initial admin & data)
│   │   ├── app.ts                # Express application setup (middleware pipeline)
│   │   └── server.ts             # Server entry point (starts HTTP server on PORT 5000)
│   ├── tests/                    # Integration & unit tests (Jest + Supertest)
│   │   ├── auth.test.ts
│   │   ├── menu.test.ts
│   │   ├── orders.test.ts
│   │   ├── slots.test.ts
│   │   └── admin.test.ts
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
├── worker/                       # Standalone Background Worker
│   ├── src/
│   │   ├── config/               # db.ts, env.ts, logger.ts
│   │   ├── jobs/                 # lateFeeScanner.ts, cleanupJob.ts
│   │   ├── services/             # lateFeeService.ts
│   │   └── index.ts              # Worker runner & graceful shutdown
│   ├── tests/
│   │   └── lateFeeWorker.test.ts
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
├── docs/                         # Architecture documentation
├── PHASE_02_IMPLEMENTATION_PLAN.md
├── API_DOCUMENTATION.md
├── DEVELOPMENT_LOG.md
└── PHASE_02_COMPLETION_REPORT.md
```

---

## 4. Database Schema & Data Models

All timestamps are stored as standard UTC `Date` objects in MongoDB, with presentation formatted to `Asia/Kolkata` (IST, UTC+05:30).

### 4.1 Users (`users`)
```typescript
interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;             // unique, lowercase, indexed
  passwordHash: string;      // bcrypt (cost factor 10)
  role: 'student' | 'staff' | 'admin';
  studentId?: string;        // rollNumber e.g., "2024CS1042" (indexed, sparse)
  department?: string;
  phone?: string;
  walletBalance: number;     // default 0, stored in paise or integer rupees (integer rupees >= 0)
  status: 'active' | 'suspended' | 'pending';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes:** `{ email: 1 }` (unique), `{ studentId: 1 }` (sparse, unique), `{ role: 1 }`.

### 4.2 MenuItems (`menu_items`)
```typescript
interface IMenuItem {
  _id: Types.ObjectId;
  name: string;              // e.g., "Crispy Masala Dosa"
  description: string;
  category: 'breakfast' | 'meals' | 'quick-bites' | 'beverages' | 'desserts';
  price: number;             // server price in rupees (positive integer)
  dietary: 'veg' | 'non-veg' | 'vegan';
  prepTimeMinutes: number;
  imageUrl: string;
  rating: number;            // e.g., 4.8
  reviewCount: number;
  isAvailable: boolean;      // Item 86 flag
  isSpecial: boolean;
  calories?: number;
  allergens: string[];
  addons: {
    name: string;
    price: number;
  }[];
  isArchived: boolean;       // Soft deletion flag
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes:** `{ category: 1, isAvailable: 1 }`, `{ name: 'text', description: 'text' }`.

### 4.3 PickupSlots (`pickup_slots`)
```typescript
interface IPickupSlot {
  _id: Types.ObjectId;
  slotCode: string;          // e.g., "SLOT-1230-1245"
  startTime: string;         // "12:30 PM"
  endTime: string;           // "12:45 PM"
  label: string;             // "12:30 PM – 12:45 PM"
  maxCapacity: number;       // default 30
  reservedCount: number;     // current booked count
  isActive: boolean;
  date: Date;                // specific service date (UTC midnight)
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes:** `{ date: 1, slotCode: 1 }` (compound unique), `{ isActive: 1 }`.

### 4.4 Orders (`orders`)
```typescript
interface IOrderItemSnapshot {
  menuItemId: Types.ObjectId;
  name: string;
  unitPrice: number;         // Historical price snapshot
  quantity: number;
  selectedAddons: {
    name: string;
    price: number;
  }[];
  itemTotal: number;         // (unitPrice + addonPrices) * quantity
}

interface IOrder {
  _id: Types.ObjectId;
  orderNumber: string;       // e.g. "QL-1042" (unique, indexed)
  tokenNumber: string;       // e.g. "A-12" (indexed)
  student: Types.ObjectId;   // Ref to User
  studentName: string;
  studentRollNo: string;
  studentPhone: string;
  items: IOrderItemSnapshot[];
  subtotal: number;
  tax: number;
  packagingFee: number;
  lateFeeApplied: number;    // 0 or 20
  total: number;             // subtotal + tax + packagingFee + lateFeeApplied
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'CANCELLED' | 'REJECTED';
  pickupSlot: Types.ObjectId;// Ref to PickupSlot
  pickupSlotLabel: string;
  counterId: string;         // e.g., "COUNTER-02"
  paymentMethod: 'counter_cash' | 'campus_wallet' | 'upi';
  paymentStatus: 'pending' | 'collected' | 'refunded';
  readyAt?: Date;            // Recorded when status -> READY_FOR_PICKUP
  pickupDeadline?: Date;     // readyAt + 10 mins grace period
  collectedAt?: Date;        // Recorded when status -> PICKED_UP
  rejectionReason?: string;
  idempotencyKey?: string;   // Unique client request key (indexed, sparse)
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes:** `{ orderNumber: 1 }` (unique), `{ student: 1, createdAt: -1 }`, `{ status: 1, pickupDeadline: 1, lateFeeApplied: 1 }`, `{ idempotencyKey: 1 }` (sparse, unique).

### 4.5 Counters (`counters`)
```typescript
interface ICounter {
  _id: Types.ObjectId;
  counterIdentifier: string; // e.g. "COUNTER-02" (unique)
  name: string;              // "Express Meals & Bowls Counter"
  assignedCategories: string[];
  activeOperatorId?: Types.ObjectId;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.6 CanteenSettings (`canteen_settings`)
```typescript
interface ICanteenSettings {
  _id: Types.ObjectId;
  singletonKey: string;      // default "CANTEEN_GLOBAL_SETTINGS"
  isOpen: boolean;
  operatingHours: {
    openTime: string;        // "08:00 AM"
    closeTime: string;       // "07:00 PM"
  };
  announcement?: string;
  slotIntervalMinutes: number; // default 15
  defaultSlotCapacity: number; // default 30
  packagingCharge: number;     // default 10
  taxRatePercent: number;      // default 5
  gracePeriodMinutes: number;  // default 10
  lateFeeAmount: number;       // default 20
  isLateFeeEnabled: boolean;   // default true
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}
```

### 4.7 OrderStatusHistory (`order_status_history`)
```typescript
interface IOrderStatusHistory {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;   // Ref to Order (indexed)
  previousStatus?: string;
  newStatus: string;
  changedBy: Types.ObjectId; // Ref to User
  actorRole: 'student' | 'staff' | 'admin' | 'system_worker';
  reason?: string;
  timestamp: Date;
}
```
**Indexes:** `{ orderId: 1, timestamp: -1 }`.

### 4.8 AuditLogs (`audit_logs`)
```typescript
interface IAuditLog {
  _id: Types.ObjectId;
  actorId?: Types.ObjectId;  // Ref to User
  actorRole: string;
  action: string;            // e.g. "MENU_ITEM_EDIT", "SLOT_OVERRIDE", "LATE_FEE_APPLIED"
  resourceType: string;      // e.g. "MenuItem", "CanteenSettings", "Order"
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
```
**Indexes:** `{ action: 1, timestamp: -1 }`, `{ resourceType: 1, resourceId: 1 }`.

---

## 5. API Endpoint Specifications

All endpoints are prefixed with `/api/v1`.

### 5.1 Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new student (`rollNumber` required, password hashed) |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user; returns JWT & sets HTTP-only cookie |
| `POST` | `/api/v1/auth/logout` | Authenticated | Clears auth session cookie |
| `GET` | `/api/v1/auth/me` | Authenticated | Returns authenticated user profile |

### 5.2 Users (`/api/v1/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/api/v1/users/profile` | Student/Staff/Admin | Update name, phone, notification preferences |
| `POST` | `/api/v1/users/wallet/topup` | Student/Admin | Add balance to campus digital wallet |

### 5.3 Menu & Inventory (`/api/v1/menu`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/menu` | Public | List menu items with search, category & diet filtering |
| `GET` | `/api/v1/menu/:id` | Public | Retrieve single dish details and add-on options |
| `POST` | `/api/v1/menu` | Admin | Create a new dish |
| `PUT` | `/api/v1/menu/:id` | Admin | Full update of dish specifications and pricing |
| `PATCH` | `/api/v1/menu/:id/availability` | Staff, Admin | One-tap Item 86 toggle (availability status) |
| `DELETE` | `/api/v1/menu/:id` | Admin | Soft delete / archive menu item |

### 5.4 Pickup Slots (`/api/v1/slots`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/slots` | Public | List today's slots with real-time capacity and occupancy status |
| `GET` | `/api/v1/slots/:id` | Public | Get specific slot details |
| `POST` | `/api/v1/slots/seed` | Admin | Generate or reset slot schedule for current date |

### 5.5 Order Management (`/api/v1/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders` | Student | Create pre-order with atomic slot reservation & price verification |
| `GET` | `/api/v1/orders/my-orders` | Student | List active and historical orders for current student |
| `GET` | `/api/v1/orders/:id` | Student, Staff, Admin| Get individual order tracking details (student owns or staff/admin) |
| `PATCH` | `/api/v1/orders/:id/status` | Staff, Admin | Progress lifecycle (`ACCEPTED`, `PREPARING`, `READY_FOR_PICKUP`, `PICKED_UP`, `REJECTED`) |
| `POST` | `/api/v1/orders/:id/cancel` | Student, Admin | Cancel order if eligible (`PLACED` only) and release reserved slot |

### 5.6 Staff Terminal (`/api/v1/staff`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/staff/dashboard` | Staff, Admin | Operational queue counts (incoming, cooking, ready, completed) |
| `GET` | `/api/v1/staff/incoming` | Staff, Admin | Incoming tickets requiring kitchen acceptance |
| `GET` | `/api/v1/staff/preparation` | Staff, Admin | Active cooking queue |
| `GET` | `/api/v1/staff/ready` | Staff, Admin | Ready orders staged at express pickup counter with token filter |
| `POST` | `/api/v1/staff/orders/:id/handover` | Staff, Admin | Confirm physical handover to student |

### 5.7 Administration & Settings (`/api/v1/admin`, `/api/v1/settings`, `/api/v1/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/orders` | Admin | Master order register with pagination and status filters |
| `GET` | `/api/v1/settings` | Public | Fetch current operating hours, tax, packaging, and policies |
| `PUT` | `/api/v1/settings` | Admin | Update canteen configuration, late fee grace period, slot limits |
| `GET` | `/api/v1/analytics/dashboard` | Admin | Revenue, AOV, volume metrics, and hourly rush distribution |
| `GET` | `/api/v1/analytics/export-csv` | Admin | CSV-formatted export of all orders, revenue, and audit trails |

---

## 6. Authentication, Security & Validation Design

### 6.1 Authentication Pipeline
- **Password Security:** Hashes passwords with `bcryptjs` (salt rounds: 10). Plaintext passwords are never logged or stored.
- **JWT Session Tokens:** Signed with `JWT_SECRET` and a strict 24-hour expiration (`expiresIn: '24h'`).
- **Cookie Security:** Auth tokens are set via `Set-Cookie` with `httpOnly: true`, `sameSite: 'lax'`, and `secure: process.env.NODE_ENV === 'production'`. Fallback `Authorization: Bearer <token>` header is also supported for developer/CLI testing.
- **Role-Based Access Control (RBAC):** Middleware checks `req.user.role` against route permission lists:
  - `authorize('admin')`
  - `authorize('staff', 'admin')`
  - `authorize('student', 'staff', 'admin')`

### 6.2 Security Hardening
- **Rate Limiting:** Protect `/api/v1/auth/*` with `express-rate-limit` (max 10 attempts per minute per IP).
- **Helmet Headers:** Integrated for standard Content Security Policy, XSS filtering, frameguard.
- **CORS Allowlist:** Configured to strictly accept `http://localhost:3000` (and production domain), preventing cross-origin credential leaks.
- **Idempotency Protection:** Order creation accepts an optional `Idempotency-Key` header to block double-charges on network retries.

---

## 7. Slot Capacity & Concurrency Control

When an order is submitted:
1. The server extracts the requested `pickupSlotId`.
2. It executes an atomic MongoDB find-and-modify:
   ```typescript
   const reservedSlot = await PickupSlot.findOneAndUpdate(
     {
       _id: slotId,
       isActive: true,
       $expr: { $lt: ['$reservedCount', '$maxCapacity'] }
     },
     { $inc: { reservedCount: 1 } },
     { new: true }
   );
   ```
3. If `reservedSlot` is `null`, the slot is full or unavailable; the order creation immediately fails with HTTP `409 Conflict` ("Selected pickup slot has reached maximum kitchen capacity").
4. If an order in `PLACED` status is cancelled or rejected, the reserved count is atomically decremented:
   ```typescript
   await PickupSlot.findByIdAndUpdate(order.pickupSlot, { $inc: { reservedCount: -1 } });
   ```

---

## 8. Background Worker & Late Fee Engine Design

The worker runs as an independent Node.js process in `/worker/src/index.ts`.

### 8.1 Business Rules & Processing Flow
- **Trigger Condition:** Orders in status `READY_FOR_PICKUP` where:
  - `pickupDeadline < new Date()` (grace period expired)
  - `lateFeeApplied === 0` (fee not yet charged)
- **Atomic Application:**
  ```typescript
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: candidateOrder._id,
      status: 'READY_FOR_PICKUP',
      pickupDeadline: { $lt: new Date() },
      lateFeeApplied: 0
    },
    {
      $set: { lateFeeApplied: 20 },
      $inc: { total: 20 }
    },
    { new: true }
  );
  ```
- **Exactly-Once Guarantee:** The query condition `{ lateFeeApplied: 0 }` guarantees that even if multiple worker loops or restarts run simultaneously, no order will ever be charged more than once.
- **Audit Logging:** An entry is appended to `order_status_history` and `audit_logs` documenting `actorRole: 'system_worker'`.
- **Interval & Loop:** Runs periodically every 15 seconds. Survives crashes and restarts through database-driven state.

---

## 9. Implementation Milestones

### Milestone 1: Workspace & Tooling Setup
- Initialize `/backend` and `/worker` packages with TypeScript 5, Express, Mongoose, and dev scripts.
- Configure `tsconfig.json`, `.env.example`, and ESLint/Prettier configs.

### Milestone 2: MongoDB Connection & Data Models
- Build database connection manager with graceful reconnection logic.
- Implement 8 Mongoose models with strict schemas, validation, and compound indexes.
- Create idempotent `seed.ts` script to populate demo users, menu items, slots, counters, and initial configuration matching Phase 1.

### Milestone 3: Middleware, Security & Authentication APIs
- Implement centralized error handler, API response formatter, and Zod validator.
- Implement `authMiddleware` and `roleMiddleware`.
- Build `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/me`.

### Milestone 4: Menu, Inventory & Slot APIs
- Implement `/api/v1/menu` (list, filter, get, create, update, delete, Item 86 toggle).
- Implement `/api/v1/slots` with real-time occupancy calculations.

### Milestone 5: Order Lifecycle & State Progression
- Implement server-side order calculation and atomic slot reservation.
- Implement `/api/v1/orders` and `/api/v1/orders/:id/status`.
- Support order cancellation and audit trail logging.

### Milestone 6: Kitchen Staff & Admin Analytics Endpoints
- Implement kitchen queue views (`/api/v1/staff/*`).
- Implement administrative configuration and analytics aggregation (`/api/v1/analytics/*`, `/api/v1/settings`).
- Build CSV export endpoint.

### Milestone 7: Standalone Background Worker
- Implement `/worker` process with deadline polling loop, atomic late-fee application, and audit logging.

### Milestone 8: Automated Testing, Documentation & Final Audit
- Write comprehensive integration tests in `backend/tests` and `worker/tests`.
- Create `API_DOCUMENTATION.md`.
- Run full regression check on frontend (`npm run lint`, `npx tsc --noEmit`, `npm run build`).
- Verify independent runnability of frontend, backend, and worker.
- Produce `PHASE_02_COMPLETION_REPORT.md` and update `DEVELOPMENT_LOG.md`.

---

## 10. Files to Create and Modify

### New Files to Create
```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── db.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── MenuItem.ts
│   │   ├── PickupSlot.ts
│   │   ├── Order.ts
│   │   ├── Counter.ts
│   │   ├── CanteenSettings.ts
│   │   ├── OrderStatusHistory.ts
│   │   └── AuditLog.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validate.ts
│   ├── validators/
│   │   ├── auth.schema.ts
│   │   ├── menu.schema.ts
│   │   ├── order.schema.ts
│   │   └── settings.schema.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── menuController.ts
│   │   ├── orderController.ts
│   │   ├── slotController.ts
│   │   ├── staffController.ts
│   │   ├── adminController.ts
│   │   ├── settingsController.ts
│   │   └── analyticsController.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── menuService.ts
│   │   ├── orderService.ts
│   │   ├── slotService.ts
│   │   └── analyticsService.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── menuRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── slotRoutes.ts
│   │   ├── staffRoutes.ts
│   │   ├── adminRoutes.ts
│   │   ├── settingsRoutes.ts
│   │   └── analyticsRoutes.ts
│   ├── utils/
│   │   ├── response.ts
│   │   ├── timezone.ts
│   │   └── errors.ts
│   ├── types/
│   │   └── index.ts
│   └── scripts/
│       └── seed.ts
└── tests/
    ├── setup.ts
    ├── auth.test.ts
    ├── menu.test.ts
    ├── orders.test.ts
    ├── slots.test.ts
    └── admin.test.ts

worker/
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── index.ts
│   ├── config/
│   │   ├── db.ts
│   │   └── env.ts
│   ├── jobs/
│   │   └── lateFeeScanner.ts
│   └── services/
│       └── lateFeeService.ts
└── tests/
    └── worker.test.ts

Root/
├── PHASE_02_IMPLEMENTATION_PLAN.md
├── API_DOCUMENTATION.md
├── PHASE_02_COMPLETION_REPORT.md
└── DEVELOPMENT_LOG.md (updated)
```

---

## 11. Verification Checklist & Success Criteria

- [ ] MongoDB connection succeeds on standard port 27017.
- [ ] Database seeds cleanly with initial demo users, menu items, slots, counters, and settings.
- [ ] Backend starts independently on `http://localhost:5000`.
- [ ] Worker starts independently and logs scanning activity.
- [ ] Passwords stored strictly as bcrypt hashes.
- [ ] JWT tokens issued and authenticated via HTTP-only cookies and Bearer headers.
- [ ] Order creation verifies actual database prices, disallowing client tampering.
- [ ] Concurrency testing confirms slot capacity cannot be exceeded.
- [ ] Background worker atomically marks late fee once only when deadline expires.
- [ ] All automated tests pass (`npm test` in backend and worker).
- [ ] Existing Next.js frontend continues to compile with 0 errors and 0 warnings (`npm run lint`, `npx tsc --noEmit`, `npm run build`).
- [ ] No git commits or pushes without explicit user authorization.

