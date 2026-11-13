# QueueLess — Phase 2 Completion Report
## Backend & Database Engineering

**Project:** QueueLess — Smart Campus Canteen Pre-Ordering and Queue Management System  
**Phase:** Phase 2 (Backend & Database Engineering)  
**Date:** November 13, 2026  
**Status:** Approved & Ready for Phase 3 Integration  
**Lead Engineer:** Antigravity AI Assistant  

---

## 1. Executive Summary

Phase 2 successfully delivered the complete, independent, enterprise-grade backend infrastructure and persistent database layer for QueueLess, without modifying or disturbing the existing Phase 1/1.1 Next.js 16 frontend.

The system now comprises two independent server components:
1. **QueueLess REST API (`backend/`):** Running on port 5000, powered by Express.js, TypeScript, Mongoose, and MongoDB. It implements authentication, role-based authorization, menu inventory management, capacity-metered pickup slot scheduling, server-side price calculation, order lifecycle progression, and real-time kitchen operations.
2. **QueueLess Background Worker (`worker/`):** An independent worker daemon running on a 15-second polling cadence to detect orders that exceed their collection grace period and atomically enforce late-fee warming penalties with an exactly-once guarantee.

---

## 2. Architecture & Service Topology

```
+-------------------------------------------------------------+
|               Next.js 16 Frontend (Port 3000)               |
|            - App Router  - React 19  - Tailwind v4          |
+-------------------------------------------------------------+
                              |
                     REST JSON / Cookies
                              |
                              v
+-------------------------------------------------------------+
|               Express.js REST API (Port 5000)               |
|        - Helmet  - CORS  - Rate Limiter  - JWT Cookie       |
|        - Zod Request Validators  - Centralized Errors       |
|        - Order Service (Server-calculated pricing)          |
|        - Slot Service (Atomic find-and-modify concurrency)  |
+-------------------------------------------------------------+
               |                               |
               |                               |
               v                               v
+-------------------------------+   +-------------------------+
|     MongoDB (Port 27017)      |   |   Background Worker     |
| - users        - orders       | < |   (/worker/src)         |
| - menu_items   - pickup_slots |   | - 15s Deadline Scanner  |
| - counters     - settings     |   | - Atomic $set / $inc    |
| - order_status - audit_logs   |   | - Exactly-Once Penalty  |
+-------------------------------+   +-------------------------+
```

---

## 3. Database Models & Schema Design (`backend/src/models/`)

All timestamps are stored as standard UTC `Date` objects in MongoDB, with presentation formatted to `Asia/Kolkata` (IST, UTC+05:30).

| Model | Collection | Primary Responsibility & Indexes |
| :--- | :--- | :--- |
| `User` | `users` | Student, staff, and admin identities with bcrypt password hash (hidden by default), campus digital wallet balance, student roll number. Indexes: `{ email: 1 }` (unique), `{ studentId: 1 }` (sparse, unique), `{ role: 1 }`. |
| `MenuItem` | `menu_items` | Dishes categorized by meals/breakfast/beverages with dietary tags, preparation times, server-enforced pricing, Item 86 availability toggle, and soft-delete archiving. Indexes: `{ category: 1, isAvailable: 1, isArchived: 1 }`, text index on `{ name, description }`. |
| `PickupSlot` | `pickup_slots` | 15-minute time windows with live capacity tracking (`maxCapacity`, `reservedCount`) and virtual `isAvailable`. Compound unique index: `{ date: 1, slotCode: 1 }`. |
| `Order` | `orders` | Complete order ticket with sequential order number (`QL-XXXX`), counter token (`A-XX`), immutable item price snapshots, server-calculated totals, status, and pickup deadline. Indexes: `{ orderNumber: 1 }` (unique), `{ student: 1, createdAt: -1 }`, `{ status: 1, pickupDeadline: 1, lateFeeApplied: 1 }`. |
| `Counter` | `counters` | Physical counter stations (`COUNTER-01`, etc.) mapped to dish categories. |
| `CanteenSettings`| `canteen_settings`| Singleton document (`CANTEEN_GLOBAL_SETTINGS`) storing operating hours, packaging fee, tax rate, grace period, and late fee toggle. |
| `OrderStatusHistory`| `order_status_history`| Complete audit trail recording status changes, actor roles, reasons, and timestamps. |
| `AuditLog` | `audit_logs` | System and administrative audit log for settings edits and worker penalties. |

---

## 4. Key Business Logic & Engineering Guarantees

### 4.1 Zero-Tamper Server Pricing
Client prices, subtotals, and totals are never trusted. When a student submits an order:
1. Dish IDs are fetched directly from MongoDB (`isArchived: false`).
2. Addon prices are validated against the database.
3. Subtotal is computed as `sum((itemPrice + addonPrice) * quantity)`.
4. Packaging fee and tax rate (5%) are fetched from `CanteenSettings`.
5. Total is computed and validated before order creation.

### 4.2 Race-Free Pickup Slot Allocation
To handle simultaneous class breaks without overbooking, slot booking executes an atomic MongoDB find-and-modify operation:
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
If the slot is full, the query returns `null` and the API rejects the request with HTTP `409 Conflict`. If an order is cancelled or rejected while in `PLACED` status, the slot count is atomically decremented.

### 4.3 Exactly-Once Late-Fee Penalty
The background worker guarantees that overdue orders are charged exactly once:
```typescript
const updatedOrder = await Order.findOneAndUpdate(
  {
    _id: candidate._id,
    status: 'READY_FOR_PICKUP',
    pickupDeadline: { $lt: now },
    lateFeeApplied: 0
  },
  {
    $set: { lateFeeApplied: 20 },
    $inc: { total: 20 }
  },
  { new: true }
);
```
The condition `lateFeeApplied: 0` ensures that repeated scans or multiple worker instances cannot double-charge an order.

---

## 5. Security & Authentication Architecture

1. **Password Security:** `bcryptjs` with 10 salt rounds. Plaintext passwords are never logged, returned in responses, or stored in plaintext.
2. **Session Delivery:** Signed JWTs (24h lifespan) delivered via HTTP-only cookie with `SameSite=Lax` and secure flags, with fallback support for `Authorization: Bearer <token>` headers.
3. **Role-Based Access Control (RBAC):** Express middleware gates routes based on role (`student`, `staff`, `admin`).
4. **Rate Limiting:** Auth endpoints (`/api/v1/auth/*`) are protected against brute force by `express-rate-limit` (15 attempts/minute).
5. **Idempotency Protection:** Order creation supports an optional `Idempotency-Key` header to prevent double-charging on network retries.

---

## 6. Test Suite & Verification Results

### 6.1 Backend Test Results (`backend/`)
```
PASS tests/menu.test.ts
  Menu Catalog & Inventory Endpoints
    ✓ should list public menu catalog without requiring auth (19 ms)
    ✓ should filter menu items by category (18 ms)
    ✓ should filter menu items by dietary restriction (5 ms)
    ✓ should allow staff to toggle dish availability (Item 86) (19 ms)
    ✓ should forbid student from toggling item availability (7 ms)
    ✓ should allow admin to create a new menu item (19 ms)

PASS tests/orders.test.ts
  Order Lifecycle & Concurrency Endpoints
    ✓ should place a new pre-order and compute exact pricing on the server (49 ms)
    ✓ should list user orders under /api/v1/orders/my-orders (4 ms)
    ✓ should retrieve individual order tracking details with audit history (10 ms)
    ✓ should progress order lifecycle: PLACED -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP (28 ms)
    ✓ should confirm handover at pickup counter via staff terminal (8 ms)
    ✓ should allow student to cancel order when in PLACED status and release slot (31 ms)

PASS tests/slots.test.ts
  Pickup Slot Scheduling & Capacity Endpoints
    ✓ should list pickup slots for current date with capacity counts (19 ms)
    ✓ should reject slot booking when slot capacity is exhausted (100 ms)

PASS tests/auth.test.ts
  Authentication & User Profile Endpoints
    ✓ should register a new student user successfully (94 ms)
    ✓ should fail registration when duplicate email is submitted (5 ms)
    ✓ should authenticate user with valid credentials (59 ms)
    ✓ should reject login with wrong password (58 ms)
    ✓ should retrieve authenticated user profile via /auth/me (5 ms)
    ✓ should reject unauthenticated request to /auth/me (2 ms)
    ✓ should top up wallet balance (5 ms)

PASS tests/admin.test.ts
  Administration, Settings & Analytics Endpoints
    ✓ should allow admin to view paginated orders register (12 ms)
    ✓ should forbid student from accessing admin orders register (3 ms)
    ✓ should allow fetching canteen global settings (3 ms)
    ✓ should allow admin to update canteen settings (6 ms)
    ✓ should retrieve business analytics metrics for admin dashboard (12 ms)
    ✓ should generate CSV export of orders (4 ms)

Test Suites: 5 passed, 5 total
Tests:       27 passed, 27 total (100% pass rate)
```

### 6.2 Worker Test Results (`worker/`)
```
PASS tests/lateFeeWorker.test.ts
  Background Worker — Late Fee Engine & Deadline Scanner
    ✓ should scan and atomically apply late fee to overdue order (27 ms)
    ✓ should guarantee exactly-once processing (idempotency check) (4 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total (100% pass rate)
```

### 6.3 Frontend Integrity Check (Zero Regression)
- `npx tsc --noEmit` (Root Next.js): **0 errors**
- `npm run lint` (Root Next.js): **0 errors, 0 warnings**
- `npm run build` (Root Next.js): **Compiled successfully in 654ms across all 26 routes**
- Existing mock demo switcher and UI remain 100% intact and functional.

---

## 7. Deliverables Summary

| Artifact | Location | Purpose |
| :--- | :--- | :--- |
| Implementation Plan | [PHASE_02_IMPLEMENTATION_PLAN.md](file:///Users/srujan/Beast/Coding/queueless/PHASE_02_IMPLEMENTATION_PLAN.md) | Architectural roadmap, schema definitions, and design specifications. |
| Backend Package | [backend/](file:///Users/srujan/Beast/Coding/queueless/backend) | Complete Express REST API server with controllers, models, routes, services, middleware, validators, seed script, and automated tests. |
| Background Worker | [worker/](file:///Users/srujan/Beast/Coding/queueless/worker) | Standalone background worker daemon for automatic collection deadline scanning and late-fee processing. |
| API Documentation | [API_DOCUMENTATION.md](file:///Users/srujan/Beast/Coding/queueless/API_DOCUMENTATION.md) | Comprehensive API endpoint reference with request/response schemas and cURL examples. |
| Development Log | [DEVELOPMENT_LOG.md](file:///Users/srujan/Beast/Coding/queueless/DEVELOPMENT_LOG.md) | Chronological log of engineering milestones and implementation details. |
| Completion Report | [PHASE_02_COMPLETION_REPORT.md](file:///Users/srujan/Beast/Coding/queueless/PHASE_02_COMPLETION_REPORT.md) | Final audit and verification summary for Phase 2. |

---

## 8. Next Steps: Phase 3 Preview

Phase 2 backend and database foundations are complete, fully tested, and ready. In Phase 3, we will:
1. Create a unified frontend API client (`src/services/api/`) pointing to `http://localhost:5000/api/v1`.
2. Seamlessly connect the student checkout, menu catalog, and tracking screens to real MongoDB endpoints.
3. Connect the staff and admin portals to live backend feeds with real-time updates.
4. Provide a dual-mode toggle (Live Backend vs. Offline Demo) so campus demos remain accessible anytime.
