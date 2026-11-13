# QueueLess System Architecture Specification

This document details the architectural blueprint of **QueueLess**, covering the completed Phase 1 frontend foundation, the centralized service layer, and the roadmap for Phase 2 (Express + MongoDB) and DevOps (Docker, Kubernetes & CI/CD).

---

## 1. System Overview

QueueLess is designed as a distributed, multi-role campus dining orchestration system. The core operational problem it solves is **traffic-spike smoothing**: transforming an unpredictable rush of hundreds of students during a 10-minute bell interval into a throttled, slot-allocated, pre-batched preparation queue.

```
       [ Student Mobile / Web ]           [ Kitchen Kiosk / Tablet ]           [ Facilities Admin Desktop ]
                   │                                   │                                    │
                   ▼                                   ▼                                    ▼
       ┌────────────────────────────────────────────────────────────────────────────────────────┐
       │                       QueueLess Next.js 16 Presentation Layer                          │
       │                                                                                        │
       │  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────────────┐  │
       │  │    Student Portal     │  │  Canteen Staff Portal │  │    Administrator Console   │  │
       │  │ (Catalog, Cart, Slots,│  │(Incoming, Prep Kanban,│  │ (Catalog CRUD, Slot Caps,  │  │
       │  │  Live Tracking & Fee) │  │ Staging, 86 Manager)  │  │  Rates & Late Fee Config)  │  │
       │  └───────────────────────┘  └───────────────────────┘  └────────────────────────────┘  │
       └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                                   │
                                                   ▼
       ┌────────────────────────────────────────────────────────────────────────────────────────┐
       │                         Centralized Client Service Abstraction                         │
       │                                                                                        │
       │  • orderService.ts        • menuService.ts        • configService.ts                   │
       │  • storage.ts (Safe SSR)  • AuthContext.tsx       • CartContext.tsx                    │
       │                                                                                        │
       │      [ Phase 1: LocalStorage + Reactive Simulated State Engine ]                       │
       │      [ Phase 2 Drop-in: Axios / Fetch API Clients targeting Express.js Backend ]       │
       └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Three Distinct User Role Experiences

### A. Student Persona (Aarav Sharma — B.Tech CSE)
- **Primary Need:** Fast, reliable ordering between classes; transparent pickup deadlines; queue avoidance.
- **Key Workflows:**
  1. Browse categorized menu with dietary tags (Pure Veg, Non-Veg, Vegan).
  2. Customize dish spice level and kitchen add-ons.
  3. Select an open 15-minute pickup slot (e.g. 12:45–01:00 PM) based on real-time capacity meters.
  4. Pay via simulated Campus Wallet or UPI.
  5. Receive a unique ticket ID (`QL-1042`) and Counter Token (`A-18`).
  6. Track the 5-step order lifecycle:
     $$\text{PLACED} \longrightarrow \text{ACCEPTED} \longrightarrow \text{PREPARING} \longrightarrow \text{READY FOR PICKUP} \longrightarrow \text{PICKED UP}$$
  7. When READY: Watch the 10-minute collection deadline countdown. If deadline expires, transparently review the late pickup warming fee (+₹20).

### B. Kitchen Staff Persona (Ramesh Patel — Head Counter Operator)
- **Primary Need:** High-speed operational execution; immediate ticket clarity; minimal cognitive load.
- **Key Workflows:**
  1. Monitor real-time incoming tickets with audio alert simulation.
  2. Accept tickets or reject with standardized kitchen reasons.
  3. Move accepted orders into active cooking queue ("Start Cooking").
  4. Signal when food arrives at counter ("Mark Ready for Pickup"), triggering student notifications.
  5. Rapid counter search by Token (`A-18`) and 1-tap "Confirm Handover".
  6. Instant Item 86 toggle when batches run out, protecting kitchen from unfulfillable orders.

### C. Administrator Persona (Dr. Ananya Iyer — Amenities Dean)
- **Primary Need:** Queue reduction governance; revenue analytics; peak rush distribution management.
- **Key Workflows:**
  1. Inspect daily gross revenue, average order value, and hourly order volume heatmaps.
  2. Manage the master food catalog: Add, edit, delete dishes, set prices in INR, assign categories.
  3. Override any order status or issue refunds.
  4. Configure slot throttles (e.g., maximum 25 orders per 15-minute interval).
  5. Set the collection grace period (e.g. 10 minutes) and late fee penalty (₹20).
  6. Download complete CSV audits for campus accounting.

---

## 3. Frontend Architecture (Phase 1)

### Directory Layout
```
src/
├── app/                  # Next.js App Router (26 routes)
│   ├── (auth)/           # Authentication (login, register)
│   ├── student/          # Student portal pages
│   ├── staff/            # Kitchen staff portal pages
│   ├── admin/            # Administrator console pages
│   ├── layout.tsx        # Root HTML layout with Geist font injection & AppProviders
│   ├── page.tsx          # Public SaaS landing page
│   └── globals.css       # Design tokens & custom scrollbars
├── components/
│   ├── common/           # Floating Role Demo Switcher & dev tools
│   ├── layout/           # Role-specific layouts (StudentLayout, StaffLayout, AdminLayout)
│   ├── student/          # FoodCard, SlotSelector, OrderStatusTimeline, PickupCountdownCard
│   ├── ui/               # Button, Badge, Modal, StatCard, EmptyState
│   └── providers/        # Context providers wrapper
├── context/              # AuthContext, CartContext, ToastContext
├── data/                 # Initial mock catalog, slots, and orders
├── services/             # Storage, orderService, menuService, configService
└── types/                # Strict TypeScript domain interfaces
```

### Clean Service Abstraction Pattern
Components never interact with raw storage or mock data directly. Instead, they invoke domain services:
- `orderService.getAll()`, `orderService.createOrder()`, `orderService.updateStatus()`, `orderService.calculateLateFee()`
- `menuService.getAll()`, `menuService.saveItem()`, `menuService.toggleAvailability()`
- `configService.getConfig()`, `configService.updateConfig()`, `configService.getSlots()`

This guarantees that in Phase 2, swapping from `storage.ts` to `apiClient.ts` requires zero changes to the presentation components.

---

## 4. Planned Phase 2: Node.js, Express & MongoDB Integration

In Phase 2, the frontend mock services will be replaced with RESTful API endpoints hosted on a separate Express.js microservice.

```
┌─────────────────────────────────┐           HTTP / REST (JSON)            ┌──────────────────────────────────┐
│   Next.js Frontend Container    │ ──────────────────────────────────────> │    Node.js / Express Backend     │
│   (Port 3000)                   │ <────────────────────────────────────── │    (Port 5000)                   │
└─────────────────────────────────┘           WebSocket (Socket.io)         └─────────────────┬────────────────┘
                                            (Real-time order pushes)                          │
                                                                                              ▼
                                                                                   ┌────────────────────┐
                                                                                   │   MongoDB Cluster  │
                                                                                   │   (Port 27017)     │
                                                                                   └────────────────────┘
```

### Proposed Data Models (Mongoose Schemas)
1. **User Schema (`users`)**:
   - `_id`, `name`, `email`, `passwordHash`, `role` (`student` | `staff` | `admin`), `rollNumber`, `phone`, `walletBalance`.
2. **MenuItem Schema (`menu_items`)**:
   - `_id`, `name`, `description`, `price`, `category`, `dietary`, `prepTimeMinutes`, `imageUrl`, `isAvailable`, `rating`.
3. **PickupSlot Schema (`pickup_slots`)**:
   - `_id`, `startTime`, `endTime`, `date`, `capacity`, `bookedCount`, `status`.
4. **Order Schema (`orders`)**:
   - `_id`, `orderNumber` (`QL-XXXX`), `tokenNumber` (`A-XX`), `studentId`, `items: [{ menuItemId, quantity, customizations }]`, `subtotal`, `tax`, `packagingFee`, `lateFeeApplied`, `total`, `status`, `pickupSlotId`, `pickupDeadline`, `createdAt`, `readyAt`, `collectedAt`.
5. **Config Schema (`canteen_config`)**:
   - `isOpen`, `operatingHours`, `maxCapacityPerSlot`, `slotIntervalMinutes`, `lateFeeConfig: { gracePeriodMinutes, lateFeeAmount, isLateFeeEnabled }`.

---

## 5. Planned DevOps Architecture (Docker, Kubernetes, Minikube & CI/CD)

```
                              ┌──────────────────────────────────────────────┐
                              │            Kubernetes Ingress                │
                              │           (queueless.campus.edu)             │
                              └──────────────────────┬───────────────────────┘
                                                     │
                       ┌─────────────────────────────┴─────────────────────────────┐
                       │                                                           │
                       ▼ Path: /                                                   ▼ Path: /api
        ┌─────────────────────────────┐                             ┌─────────────────────────────┐
        │   queueless-frontend-svc    │                             │    queueless-backend-svc    │
        │      (Port 80 -> 3000)      │                             │      (Port 80 -> 5000)      │
        └──────────────┬──────────────┘                             └──────────────┬──────────────┘
                       │                                                           │
        ┌──────────────┴──────────────┐                             ┌──────────────┴──────────────┐
        │  Frontend Deployment (Pods) │                             │   Backend Deployment (Pods) │
        │  [ Next.js Production App ] │                             │   [ Express API Service ]   │
        └─────────────────────────────┘                             └──────────────┬──────────────┘
                                                                                   │
                                                                                   ▼
                                                                    ┌─────────────────────────────┐
                                                                    │      queueless-mongo-svc    │
                                                                    │      (StatefulSet / PVC)    │
                                                                    └─────────────────────────────┘
```

### Containerization Strategy
- **Frontend Dockerfile:** Multi-stage build (`node:20-alpine`):
  1. `deps`: Install production node_modules.
  2. `builder`: Compile Next.js standalone build (`output: 'standalone'`).
  3. `runner`: Minimal unprivileged Alpine image running `server.js` (~120MB image size).
- **Backend Dockerfile:** Multi-stage TypeScript build compiled to pure JavaScript.
- **Docker Compose:** Local multi-container orchestration (`frontend`, `backend`, `mongo`, `mongo-express`).

### Kubernetes Manifests (Minikube Target)
- `namespace.yaml`: `queueless-production`
- `frontend-deployment.yaml` & `frontend-service.yaml`
- `backend-deployment.yaml` & `backend-service.yaml`
- `mongo-statefulset.yaml` & `mongo-pvc.yaml` (Persistent Volume Claims for data resilience)
- `ingress.yaml`: Ingress controller with TLS termination.
- `configmap.yaml` & `secret.yaml`: Environment variables and credentials.

### GitHub Actions CI/CD Pipeline
1. **Lint & Test:** Runs ESLint and TypeScript compiler verification.
2. **Build & Package:** Builds Docker containers for frontend and backend.
3. **Container Registry:** Pushes tagged images to Docker Hub (`queueless/frontend:v1.0.0`).
4. **Deploy:** Deploys manifests to Minikube or staging cluster via `kubectl apply`.
