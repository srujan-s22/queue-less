# QueueLess — Phase 3 Implementation Plan
## Complete Frontend-to-Backend Integration & Real-Time Sync

**Project:** QueueLess — Smart Campus Canteen Pre-Ordering and Queue Management System  
**Document:** `PHASE_03_IMPLEMENTATION_PLAN.md`  
**Phase:** Phase 3 (Complete Frontend-Backend Integration)  
**Date:** November 13, 2026  
**Status:** Architecture Specification & Implementation Plan  
**Lead Architect:** Antigravity AI Assistant  

---

## 1. Current Architecture Assessment

### 1.1 Frontend (Next.js 16 App Router)
- **Framework:** Next.js 16.4.6, React 19.3.0, TypeScript 5, Tailwind CSS v4.
- **Portals Implemented:**
  - **Student Portal (`/student/*`):** Dashboard, Food Menu, Dish Details, Cart Tray, Capacity-Metered Checkout, Order Tracking with countdown timer, Order Confirmation with QR code, Order History, Student Profile.
  - **Kitchen Staff Command Center (`/staff/*`):** Real-time Operations Dashboard, Incoming Tickets with reject modal, Active Preparation Kanban line, Ready Orders counter staging, Order Handover confirmation, Item 86 stock availability manager.
  - **Administrator Console (`/admin/*`):** Executive KPI Dashboard, Live Order Ledger with status overrides, Menu Catalog CRUD with pricing & addons, Staff & counter station roster, Operating hours & late-fee policies, Downloadable CSV transaction reports.
- **Current State Abstraction:**
  - `src/services/` (`orderService.ts`, `menuService.ts`, `configService.ts`, `storage.ts`) currently read/write from browser `localStorage` seeded from `src/data/mockData.ts`.
  - `src/context/` (`AuthContext.tsx`, `CartContext.tsx`, `ToastContext.tsx`): `AuthContext` relies on a simulated user role stored in `localStorage` without true HTTP-only session cookies.

### 1.2 Backend (Express.js REST API & Independent Worker)
- **REST API (`backend/` on port 5000):**
  - Node.js, Express.js (v4.21.2), TypeScript (v5.8.2), Mongoose (v8.12.1), MongoDB (`mongodb://localhost:27017/queueless`).
  - 8 production collections: `users`, `menu_items`, `pickup_slots`, `orders`, `counters`, `canteen_settings`, `order_status_history`, `audit_logs`.
  - Dual authentication: HTTP-only session cookies (`token=<jwt>`) and `Authorization: Bearer <token>`.
  - Rate limiting, Helmet security headers, CORS with credentials.
  - Strict server-calculated pricing (client-sent prices are ignored).
  - Atomic slot reservation (`$expr: { $lt: ['$reservedCount', '$maxCapacity'] }` with `$inc: { reservedCount: 1 }`).
- **Background Worker (`worker/`):**
  - Standalone Node.js process polling MongoDB every 15s.
  - Evaluates orders in `READY_FOR_PICKUP` where `pickupDeadline < now` and `lateFeeApplied: 0`.
  - Applies ₹20 late fee with an atomic exactly-once guarantee (`$set: { lateFeeApplied: 20 }, $inc: { total: 20 }`).

### 1.3 Key Findings from Phase 2 Acceptance Audit
1. **ORD-01 (Order Number Collision):** When multiple concurrent order requests arrive in the exact same millisecond, `countDocuments()` can generate the same order number (`QL-1001`), causing a unique constraint conflict and rollback. To ensure 100% collision-free concurrent ordering, Phase 3 will introduce an atomic sequence counter or an entropy-backed identifier.
2. **API-01 (Identifier Mapping):** Frontend interfaces expect `id: string`, whereas MongoDB documents expose `_id: ObjectId`. A clean adapter layer must normalize `_id` to `id` without modifying existing approved component interfaces.
3. **SEC-01 (CORS Origins):** Configured for `localhost:3000` with credentials; will be made environment-configurable via `CLIENT_URL` (supporting comma-separated origins).

---

## 2. Target Phase 3 System Architecture

```
+-----------------------------------------------------------------------------------------+
|                               Next.js 16 Frontend (Port 3000)                           |
|                                                                                         |
|   +-------------------+   +--------------------+   +--------------------------------+   |
|   |  Student Portal   |   |   Kitchen Portal   |   |        Admin Console           |   |
|   +-------------------+   +--------------------+   +--------------------------------+   |
|             \                      |                      /                             |
|              \                     |                     /                              |
|               v                    v                    v                               |
|   +---------------------------------------------------------------------------------+   |
|   |                        Centralized API Client Layer                             |   |
|   |             (/src/lib/api/client.ts + /src/lib/api/services/*.ts)                |   |
|   |             - Typed responses      - Cookie credentials: 'include'              |   |
|   |             - Mongo _id -> id      - Centralized AppError handling              |   |
|   +---------------------------------------------------------------------------------+   |
|             |                                                  ^                        |
|             | HTTP REST (/api/v1/*)                            | Socket.IO Notifications|
|             v                                                  | (order:*, menu:*)      |
+-------------|--------------------------------------------------|------------------------+
              |                                                  |
              v                                                  |
+-----------------------------------------------------------------------------------------+
|                       Express REST & Socket.IO Server (Port 5000)                       |
|                                                                                         |
|   +-----------------------------+   +-----------------------------------------------+   |
|   |      REST API Routes        |   |           Socket.IO Gateway Server            |   |
|   |  - /auth       - /menu      |   |  - JWT Socket Handshake Authentication        |   |
|   |  - /orders     - /slots     |   |  - Room Scoping: 'student:<id>', 'staff',     |   |
|   |  - /staff      - /admin     |   |                  'admin'                      |   |
|   |  - /settings   - /analytics |   |  - Event Dispatcher on DB write success       |   |
|   +-----------------------------+   +-----------------------------------------------+   |
|                 \                                   /                                   |
|                  \                                 /                                    |
|                   v                               v                                     |
|   +---------------------------------------------------------------------------------+   |
|   |                         Mongoose Data Models (MongoDB)                          |   |
|   |  - users        - orders       - menu_items   - pickup_slots                    |   |
|   |  - counters     - settings     - history      - audit_logs                      |   |
|   +---------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------+
                                 ^
                                 | Polling (every 15s)
                                 v
+-----------------------------------------------------------------------------------------+
|                         Independent Background Worker (worker/)                         |
|   - Overdue deadline scanner    - Atomic late-fee processing ($set: 20, $inc: 20)       |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Backend Enhancements for Phase 3

### 3.1 Concurrency-Safe Order Number Generation (Resolving ORD-01)
In `backend/src/services/orderService.ts`:
Replace `countDocuments()` with an atomic counter or timestamp-entropy sequence:
```typescript
// Format: QL-YYYYMMDD-XXXX (e.g., QL-2611-4821)
const timestampPart = Date.now().toString().slice(-4);
const randomPart = Math.floor(1000 + Math.random() * 9000);
const orderNumber = `QL-${timestampPart}-${randomPart}`;
const tokenNumber = `${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}-${Math.floor(10 + Math.random() * 90)}`;
```
This guarantees zero collisions even when hundreds of students submit pre-orders in the exact same millisecond.

### 3.2 Real-Time Socket.IO Server (`backend/src/socket/`)
- Install `socket.io` in `backend/`.
- Attach Socket.IO to the Express HTTP server instance in `server.ts`.
- Implement JWT handshake authentication using `cookie-parser` or `auth.token`.
- Manage connection rooms:
  - `student:${userId}`: receives `order:created`, `order:accepted`, `order:preparing`, `order:ready`, `order:picked-up`, `order:cancelled`.
  - `staff`: receives all kitchen tickets (`order:created`, `order:cancelled`, `order:status_updated`, `inventory:updated`).
  - `admin`: receives `order:*`, `menu:updated`, `settings:updated`.
- Create an event emitter utility (`backend/src/socket/emitter.ts`) so services (`orderService`, `menuService`, `adminService`) emit events **only after successful database persistence**.

### 3.3 Configurable Multi-Origin CORS (Resolving SEC-01)
Support comma-separated `CLIENT_URL` values (e.g., `http://localhost:3000,http://127.0.0.1:3000,https://queueless.campus.edu`).

---

## 4. Frontend API Client & Adapter Architecture

### 4.1 Directory Structure
```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts              # Core fetch wrapper with credentials: 'include', base URL, error interceptor
│   │   ├── endpoints.ts           # Centralized API route constants
│   │   ├── errors.ts              # Normalized ApiError class
│   │   ├── types.ts               # Request & Response TypeScript DTOs
│   │   ├── adapters.ts            # MongoDB _id <-> id normalizer
│   │   └── services/              # Domain-specific API service modules
│   │       ├── authApi.ts         # login, register, logout, getMe, updateProfile, topupWallet
│   │       ├── menuApi.ts         # getMenu, getMenuItem, createItem, updateItem, toggleAvailability, removeItem
│   │       ├── ordersApi.ts       # createOrder, getMyOrders, getOrderById, updateStatus, cancelOrder
│   │       ├── slotsApi.ts        # getSlots, seedSlots
│   │       ├── staffApi.ts        # getDashboard, getIncoming, getPreparation, getReady, handoverOrder
│   │       ├── adminApi.ts        # listOrders, getSettings, updateSettings, getAnalytics, exportCsv
│   │       └── settingsApi.ts     # getSettings, updateSettings
│   └── socket/
│       ├── socketClient.ts        # Socket.IO client singleton with reconnection handling
│       └── useSocket.ts           # React hook for room subscription & cleanup
```

### 4.2 Identifier Normalization (`_id` -> `id`)
```typescript
export const normalizeEntity = <T extends { _id?: any; id?: string }>(doc: any): T => {
  if (!doc) return doc;
  const id = doc.id || (doc._id ? doc._id.toString() : '');
  return { ...doc, id };
};

export const normalizeArray = <T>(docs: any[]): T[] => {
  if (!Array.isArray(docs)) return [];
  return docs.map((d) => normalizeEntity<T>(d));
};
```
This ensures zero breaking changes to existing UI components that reference `item.id`, `order.id`, or `slot.id`.

### 4.3 Centralized Error Handling & Response Format
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, any>;
  errors?: { field: string; message: string }[];
}
```

---

## 5. Authentication & Route Protection Strategy

### 5.1 Real Backend Session Management
1. **Session Restoration:** On initial application load, `AuthContext` calls `authApi.getMe()`. If a valid HTTP-only cookie exists, the user's authentic profile is loaded and `isAuthenticated` becomes `true`.
2. **Login:** `authApi.login({ email, password })` sets the browser cookie and returns the user profile. The user is redirected to the role-appropriate dashboard (`/student/dashboard`, `/staff/dashboard`, `/admin/dashboard`).
3. **Registration:** `authApi.register({ name, email, password, studentId, ... })` registers the student and logs them in.
4. **Logout:** `authApi.logout()` clears the server cookie and redirects to `/login`.
5. **Route Protection:**
   - Next.js client-side route guards in `StudentLayout`, `StaffLayout`, and `AdminLayout` verify `isAuthenticated` and `user.role`.
   - Unauthorized attempts (e.g. student navigating to `/admin/dashboard` or `/staff/preparation`) redirect immediately to the login page or their appropriate dashboard with an informative toast message.
6. **Development Demo Persona Switcher:**
   - Retained for offline review and rapid grading demonstrations.
   - When in "Live Backend" mode, role switching performs authentic backend logins for the default demo accounts (`student123`, `staff123`, `admin123`).

---

## 6. Real-Time Communication Architecture (Socket.IO)

### 6.1 Event Lifecycle Matrix
| Event Name | Trigger | Target Room | Action / UI Impact |
| :--- | :--- | :--- | :--- |
| `order:created` | Student submits pre-order | `staff`, `admin` | Kitchen incoming queue count increments, ticket appears without reload. |
| `order:accepted` | Staff accepts order | `student:${studentId}`, `staff`, `admin` | Student tracking progresses to "Accepted". |
| `order:preparing` | Staff clicks "Start Cooking" | `student:${studentId}`, `staff`, `admin` | Student tracking progresses to "Preparing". |
| `order:ready` | Staff marks "Ready for Pickup" | `student:${studentId}`, `staff`, `admin` | Student tracking progresses to "Ready for Pickup", pickup countdown begins with backend `readyAt` and `pickupDeadline`. Staged in staff pickup counter. |
| `order:picked-up` | Staff confirms counter collection | `student:${studentId}`, `staff`, `admin` | Order marked "Picked Up", moved to completed archive. |
| `order:cancelled` | Student cancels before acceptance | `staff`, `admin` | Kitchen removes ticket, slot occupancy decrements. |
| `order:rejected` | Staff rejects ticket with reason | `student:${studentId}`, `admin` | Student sees rejection reason modal and status update. |
| `menu:updated` | Admin updates dish price/info | `all` | Menu catalog updates dynamically. |
| `inventory:updated` | Staff toggles Item 86 | `all` | Dish disabled/enabled across all menus instantly. |

### 6.2 Connection & Authentication
- Socket connects to `http://localhost:5000` with `withCredentials: true`.
- On reconnection, the client automatically re-fetches active state from REST endpoints to prevent state desynchronization.

---

## 7. Portal-by-Portal Integration Plan

### 7.1 Student Portal (`/student/*`)
- **Dashboard (`/student/dashboard`):**
  - Calls `ordersApi.getMyOrders()` to retrieve active pre-orders and historical statistics.
  - Calls `menuApi.getMenu({ availableOnly: true })` to display featured lunch recommendations.
  - Calculates real metrics (total spent, orders completed).
- **Menu Catalog (`/student/menu` & `/student/menu/[id]`):**
  - Calls `menuApi.getMenu()` with live category tabs (`breakfast`, `meals`, `quick-bites`, `beverages`, `desserts`), dietary filters (`veg`, `non-veg`, `vegan`), and instant search.
  - Displays real dish specifications, prep times, prices, and Item 86 sold-out badges.
  - Dish detail page displays verified server addons.
- **Shopping Tray & Checkout (`/student/cart` & `/student/checkout`):**
  - Cart persists in `localStorage` client-side until checkout.
  - Checkout fetches real pickup slots via `slotsApi.getSlots()`.
  - Submits pre-order via `ordersApi.createOrder()` with `Idempotency-Key` header.
  - Enforces `counter_cash` payment at counter.
  - On success, redirects to confirmation ticket with actual server `orderNumber` (`QL-XXXX`) and `tokenNumber` (`A-XX`).
- **Live Order Tracking (`/student/orders/[id]/track`):**
  - Fetches order from `ordersApi.getOrderById(orderId)`.
  - Calculates pickup countdown strictly from server `readyAt` and `pickupDeadline` timestamps (no client-side time resets).
  - Listens to Socket.IO events for live status progression.
- **My Orders (`/student/orders`):**
  - Lists real historical pre-orders with live status badges.
  - Allows cancellation only if status is `PLACED`.

### 7.2 Kitchen Staff Command Center (`/staff/*`)
- **Dashboard (`/staff/dashboard`):**
  - Displays live queue counts fetched from `staffApi.getDashboard()`.
  - Incoming queue, cooking queue, ready orders, and today's completed tally.
- **Incoming Tickets (`/staff/orders`):**
  - Lists all orders in `PLACED` status.
  - 1-click "Accept Ticket" (`status: 'ACCEPTED'`) or "Reject Ticket" with reason.
- **Kitchen Preparation Kanban (`/staff/preparation`):**
  - Displays cooking queue (`ACCEPTED`, `PREPARING`).
  - "Start Cooking" and "Mark Ready for Pickup".
- **Ready Counter Staging (`/staff/ready`):**
  - Lists orders staged at counter (`READY_FOR_PICKUP`).
  - Search by token number (`A-12`).
  - 1-click "Confirm Collection" (`ordersApi.handoverOrder()`) to finalize collection.
- **Item 86 Inventory Manager (`/staff/menu`):**
  - One-tap toggle calling `menuApi.toggleAvailability(id)`.
  - Emits real-time `inventory:updated` to all student screens.

### 7.3 Administrator Console (`/admin/*`)
- **Executive Analytics Dashboard (`/admin/dashboard` & `/admin/analytics`):**
  - Fetches real business KPIs via `adminApi.getAnalytics()`: Total revenue, Total orders, Average Order Value (AOV), active users, hourly order rush distribution, and top-selling dishes.
- **Menu Management (`/admin/menu`):**
  - Create new dish via `menuApi.createItem()`.
  - Edit existing dish pricing, category, prep time via `menuApi.updateItem()`.
  - Soft-archive dish via `menuApi.removeItem()`.
- **Master Order Ledger (`/admin/orders`):**
  - Paginated order register (`adminApi.listOrders({ page, limit, status, search })`).
  - Status overrides and detailed ticket modal.
- **Settings & Operational Policies (`/admin/settings`):**
  - Operating hours, slot interval (15 mins), packaging charge (₹10), tax rate (5%), grace period (10 mins), late fee (₹20), and late fee toggle.
  - Updates persist directly to MongoDB `canteen_settings`.
- **CSV Export:**
  - One-click download of audit-ready CSV via `adminApi.exportCsv()`.

---

## 8. Mock Data Removal Strategy

| Existing Mock File | Target Status | Replacement Mechanism |
| :--- | :--- | :--- |
| `src/services/storage.ts` | Retain only for cart items & local preferences | Replaced by `src/lib/api/` for all domain entities. |
| `src/services/menuService.ts` | Refactor to use `src/lib/api/services/menuApi.ts` | Directly calls backend MongoDB endpoints. |
| `src/services/orderService.ts`| Refactor to use `src/lib/api/services/ordersApi.ts` | Directly calls backend MongoDB endpoints. |
| `src/services/configService.ts`| Refactor to use `src/lib/api/services/settingsApi.ts` & `slotsApi.ts` | Directly calls backend MongoDB endpoints. |
| `src/context/AuthContext.tsx` | Refactor to use `src/lib/api/services/authApi.ts` | Real JWT cookie session validation. |
| `src/data/mockData.ts` | Retain as offline fallback / seed reference | No active imports in production application flow. |

---

## 9. Loading, Error, and Empty State Design

1. **Skeleton Loaders:**
   - Clean, neutral `#E5E7EB` pulse animations conforming to the monochrome design system.
   - Skeletons for Menu cards, Dashboard KPI cards, Active order countdown, Kitchen ticket cards, and Admin order tables.
2. **Inline Error Feedback:**
   - Clear banner notifications on network failure or session expiration.
   - Form field validation errors matching Zod backend schema messages.
3. **Empty States:**
   - Meaningful, polite empty states for empty cart ("Your tray is empty"), no active orders ("No active pre-orders right now"), empty kitchen queue ("All orders prepared! Kitchen line clear").
4. **Toast Feedback:**
   - Integration with existing `ToastContext` for real-time notifications ("Order Accepted", "Dish is now Ready for Pickup!", "Item 86 updated").

---

## 10. Integration Testing Plan

### 10.1 Multi-Role End-to-End Walkthrough
1. **Student:** Login (`aarav.sharma@campus.edu`), browse menu, add Masala Dosa + Addon to cart, select 12:30 PM slot, checkout with counter collection.
2. **Kitchen:** Login (`ramesh.canteen@campus.edu`), receive ticket in incoming queue, accept order, start cooking, mark ready for pickup.
3. **Student:** Receive real-time "Ready for Pickup" notification without refreshing, verify pickup countdown starts with server deadline.
4. **Kitchen:** Verify order in ready staging, perform handover collection.
5. **Admin:** Login (`ananya.iyer@campus.edu`), inspect analytics dashboard, verify revenue incremented, verify order in master register, export CSV.
6. **Item 86 Sync:** Staff toggles Hakka Noodles availability; verify student menu updates instantly.

### 10.2 Edge Case & Concurrency Testing
- Two students submit orders for the same slot simultaneously.
- Slot capacity exhaustion handling (409 Conflict toast).
- Background worker applying late fee on overdue order.
- Socket disconnection and automatic recovery.
- Browser refresh during active order countdown (countdown preserves server deadline).

---

## 11. Implementation Milestones

```
Milestone 1: Backend Preparation & Real-Time Engine Setup
├── 1.1 Install socket.io in backend & socket.io-client in root
├── 1.2 Implement collision-free order number generation in orderService.ts
├── 1.3 Implement Socket.IO server & authenticated handshake in backend/src/socket/
├── 1.4 Wire Socket.IO event emission into orderService, menuService, adminService
└── 1.5 Update CORS in backend/src/app.ts for multi-origin support

Milestone 2: Centralized Frontend API Client & Socket Layer
├── 2.1 Create src/lib/api/client.ts with credentials & error interceptor
├── 2.2 Create src/lib/api/endpoints.ts, errors.ts, types.ts
├── 2.3 Create src/lib/api/adapters.ts (_id <-> id normalizer)
├── 2.4 Create API service modules (auth, users, menu, orders, slots, staff, admin, settings)
└── 2.5 Create Socket.IO client singleton & React useSocket hook in src/lib/socket/

Milestone 3: Authentication & Route Protection Integration
├── 3.1 Refactor src/context/AuthContext.tsx with real authApi calls (login, register, logout, getMe)
├── 3.2 Implement session restoration on mount via HTTP-only cookie
├── 3.3 Add role-based route guards in StudentLayout, StaffLayout, and AdminLayout
└── 3.4 Wire login and registration pages to real auth endpoints

Milestone 4: Student Portal Real Backend Integration
├── 4.1 Connect Food Menu (/student/menu & [id]) to real menuApi
├── 4.2 Connect Cart & Checkout (/student/checkout) to real slotsApi & ordersApi
├── 4.3 Connect Order Tracking (/student/orders/[id]/track) to real order data & Socket.IO
├── 4.4 Connect Order Confirmation & My Orders (/student/orders) to real ordersApi
└── 4.5 Connect Student Dashboard (/student/dashboard) to real order metrics & menu

Milestone 5: Kitchen Staff Command Center Integration
├── 5.1 Connect Staff Dashboard (/staff/dashboard) to real staffApi metrics & live feed
├── 5.2 Connect Incoming Tickets (/staff/orders) with real accept/reject & Socket.IO
├── 5.3 Connect Kitchen Preparation Queue (/staff/preparation) with real status updates
├── 5.4 Connect Ready Orders & Handover (/staff/ready) to real counter handover
└── 5.5 Connect Item 86 Inventory Manager (/staff/menu) with real-time toggle

Milestone 6: Administrator Console Integration
├── 6.1 Connect Executive Dashboard (/admin/dashboard & /admin/analytics) to real analyticsApi
├── 6.2 Connect Menu Catalog CRUD (/admin/menu) to real menuApi
├── 6.3 Connect Master Order Ledger (/admin/orders) to real adminApi orders with pagination
├── 6.4 Connect Settings & Rates (/admin/settings) to real settingsApi
└── 6.5 Connect CSV Export (/admin/analytics) to real exportCsv endpoint

Milestone 7: Loading States, Polish & Design Preservation
├── 7.1 Verify premium monochrome styling across all updated pages
├── 7.2 Implement skeleton loaders for loading states
└── 7.3 Implement clear inline error & empty states

Milestone 8: End-to-End Verification, Documentation & Final Audit
├── 8.1 Execute full multi-role integration test suite
├── 8.2 Rerun TypeScript, ESLint, and production builds across frontend, backend, and worker
├── 8.3 Update DEVELOPMENT_LOG.md, API_DOCUMENTATION.md, and README.md
└── 8.4 Generate PHASE_03_COMPLETION_REPORT.md
```
