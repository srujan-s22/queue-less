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

### Frontend (Phase 1)
- **Framework:** Next.js 16 (App Router with Server & Client components)
- **Core Library:** React 19 & TypeScript 5
- **Styling:** Tailwind CSS v4 with custom restaurant-tech design system tokens
- **Icons:** Lucide React
- **Celebration Effects:** Canvas Confetti

### Planned Backend & DevOps (Phase 2 & Future Phases)
- **API Server:** Node.js, Express.js, TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Kubernetes & Minikube
- **CI/CD:** GitHub Actions & Docker Hub

---

## 4. Getting Started

### Prerequisites
- Node.js (v18.18.0 or newer recommended, developed on v24.22)
- npm (v10+ or newer)

### Installation
```bash
# Clone or navigate to the project directory
cd queueless

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Next.js development server
npm run dev

# Or build and launch the production-optimized server
npm run build
npm run start -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Quick Role Switching & Demo Evaluation

QueueLess includes a floating **Role Demo Switcher** widget pinned to the bottom-left of every screen. Evaluators can instantly switch between:
- **Student Profile:** Aarav Sharma (`aarav.sharma@campus.edu`, Roll: `2024CS1042`, Balance: ₹450)
- **Staff Profile:** Ramesh Patel (`ramesh.canteen@campus.edu`, Counter #2 Operator)
- **Admin Profile:** Dr. Ananya Iyer (`ananya.iyer@campus.edu`, Amenities Dean)

### Interactive Evaluation Highlights
1. **Interactive Order Tracking:** Navigate to `/student/orders/QL-1042/track` to see the live 5-step lifecycle and real-time countdown timer. Use the **Simulate Next Status** or **Trigger Overdue & Late Fee** buttons to test state transitions.
2. **Item 86 Kitchen Toggle:** Go to `/staff/menu`, toggle any item out of stock, and observe the immediate real-time update on `/student/menu`.
3. **Dynamic Slot Throttling:** Adjust slot capacities in `/admin/settings` and observe the capacity meters adjust in `/student/checkout`.

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
