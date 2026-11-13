# QueueLess REST API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5001/api/v1`  
**Timezone Reference:** `Asia/Kolkata` (IST, UTC+05:30)  
**Standard Timestamp Storage:** UTC ISO-8601  

---

## 1. Overview & Architectural Principles

QueueLess provides a RESTful JSON API powered by Node.js, Express, TypeScript, and MongoDB. The system enforces strict server-side calculation for all prices, taxes, packaging fees, and discounts, eliminating client-side tampering.

### 1.1 Concurrency & Slot Protection
Pickup slot bookings use atomic MongoDB find-and-modify operations (`$expr: { $lt: ['$reservedCount', '$maxCapacity'] }` with `$inc: { reservedCount: 1 }`), guaranteeing zero overselling during campus lunch rushes.

### 1.2 Exactly-Once Late-Fee Processing
An independent background worker runs every 15 seconds to evaluate orders staged at `READY_FOR_PICKUP`. Overdue orders receive an atomic `$set` and `$inc`, guaranteeing exactly-once penalty enforcement.

---

## 2. Global Response Conventions

All API responses follow a uniform JSON structure.

### 2.1 Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 2.2 Error Response (`400`, `401`, `403`, `404`, `409`, `500`)
```json
{
  "success": false,
  "message": "Detailed error description",
  "errors": [
    {
      "field": "items.0.quantity",
      "message": "Quantity must be at least 1"
    }
  ]
}
```

---

## 3. Authentication & RBAC

QueueLess supports dual-channel authentication:
1. **HTTP-only Cookie:** `token=<jwt>` (automatic session persistence in browsers with `SameSite=Lax`).
2. **Authorization Header:** `Authorization: Bearer <jwt>` (CLI / developer / programmatic testing).

### 3.1 Roles & Permissions Matrix
| Role | Capabilities |
| :--- | :--- |
| `student` | Browse menu, check slot availability, place pre-orders, view personal order history, cancel placed orders, top-up campus wallet. |
| `staff` | Real-time kitchen view, accept/reject incoming tickets, progress cooking status, mark orders ready, scan/handover at counter, toggle dish availability (Item 86). |
| `admin` | Full system access, menu catalog CRUD, operational settings configuration, slot schedule generation, financial analytics, order ledger CSV export. |

---

## 4. Endpoints Reference

### 4.1 Authentication (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
Register a new student account.

- **Access:** Public (Rate limited: 15 req/min)
- **Request Body:**
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@campus.edu",
  "password": "studentPassword123",
  "studentId": "2024CS1042",
  "department": "Computer Science & Engg.",
  "phone": "+91 98765 43210"
}
```
- **Response:** `201 Created` with user payload and signed JWT token.

#### `POST /api/v1/auth/login`
Authenticate existing user.

- **Access:** Public
- **Request Body:**
```json
{
  "email": "aarav.sharma@campus.edu",
  "password": "studentPassword123"
}
```
- **Response:** `200 OK` (sets `token` cookie and returns token in payload).

#### `POST /api/v1/auth/logout`
Terminates current session by clearing the auth cookie.

- **Access:** Public
- **Response:** `200 OK`

#### `GET /api/v1/auth/me`
Retrieve profile of currently authenticated user.

- **Access:** Authenticated (`student`, `staff`, `admin`)
- **Response:** `200 OK`

---

### 4.2 Users & Wallet (`/api/v1/users`)

#### `PATCH /api/v1/users/profile`
Update personal details.

- **Access:** Authenticated
- **Request Body:**
```json
{
  "name": "Aarav Sharma",
  "phone": "+91 98765 43210",
  "department": "Computer Science & Engineering"
}
```

#### `POST /api/v1/users/wallet/topup`
Add funds to the digital campus dining wallet.

- **Access:** Authenticated
- **Request Body:**
```json
{
  "amount": 250
}
```
- **Response:** `200 OK` with updated `walletBalance`.

---

### 4.3 Menu Catalog & Inventory (`/api/v1/menu`)

#### `GET /api/v1/menu`
List all active menu items with optional category and diet filters.

- **Access:** Public
- **Query Parameters:**
  - `category` (optional): `breakfast` | `meals` | `quick-bites` | `beverages` | `desserts`
  - `dietary` (optional): `veg` | `non-veg` | `vegan`
  - `search` (optional): search text (matches name or description)
  - `availableOnly` (optional): `true` | `false`
- **Response:** `200 OK` array of `MenuItem` objects.

#### `GET /api/v1/menu/:id`
Retrieve detailed dish specifications, add-on modifiers, and nutritional data.

- **Access:** Public
- **Response:** `200 OK`

#### `POST /api/v1/menu`
Create a new menu item.

- **Access:** `admin`
- **Request Body:**
```json
{
  "name": "Mysore Masala Dosa",
  "description": "Crispy crepe coated with spicy red garlic-chili paste and potato mash.",
  "category": "breakfast",
  "price": 85,
  "dietary": "veg",
  "prepTimeMinutes": 8,
  "imageUrl": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
  "addons": [
    { "name": "Extra Gunpowder Podi Butter", "price": 15 }
  ]
}
```

#### `PUT /api/v1/menu/:id`
Full update of dish specifications and pricing.

- **Access:** `admin`

#### `PATCH /api/v1/menu/:id/availability`
One-tap availability toggle (Item 86) for kitchen stockouts.

- **Access:** `staff`, `admin`
- **Request Body:**
```json
{
  "isAvailable": false
}
```

#### `DELETE /api/v1/menu/:id`
Soft-archives menu item (`isArchived: true`), preserving historical orders.

- **Access:** `admin`

---

### 4.4 Pickup Slots (`/api/v1/slots`)

#### `GET /api/v1/slots`
Fetch pickup slots for a given date with live capacity and reserved occupancy counts.

- **Access:** Public
- **Query Parameters:**
  - `date` (optional): ISO date string (defaults to today in IST).
- **Response:** `200 OK` array of `PickupSlot` objects with `maxCapacity`, `reservedCount`, and virtual `isAvailable`.

#### `POST /api/v1/slots/seed`
Admin trigger to generate or reset standard 15-minute slot schedules for the day.

- **Access:** `admin`

---

### 4.5 Pre-Orders (`/api/v1/orders`)

#### `POST /api/v1/orders`
Place a food pre-order with atomic slot reservation and server-verified pricing.

- **Access:** `student`
- **Headers:**
  - `Idempotency-Key` (optional): Unique client UUID preventing duplicate orders.
- **Request Body:**
```json
{
  "pickupSlotId": "65f1234567890abcdef12345",
  "paymentMethod": "counter_cash",
  "items": [
    {
      "menuItemId": "65f0987654321fedcba54321",
      "quantity": 2,
      "selectedAddons": [
        { "name": "Extra Coconut Chutney Cup", "price": 10 }
      ]
    }
  ]
}
```
- **Response:** `201 Created` with full order snapshot, `orderNumber` (`QL-XXXX`), and `tokenNumber` (`A-XX`).

#### `GET /api/v1/orders/my-orders`
List active and past pre-orders for the authenticated student.

- **Access:** `student`

#### `GET /api/v1/orders/:id`
Get real-time order status, preparation progress, pickup countdown, and full audit history.
> **Identifier Support:** `:id` accepts either a 24-character hexadecimal MongoDB `ObjectId` or the human-readable `orderNumber` (e.g., `QL-1011-91`).

- **Access:** `student` (own orders only), `staff`, `admin`

#### `PATCH /api/v1/orders/:id/status`
Progress order lifecycle state.
> **Identifier Support:** `:id` accepts either MongoDB `ObjectId` or `orderNumber`.

- **Access:** `staff`, `admin`
- **Valid Transitions:**
  - `PLACED` -> `ACCEPTED` | `REJECTED` | `CANCELLED`
  - `ACCEPTED` -> `PREPARING` | `CANCELLED`
  - `PREPARING` -> `READY_FOR_PICKUP` (Calculates `readyAt` and `pickupDeadline`)
  - `READY_FOR_PICKUP` -> `PICKED_UP` (Records `collectedAt` and `paymentStatus = 'collected'`)
- **Request Body:**
```json
{
  "status": "ACCEPTED"
}
```

#### `POST /api/v1/orders/:id/cancel`
Cancel order if it is still in `PLACED` status. Automatically decrements slot occupancy and refunds digital wallet if used.

- **Access:** `student` (own order), `admin`
- **Request Body:**
```json
{
  "reason": "Class lecture extended"
}
```

---

### 4.6 Staff Kitchen Terminal (`/api/v1/staff`)

#### `GET /api/v1/staff/dashboard`
Get live counts of incoming, cooking, ready, and completed orders.

- **Access:** `staff`, `admin`

#### `GET /api/v1/staff/incoming`
Fetch pending tickets awaiting kitchen acceptance (`status: 'PLACED'`).

- **Access:** `staff`, `admin`

#### `GET /api/v1/staff/preparation`
Fetch active orders currently cooking on the kitchen line (`status: 'ACCEPTED'` or `'PREPARING'`).

- **Access:** `staff`, `admin`

#### `GET /api/v1/staff/ready`
Fetch prepared orders staged at the express pickup counter (`status: 'READY_FOR_PICKUP'`).

- **Access:** `staff`, `admin`

#### `POST /api/v1/staff/orders/:id/handover`
Confirm physical collection by student, marking `status: 'PICKED_UP'`.

- **Access:** `staff`, `admin`

---

### 4.7 Administration, Settings & Analytics (`/api/v1/admin`, `/api/v1/settings`, `/api/v1/analytics`)

#### `GET /api/v1/admin/orders`
Paginated master register with multi-criteria filtering.

- **Access:** `admin`
- **Query Parameters:**
  - `page`: default 1
  - `limit`: default 20 (max 100)
  - `status`: filter by order status
  - `search`: search by order number, token, student name, or roll number
  - `startDate`, `endDate`: date range filtering

#### `GET /api/v1/admin/staff`
List all kitchen staff members, active shift statuses, and counter station assignments directly from MongoDB.

- **Access:** `admin`

#### `POST /api/v1/admin/staff`
Provision a new staff member account with verified role `'staff'`.

- **Access:** `admin`
- **Request Body:**
```json
{
  "name": "Kavita Nair",
  "email": "kavita.canteen@campus.edu",
  "password": "Password123!",
  "phone": "+91 98765 43219",
  "station": "Dosa & Breakfast Counter"
}
```

#### `PATCH /api/v1/admin/staff/:id/status`
Update a staff member's operational status between `'active'` and `'suspended'`.

- **Access:** `admin`
- **Request Body:**
```json
{
  "status": "suspended"
}
```

#### `GET /api/v1/settings`
Fetch current operating parameters, hours, tax rate, and late-fee policies.

- **Access:** Public

#### `PUT /api/v1/settings`
Update canteen operating hours, packaging fee, tax rate, or late fee grace period. Logs audit record.

- **Access:** `admin`
- **Request Body:**
```json
{
  "isOpen": true,
  "operatingHours": {
    "openTime": "08:00 AM",
    "closeTime": "07:00 PM"
  },
  "packagingCharge": 10,
  "taxRatePercent": 5,
  "gracePeriodMinutes": 10,
  "lateFeeAmount": 20,
  "isLateFeeEnabled": true
}
```

#### `GET /api/v1/analytics/dashboard`
Aggregated financial intelligence: total revenue, order volume, Average Order Value (AOV), status breakdown, and top-selling items.

- **Access:** `admin`

#### `GET /api/v1/analytics/export-csv`
Download a comprehensive, audit-ready CSV file of all canteen transactions.

- **Access:** `admin`
- **Response:** `200 OK` (`Content-Type: text/csv`)

---

## 5. cURL Verification Examples

### 5.1 Student Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aarav.sharma@campus.edu","password":"student123"}'
```

### 5.2 Browse Breakfast Dishes
```bash
curl "http://localhost:5000/api/v1/menu?category=breakfast"
```

### 5.3 Fetch Available Pickup Slots
```bash
curl "http://localhost:5000/api/v1/slots"
```

### 5.4 Submit Order
```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "pickupSlotId": "<SLOT_ID>",
    "paymentMethod": "counter_cash",
    "items": [{"menuItemId": "<ITEM_ID>", "quantity": 1}]
  }'
```

---

## 6. Real-Time Socket.IO Gateway Specification

QueueLess incorporates a high-throughput Socket.IO event gateway running concurrently on the Express HTTP server (default port 5001).

### 6.1 Handshake Authentication & Scoping
- **Endpoint:** `http://localhost:5001/socket.io`
- **Transport:** WebSocket with polling fallback
- **Auth:** Extracted automatically from HTTP-only `token` cookie or `auth.token` handshake parameter.
- **Client Connection Options:**
```typescript
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});
```

### 6.2 Connection Rooms & Order-Level Authorization
Upon authentication, the server automatically joins the socket to appropriate role rooms:
- `student:${user._id}`: Private room for user-specific order updates.
- `staff`: Kitchen staff room for real-time ticket arrival and cancellation.
- `admin`: Operational oversight room.

#### Server-Side Order Room Authorization (`SOCK-AUTH-01`)
When a client requests to subscribe to an order via `socket.emit('join:order', orderId, callback)`:
1. **Unauthenticated Sockets:** Instantly rejected with `{ success: false, error: 'Unauthorized: Authentication required to subscribe to orders' }`.
2. **Order Lookup:** Fetched from MongoDB using either ObjectId or `orderNumber`. If not found, rejected with `{ success: false, error: 'Order not found' }`.
3. **Role Verification:**
   - `staff` and `admin` sockets are granted access to any valid order.
   - `student` sockets are checked against `order.student.toString() === socket.data.user.id`. If mismatched, rejected with 403 Forbidden: `{ success: false, error: 'Forbidden: You do not own this order' }`.
4. **Subscription:** Upon authorization, joins both `order:${order._id}` and `order:${order.orderNumber}`. Room membership is automatically cleaned up on disconnection.

### 6.3 Event Catalog
| Event | Trigger / Source | Target Room | Payload Summary |
| :--- | :--- | :--- | :--- |
| `order:created` | Student submits order | `staff`, `admin` | Full sanitized Order document |
| `order:status_updated` | Order status changes | `student:${id}`, `staff`, `admin`, `order:${orderId}` | `{ orderId, orderNumber, tokenNumber, status, studentId, ... }` |
| `order:accepted` | Staff accepts ticket | `student:${id}`, `order:${orderId}` | Full Order document |
| `order:preparing` | Kitchen starts cooking | `student:${id}`, `order:${orderId}` | Full Order document |
| `order:ready` | Kitchen marks ready | `student:${id}`, `order:${orderId}` | Full Order document with `readyAt` & `pickupDeadline` |
| `order:picked-up` | Counter confirms handover | `student:${id}`, `order:${orderId}` | Full Order document with `collectedAt` |
| `order:cancelled` | Student cancels placed ticket | `staff`, `admin`, `order:${orderId}` | `{ orderId, status: 'CANCELLED', reason }` |
| `order:rejected` | Kitchen rejects ticket | `student:${id}`, `order:${orderId}` | `{ orderId, status: 'REJECTED', reason }` |
| `inventory:updated` | Staff toggles Item 86 | All clients | `{ menuItemId, name, isAvailable }` |
| `menu:updated` | Admin creates/edits dish | All clients | Full MenuItem document |
| `settings:updated` | Admin updates canteen policy | All clients | Full CanteenConfig document |

> [!NOTE]
> All Socket.IO events are emitted **strictly after** successful MongoDB database persistence. Zero transient or uncommitted states are dispatched.

