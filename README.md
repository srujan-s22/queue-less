# QueueLess — Smart Campus Canteen Pre-Ordering & Queue Management Platform

> **Order during class. Skip the lunch queue. Collect hot meals when ready.**

QueueLess is a smart campus canteen pre-ordering and queue management system designed to eliminate long lunchtime queues in university cafeterias. Students can browse real-time food catalogs, customize orders, reserve specific pickup slots (e.g., 12:45–1:00 PM), and collect their meals at express priority counters within minutes of their class break starting.

---

## 1. Problem Statement & Solution

### The Problem
During peak university lunch breaks, hundreds of students descend upon the canteen simultaneously. Students frequently spend 20–25 minutes of a 30-minute break standing in crowded, noisy lines. Often, popular items run out right when students reach the counter, leaving minimal time to actually eat.

### The QueueLess Solution
1. **Pre-Order During Lecture:** Students place their order 15–30 minutes before break.
2. **Reserved Pickup Slots:** Orders are throttled by 15-minute slot capacity to prevent kitchen bottlenecks.
3. **Automated Preparation Pipeline:** Kitchen staff receive orders in advance, stage ready trays, and trigger real-time notifications.
4. **2-Minute Express Handover:** Students display their unique token (e.g. `A-18`), collect their tray at Counter #2, and enjoy a relaxed lunch.
5. **Late Pickup Policy:** A 10-minute grace window guarantees hot food quality while applying an automatic warming fee (+₹20) if collection deadlines are exceeded.

---

## 2. Platform Architecture & Three Role Experiences

QueueLess provides three dedicated, professionally designed workspaces:

| Portal | Target User | Key Capabilities |
| :--- | :--- | :--- |
| **Student Portal** | University Students | Food catalog browsing, dietary filtering (Veg, Non-Veg, Vegan), Tray management, Pickup slot selector, Live 5-step order tracker, 10-minute pickup countdown timer, Late fee simulation, Reorder history, Campus wallet. |
| **Staff Portal** | Kitchen Operators | Live operational command center, Incoming orders acceptance/rejection with reason modals, Kitchen prep Kanban queue, Counter staging with fast token search, One-tap Item 86 live stock availability manager. |
| **Admin Portal** | Canteen & Campus Facilities Admins | Executive throughput metrics, Break rush volume distribution heatmaps, Full Menu Catalog CRUD & price updater, Pickup slot capacity throttles, Grace period & late penalty configuration, Operator shift logs, CSV report export. |

---

## 3. Technology Stack

### Full Stack (Phases 1, 2, 3, and 3.1 - Complete)
- **Frontend (Port 3000 / 3001):** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Socket.IO Client
- **REST & Real-Time Gateway (Default Port 5001):** Node.js, Express.js, TypeScript, Mongoose ODM, Socket.IO Server
- **Database (Port 27017):** MongoDB (8 collections: `users`, `menu_items`, `pickup_slots`, `orders`, `counters`, `canteen_settings`, `order_status_history`, `audit_logs`)
- **Background Worker (`worker/`):** Standalone Node.js daemon (15s cadence) with atomic late-fee assessment
- **Security & Integrity:** Dual HTTP-only JWT cookies + Bearer auth, bcrypt password hashing, atomic slot capacity protection, server-calculated pricing, Zod schema validation, Socket.IO room-level student authorization

### Planned DevOps (Future Phases)
- **Phase 4:** Multi-Stage Docker Containerization (Frontend, Backend, Worker, Mongo) & Docker Compose
- **Phase 5:** Kubernetes & Minikube Orchestration
- **Phase 6:** CI/CD via GitHub Actions

---

## 4. Getting Started

### Prerequisites
- Node.js (v18.18+ or v20+, developed on v24)
- npm (v10+)
- MongoDB (v7+ or v8 running locally on default port `27017`)

### 1. Database Setup & Seeding
```bash
# Ensure local MongoDB is active
brew services start mongodb/brew/mongodb-community # On macOS

# Seed the database with demo users, menu items, pickup slots, and settings
cd backend
npm install
npm run seed
```

### 2. Launch the Backend Server (Port 5001)
```bash
cd backend
npm run dev
# Express REST API & Socket.IO Gateway active at http://localhost:5001
```

### 3. Launch the Background Worker
```bash
cd worker
npm install
npm run dev
# Deadline scanner running every 15s
```

### 4. Launch the Next.js Frontend (Port 3000)
```bash
# In the repository root
npm install
npm run dev
# Open http://localhost:3000 in your browser (or port 3001 if 3000 is occupied)
```

---

## 5. Quick Role Switching & Multi-Portal Evaluation

QueueLess includes a floating **Role Demo Switcher** widget pinned to the bottom-left of every screen. Evaluators can instantly switch between:
- **Student Profile:** Aarav Sharma (`aarav.sharma@campus.edu`, Roll: `2024CS1042`, Balance: ₹600)
- **Staff Profile:** Ramesh Patel (`ramesh.canteen@campus.edu`, Counter #2 Operator)
- **Admin Profile:** Dr. Ananya Iyer (`ananya.iyer@campus.edu`, Amenities Dean)

### Interactive Evaluation Highlights
1. **Live Multi-Role Order Workflow:** Place an order on `/student/checkout`. Switch to Staff Portal (`/staff/orders`) to see the incoming ticket arrive instantly via Socket.IO. Click "Accept" -> navigate to `/staff/preparation` and click "Start Cooking" -> click "Mark Ready". Switch back to the student tracking screen (`/student/orders/[id]/track`) to watch status and countdown update automatically without page refresh.
2. **Item 86 Kitchen & Admin Toggle:** Go to `/staff/menu` or `/admin/menu`, toggle any item (e.g. Crispy Masala Dosa) out of stock, and observe the immediate real-time update on `/student/menu` with a disabled Add button and "Sold Out (86)" badge.
3. **Admin Staff Roster Management:** In `/admin/staff`, add new kitchen operators or cycle shift status between Active and On Break; changes persist directly to MongoDB.

---

## 6. Project Structure

```
queueless/
├── public/
│   └── screenshots/              # High-resolution screenshots of all 3 portals
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── (auth)/login & register
│   │   ├── student/              # 9 student pages (dashboard, menu, cart, checkout, orders, track, profile)
│   │   ├── staff/                # 7 staff pages (dashboard, orders, prep, ready, completed, menu)
│   │   ├── admin/                # 6 admin pages (dashboard, menu, orders, staff, settings, analytics)
│   │   ├── layout.tsx
│   │   └── page.tsx              # SaaS landing page
│   ├── components/
│   │   ├── common/               # Role switcher & dev controls
│   │   ├── layout/               # Student, Staff, and Admin layouts & navigation
│   │   ├── student/              # FoodCard, SlotSelector, OrderStatusTimeline, PickupCountdownCard
│   │   ├── ui/                   # Button, Badge, Modal, StatCard, EmptyState
│   │   └── providers/            # AppProviders
│   ├── context/                  # AuthContext, CartContext, ToastContext
│   ├── data/                     # Centralized seed mock data
│   ├── services/                 # orderService, menuService, configService, storage
│   └── types/                    # TypeScript interfaces
├── ARCHITECTURE.md               # Full architecture & future phases specification
├── DEVELOPMENT_LOG.md            # Execution and implementation log
└── package.json
```

---

## 7. License
Developed for Academic & Production Campus Deployments. © 2026 QueueLess Team.
