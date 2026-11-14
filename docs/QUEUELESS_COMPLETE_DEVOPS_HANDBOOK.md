# QueueLess — Complete DevOps Project Handbook
## Comprehensive Systems Architecture, Containerization, Kubernetes Orchestration, CI/CD Pipeline Automation, and 4-Person Presentation Division

---

### Project & Document Metadata

| Attribute | Verified Engineering Record |
|---|---|
| **Project Title** | **QueueLess — Institutional Canteen Pre-Ordering & Queue Automation Platform** |
| **GitHub Repository** | [https://github.com/srujan-s22/queue-less](https://github.com/srujan-s22/queue-less) |
| **Pull Request** | **Pull Request #1 (Merged into `main`)** |
| **Verified Production Commit** | `474e21646fabc877955b9c4d4690e6cffd4f4330` |
| **Docker Hub Repositories** | • `srujans22/queueless-frontend`<br>• `srujans22/queueless-backend`<br>• `srujans22/queueless-worker` |
| **Runtime Infrastructure** | Local Minikube Cluster via Docker Desktop on macOS (Single-Node, Traefik Ingress) |
| **CI/CD Platform** | GitHub Actions (Cloud-Hosted `ubuntu-latest` Runners, Multi-Arch Buildx/QEMU) |
| **Target Audience** | 4-Member Project Team, Technical Evaluators, and Engineering Examination Panels |
| **Document Date & Time** | November 14, 2026 |

---

### Table of Contents

* **[PART A — PROJECT FUNDAMENTALS](#part-a--project-fundamentals)**
  * 1. Executive Summary & Problem Domain
  * 2. The QueueLess Solution & Value Proposition
  * 3. Project Objectives & Core Functional Capabilities
  * 4. Role-Based Access Control (RBAC) & Complete User Workflows
  * 5. The QueueLess Order Lifecycle & State Machine
  * 6. The 10-Minute Grace Period & ₹20 Late Fee Mechanics
  * 7. Teaching Formula: Core Fundamentals
* **[PART B — COMPLETE TECHNICAL ARCHITECTURE](#part-b--complete-technical-architecture)**
  * 1. High-Level Technology Stack & Rationale
  * 2. End-to-End System Architecture Diagram
  * 3. Communication Patterns: Synchronous REST vs Real-Time WebSockets
  * 4. Autonomous Background Processing Architecture
  * 5. Teaching Formula: Architecture Concepts
* **[PART C — WHERE EVERYTHING ACTUALLY RUNS: RUNTIME & INFRASTRUCTURE TOPOLOGY](#part-c--where-everything-actually-runs-runtime--infrastructure-topology)**
  * 1. Demystifying the Actual Environment
  * 2. Definitive Component Location Matrix
  * 3. Core DevOps Concepts Explained with Simple Analogies
  * 4. Teaching Formula: Infrastructure Concepts
* **[PART D — DOCKER AND CONTAINERIZATION](#part-d--docker-and-containerization)**
  * 1. Why Containerization Was Mandatory
  * 2. Docker Core Concepts & Multi-Stage Architecture
  * 3. Detailed Walkthrough of QueueLess Dockerfiles
  * 4. Docker Compose Orchestration (`docker-compose.yml`)
  * 5. Persistence, Networking & Health Checks
  * 6. Essential Docker Diagnostic Commands
  * 7. Teaching Formula: Docker Concepts
* **[PART E — KUBERNETES AND MINIKUBE](#part-e--kubernetes-and-minikube)**
  * 1. Why Transition from Docker Compose to Kubernetes?
  * 2. Complete Manifest-by-Manifest Inspection (`k8s/`)
  * 3. Strict Architectural Constraints (Worker Singleton & MongoDB Memory Limits)
  * 4. Kubernetes Command Reference & QueueLess Examples
  * 5. Teaching Formula: Kubernetes Concepts
* **[PART F — CI/CD PIPELINE](#part-f--cicd-pipeline)**
  * 1. CI/CD Principles & GitHub Actions Architecture
  * 2. The Four Automated Quality Gates (Frontend, Backend, Worker, Manifests)
  * 3. The Docker Hub Publishing Pipeline (`publish-images`)
  * 4. The Complete Code-to-Cluster Lifecycle
  * 5. Teaching Formula: CI/CD Concepts
* **[PART G — DEPLOYMENT AUTOMATION AND ROLLBACK (`scripts/deploy-k8s.sh`)](#part-g--deployment-automation-and-rollback-scriptsdeploy-k8ssh)**
  * 1. Why Automated Deployment Scripting Was Mandatory
  * 2. Architecture & Execution Flow of `deploy-k8s.sh`
  * 3. Key Defensive Mechanisms Explained
  * 4. The Automated Rollback Engine (`execute_rollback`)
  * 5. Actual Deployment Record: The Live Deployment
  * 6. Teaching Formula: Deployment Automation Concepts
* **[PART H — ACTUAL PROJECT OPERATIONS: WHAT WE DID, STEP BY STEP](#part-h--actual-project-operations-what-we-did-step-by-step)**
  * 1. Chronological Master Operations Table
  * 2. Detailed Narrative of Engineering Phases (Phase 1 to Phase 6.5)
  * 3. Teaching Formula: Operations Concepts
* **[PART I — FINAL VERIFIED RESULTS AND KNOWN LIMITATIONS](#part-i--final-verified-results-and-known-limitations)**
  * 1. Verified Results Matrix
  * 2. Transparent Analysis of Known Limitations
  * 3. Categorization: Verified vs Mocked vs Future Roadmap
  * 4. Teaching Formula: Results & Limitations Concepts
* **[PART J — TROUBLESHOOTING AND VIVA PREPARATION](#part-j--troubleshooting-and-viva-preparation)**
  * 1. Comprehensive Troubleshooting Matrix (13 Scenarios)
  * 2. 25+ Comprehensive Viva Questions & Model Answers
* **[PART K — FOUR-PERSON PRESENTATION DIVISION AND SCRIPTS](#part-k--four-person-presentation-division-and-scripts)**
  * 1. Presentation Strategy & Master Schedule
  * 2. Speaker 1: Project Introduction & Application Architecture (Script & Q&A)
  * 3. Speaker 2: Backend APIs, Database, Worker Engine & Docker (Script & Q&A)
  * 4. Speaker 3: Kubernetes Orchestration & Minikube Deployment (Script & Q&A)
  * 5. Speaker 4: CI/CD Pipeline, Docker Hub, Automation & Results (Script & Q&A)
* **[PART L — CLOUD-NATIVE & DEVOPS TECHNICAL GLOSSARY](#part-l--cloud-native--devops-technical-glossary)**

---


---

# PART A — PROJECT FUNDAMENTALS

## 1. Executive Summary & Problem Domain

In high-density academic and institutional environments, cafeteria and canteen infrastructure consistently suffers from peak-hour congestion, extended physical queuing, and unpredictable fulfillment latencies. During standard 15-to-30 minute lecture intervals, hundreds of students converge simultaneously on physical order counters, resulting in:

1. **Severe Queuing Bottlenecks:** Physical queue wait times frequently exceed the duration of academic breaks, resulting in abandoned orders or classroom tardiness.
2. **Kitchen Disorganization & Counter Chaos:** Staff are overwhelmed by simultaneous in-person order taking, cash/card payment reconciliation, manual order tracking, and meal preparation, causing inaccurate order fulfillment and high operational stress.
3. **Food Wastage & Inefficient Prep Timing:** Without visibility into upcoming demand, kitchen staff either over-prepare perishables that spoil or under-prepare meals, leading to extended preparation delays.
4. **Counter Clutter & Uncollected Meals:** Prepared meals accumulate on service counters as students linger in crowds or fail to arrive promptly when meals are ready.

---

## 2. The QueueLess Solution & Value Proposition

**QueueLess** is an enterprise-grade digital pre-ordering, scheduled slot allocation, and queue automation platform engineered specifically for institutional canteens. 

By transitioning in-person counter transactions into a fully coordinated digital workflow, QueueLess solves the core bottleneck of campus dining:

* **Digital Slot Booking & Pre-Ordering:** Students browse dynamic menus, place pre-orders from classrooms or dormitories, and reserve discrete collection time slots.
* **Synchronous & Asynchronous Event Processing:** Kitchen staff manage prep pipelines in real time via live Kanban interfaces, while automated background workers monitor pickup compliance.
* **Predictable Meal Collection:** Physical queues are replaced by predictable, digitized token queues, ensuring zero standing time at physical counters.
* **Automated Accountability:** An automated grace period and penalty fee system deters abandoned orders and ensures counter turnover.

---

## 3. Project Objectives & Core Functional Capabilities

### Primary Engineering Objectives
* **Eliminate Counter Congestion:** Reduce average physical student wait time from $>15$ minutes to under 60 seconds at meal collection counters.
* **Real-Time Operational Transparency:** Provide sub-second bidirectional state synchronization between student devices and kitchen kitchen displays using WebSockets.
* **Strict Production Parity & Portability:** Guarantee identical application behavior across local developer workstations, continuous integration runners, and production orchestrators using containerization.
* **Zero-Downtime Resilience:** Implement automated health probes, graceful service degradation, self-healing pod management, and transactional database persistence.
* **Fail-Safe Continuous Delivery:** Construct an automated multi-gate delivery pipeline that validates every pull request and safely deploys Git SHA-tagged images to Kubernetes with automated rollback capabilities.

### Main Feature Matrix
| Capability | Student Perspective | Staff / Kitchen Perspective | Administrator Perspective |
|---|---|---|---|
| **Menu Catalog** | Real-time item availability, categories, nutritional pricing | Toggle item availability, update prices, manage stock | Global catalog audits, category overrides |
| **Slot Scheduling** | Reserve discrete 15-minute pickup slots | View order volume distributed per slot | Configure slot capacities and interval limits |
| **Ordering & Payments** | Digital cart, campus wallet balance, token issuance | Live incoming order stream, one-click status transitions | Transaction logs, revenue reporting, wallet reconciliation |
| **Order Tracking** | Real-time status tracker (`PLACED` to `READY`) | Drag-and-drop or click-to-advance order board | Historical timeline inspection, operational bottleneck analysis |
| **Late Fee Engine** | 10-minute collection timer countdown, transparent warnings | System alerts for overdue uncollected trays | Configurable grace periods, late-fee revenue auditing |

---

## 4. Role-Based Access Control (RBAC) & Complete User Workflows

QueueLess enforces strict Role-Based Access Control across three discrete user personas:

```
  +------------------+     +--------------------------+     +-----------------------+
  |  STUDENT ROLE    |     |  CANTEEN STAFF / KITCHEN |     |     ADMIN ROLE        |
  +------------------+     +--------------------------+     +-----------------------+
  | - Browse Menu    |     | - View Incoming Queue    |     | - Manage Canteen Data |
  | - Reserve Slot   |     | - Accept / Reject Orders |     | - Configure Slots     |
  | - Wallet Payment |     | - Mark Preparing / Ready |     | - Audit Financials    |
  | - Real-time Push |     | - Confirm Final Pickup   |     | - Configure Late Fees |
  +------------------+     +--------------------------+     +-----------------------+
```

### 1. Student Persona Workflow
1. **Authentication:** The student registers or authenticates via JWT-backed credentials.
2. **Menu Selection:** The student views available breakfast, lunch, or snack menus filtered by current kitchen inventory.
3. **Slot Allocation:** The student selects an available pickup window (e.g., 12:45 PM – 01:00 PM) governed by atomic slot-capacity counters.
4. **Order Placement:** The cart is confirmed using campus wallet balance or simulated payment, generating a unique token (e.g., `A-12`).
5. **Real-Time Tracking:** The student monitors order progression from their smartphone via Socket.IO events.
6. **Collection:** Upon receiving the `READY_FOR_PICKUP` alert, the student arrives at the designated counter, presents token `A-12`, and retrieves their tray within the 10-minute grace period.

### 2. Canteen Staff / Kitchen Persona Workflow
1. **Kitchen Dashboard:** Staff monitor an active order queue partitioned by status lanes.
2. **Order Acceptance:** New `PLACED` orders are reviewed and acknowledged (`ACCEPTED`).
3. **Meal Preparation:** As assembly begins, staff update status to `PREPARING`, alerting the student.
4. **Ready for Pickup Notification:** When the meal is boxed or plated, staff mark it `READY_FOR_PICKUP`. This single action stamps the `readyAt` timestamp and starts the pickup countdown timer.
5. **Handover & Completion:** Staff verify the student token number at the counter and mark the order `PICKED_UP`, archiving the transaction.

### 3. Administrator Persona Workflow
1. **Catalog & Inventory Control:** Admins create menu items, update ingredient tags, and adjust unit prices.
2. **Slot Capacity Management:** Admins configure maximum concurrent order limits per 15-minute slot to prevent kitchen saturation.
3. **System Settings Configuration:** Admins configure global policy variables, such as grace period duration (default 10 minutes) and penalty fee amount (default ₹20).
4. **Audit Logs & Metrics:** Admins review transactional logs, system worker activity, and revenue breakdown.

---

## 5. The QueueLess Order Lifecycle & State Machine

The order lifecycle in QueueLess is governed by a finite state machine enforced by backend validation guards in `backend/src/services/orderService.ts`:

```
 [ PLACED ] --------> [ ACCEPTED ] --------> [ PREPARING ] --------> [ READY_FOR_PICKUP ] --------> [ PICKED_UP ]
     |                      |                      |                         |
     +-----> [ CANCELLED ]  +-----> [ REJECTED ]   +                         +-----> (10-Min Grace Period Exceeded)
                                                                                         |
                                                                                         v
                                                                                [ LATE FEE APPLIED (+Rs. 20) ]
```

### Valid State Transitions
* `PLACED` $ightarrow$ `ACCEPTED` or `CANCELLED` (Student can cancel before kitchen acceptance; slot released).
* `ACCEPTED` $ightarrow$ `PREPARING` or `REJECTED` (Staff can reject with reason; wallet balance refunded).
* `PREPARING` $ightarrow$ `READY_FOR_PICKUP` (Kitchen marks ready; `readyAt` recorded; timer activated).
* `READY_FOR_PICKUP` $ightarrow$ `PICKED_UP` (Student collects food; transaction finalized).

---

## 6. The 10-Minute Grace Period & ₹20 Late Fee Mechanics

To prevent counter congestion caused by uncollected food, QueueLess features an automated background penalty mechanism.

### The Problem of Abandoned & Stale Trays
When food sits on a collection counter for extended periods:
* Food loses temperature and nutritional quality.
* Physical counter space is occupied, blocking incoming orders.
* Kitchen staff cannot determine whether the student is simply delayed or has abandoned the order.

### Exact Implementation Mechanics
The late fee enforcement operates as a cooperative interaction between the Express backend and the autonomous Background Worker:

```
  +---------------------------------------------------------------------------------------------------+
  | 1. Staff clicks 'Ready for Pickup' in Dashboard                                                   |
  |    -> backend/src/services/orderService.ts executes:                                              |
  |         readyAt = new Date();                                                                     |
  |         graceMinutes = settings.gracePeriodMinutes || 10;                                         |
  |         pickupDeadline = readyAt + (10 * 60 * 1000);                                              |
  |         Order.status = 'READY_FOR_PICKUP';                                                        |
  +---------------------------------------------------------------------------------------------------+
                                                    |
                                                    v
  +---------------------------------------------------------------------------------------------------+
  | 2. Background Worker ticks every 15,000ms (15s)                                                   |
  |    -> worker/src/services/lateFeeService.ts executes:                                             |
  |         OrderWorker.find({                                                                        |
  |           status: 'READY_FOR_PICKUP',                                                             |
  |           pickupDeadline: { $lt: new Date() },                                                    |
  |           lateFeeApplied: 0                                                                       |
  |         });                                                                                       |
  +---------------------------------------------------------------------------------------------------+
                                                    |
                                                    v
  +---------------------------------------------------------------------------------------------------+
  | 3. Atomic Penalty Assessment                                                                      |
  |    -> For each candidate order:                                                                   |
  |         OrderWorker.findOneAndUpdate({                                                            |
  |           _id: candidate._id,                                                                     |
  |           status: 'READY_FOR_PICKUP',                                                             |
  |           pickupDeadline: { $lt: new Date() },                                                    |
  |           lateFeeApplied: 0                                                                       |
  |         }, {                                                                                      |
  |           $set: { lateFeeApplied: 20 },                                                           |
  |           $inc: { total: 20 }                                                                     |
  |         });                                                                                       |
  |    -> Write OrderStatusHistoryWorker record ("Late pickup penalty fee of Rs. 20 applied...")      |
  |    -> Write AuditLogWorker entry                                                                  |
  |    -> Touch /tmp/worker-heartbeat timestamp                                                       |
  +---------------------------------------------------------------------------------------------------+
```

### Critical Implementation Details
* **Timer Activation Trigger:** The pickup grace period timer **does not** start when the order is placed or accepted. It begins **strictly** when the staff member clicks "Ready for Pickup", which records the exact timestamp in the `readyAt` field and computes `pickupDeadline = readyAt + 10 minutes`.
* **Penalty Quantum:** The default fee is ₹20 (configurable in `CANTEEN_GLOBAL_SETTINGS`).
* **Idempotency Guarantee:** The worker query explicitly filters for `lateFeeApplied: 0` and uses an atomic MongoDB `findOneAndUpdate` operation. Even if the scan runs multiple times or checks the same order on subsequent 15-second cycles, the penalty is applied **strictly once**.

---

## 7. Teaching Formula: Core Fundamentals

### Concept 1: The QueueLess Order Lifecycle
> **UNDERSTAND:** In a manual canteen, orders are written on paper slips or shouted across the counter. QueueLess turns the order into a formal digital state machine where every step (Placed, Accepted, Preparing, Ready, Picked Up) is tracked and broadcast in real time.
>
> **QUEUELESS IMPLEMENTATION:** The order lifecycle is governed by Mongoose models in `backend/src/models/Order.ts` and validated by transition guards in `backend/src/services/orderService.ts`. Transitions trigger real-time Socket.IO room events to both student and kitchen clients.
>
> **PRESENTATION ANSWER:** "QueueLess models the physical kitchen workflow as a strict digital state machine: Placed, Accepted, Preparing, Ready for Pickup, and Picked Up. Each transition updates MongoDB, validates business rules, and broadcasts real-time WebSocket events to eliminate physical counter inquiries."

### Concept 2: The Automated Pickup Grace Period and Late Fee
> **UNDERSTAND:** If students order food but do not collect it, food gets cold and counters get clogged. QueueLess gives students a 10-minute window to collect their food once it is ready. If they are late, an automated background process adds a ₹20 penalty fee.
>
> **QUEUELESS IMPLEMENTATION:** When kitchen staff mark an order `READY_FOR_PICKUP`, `readyAt` is recorded and `pickupDeadline` is set to 10 minutes in the future. An independent background worker polls MongoDB every 15 seconds, queries overdue orders with `pickupDeadline < now` and `lateFeeApplied == 0`, and atomically increments the total by ₹20.
>
> **PRESENTATION ANSWER:** "To maintain counter throughput and prevent food abandonment, QueueLess enforces an automated 10-minute collection grace period starting the moment kitchen staff mark an order ready. An independent background worker continuously monitors deadlines and atomically applies a ₹20 penalty to overdue orders."


---

# PART B — COMPLETE TECHNICAL ARCHITECTURE

## 1. High-Level Technology Stack & Rationale

QueueLess is architected as a decoupled, multi-tier microservices platform. Every technology in the stack was selected to satisfy specific architectural requirements regarding latency, developer productivity, type safety, and operational resilience:

| Layer / Component | Technology | Version | Key Responsibility & Engineering Justification |
|---|---|:---:|---|
| **Client / Presentation** | **Next.js** (App Router) | **16.x** | Modern React framework providing server-side rendering, optimized client bundling, and fast page hydration. |
| **UI Library** | **React** | **19.x** | Declarative component UI engine for interactive state management (order tracker, cart, live kitchen board). |
| **Styling & Design** | **Tailwind CSS** | **v4** | Utility-first CSS engine delivering responsive, accessible UI without heavy stylesheet overhead. |
| **Type Safety** | **TypeScript** | **5.x** | Full-stack static typing across data contracts, API payloads, and database document interfaces. |
| **API & Business Logic** | **Express.js / Node.js** | **Node 22 / Express 4** | High-performance asynchronous event-driven REST API engine handling authentication, order processing, and RBAC. |
| **Data Persistence** | **MongoDB Community** | **7.x** | Document database providing high-throughput flexible schema storage for catalogs, orders, histories, and audit logs. |
| **ODM Layer** | **Mongoose** | **8.x** | Object Data Modeling library enforcing schema constraints, field validation, and atomic aggregation pipelines. |
| **Real-Time Communication** | **Socket.IO** | **4.x** | Bidirectional WebSocket abstraction providing auto-reconnection, event fallbacks, and room-based pub/sub routing. |
| **Containerization** | **Docker Engine** | **27.x** | Hermetic application packaging ensuring cross-environment parity from developer workstation to cluster. |
| **Local Orchestration** | **Docker Compose** | **v2** | Multi-container declarative runtime for local multi-service testing, network linking, and volume persistence. |
| **Production Orchestration** | **Kubernetes** | **v1.30+** | Declarative container orchestration handling self-healing, rolling updates, DNS service discovery, and scaling. |
| **Local K8s Environment** | **Minikube** | **v1.34+** | Local single-node Kubernetes cluster running inside Docker Desktop on macOS. |
| **Edge Routing & Ingress** | **Traefik Ingress** | **v3** | HTTP reverse proxy routing external traffic via hostname `queueless.local` to cluster services. |
| **CI/CD Automation** | **GitHub Actions** | **Runner v4** | Cloud-native CI/CD executing automated quality gates, linting, unit/integration testing, and Docker builds. |
| **Container Registry** | **Docker Hub** | **Cloud** | Central distribution registry hosting multi-architecture (`linux/amd64`, `linux/arm64`) SHA-tagged images. |

---

## 2. End-to-End System Architecture Diagram

The diagram below maps the complete topology of QueueLess, illustrating how code flows from developer machines and GitHub Actions into Docker Hub, and how external user traffic navigates through Minikube Ingress to the containerized workloads:

```
=========================================================================================================================
                                        QUEUELESS CLOUD & REPOSITORY ECOSYSTEM
=========================================================================================================================

   DEVELOPER WORKSTATION                             GITHUB REPOSITORY & CI/CD                     DOCKER HUB REGISTRY
  +-----------------------+                       +-----------------------------+               +-----------------------+
  |  Local Source Code    |  git push feat/ci     |  GitHub Actions Workflow    |  push image   |  Multi-Arch Images    |
  |  (Next.js, Express,   | --------------------> |  - Gate 1: Frontend Build   | ------------> |  - queueless-frontend |
  |   Worker, Manifests)  |                       |  - Gate 2: Backend Tests    |               |  - queueless-backend  |
  +-----------------------+                       |  - Gate 3: Worker Tests     |               |  - queueless-worker   |
              |                                   |  - Gate 4: Manifest Lint    |               |  (Tags: sha-* &       |
              |                                   |  - Publish: Buildx (AMD/ARM)|               |   latest)             |
              |                                   +-----------------------------+               +-----------------------+
              |                                                  |                                          |
              | ./scripts/deploy-k8s.sh <SHA>                    | (PR Merged)                              |
              +--------------------------------------------------+                                          |
                                         |                                                                  |
                                         v                                                                  |
=========================================================================================================   |
                                 LOCAL KUBERNETES RUNTIME (MINIKUBE ON DOCKER)                              |
=========================================================================================================   |
                                                                                                            |
      TRAEFIK INGRESS CONTROLLER (:80)                                                                      |
      Host: queueless.local                                                                                 |
     +-------------------------------------------------------------------------------------------------+    |
     |  Path: /             --> Service: frontend (:3000)                                              |    |
     |  Path: /api/v1       --> Service: backend  (:5001)                                              |    |
     |  Path: /socket.io    --> Service: backend  (:5001)                                              |    |
     +-------------------------------------------------------------------------------------------------+    |
               |                                       |                                                    |
               v                                       v                                                    |
     +-------------------+                   +-------------------+                                          |
     | SERVICE: frontend |                   | SERVICE: backend  |                                          |
     | Port: 3000        |                   | Port: 5001        |                                          |
     +-------------------+                   +-------------------+                                          |
               |                                       |                                                    |
               v                                       v                                                    |
     +-----------------------+               +-----------------------+                                      |
     | DEPLOYMENT: frontend  |               | DEPLOYMENT: backend   |                                      |
     | Pod: frontend-*       |               | Pod: backend-*        |                                      |
     | Image: pull <---------+---------------+-----------------------+--------------------------------------+
     +-----------------------+               +-----------------------+
                                                       |
                                                       +-----------------------------+
                                                       |                             |
                                                       v                             v
                                            +---------------------+       +----------------------+
                                            | SERVICE: mongodb    |       | DEPLOYMENT: worker   |
                                            | Port: 27017 (None)  |       | Pod: worker-*        |
                                            +---------------------+       | Replicas: 1 (Recreate|
                                                       |                  | Polls Mongo every 15s|
                                                       v                  +----------------------+
                                            +---------------------+                  |
                                            | STATEFULSET: mongo  |                  |
                                            | Pod: mongodb-0      | <----------------+
                                            | Image: mongo:7      |
                                            +---------------------+
                                                       |
                                                       v
                                            +---------------------+
                                            | PERSISTENT VOLUME   |
                                            | CLAIM: mongodb-pvc  |
                                            | 2Gi ReadWriteOnce   |
                                            +---------------------+
=========================================================================================================================
```

---

## 3. Communication Patterns: Synchronous REST vs Real-Time WebSockets

QueueLess employs a dual-channel communication architecture to deliver responsive user experiences while keeping server load predictable:

### 1. Synchronous REST API Flow (HTTP / JSON)
Standard transactional operations (such as authentication, menu retrieval, order submission, and slot booking) execute via standard stateless HTTP REST endpoints exposed on `/api/v1`:

```
 [ Browser / Client ] ---( 1. POST /api/v1/auth/login )-----------------> [ Ingress / Traefik ]
                                                                                  |
 [ Browser / Client ] <--( 4. HTTP 200 OK + JWT Token )--------------------+      | (2. Proxy /api/v1)
                                                                           |      v
                                                                    [ Backend Service ]
                                                                           |
                                                                           | (3. Query User / Compare Hash)
                                                                           v
                                                                    [ MongoDB (mongodb-0) ]
```

1. The client issues an HTTP request with JSON payload and optional `Authorization: Bearer <JWT>` header.
2. Ingress receives the packet on port 80, matches host `queueless.local` and path `/api/v1`, and forwards it to the `backend` ClusterIP service.
3. Express processes middleware (CORS, rate limiting, JWT validation), executes business logic in `src/services/`, and queries MongoDB via Mongoose.
4. The JSON response returns synchronously through Ingress to the client.

### 2. Real-Time Bidirectional Event Flow (Socket.IO / WebSockets)
Asynchronous state changes (such as order status updates, kitchen queue movement, and cancellation alerts) are pushed instantly via Socket.IO:

```
 [ Student Browser ]                        [ Backend Socket Engine ]                      [ Staff Kitchen Board ]
        |                                              |                                              |
        | --- 1. Connect & Join Room (order:102) ----> |                                              |
        |                                              | <--- 2. Staff Updates Order: 'PREPARING' --- |
        |                                              |                                              |
        |                                              | --- 3. Save status to MongoDB                |
        |                                              |                                              |
        |                                              | --- 4. Emit 'order:status_updated' --------> |
        | <--- 5. Push 'order:status_updated' -------- |    (to room: order:102 and canteen:main)     |
        |      (UI updates progress bar)               |                                              |
```

* **Room Partitioning:** Socket.IO partitions traffic using discrete rooms:
  * `order:<orderId>`: Subscribed to exclusively by the student who owns the order.
  * `canteen:<canteenId>`: Subscribed to by all kitchen staff terminals for aggregate queue synchronization.
  * `user:<userId>`: Personal channel for direct notifications and wallet updates.
* **Auto-Reconnection:** If a student enters an elevator or experiences transient packet loss, the Socket.IO client automatically falls back to HTTP long-polling and buffers reconnect requests until WebSocket connectivity is re-established.

---

## 4. Autonomous Background Processing Architecture

Unlike synchronous web servers that only act when an HTTP request arrives, the QueueLess platform features an independent daemon: the **Background Worker**.

```
 +---------------------------------------------------------------------------------------------------+
 | WORKER DAEMON POD (worker-*)                                                                      |
 |                                                                                                   |
 |   +--------------------+     Every 15s     +--------------------------------------------------+   |
 |   | setInterval Engine | ----------------> | lateFeeScanner.runLateFeeScan()                  |   |
 |   +--------------------+                   +--------------------------------------------------+   |
 |                                                                     |                             |
 |                                            Check 1: isRunning == false?                           |
 |                                            Check 2: mongoose.connection == connected?             |
 |                                                                     |                             |
 |                                                                     v                             |
 |                                            +--------------------------------------------------+   |
 |                                            | Query MongoDB:                                   |   |
 |                                            | status == 'READY_FOR_PICKUP'                     |   |
 |                                            | pickupDeadline < now                             |   |
 |                                            | lateFeeApplied == 0                              |   |
 |                                            +--------------------------------------------------+   |
 |                                                                     |                             |
 |                                            +------------------------+-------------------------+   |
 |                                            | For Each Overdue Order:                          |   |
 |                                            | - Atomically increment total by Rs. 20           |   |
 |                                            | - Record OrderStatusHistoryWorker entry          |   |
 |                                            | - Record AuditLogWorker entry                    |   |
 |                                            +--------------------------------------------------+   |
 |                                                                     |                             |
 |                                            +--------------------------------------------------+   |
 |                                            | Write Heartbeat File:                            |   |
 |                                            | /tmp/worker-heartbeat                            |   |
 |                                            | { timestamp: Date.now(), status: "healthy" }     |   |
 |                                            +--------------------------------------------------+   |
 +---------------------------------------------------------------------------------------------------+
```

### Why Decouple the Worker into a Separate Service?
1. **CPU & Memory Isolation:** Long-running analytical scans or heavy background processing cannot starve Express HTTP threads or degrade student API response times.
2. **Independent Failure Domain:** If a database transaction error or parsing anomaly crashes the worker daemon, the Express API and frontend continue operating without interruption.
3. **Discrete Health Monitoring:** The worker does not expose an HTTP port. Instead, its operational health is monitored via an active filesystem heartbeat (`/tmp/worker-heartbeat`), which records timestamps and database connectivity on every tick.

---

## 5. Teaching Formula: Architecture Concepts

### Concept 1: Microservices Decoupling (Frontend, Backend, Worker, DB)
> **UNDERSTAND:** Instead of building one giant application where the website, API, database, and background tasks run in a single process, QueueLess separates them into 4 distinct services. If one crashes or needs an update, the others remain online.
>
> **QUEUELESS IMPLEMENTATION:** QueueLess maintains four separate containerized services: `frontend` (Next.js), `backend` (Express REST/Socket.IO), `worker` (background late-fee engine), and `mongodb` (persistent database StatefulSet).
>
> **PRESENTATION ANSWER:** "We adopted a decoupled 4-tier architecture comprising Next.js for the UI, Express for REST and WebSocket APIs, an isolated background worker for deadline automation, and MongoDB for persistence. This separation of concerns ensures that background tasks never block student transactions and allows independent scaling and deployments."

### Concept 2: Real-Time WebSockets vs HTTP Polling
> **UNDERSTAND:** In traditional websites, your browser has to repeatedly ask the server "Is my food ready yet?" every few seconds (polling), which wastes bandwidth and server power. With WebSockets, a permanent two-way phone line is opened: the moment the kitchen clicks 'Ready', the server pushes the alert directly to the student's screen.
>
> **QUEUELESS IMPLEMENTATION:** We use Socket.IO on top of Express. When an order transitions from `PREPARING` to `READY_FOR_PICKUP`, the backend emits an `order:status_updated` event to the specific `order:<orderId>` room, updating the student's progress bar in under 100 milliseconds.
>
> **PRESENTATION ANSWER:** "Rather than burdening the server with inefficient HTTP polling, QueueLess uses Socket.IO to establish bidirectional event channels. Order updates are partitioned into discrete rooms, delivering sub-second state transitions directly to the student's device the instant kitchen staff advance the order."


---

# PART C — WHERE EVERYTHING ACTUALLY RUNS: RUNTIME & INFRASTRUCTURE TOPOLOGY

## 1. Demystifying the Actual Environment

A frequent source of confusion during technical presentations is failing to clearly articulate the physical and virtual boundaries where code executes.

For QueueLess, the entire system spans three distinct environments:
1. **The Developer Workstation (Local macOS Machine):** Where code is authored, local Git commits are created, and deployment scripts are triggered.
2. **GitHub Cloud (GitHub-Hosted Actions Runners):** Where automated continuous integration workflows execute on ephemeral Ubuntu virtual machines.
3. **Docker Hub (Cloud Registry):** Where immutable multi-architecture container images are publicly hosted.
4. **Local Kubernetes Cluster (Minikube on Docker Desktop):** Where the actual production-like container workloads, persistent database storage, and Ingress proxies execute.

```
+-----------------------------------------------------------------------------------------------------+
| PHYSICAL HOST: Apple Mac (macOS)                                                                    |
|                                                                                                     |
|  +---------------------------+        +----------------------------------------------------------+  |
|  | Developer Shell (zsh)     |        | DOCKER DESKTOP ENGINE (HyperKit / Virtualization VM)    |  |
|  | - git commits             |        |                                                          |  |
|  | - ./scripts/deploy-k8s.sh |        |  +----------------------------------------------------+  |  |
|  +---------------------------+        |  | MINIKUBE SINGLE-NODE CLUSTER (minikube node)       |  |  |
|               |                       |  |                                                    |  |  |
|               | kubectl commands      |  |  Namespace: queueless                              |  |  |
|               +---------------------> |  |  - Pod: frontend-*                                 |  |  |
|                                       |  |  - Pod: backend-*                                  |  |  |
|                                       |  |  - Pod: worker-*                                   |  |  |
|                                       |  |  - Pod: mongodb-0                                  |  |  |
|                                       |  |  - Volume: mongodb-pvc (2Gi on host disk)          |  |  |
|                                       |  |  - Ingress: Traefik Controller (:80)               |  |  |
|                                       |  +----------------------------------------------------+  |  |
|                                       +----------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------------------+
                                    ^                                     ^
                                    | pull image                          | push image
                                    |                                     |
                   +----------------------------------+                   |
                   | DOCKER HUB REGISTRY (Cloud)      | <-----------------+
                   | - srujans22/queueless-frontend   |
                   | - srujans22/queueless-backend    |
                   | - srujans22/queueless-worker     |
                   +----------------------------------+
                                    ^
                                    | push on merge to main
                                    |
                   +----------------------------------+
                   | GITHUB ACTIONS CI/CD (Cloud)     |
                   | - Runner: ubuntu-latest          |
                   | - Ephemeral MongoDB Service      |
                   | - Multi-Arch QEMU / Buildx       |
                   +----------------------------------+
```

---

## 2. Definitive Component Location Matrix

The table below lists every single component of QueueLess, where it actually runs, and its architectural role:

| Component | Actual Runtime Location | Underlying Infrastructure | Detailed Responsibility |
|---|---|---|---|
| **Frontend UI** | Kubernetes Deployment & Pod | Minikube Node via Docker Desktop | Runs standalone Next.js server on port 3000 rendering HTML/React pages. |
| **Backend REST & Socket API** | Kubernetes Deployment & Pod | Minikube Node via Docker Desktop | Runs Express server on port 5001 processing API queries and WebSockets. |
| **Background Worker** | Kubernetes Deployment & Pod | Minikube Node via Docker Desktop | Runs Node.js daemon (1 replica, Recreate) polling MongoDB and assessing late fees. |
| **MongoDB Database** | Kubernetes StatefulSet & Pod | Minikube Node via Docker Desktop | Runs MongoDB 7.x instance on port 27017 holding all application collections. |
| **MongoDB Storage** | PersistentVolumeClaim (`mongodb-pvc`) | Minikube host-path standard storage class | Retains physical database files (`/data/db`) on the host disk across pod restarts. |
| **Edge Ingress Proxy** | Traefik Ingress Controller | Minikube system namespace | Routes incoming traffic for hostname `queueless.local` to cluster internal services. |
| **Container Images** | Docker Hub Cloud Registry | Public Docker Registry (`srujans22/*`) | Hosts immutable multi-architecture image layers indexed by full Git commit SHAs. |
| **CI Quality Gates** | Ephemeral Ubuntu VM | GitHub Actions Cloud Infrastructure | Compiles TypeScript, runs linters, and executes 45 automated tests against clean databases. |
| **Kubernetes Control Plane** | Minikube Core Components | Docker Desktop container on Mac | Provides API server, etcd, scheduler, and controller manager for cluster operations. |

---

## 3. Core DevOps Concepts Explained with Simple Analogies

One of the most common pitfalls in DevOps oral examinations is confusing images, containers, pods, and deployments. The table below provides rigorous technical definitions paired with intuitive physical analogies:

```
  BLUEPRINT           SHIPPING BOX         BUILDING FLATS       BUILDING SUPERVISOR   BANK SAFE
 [ Docker Image ] -> [ Container ]  ->  [ Kubernetes Pod ] ->  [ Deployment ]    ->  [ PVC ]
```

### 1. Docker Image
* **Technical Definition:** A read-only, multi-layered template containing the operating system filesystem, runtime binaries, dependencies, and compiled application source code required to execute a process.
* **Simple Analogy:** The architectural blueprint or recipe. An architectural drawing of a house is not a physical building you can live in; it is an immutable set of instructions detailing exactly how to construct the house.
* **QueueLess Manifestation:** `srujans22/queueless-backend:sha-474e21646fabc877955b9c4d4690e6cffd4f4330` stored on Docker Hub.

### 2. Docker Container
* **Technical Definition:** An isolated, runnable instance of a Docker image executing as a sandboxed user-space process on a shared host Linux kernel, constrained by cgroups (resource limits) and namespaces (process/network isolation).
* **Simple Analogy:** The physical house constructed from the blueprint. You can walk inside, turn on the lights, and live in it.
* **QueueLess Manifestation:** The running Node.js process executing `node dist/index.js` inside an isolated Linux namespace.

### 3. Kubernetes Pod
* **Technical Definition:** The smallest deployable computing unit in Kubernetes. A Pod encapsulates one or more containers that share identical network namespaces (same IP address, localhost loopback), storage volumes, and lifecycle specifications.
* **Simple Analogy:** A residential apartment flat. A flat can house one person (single-container pod) or two roommates who share the same address, mailbox, and kitchen (multi-container pod with sidecar).
* **QueueLess Manifestation:** `pod/backend-656b9b46cd-x8dkr` running in the `queueless` namespace with its own cluster IP.

### 4. Kubernetes Deployment
* **Technical Definition:** A declarative higher-level controller that manages the creation, scaling, self-healing, and rolling updates of a replica set of identical stateless Pods.
* **Simple Analogy:** The apartment building management company. If a tenant moves out or a flat is damaged, the management company immediately renovates and replaces the flat to ensure the building always maintains its contracted capacity.
* **QueueLess Manifestation:** `deployment/backend` which ensures exactly 1 healthy backend pod is continuously running.

### 5. Kubernetes StatefulSet
* **Technical Definition:** A controller designed for stateful workloads requiring stable, unique network identifiers (e.g., `mongodb-0`), ordered graceful deployments/terminations, and dedicated persistent volume attachment that survives pod recreation.
* **Simple Analogy:** A bank safety deposit vault assigned to an individual account holder. If the bank teller shifts, your assigned safe deposit box remains physically locked to your specific key number and does not disappear.
* **QueueLess Manifestation:** `statefulset/mongodb` ensuring the database pod is always named `mongodb-0` and attaches to `mongodb-pvc`.

### 6. Kubernetes Service
* **Technical Definition:** An abstraction that defines a logical set of Pods and a consistent policy to access them. It provides a stable virtual IP address (ClusterIP) and DNS name that load-balances traffic across dynamic, ephemeral Pod IP addresses.
* **Simple Analogy:** The main customer service switchboard phone number for a company. Even if individual support staff change desks or shift hours, dialing the switchboard number always connects you to an available operator.
* **QueueLess Manifestation:** `service/backend` exposing internal cluster port 5001 at DNS address `backend.queueless.svc.cluster.local`.

### 7. Kubernetes Ingress
* **Technical Definition:** An API object that manages external HTTP/HTTPS access to services within the cluster, providing name-based virtual hosting, path-based URL routing, and SSL termination.
* **Simple Analogy:** The security gatekeeper and reception directory at the building entrance. Visitors say "I have an appointment for `/api/v1`", and the receptionist directs them to Tower B, Floor 5.
* **QueueLess Manifestation:** `ingress/queueless-ingress` routing incoming requests for `queueless.local/api/v1` to `service/backend`.

### 8. PersistentVolumeClaim (PVC)
* **Technical Definition:** A declarative request for persistent storage by a user or workload. It specifies storage capacity and access modes, binding to an underlying physical PersistentVolume (PV) independent of the lifecycle of any individual Pod.
* **Simple Analogy:** A long-term rented storage unit in a commercial warehouse. Even if you move between different residential apartments, all your furniture and physical possessions remain safely stored in the rented unit.
* **QueueLess Manifestation:** `mongodb-pvc` reserving 2Gi of disk space on the Minikube host machine, preserving database collections even when `mongodb-0` restarts.

---

## 4. Teaching Formula: Infrastructure Concepts

### Concept 1: Docker Container vs Kubernetes Pod
> **UNDERSTAND:** A Docker container is an isolated Linux process running on your machine. A Kubernetes Pod is a wrapper around that container (or group of containers) that allows Kubernetes to manage its networking, storage, health probes, and lifecycle as a single unit.
>
> **QUEUELESS IMPLEMENTATION:** Each service (backend, frontend, worker) is defined as a container inside a Kubernetes Pod manifest in the `k8s/` directory.
>
> **PRESENTATION ANSWER:** "A Docker container is an isolated process created from an image. A Kubernetes Pod is the atomic scheduling unit of Kubernetes that wraps the container, providing it with a cluster IP, shared storage volumes, and lifecycle policies. In QueueLess, every workload runs inside a Pod managed by a Deployment or StatefulSet."

### Concept 2: Deployment vs StatefulSet
> **UNDERSTAND:** Deployments are for stateless applications (like our web server or frontend) where pods are completely interchangeable and can be killed or replaced at any time. StatefulSets are for stateful applications (like MongoDB) where the pod needs a fixed identity and must reattach to its exact same physical hard drive when it restarts.
>
> **QUEUELESS IMPLEMENTATION:** Frontend, backend, and worker are stateless workloads managed by `Deployment` controllers. MongoDB is managed by a `StatefulSet` attached to `mongodb-pvc`, ensuring data integrity across pod recreations.
>
> **PRESENTATION ANSWER:** "We use Deployments for our stateless microservices (frontend, backend, worker) because their pods are disposable and can be rolling-updated without state loss. We use a StatefulSet for MongoDB because the database requires an immutable network identifier (`mongodb-0`) and dedicated binding to the 2Gi PersistentVolumeClaim."


---

# PART D — DOCKER AND CONTAINERIZATION

## 1. Why Containerization Was Mandatory

Before containerizing QueueLess, running the application on a new developer laptop required:
1. Manually installing Node.js 22, matching exact npm patch versions.
2. Manually installing MongoDB 7 locally, configuring default port 27017, and managing background daemon permissions.
3. Manually setting system environment variables across shell configuration files (`.zshrc`, `.bashrc`).
4. Running four separate terminal windows to start the frontend, backend, worker, and database.

This manual workflow led to the classic **"Works on My Machine"** failure mode:
* Developers on macOS with Apple Silicon (ARM64) experienced binary compilation discrepancies compared to developers or CI runners on x86_64 (AMD64).
* Host-level Node versions conflicted across different academic or personal projects.
* Local MongoDB databases frequently accumulated stale, unseeded test data that broke integration tests.

**Containerization eliminated these friction points completely.** By packaging the runtime, OS libraries, node modules, and application binaries into an immutable Docker image, QueueLess runs identically on any operating system with a single command.

---

## 2. Docker Core Concepts & Multi-Stage Architecture

### Docker Image vs Dockerfile vs Container
* **Dockerfile:** A declarative text script containing ordered instructions (`FROM`, `COPY`, `RUN`, `CMD`) that describe how to build an image layer by layer.
* **Docker Image:** The frozen, compiled artifact resulting from `docker build`. It contains every file needed to execute the application.
* **Docker Container:** The live running instance created via `docker run`. Multiple containers can be launched from the same single image.

### Why Multi-Stage Builds?
In standard single-stage builds, development dependencies (such as TypeScript compilers, linters, testing libraries, and build tools) remain trapped inside the final production container. This causes:
1. **Bloated Image Sizes:** Production images exceed 1.2 GB, slowing down container downloads and deployment rollouts.
2. **Security Vulnerabilities:** Retaining compilers and source code inside production containers gives potential attackers unnecessary attack tools.

QueueLess solves this using **Multi-Stage Builds** across all services:

```
  STAGE 1: BUILDER                               STAGE 2: RUNNER (PRODUCTION)
 +----------------------------------------+     +----------------------------------------+
 | - FROM node:22-alpine                  |     | - FROM node:22-alpine                  |
 | - Install ALL devDependencies (npm ci) |     | - Install ONLY production dependencies |
 | - Copy full TypeScript source code     |     | - Copy COMPILED JavaScript (/dist)     |
 | - Run "npm run build" (compile TS->JS) | --> | - Discard TypeScript compiler & source |
 |                                        |     | - Set USER node (UID 1000)             |
 | Result: Large scratch environment      |     | Result: Lean (~150MB), secure image   |
 +----------------------------------------+     +----------------------------------------+
```

---

## 3. Detailed Walkthrough of QueueLess Dockerfiles

### 1. Frontend Dockerfile (`Dockerfile`)
The frontend leverages Next.js 16 standalone output mode to compress a full Next.js application into a minimal Node.js server:
```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build Next.js application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Minimal production runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME="0.0.0.0" NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```
* **Why `libc6-compat`?** Alpine Linux uses `musl` instead of `glibc`. The `libc6-compat` package provides compatibility for Next.js internal binary bindings.
* **Why `standalone`?** Next.js automatically analyzes imports and bundles only the necessary node modules into `.next/standalone`, eliminating over 800MB of unused dependencies.

### 2. Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build   # Compiles TypeScript into /app/dist

# Stage 2: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=5001
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN chown -R node:node /app
USER node
EXPOSE 5001
CMD ["node", "dist/index.js"]
```

### 3. Worker Dockerfile (`worker/Dockerfile`)
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN chown -R node:node /app
USER node
CMD ["node", "dist/index.js"]
```

---

## 4. Docker Compose Orchestration (`docker-compose.yml`)

Docker Compose manages multi-container application lifecycles locally. The QueueLess Compose configuration connects all four services into a unified network:

```
  +-----------------------------------------------------------------------------------------+
  | DOCKER COMPOSE RUNTIME: queueless-network (bridge)                                      |
  |                                                                                         |
  |  +--------------------+         HTTP :5001         +--------------------+               |
  |  | frontend           | -------------------------> | backend            |               |
  |  | (port 3000:3000)   |                            | (port 5001:5001)   |               |
  |  +--------------------+                            +--------------------+               |
  |           |                                                  |                          |
  |           | depends_on (healthy)                             | depends_on (healthy)     |
  |           v                                                  v                          |
  |  +--------------------+                            +--------------------+               |
  |  | worker             | -------------------------> | mongo (port 27017) |               |
  |  | (daemon process)   |    mongodb://mongo:27017   +--------------------+               |
  |  +--------------------+                                      |                          |
  |           |                                                  v                          |
  |           | depends_on (healthy)                 +-----------------------+              |
  |           +------------------------------------> | queueless_mongo_data  | (Volume)     |
  |                                                  +-----------------------+              |
  +-----------------------------------------------------------------------------------------+
```

### Key Architectural Elements in `docker-compose.yml`
1. **Automated Dependency Coordination (`depends_on`):**
   * The `backend` and `worker` services declare `condition: service_healthy` on `mongo`. They do not launch until MongoDB responds successfully to internal ping commands.
   * The `frontend` declares `condition: service_healthy` on `backend`.
2. **Fail-Fast Secret Validation:**
   ```yaml
   JWT_SECRET: "${JWT_SECRET:?FATAL: JWT_SECRET must be set in your root .env file before launching QueueLess.}"
   ```
   If a developer runs `docker compose up` without specifying `JWT_SECRET` in `.env`, Compose immediately halts execution with a fatal message, preventing insecure default states.
3. **Internal DNS Service Discovery:**
   Containers communicate using their service names as hostnames. For example, the backend connects to MongoDB via `mongodb://mongo:27017/queueless` rather than hardcoding localhost or unstable IP addresses.

---

## 5. Persistence, Networking & Health Checks

### Data Persistence via Named Volumes
When a container terminates, its internal ephemeral filesystem is destroyed. To prevent data loss when MongoDB restarts, QueueLess attaches a named Docker volume:
```yaml
volumes:
  mongo_data:
    name: queueless_mongo_data
```
This maps `/data/db` inside the MongoDB container to a permanent storage directory on the host machine. You can stop, delete, and recreate the MongoDB container ten times—your orders, users, and menus remain 100% intact.

### Health Check Mechanisms
Docker health checks verify that a container is not just running, but actually capable of serving traffic:
* **MongoDB:** Executes `mongosh --eval "db.adminCommand('ping')"` every 10 seconds.
* **Backend:** Runs an inline Node HTTP client requesting `http://localhost:5001/api/v1/health` and checks for HTTP 200.
* **Frontend:** Requests `http://localhost:3000/api/health`.
* **Worker:** Inspects `/tmp/worker-heartbeat` to ensure the file exists and was modified within the last 45 seconds (`Date.now() - fs.statSync('/tmp/worker-heartbeat').mtimeMs < 45000`).

---

## 6. Essential Docker Diagnostic Commands

The table below outlines the core Docker commands relevant to QueueLess, including exact syntax and practical examples:

| Command | Purpose & QueueLess Context | Example Execution | Expected Output / Result |
|---|---|---|---|
| `docker ps` | Lists all active containers, exposed ports, and health statuses. | `docker ps --filter "name=queueless"` | Displays `frontend`, `backend`, `worker`, `mongo` with status `Up (healthy)`. |
| `docker images` | Lists all locally cached Docker images, tags, and disk footprints. | `docker images | grep queueless` | Shows image tags, image IDs, and sizes (~150MB for runner stages). |
| `docker logs` | Streams stdout/stderr console output from a specific container. | `docker logs -f queueless-backend` | Shows Express server startup, DB connection, and incoming HTTP request logs. |
| `docker inspect` | Extracts low-level JSON configuration, IP addresses, and mounts. | `docker inspect queueless-mongo` | Returns detailed JSON showing volume mount to `queueless_mongo_data`. |
| `docker compose up -d` | Builds, creates, and launches all 4 services in the background. | `docker compose up -d --build` | Compiles images, creates network and volumes, starts services in dependency order. |
| `docker compose down` | Stops and removes containers and internal networks safely. | `docker compose down` | Gracefully halts containers without deleting persistent volume data. |
| `docker compose config` | Validates YAML syntax and parses environment variable substitutions. | `docker compose config` | Outputs normalized, error-checked Compose configuration. |
| `docker volume ls` | Lists all persistent Docker volumes on the host system. | `docker volume ls` | Confirms existence of `queueless_mongo_data`. |
| `docker network ls` | Lists Docker virtual networks. | `docker network ls` | Shows `queueless-network` configured with the `bridge` driver. |

---

## 7. Teaching Formula: Docker Concepts

### Concept 1: Multi-Stage Docker Builds
> **UNDERSTAND:** When building TypeScript apps, you need large compilers and test tools. But once compiled into plain JavaScript, you only need the lightweight Node runtime. Multi-stage builds let you compile in Stage 1 and copy only the final JavaScript into Stage 2, throwing away all the heavy tools.
>
> **QUEUELESS IMPLEMENTATION:** `Dockerfile`, `backend/Dockerfile`, and `worker/Dockerfile` use multi-stage builds (`builder` and `runner`). The resulting runner images are based on Alpine Linux and weigh under 160MB, running securely as unprivileged user `node`.
>
> **PRESENTATION ANSWER:** "We use multi-stage Docker builds to compile our TypeScript code in a builder stage and copy only the compiled JavaScript and production dependencies into a clean Alpine runner stage. This reduced our production image sizes from over 1GB to under 160MB and eliminated build-tool vulnerabilities."

### Concept 2: Docker Named Volumes for Database Persistence
> **UNDERSTAND:** Containers are temporary. If a container stops or crashes, everything written inside it is deleted. A named volume is like plugging an external USB hard drive into the container: even if the container is destroyed, the files on the hard drive stay safe.
>
> **QUEUELESS IMPLEMENTATION:** In `docker-compose.yml`, MongoDB mounts named volume `queueless_mongo_data` to `/data/db`. In Kubernetes, this is mirrored by `mongodb-pvc`.
>
> **PRESENTATION ANSWER:** "Containers are inherently stateless and ephemeral. To ensure our MongoDB database survives container restarts and updates, we attach a named volume (`queueless_mongo_data`) mapped to `/data/db`. The database engine writes directly to persistent host storage."


---

# PART E — KUBERNETES AND MINIKUBE

## 1. Why Transition from Docker Compose to Kubernetes?

While Docker Compose is an excellent tool for local multi-container development, it has fundamental limitations when simulating production environments:
* **No Automated Self-Healing:** If a container crashes in Compose, it can restart, but Compose cannot reschedule workloads onto healthy nodes or replace frozen pods based on fine-grained health probes.
* **No Native Rolling Updates:** Updating an image in Compose typically requires stopping the container and starting a new one, causing brief service downtime.
* **No Declarative Ingress Controller:** Compose relies on static host port mappings (e.g., `3000:3000`), which causes port collisions and lacks path-based URL routing under a unified domain name.
* **No Production Parity:** Production cloud platforms (GKE, EKS, AKS) run on Kubernetes. Packaging QueueLess for Kubernetes ensures architectural readiness for enterprise cloud deployments.

**Minikube** provides a single-node Kubernetes cluster running inside Docker Desktop on macOS. It enables local testing of actual production Kubernetes manifests, Ingress routing, PersistentVolumeClaims, and rolling deployment strategies.

---

## 2. Complete Manifest-by-Manifest Inspection (`k8s/`)

Every Kubernetes resource in QueueLess is declaratively defined across nine YAML manifests in the `k8s/` directory. Below is the technical breakdown of each manifest:

```
  00-namespace.yaml ----------> Creates isolated 'queueless' sandbox
  01-configmap.yaml ----------> Injects common environment variables
  02-secret.yaml -------------> Injects cryptographic JWT secret
  03-mongodb-pvc.yaml --------> Claims 2Gi persistent disk space
  04-mongodb.yaml ------------> Headless Service & StatefulSet (mongo:7)
  05-backend.yaml ------------> ClusterIP Service & Deployment (Express API)
  06-worker.yaml -------------> Deployment (Replicas: 1, Recreate, Daemon)
  07-frontend.yaml -----------> ClusterIP Service & Deployment (Next.js UI)
  08-ingress.yaml ------------> Traefik Ingress routing for queueless.local
```

### 1. `00-namespace.yaml` — Resource Isolation
* **Kind:** `Namespace`
* **Name:** `queueless`
* **Purpose:** Establishes a private virtual cluster boundary. Isolates QueueLess workloads, configuration objects, and secrets from cluster system services (such as kube-system).

### 2. `01-configmap.yaml` — Shared Configuration
* **Kind:** `ConfigMap`
* **Name:** `queueless-config`
* **Injected Data:**
  * `NODE_ENV: "production"`
  * `BACKEND_PORT: "5001"`, `FRONTEND_PORT: "3000"`
  * `MONGODB_URI: "mongodb://mongodb.queueless.svc.cluster.local:27017/queueless"`
  * `CLIENT_URL: "http://queueless.local,http://localhost:3000,http://127.0.0.1:3000"`
  * `POLL_INTERVAL_MS: "15000"`
* **Why Cluster DNS?** The URI references `mongodb.queueless.svc.cluster.local`. This is Kubernetes CoreDNS notation: `<service>.<namespace>.svc.cluster.local`, allowing any pod in the cluster to find the database without hardcoded IP addresses.

### 3. `02-secret.yaml.example` — Sensitive Credentials
* **Kind:** `Secret` (Type: Opaque)
* **Name:** `queueless-secret`
* **Key:** `JWT_SECRET` (base64 encoded)
* **Security Pattern:** Kept out of version control. Developers copy `02-secret.yaml.example` to `02-secret.yaml` and inject real tokens locally.

### 4. `03-mongodb-pvc.yaml` — Persistent Storage Allocation
* **Kind:** `PersistentVolumeClaim`
* **Name:** `mongodb-pvc`
* **Storage Request:** `2Gi`
* **Access Mode:** `ReadWriteOnce` (RWO) — can be mounted as read-write by a single node.
* **Storage Class:** `standard` (Minikube host-path provisioner).

### 5. `04-mongodb.yaml` — Database StatefulSet & Headless Service
* **Components:**
  1. **Headless Service (`clusterIP: None`):** Provides a direct network identity for the StatefulSet pod on port 27017.
  2. **StatefulSet (`replicas: 1`):** Manages `mongodb-0`.
* **Resource Invariants:**
  * Requests: `cpu: 100m, memory: 200Mi`
  * Limits: `cpu: 400m, memory: 400Mi`
* **Storage Mount:** Mounts `mongodb-pvc` to `/data/db`.
* **Probes:** Configures `livenessProbe` and `readinessProbe` executing `mongosh --eval "db.adminCommand('ping')" --quiet`.

### 6. `05-backend.yaml` — Express REST API Deployment
* **Components:**
  1. **Service (`type: ClusterIP`):** Internal load balancer exposing port 5001.
  2. **Deployment (`replicas: 1`):** Manages stateless backend pods.
* **Security Context:** `runAsNonRoot: true`, `runAsUser: 1000` (Node user).
* **Probes:**
  * `readinessProbe`: HTTP GET `/api/v1/health` on port 5001.
  * `livenessProbe`: HTTP GET `/api/v1/health` on port 5001.

### 7. `06-worker.yaml` — Background Late-Fee Engine
* **Kind:** `Deployment`
* **Critical Design Invariant:** `replicas: 1` with `strategy: { type: Recreate }`.
* **Why Recreate?** During a rolling update, Kubernetes standard strategy (`RollingUpdate`) temporarily spins up a new pod *before* terminating the old one. For the worker, having two pods running simultaneously would cause duplicate late-fee evaluations. `Recreate` guarantees the old worker terminates before the new worker starts.
* **Heartbeat Volume:** An `emptyDir` memory volume mounted at `/tmp` so the worker can write `/tmp/worker-heartbeat`.

### 8. `07-frontend.yaml` — Next.js Standalone UI Deployment
* **Components:**
  1. **Service (`type: ClusterIP`):** Exposes port 3000.
  2. **Deployment (`replicas: 1`):** Serves pre-built Next.js pages.
* **Probes:** HTTP GET `/api/health` on port 3000.

### 9. `08-ingress.yaml` — Traefik Ingress Controller Routing
* **Kind:** `Ingress`
* **Ingress Class:** `traefik`
* **Host Rule:** `queueless.local`
* **Routing Rules:**
  * Path `/api/v1` $ightarrow$ `backend:5001`
  * Path `/socket.io` $ightarrow$ `backend:5001`
  * Path `/` $ightarrow$ `frontend:3000`

---

## 3. Strict Architectural Constraints

During presentation audits, explain these two strict architectural constraints:

### Constraint 1: Why the Worker Must Remain Exactly One Replica
```
 [ Worker Pod 1 ] ---> Reads Order X (overdue) ---> Adds Rs. 20 fee
                                                         ^
                                                         | RACE CONDITION!
 [ Worker Pod 2 ] ---> Reads Order X (overdue) ----------+ Adds Rs. 20 fee AGAIN!
```
The QueueLess background worker utilizes an in-process lock (`let isRunning = false;` in `worker/src/jobs/lateFeeScanner.ts`). This lock prevents overlapping scans within a single process. However, in-memory variables **are not shared across pods**. 
* If `replicas` were increased to 2 or 3, both pods could read the same overdue order concurrently before MongoDB commits the first update, risking double-charging the student.
* Until a distributed locking mechanism (e.g., Redis Redlock or a dedicated MongoDB locking collection) is implemented, the worker **must strictly remain at `replicas: 1`** with `strategy: Recreate`.

### Constraint 2: MongoDB StatefulSet Memory Limits & PVC Invariants
* **400Mi Memory Limit:** MongoDB in Minikube is allocated a strict 400Mi memory limit (`limits.memory: 400Mi`). During earlier intensive operations, MongoDB experienced an OOMKilled (Exit 137) event. The database recovered cleanly because its data files were stored in `mongodb-pvc`. To maintain cluster stability, this limit is strictly preserved.
* **2Gi PVC Safety:** The deployment script and CI workflows enforce a strict read-only policy on the StatefulSet and PVC. The database is **never deleted, restarted, or reseeded** during deployments.

---

## 4. Kubernetes Command Reference & QueueLess Examples

The table below catalogs essential `kubectl` commands, distinguishing commands actively used during QueueLess operations from standard diagnostic tools:

| Command & Syntax | Operational Context in QueueLess | Actual Example Executed | Expected Output / Result |
|---|---|---|---|
| `kubectl get pods -n queueless` | Used continuously to verify pod states, restart counts, and readiness. | `kubectl get pods -n queueless` | Shows 4 pods (`backend`, `frontend`, `worker`, `mongodb-0`) all `1/1 Running`. |
| `kubectl get deployments -n queueless` | Verifies deployment replica counts and rollout readiness. | `kubectl get deploy -n queueless` | Shows `backend`, `frontend`, `worker` with `1/1 READY`. |
| `kubectl get statefulsets -n queueless` | Audits the database StatefulSet status. | `kubectl get sts -n queueless` | Confirms `mongodb` is `1/1 READY`. |
| `kubectl get pvc -n queueless` | Confirms volume attachment and capacity. | `kubectl get pvc -n queueless` | Shows `mongodb-pvc` with status `Bound` and capacity `2Gi`. |
| `kubectl get ingress -n queueless` | Inspects host routing rules and IP binding. | `kubectl get ing -n queueless` | Shows `queueless-ingress` binding `queueless.local` on port 80. |
| `kubectl describe pod <pod> -n queueless` | Diagnostic command used to inspect events, mounts, and probe failures. | `kubectl describe pod backend-656b9b46cd-x8dkr -n queueless` | Shows container image SHA, probe intervals, and lifecycle events. |
| `kubectl logs <pod> -n queueless` | Diagnostic command to inspect application logs and unhandled errors. | `kubectl logs -l app.kubernetes.io/name=backend -n queueless` | Displays Express startup banner, MongoDB connection log, and health checks. |
| `kubectl exec -it <pod> -n queueless -- <cmd>` | Used by deployment scripts to query health endpoints and heartbeats internally. | `kubectl exec deploy/worker -n queueless -- cat /tmp/worker-heartbeat` | Returns JSON: `{"status":"healthy","db":"connected","timestamp":...}`. |
| `kubectl set image deployment/<name>` | **Actively used by deployment script** to update pod container images atomically. | `kubectl set image deployment/backend backend=srujans22/queueless-backend:sha-474e216... -n queueless` | Triggers rolling update of backend deployment to target Git SHA image. |
| `kubectl rollout status deployment/<name>` | **Actively used by deployment script** to block execution until pods are Ready. | `kubectl rollout status deployment/backend -n queueless --timeout=120s` | Returns `deployment "backend" successfully rolled out`. |
| `kubectl rollout history deployment/<name>` | Diagnostic command to view revision history of a deployment. | `kubectl rollout history deployment/frontend -n queueless` | Lists rollout revisions and associated change causes. |
| `kubectl rollout undo deployment/<name>` | Emergency command to roll back a deployment to its previous revision. | `kubectl rollout undo deployment/backend -n queueless` | Reverts deployment to previous ReplicaSet revision. |

---

## 5. Teaching Formula: Kubernetes Concepts

### Concept 1: Ingress vs NodePort vs ClusterIP
> **UNDERSTAND:** A ClusterIP service gives a pod an internal private phone extension only other pods can call. A NodePort opens a high-number port (like 31234) on the physical machine. An Ingress is an intelligent receptionist at the front door that listens on standard port 80, looks at the web address you typed (`queueless.local`), and routes you to the right department.
>
> **QUEUELESS IMPLEMENTATION:** Frontend and backend use internal `ClusterIP` services. External traffic enters through Traefik Ingress (`08-ingress.yaml`), which routes `/api/v1` to the backend and `/` to the frontend under host `queueless.local`.
>
> **PRESENTATION ANSWER:** "We use ClusterIP services to keep our application microservices securely isolated within the cluster network. External traffic enters through Traefik Ingress on port 80, which performs host-based and path-based routing, dispatching `/api/v1` requests to Express and root `/` requests to Next.js."

### Concept 2: Readiness Probes vs Liveness Probes
> **UNDERSTAND:** A liveness probe asks: "Are you still alive, or should I restart you?" A readiness probe asks: "Are you ready to take customer orders, or should I wait until your kitchen finishes heating up?"
>
> **QUEUELESS IMPLEMENTATION:** The backend defines both probes pointing to `/api/v1/health`. If MongoDB is momentarily slow to connect, the readiness probe fails and Kubernetes withholds traffic, preventing 500 errors from reaching students.
>
> **PRESENTATION ANSWER:** "A liveness probe detects whether a process is deadlocked and restarts it. A readiness probe verifies that the application has fully initialized—such as establishing its MongoDB connection—before Kubernetes routes user traffic to it. This guarantees zero downtime during deployments."


---

# PART F — CI/CD PIPELINE

## 1. CI/CD Principles & GitHub Actions Architecture

In professional software engineering, manual testing and manual image builds are unacceptable risks. A developer might forget to run tests, compile with outdated dependencies, or push a broken container to production.

* **Continuous Integration (CI):** The practice of automatically building, linting, and testing code on every push or Pull Request to detect integration errors within minutes.
* **Continuous Delivery (CD):** The automated pipeline that packages validated code into immutable release artifacts (multi-architecture Docker images) and publishes them to a container registry, ready for deployment.

QueueLess implements CI/CD using **GitHub Actions**, orchestrated via `.github/workflows/ci.yml`.

```
======================================================================================================================
                                         QUEUELESS CI/CD PIPELINE ARCHITECTURE
======================================================================================================================

  PULL REQUEST / GIT PUSH
             |
             v
  +----------------------------------------------------------------------------------------------------------------+
  | PARALLEL QUALITY GATES (Execute on GitHub-Hosted Ubuntu-Latest Runners)                                        |
  |                                                                                                                |
  |  +--------------------+  +-----------------------+  +----------------------+  +-----------------------------+  |
  |  | GATE 1: FRONTEND   |  | GATE 2: BACKEND       |  | GATE 3: WORKER       |  | GATE 4: MANIFESTS           |  |
  |  | - Node 22 setup    |  | - Node 22 setup       |  | - Node 22 setup      |  | - Docker Compose lint       |  |
  |  | - npm ci           |  | - MongoDB 7 service   |  | - MongoDB 7 service  |  | - Kubernetes YAML validate  |  |
  |  | - ESLint check     |  | - TypeScript compile  |  | - TypeScript compile |  | - Secret template check     |  |
  |  | - TypeScript types |  | - Seed Database       |  | - 2 Jest Unit Tests  |  +-----------------------------+  |
  |  | - Standalone Build |  | - 43 Jest Tests       |  +----------------------+                                   |
  |  +--------------------+  +-----------------------+                                                             |
  +----------------------------------------------------------------------------------------------------------------+
                                                         |
                                                         | ALL 4 GATES PASS?
                                                         | (AND branch == main)
                                                         v
  +----------------------------------------------------------------------------------------------------------------+
  | GATED PUBLISHING JOB: publish-images                                                                           |
  |                                                                                                                |
  |  1. Freshness Guard: Verify github.sha == origin/main HEAD                                                     |
  |  2. Docker Hub Authentication (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN secrets)                                    |
  |  3. Multi-Arch QEMU & Buildx Setup                                                                             |
  |  4. Build & Push Multi-Arch (linux/amd64, linux/arm64):                                                        |
  |     - srujans22/queueless-frontend:sha-<SHA> & :latest                                                         |
  |     - srujans22/queueless-backend:sha-<SHA> & :latest                                                          |
  |     - srujans22/queueless-worker:sha-<SHA> & :latest                                                           |
  |  5. Verify Image Manifests via "docker buildx imagetools inspect"                                              |
  +----------------------------------------------------------------------------------------------------------------+
```

---

## 2. The Four Automated Quality Gates

Whenever code is pushed to a branch or a Pull Request is opened against `main`, GitHub Actions spins up parallel ephemeral virtual machines to execute the four quality gates:

### Gate 1: Frontend Quality Gate (`frontend-gate`)
* **Runner:** `ubuntu-latest` (Node.js 22 runtime)
* **Execution Steps:**
  1. `npm ci`: Clean, reproducible dependency installation matching `package-lock.json`.
  2. `npm run lint`: Executes ESLint across all TypeScript React components to catch code smell and unused variables.
  3. `npx tsc --noEmit`: Typechecks the entire Next.js codebase without emitting files, catching type mismatches.
  4. `npm run build`: Executes the Next.js production compiler to verify standalone bundle generation.

### Gate 2: Backend Quality Gate (`backend-gate`)
* **Runner:** `ubuntu-latest` with a native Docker container service running `mongo:7`.
* **Execution Steps:**
  1. Spawns an isolated MongoDB service container on port 27017 mapped to `queueless_ci_test`.
  2. Compiles TypeScript via `npm run build` into `/backend/dist`.
  3. **Seeds Test Database:** Executes `npm run seed` to load baseline canteen slots, users, and menu items.
  4. **Executes Test Suite:** Runs `npm test`, executing **43 automated integration tests across 6 test suites**:
     * `auth.test.ts`: User registration, JWT issuance, password hashing.
     * `admin.test.ts`: Menu management, slot configuration, RBAC permissions.
     * `menu.test.ts`: Category filtering, pricing checks, availability toggling.
     * `orders.test.ts`: Order creation, slot validation, wallet deductions.
     * `slots.test.ts`: Atomic slot capacity increments and exhaustion guards.
     * `remediation.test.ts`: WebSocket handshake tests, CORS validation.

### Gate 3: Worker Quality Gate (`worker-gate`)
* **Runner:** `ubuntu-latest` with MongoDB 7 service.
* **Execution Steps:**
  1. Compiles worker TypeScript source.
  2. Runs `npm test` in the `/worker` directory:
     * Tests late-fee calculation logic against overdue mock orders.
     * Validates **idempotency** (verifies that scanning an overdue order twice never applies a double penalty).

### Gate 4: Manifest & Configuration Gate (`manifest-gate`)
* **Runner:** `ubuntu-latest`
* **Execution Steps:**
  1. Runs `docker compose config` to validate Compose syntax and environment variable rules.
  2. Runs `kubectl apply --dry-run=client` across all manifests in `k8s/` to catch YAML formatting, indentation, or schema errors before reaching any cluster.

---

## 3. The Docker Hub Publishing Pipeline (`publish-images`)

Publishing images to Docker Hub is strictly protected by three engineering safeguards:
1. **Quality Gate Dependency:** The `publish-images` job declares `needs: [frontend-gate, backend-gate, worker-gate, manifest-gate]`. If even a single test fails in any gate, image building is immediately aborted.
2. **Branch Protection:** Execution is conditioned on `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`. Feature branches and pull requests **never** publish images.
3. **Freshness Guard:** To prevent race conditions where an older, slow-running commit overwrites images from a newer commit, the job runs a git check verifying that `github.sha` matches the latest `origin/main` HEAD.

### Multi-Architecture Builds (AMD64 & ARM64)
Today's computing environments are heterogeneous:
* Developers frequently run Apple Silicon Macs (`ARM64` architecture).
* Production cloud servers and Minikube virtual machines typically run Intel/AMD processors (`AMD64` architecture).

Building an image strictly for AMD64 means it runs sluggishly or fails under emulation on ARM64 Macs. QueueLess uses **Docker Buildx and QEMU** to compile true multi-architecture binaries simultaneously:
```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3

- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and Push Multi-Arch Image
  uses: docker/build-push-action@v5
  with:
    context: ./backend
    platforms: linux/amd64,linux/arm64
    push: true
    tags: |
      srujans22/queueless-backend:sha-${{ github.sha }}
      srujans22/queueless-backend:latest
```

### Dual Tagging Strategy: Full Git SHA vs Latest
* **Immutable SHA Tag (`sha-474e21646fabc877955b9c4d4690e6cffd4f4330`):** Every build produces an immutable tag containing the exact 40-character Git commit SHA. This provides 100% cryptographic traceability: anyone looking at a running pod can identify the exact line of code that produced it.
* **Mutable `latest` Tag:** Updated as a convenience pointer for general inspection. The automated deployment script explicitly **rejects** `latest` to prevent caching ambiguities.

---

## 4. The Complete Code-to-Cluster Lifecycle

The journey of a code change from a developer's keyboard to the live cluster follows a strict 6-stage lifecycle:

```
 [ Local Laptop ]                      [ GitHub Repository ]                    [ Docker Hub Registry ]
  1. Author code in branch              3. Pull Request opened                  6. Multi-arch images pushed
  2. git commit && git push ------->    4. 4 Quality Gates run & pass              (sha-474e216... & latest)
                                        5. Merge PR to main                                |
                                                                                           v
 [ Minikube Cluster ] <--------------------------------------------------- [ Local Shell Execution ]
  8. Pods roll out with zero downtime                                       7. ./scripts/deploy-k8s.sh <SHA>
```

1. **Local Authoring:** Developer creates a feature branch (`feat/phase-6-cicd`) and writes code.
2. **Push to Remote:** Code is pushed to `origin/feat/phase-6-cicd`.
3. **Pull Request Opened:** PR #1 is created on GitHub against `main`.
4. **CI Evaluation:** GitHub Actions runs the 4 quality gates in parallel.
5. **Merge Commit:** Once approved and passed, PR #1 is merged into `main` via a merge commit (`474e21646fabc877955b9c4d4690e6cffd4f4330`).
6. **Publishing:** GitHub Actions detects the merge to `main`, re-runs all gates, and executes `publish-images`, pushing multi-arch images to Docker Hub.
7. **Deployment Execution:** The developer runs `./scripts/deploy-k8s.sh 474e21646fabc877955b9c4d4690e6cffd4f4330`.
8. **Live Rollout:** Kubernetes pulls the SHA-tagged images from Docker Hub, performs zero-downtime rolling updates, and verifies health checks.

---

## 5. Teaching Formula: CI/CD Concepts

### Concept 1: The Four Quality Gates
> **UNDERSTAND:** You wouldn't let a car leave the factory without checking the brakes, engine, electronics, and safety belts. Our CI pipeline has 4 separate automated inspection stations (Frontend, Backend, Worker, Manifests) that must all give a green light before code can be published.
>
> **QUEUELESS IMPLEMENTATION:** Defined in `.github/workflows/ci.yml`. Gate 1 builds Next.js, Gate 2 runs 43 backend tests against a live MongoDB container, Gate 3 tests worker idempotency, and Gate 4 checks YAML syntax.
>
> **PRESENTATION ANSWER:** "We implemented four parallel CI quality gates in GitHub Actions: frontend linting and compilation, backend integration tests with an ephemeral MongoDB service, background worker tests, and Kubernetes manifest validation. Docker image publishing is strictly blocked until all four gates pass."

### Concept 2: Immutable Git SHA Tagging vs `latest`
> **UNDERSTAND:** Labeling an image `latest` is like labeling a box of leftover food 'current dinner'—tomorrow it will mean something completely different, and you can't tell when it was cooked. Tagging with a Git SHA is like stamping the box with an indelible barcode linking directly to the exact recipe and minute it was made.
>
> **QUEUELESS IMPLEMENTATION:** The CI workflow tags images with both `sha-${{ github.sha }}` and `latest`. Our deployment script (`deploy-k8s.sh`) explicitly rejects `latest` and requires the 40-character SHA.
>
> **PRESENTATION ANSWER:** "Using `latest` in production introduces caching issues and ambiguity. By tagging images with the immutable 40-character Git SHA (`sha-474e216...`), we guarantee full auditability and ensure Kubernetes always pulls the exact binary matching the verified commit."


---

# PART G — DEPLOYMENT AUTOMATION AND ROLLBACK (`scripts/deploy-k8s.sh`)

## 1. Why Automated Deployment Scripting Was Mandatory

Deploying a microservices platform manually using raw `kubectl set image` commands involves significant operational risks:
1. **Human Typographical Errors:** A developer might mistype an image tag, point to a non-existent container, or target the wrong Kubernetes context.
2. **Partial / Half-Deployed States:** If the backend deployment succeeds but the frontend deployment fails due to a network glitch, the cluster is left in an inconsistent hybrid state.
3. **No Automated Rollback Safety Net:** If a newly deployed pod crashes due to a runtime configuration issue, an operator must manually remember the previous image tags and revert them by hand under stressful production conditions.
4. **Accidental Database Destruction:** An operator might accidentally run `kubectl delete all` or reapply a manifest that overwrites the persistent volume claim.

To solve this, QueueLess engineers created a dedicated, robust deployment automation script: **`scripts/deploy-k8s.sh`** (740+ lines of enterprise-grade Bash automation).

---

## 2. Architecture & Execution Flow of `deploy-k8s.sh`

The deployment automation script operates as a fail-closed finite state machine, progressing through seven defensive phases:

```
======================================================================================================================
                                   SAFE DEPLOYMENT SCRIPT EXECUTION LIFECYCLE
======================================================================================================================

 [ Invocation: ./scripts/deploy-k8s.sh <SHA> ]
                     |
                     v
  +----------------------------------------------------------------------------------------------------------------+
  | 1. PRE-FLIGHT SAFETY AUDIT                                                                                     |
  |    - Verify kubectl and jq exist in PATH                                                                       |
  |    - Enforce exact context: kubectl config current-context == 'minikube'                                       |
  |    - Validate input SHA: exactly 40 hex characters or 'sha-<40-hex>' (REJECT 'latest')                         |
  |    - Check Docker Hub: Verify images exist on registry before touching cluster                                 |
  +----------------------------------------------------------------------------------------------------------------+
                     | PASS
                     v
  +----------------------------------------------------------------------------------------------------------------+
  | 2. DATABASE & PVC IMMUTABILITY AUDIT                                                                           |
  |    - Verify mongodb-0 is 1/1 Running & Ready                                                                   |
  |    - Verify mongodb-pvc is Bound with 2Gi capacity                                                             |
  |    - STRICT RULE: Read-only check; script NEVER mutates, restarts, or reseeds the database                      |
  +----------------------------------------------------------------------------------------------------------------+
                     | PASS
                     v
  +----------------------------------------------------------------------------------------------------------------+
  | 3. BASELINE CAPTURE & HEARTBEAT CHECK                                                                          |
  |    - Save current image tags for backend, frontend, worker to memory variables                                 |
  |    - Capture baseline worker heartbeat timestamp via: kubectl exec deploy/worker -- cat /tmp/worker-heartbeat  |
  +----------------------------------------------------------------------------------------------------------------+
                     | PASS
                     v
  +----------------------------------------------------------------------------------------------------------------+
  | 4. PHASED DEPLOYMENT SEQUENCE (With Signal Traps & Rollback Guard)                                             |
  |                                                                                                                |
  |  [ Phase A: Backend Deployment ]                                                                               |
  |  - kubectl set image deployment/backend backend=<REGISTRY>/queueless-backend:sha-<SHA>                         |
  |  - kubectl rollout status deployment/backend --timeout=120s                                                    |
  |  - Verify HTTP GET /api/v1/health returns 200 OK via in-cluster pod exec                                       |
  |                                                                                                                |
  |  [ Phase B: Frontend Deployment ]                                                                              |
  |  - kubectl set image deployment/frontend frontend=<REGISTRY>/queueless-frontend:sha-<SHA>                      |
  |  - kubectl rollout status deployment/frontend --timeout=120s                                                   |
  |  - Verify HTTP GET /api/health returns 200 OK                                                                  |
  |                                                                                                                |
  |  [ Phase C: Worker Deployment ]                                                                                |
  |  - kubectl set image deployment/worker worker=<REGISTRY>/queueless-worker:sha-<SHA>                            |
  |  - kubectl rollout status deployment/worker --timeout=120s                                                     |
  |  - Poll /tmp/worker-heartbeat: VERIFY NEW TIMESTAMP > PRE-DEPLOYMENT BASELINE                                  |
  +----------------------------------------------------------------------------------------------------------------+
                     | PASS (Any failure triggers automatic execute_rollback)
                     v
  +----------------------------------------------------------------------------------------------------------------+
  | 5. FINAL CLUSTER ACCEPTANCE AUDIT                                                                              |
  |    - Audit all 4 pods: 1/1 Running & Ready                                                                     |
  |    - Confirm running image SHA matches target Git commit exactly                                               |
  |    - Confirm MongoDB StatefulSet remains 1/1 Ready and PVC Bound                                               |
  |    - Display deployment summary and exit code 0                                                                |
  +----------------------------------------------------------------------------------------------------------------+
```

---

## 3. Key Defensive Mechanisms Explained

### 1. Rejection of Mutable `latest` Tags
The script begins by parsing the input tag:
```bash
if [[ "${INPUT_TAG}" =~ ^[0-9a-fA-F]{40}$ ]]; then
  TARGET_SHA="${INPUT_TAG}"
elif [[ "${INPUT_TAG}" =~ ^sha-([0-9a-fA-F]{40})$ ]]; then
  TARGET_SHA="${BASH_REMATCH[1]}"
else
  log_error "Invalid image tag format '${INPUT_TAG}'. Must be a 40-character commit SHA or 'sha-<40-hex>'."
  log_error "Using mutable tags like 'latest' or 'dev' is strictly prohibited."
  exit 1
fi
```
Requiring the 40-character Git SHA ensures that every deployment is strictly pinned to an auditable commit in version control.

### 2. Strict Minikube Context Enforcement
To prevent accidentally running the script against an external or cloud Kubernetes cluster, the script inspects the active context:
```bash
CURRENT_CONTEXT=$(kubectl config current-context 2>/dev/null || echo "")
if [ "${CURRENT_CONTEXT}" != "minikube" ]; then
  log_error "Context violation: current kubectl context is '${CURRENT_CONTEXT}'. Must equal exactly 'minikube'."
  exit 1
fi
```

### 3. Registry Pre-Flight Validation
Before touching a single Kubernetes pod, the script checks Docker Hub to verify that all three images (`queueless-backend`, `queueless-frontend`, `queueless-worker`) actually exist for the target SHA. If an image is missing, the script halts before initiating any rollout, avoiding `ImagePullBackOff` loops.

### 4. Database Immutability & PVC Safety Invariant
The script contains zero commands that delete, restart, or reseed MongoDB. It checks:
```bash
PVC_STATUS=$(kubectl get pvc mongodb-pvc -n queueless -o jsonpath='{.status.phase}')
if [ "${PVC_STATUS}" != "Bound" ]; then
  log_error "PersistentVolumeClaim 'mongodb-pvc' is '${PVC_STATUS}'. Must be 'Bound'."
  exit 1
fi
```

### 5. Worker Heartbeat Advancement Check
How does the script know the new worker pod is actually working, and not just sitting idle in memory?
* Before deployment, the script records the current heartbeat timestamp: `BASELINE_HEARTBEAT_TIME`.
* After the worker rollout completes, the script polls `/tmp/worker-heartbeat` inside the new pod until:
  $$	ext{NEW\_HEARTBEAT\_TIME} > 	ext{BASELINE\_HEARTBEAT\_TIME}$$
* This mathematically proves that the newly deployed worker container has booted, connected to MongoDB, executed a scan cycle, and updated the heartbeat file.

---

## 4. The Automated Rollback Engine (`execute_rollback`)

If a deployment fails at any point—whether due to a rollout timeout, a failed HTTP health check, or an advancing heartbeat failure—the script automatically invokes `execute_rollback`:

```
                                  DEPLOYMENT FAILURE DETECTED!
                                                |
                                                v
                               +----------------------------------+
                               | 1. Trigger execute_rollback()    |
                               |    Print failure reason          |
                               +----------------------------------+
                                                |
                                                v
                               +----------------------------------+
                               | 2. Inspect MODIFIED_DEPLOYMENTS  |
                               |    (e.g., worker, frontend, back)|
                               +----------------------------------+
                                                |
                                                v
                               +----------------------------------+
                               | 3. Revert in REVERSE ORDER:      |
                               |    - Revert worker -> BASELINE   |
                               |    - Revert frontend -> BASELINE |
                               |    - Revert backend -> BASELINE  |
                               +----------------------------------+
                                                |
                                                v
                               +----------------------------------+
                               | 4. Await Rollout Status          |
                               |    Verify cluster restored       |
                               |    Exit with code 1              |
                               +----------------------------------+
```

### Signal Trapping (`trap`)
If an operator presses `Ctrl+C` (`SIGINT`) or sends `SIGTERM` in the middle of a rollout, Bash traps the signal immediately and invokes `execute_rollback`. This guarantees that an interrupted script never leaves the cluster in a half-deployed state.

### Testing Transparency
During Phase 6 testing, the rollback logic, signal trapping, and reverse-order reversion were validated via static code analysis, unit testing, and simulated dry-run tests. Because the live cluster was operating smoothly with production-grade data, a destructive live failure injection drill was intentionally omitted to prevent unnecessary risk to persistent data.

---

## 5. Actual Deployment Record: The Live Deployment

On November 14, 2026, the deployment script was executed against the live Minikube cluster using the final merged commit SHA:

```bash
./scripts/deploy-k8s.sh 474e21646fabc877955b9c4d4690e6cffd4f4330
```

### Verified Live Deployment Results
* **Pre-flight Checks:** `kubectl` and `jq` validated; context verified as `minikube`; Docker Hub images confirmed present for commit `474e21646fabc877955b9c4d4690e6cffd4f4330`.
* **StatefulSet & PVC:** `mongodb-0` confirmed `1/1 Ready`; `mongodb-pvc` confirmed `Bound` (2Gi).
* **Baseline Capture:** Saved previous image tags for backend, frontend, worker.
* **Phase A (Backend):** `kubectl set image` executed; rollout completed successfully; in-cluster health check to `/api/v1/health` returned HTTP 200 OK.
* **Phase B (Frontend):** `kubectl set image` executed; rollout completed successfully; health check to `/api/health` returned HTTP 200 OK.
* **Phase C (Worker):** `kubectl set image` executed; Recreate strategy terminated old pod and started new pod; heartbeat timestamp advanced beyond baseline; status confirmed `healthy`.
* **Final Audit:** All 4 workloads verified `1/1 Running` and `Ready` with exact SHA images. Zero database mutations or PVC re-attachments occurred.

---

## 6. Teaching Formula: Deployment Automation Concepts

### Concept 1: Atomic Deployment with Automated Rollback
> **UNDERSTAND:** When updating a complex system, you want an "undo" button. If the new backend starts but the new frontend crashes, our deployment script automatically hits undo, restoring the previous working versions of all services so users never experience an outage.
>
> **QUEUELESS IMPLEMENTATION:** `scripts/deploy-k8s.sh` tracks every mutated service in `MODIFIED_DEPLOYMENTS`. If any health check fails, `execute_rollback` reverts the services to their saved baseline images in reverse order and verifies their stability before exiting.
>
> **PRESENTATION ANSWER:** "We engineered `deploy-k8s.sh` to provide atomic deployments with automatic rollback. It captures baseline images before making changes, updates services in dependency order, verifies health probes and worker heartbeats, and automatically reverts the cluster to its known good state if any failure occurs."

### Concept 2: Worker Heartbeat Advancement Verification
> **UNDERSTAND:** Just because a worker pod is labeled 'Running' does not mean it's actually doing its job—it could be stuck in an infinite loop. We verify that the worker is actively scanning by checking that its heartbeat timestamp advances past our pre-deployment baseline.
>
> **QUEUELESS IMPLEMENTATION:** The worker writes a timestamp to `/tmp/worker-heartbeat` on every 15-second tick. The deployment script captures the timestamp before rollout and verifies that the new pod generates a strictly newer timestamp with `db: "connected"` before declaring success.
>
> **PRESENTATION ANSWER:** "A pod status of 'Running' only proves the process is alive, not that it is functional. Our deployment script inspects `/tmp/worker-heartbeat` inside the worker pod to verify that the timestamp advances beyond the pre-deployment baseline, proving active database connectivity and scanning."


---

# PART H — ACTUAL PROJECT OPERATIONS: WHAT WE DID, STEP BY STEP

## 1. Chronological Master Operations Table

The table below outlines the complete chronological engineering trajectory of the QueueLess project, documenting the major phases, objectives, components modified, commands executed, and verified Git commits:

| Phase | Core Objective | Primary Components | Representative Operations & Commands | Verified Commit SHA | Key Engineering Outcome |
|---|---|---|---|:---:|---|
| **Phase 1** | Client UI Development | Next.js 16, React 19, Tailwind v4 | Built student menu browser, slot selector, kitchen Kanban board, order tracker. | Documented Milestone | Clean, responsive student and staff web interfaces. |
| **Phase 2** | Backend & Engine APIs | Express, Node 22, Mongoose, Socket.IO | Engineered REST endpoints, RBAC middleware, Socket.IO rooms, worker late-fee scanner. | Documented Milestone | High-throughput asynchronous backend and background engine. |
| **Phase 3** | Integration & Audit | Full Stack Integration | Audited API contracts, resolved CORS policies, synchronized WebSocket payload formats. | `de41d02` | End-to-end user workflows validated across client and server. |
| **Phase 4** | Containerization | Dockerfiles, `docker-compose.yml` | Multi-stage Dockerfiles (`node:22-alpine`), health checks, named volumes, Compose network. | `3cc169b` | Full 4-service stack reproducible via `docker compose up -d`. |
| **Phase 5** | Kubernetes Orchestration | Manifests in `k8s/` | Authored Namespace, ConfigMap, Secret, PVC (2Gi), StatefulSet (Mongo), Deployments, Ingress. | `fe57cbb` | Native orchestration in Minikube; self-healing workloads. |
| **Phase 6.2** | CI Quality Gates | `.github/workflows/ci.yml` | Engineered 4 parallel quality gates (Frontend, Backend, Worker, Manifests) with Mongo service. | `ecaf29e` | Automated pull-request validation blocking broken merges. |
| **Phase 6.3** | Docker Hub Publishing | `.github/workflows/ci.yml` | Integrated QEMU, Buildx, multi-arch builds (`amd64`/`arm64`), freshness guard, SHA tagging. | `3585c22` | Automated Docker Hub publishing on push to `main`. |
| **Phase 6.4** | Safe Deployment Script | `scripts/deploy-k8s.sh` | Authored 740+ line automated deployment script with preflights, health checks, rollback. | `9e2d701` | Safe, one-command deployment to Minikube with zero data risk. |
| **Phase 6.5A** | PR & CI Remediation | Backend `package.json`, CI workflow | Opened PR #1; diagnosed CI failure; added `socket.io-client`; added `npm run seed` to CI. | `505b18d` | Resolved backend CI failures; all 4 quality gates green (43 tests). |
| **Phase 6.5B** | PR Merge & Cloud Build | GitHub PR #1, Docker Hub | Merged PR #1 to `main`; monitored CI run 43545820081; published multi-arch images. | `474e216` | Images live on Docker Hub with tag `sha-474e216...` and `latest`. |
| **Phase 6.5C** | Live Cluster Deployment | `scripts/deploy-k8s.sh`, Minikube | Executed `./scripts/deploy-k8s.sh 474e216...`; rolled out backend, frontend, worker. | Live Deployment | All pods updated to SHA images; worker heartbeat advanced; 0 downtime. |
| **Phase 6.5D** | Final Acceptance Audit | Ingress, Pods, StatefulSet, PVC | Queried `queueless.local` via Ingress; verified HTTP 200 on UI, API health, Socket.IO. | Cluster Verified | System 100% healthy, verified, documented, and stable. |

---

## 2. Detailed Narrative of Engineering Phases

### Phase 1 & 2: Full-Stack Application Engineering
* **Frontend Development:** Designed using Next.js 16 and React 19. Implemented responsive student mobile layouts, cart drawers, slot pickers, and live kitchen Kanban boards.
* **Backend Development:** Built using Express.js and Mongoose on Node.js 22. Implemented password hashing (bcrypt), JWT generation, RBAC middleware, and real-time Socket.IO room dispatching.
* **Background Worker:** Authored as an autonomous daemon polling MongoDB on a 15-second timer to scan for orders whose collection deadline has elapsed, applying the ₹20 penalty fee atomically.

### Phase 3 & 3.1: Integration, Acceptance Audit & Remediation (`de41d02`)
* During initial integration testing, team audits identified inconsistencies in WebSocket payload formatting and CORS configuration when the frontend communicated across origins.
* Commit `de41d02` remediated these issues, standardizing the Socket.IO event schema (`order:status_updated`, `canteen:queue_changed`) and ensuring strict CORS origin binding.

### Phase 4: Containerization & Docker Compose (`3cc169b`)
* Packaged the frontend, backend, and worker into optimized multi-stage Dockerfiles based on Alpine Linux.
* Configured `docker-compose.yml` to orchestrate all four services over a custom bridge network (`queueless-network`).
* Implemented fail-fast JWT secret validation, Docker health checks for all services, and persistent named volumes (`queueless_mongo_data`) for MongoDB.

### Phase 5: Kubernetes Manifests & Minikube Deployment (`fe57cbb`)
* Replaced Docker Compose with production-grade Kubernetes manifests under `k8s/`.
* Created the `queueless` namespace, ConfigMap, Secret template, and a 2Gi `PersistentVolumeClaim`.
* Configured MongoDB as a `StatefulSet` with headless service, 400Mi memory limit, and persistent volume mounting.
* Implemented Traefik Ingress routing for `queueless.local`.

### Phase 6.1 – 6.4: CI/CD Pipeline & Deployment Automation (`ecaf29e`, `3585c22`, `9e2d701`)
* **Phase 6.2 (`ecaf29e`):** Created `.github/workflows/ci.yml` defining the 4 parallel quality gates.
* **Phase 6.3 (`3585c22`):** Added the `publish-images` job with multi-architecture Buildx compilation (`linux/amd64`, `linux/arm64`), freshness guards, and dual tagging (`sha-<SHA>` and `latest`).
* **Phase 6.4 (`9e2d701`):** Created `scripts/deploy-k8s.sh` providing pre-flight checks, baseline image preservation, ordered rollout, worker heartbeat verification, signal trapping, and automated rollback.

### Phase 6.5 Gate A: PR #1 Diagnosis & Remediation (`505b18d`)
On November 14, 2026, the feature branch `feat/phase-6-cicd` was pushed to GitHub and Pull Request #1 was opened against `main`. 

The initial CI run caught two critical issues in the backend quality gate:
1. **Missing DevDependency:** `backend/tests/remediation.test.ts` imported `socket.io-client` to test WebSocket connections, but the package was omitted from `backend/package.json`.
2. **Unseeded CI Database:** The GitHub Actions MongoDB service started completely empty. Tests expecting seeded users, menu items, and slots failed.

**The Remediation:**
* Added `"socket.io-client": "^4.8.4"` to `devDependencies` in `backend/package.json` and generated a clean lockfile.
* Added a dedicated `Seed Test Database` step (`npm run seed`) to `.github/workflows/ci.yml` immediately preceding `npm test`.
* Verified locally against an isolated MongoDB test instance (port 27099): all 43 tests across all 6 test suites passed cleanly.
* Committed as `505b18d` (`fix(phase-6): resolve backend CI dependency and seed failures`) and pushed to PR #1. All four quality gates turned green!

### Phase 6.5 Gate B: Merge PR #1 & Docker Hub Publishing (`474e216`)
* Pull Request #1 was merged into `main` using a regular merge commit (`474e21646fabc877955b9c4d4690e6cffd4f4330`).
* GitHub Actions workflow run `43545820081` triggered on `main`.
* All four quality gates passed.
* The `publish-images` job ran for 10 minutes and 42 seconds, compiling multi-architecture images and publishing them to Docker Hub:
  * `srujans22/queueless-frontend:sha-474e21646fabc877955b9c4d4690e6cffd4f4330`
  * `srujans22/queueless-backend:sha-474e21646fabc877955b9c4d4690e6cffd4f4330`
  * `srujans22/queueless-worker:sha-474e21646fabc877955b9c4d4690e6cffd4f4330`

### Phase 6.5 Gate C: Live Minikube SHA Deployment
* Executed `./scripts/deploy-k8s.sh 474e21646fabc877955b9c4d4690e6cffd4f4330`.
* The script verified pre-flights, audited MongoDB and PVC invariants, captured baselines, and updated `backend`, `frontend`, and `worker` in phased order.
* Post-rollout health checks verified HTTP 200 on all web services, and the worker heartbeat strictly advanced beyond its baseline.

### Phase 6.5 Gate D: Final Functional Verification & Acceptance
* Queried Traefik Ingress internally via Minikube cluster routing for hostname `queueless.local`:
  * `http://queueless.local/` returned HTTP 200 OK (Next.js HTML rendered).
  * `http://queueless.local/api/v1/health` returned HTTP 200 OK (`{"status":"ok","service":"queueless-backend","database":"connected"}`).
  * `http://queueless.local/socket.io/?EIO=4&transport=polling` returned HTTP 200 OK (Engine.IO handshake established).
* Confirmed MongoDB StatefulSet `1/1 Ready`, PVC `Bound` (2Gi), worker singleton running, zero cluster restart anomalies.

---

## 3. Teaching Formula: Operations Concepts

### Concept 1: Why We Diagnosed & Fixed CI Failures in PR #1
> **UNDERSTAND:** CI is designed to catch bugs before they reach the main branch. When our first CI run failed, it proved the pipeline was working! We caught a missing test library and an unseeded database in the pull request, fixed them locally, verified them, and pushed the fix so main stayed completely clean.
>
> **QUEUELESS IMPLEMENTATION:** PR #1 failed due to missing `socket.io-client` in `devDependencies` and an unseeded CI MongoDB service. Commit `505b18d` added the dependency and inserted `npm run seed` into `.github/workflows/ci.yml`, enabling all 43 backend tests to pass.
>
> **PRESENTATION ANSWER:** "The CI quality gates functioned exactly as intended during Phase 6.5 Gate A. When PR #1 was opened, the backend gate caught a missing devDependency and an unseeded CI database. We remediated these in commit `505b18d`, re-verified locally, and pushed the fix, ensuring that our `main` branch remained pristine."

### Concept 2: The Final Deployed Git Commit SHA
> **UNDERSTAND:** In our presentation, we don't just say 'we deployed the latest version'. We provide the exact 40-character cryptographic commit hash that proves exactly which code is running in our cluster.
>
> **QUEUELESS IMPLEMENTATION:** The verified production commit running in Minikube is `474e21646fabc877955b9c4d4690e6cffd4f4330`, published on Docker Hub under tag `sha-474e21646fabc877955b9c4d4690e6cffd4f4330`.
>
> **PRESENTATION ANSWER:** "Our production deployment is cryptographically tied to merge commit `474e21646fabc877955b9c4d4690e6cffd4f4330`. Every running pod in our Minikube cluster executes the exact multi-architecture container images published to Docker Hub under this SHA tag."


---

# PART I — FINAL VERIFIED RESULTS AND KNOWN LIMITATIONS

## 1. Verified Results Matrix

The table below documents the final verified technical metrics of the QueueLess platform across GitHub, Docker Hub, and the Minikube cluster as audited in Phase 6.5 Gate D:

| Verification Area | Specific Metric / Check | Target Expectation | Verified Actual Result | Status |
|---|---|---|---|:---:|
| **Git & Version Control** | Main Branch Deployed SHA | `474e216...` | `474e21646fabc877955b9c4d4690e6cffd4f4330` | **VERIFIED** |
| **Pull Request Status** | GitHub PR #1 | Merged to `main` | Merged via commit `474e216...` | **VERIFIED** |
| **CI Quality Gate 1** | Frontend Lint, Types & Build | 0 errors | ESLint clean, TSC 0 errors, Next.js build clean | **VERIFIED** |
| **CI Quality Gate 2** | Backend Integration Tests | Pass all suites | **43 passed across 6 test suites** | **VERIFIED** |
| **CI Quality Gate 3** | Worker Unit Tests | Pass tests | **2 passed in 1 test suite** (idempotency verified) | **VERIFIED** |
| **CI Quality Gate 4** | Manifest & Compose Validation | Valid schemas | Compose config clean, K8s dry-run passed | **VERIFIED** |
| **Docker Publishing** | Multi-Arch Image Publication | AMD64 & ARM64 | Pushed to Docker Hub (run 43545820081, 10m 42s) | **VERIFIED** |
| **Docker Registry** | Backend Image SHA Tag | `sha-474e216...` | Public on Docker Hub (`srujans22/queueless-backend`) | **VERIFIED** |
| **Docker Registry** | Frontend Image SHA Tag | `sha-474e216...` | Public on Docker Hub (`srujans22/queueless-frontend`) | **VERIFIED** |
| **Docker Registry** | Worker Image SHA Tag | `sha-474e216...` | Public on Docker Hub (`srujans22/queueless-worker`) | **VERIFIED** |
| **Deployment Automation** | `scripts/deploy-k8s.sh` | Clean exit 0 | Automated rollout executed with zero errors | **VERIFIED** |
| **Pod Workload: Backend** | Replica & Image Match | 1/1 Running | `pod/backend-656b9b46cd-x8dkr` (Image: `sha-474e216...`) | **VERIFIED** |
| **Pod Workload: Frontend** | Replica & Image Match | 1/1 Running | `pod/frontend-556d5dccb4-h957c` (Image: `sha-474e216...`) | **VERIFIED** |
| **Pod Workload: Worker** | Replica & Strategy | 1/1 (Recreate) | `pod/worker-5cd4767dc-f49bn` (Image: `sha-474e216...`) | **VERIFIED** |
| **StatefulSet: MongoDB** | Replica & Stability | 1/1 Ready | `pod/mongodb-0` (Image: `mongo:7`, 0 recent restarts) | **VERIFIED** |
| **Storage: PVC** | Bound State & Capacity | Bound, 2Gi | `mongodb-pvc` status `Bound`, capacity `2Gi` | **VERIFIED** |
| **Worker Heartbeat** | Active Database Scan | Advancing timestamp | New heartbeat timestamp advanced beyond baseline | **VERIFIED** |
| **Ingress: Frontend UI** | HTTP GET `http://queueless.local/` | HTTP 200 OK | HTTP 200 OK (HTML document served) | **VERIFIED** |
| **Ingress: Backend API** | HTTP GET `/api/v1/health` | HTTP 200 OK | HTTP 200 OK (`{"status":"ok","database":"connected"}`) | **VERIFIED** |
| **Ingress: Real-Time** | Engine.IO Handshake `/socket.io/` | HTTP 200 OK | HTTP 200 OK (`sid` and WebSocket upgrades returned) | **VERIFIED** |
| **Data Integrity** | Existing Database Records | Unmodified | 0 data loss, no live reseeding performed | **VERIFIED** |

---

## 2. Transparent Analysis of Known Limitations

Academic and technical rigor requires transparent disclosure of engineering boundaries, operational trade-offs, and constraints:

### 1. MongoDB Historical Memory Limit & OOMKilled Event
* **Observation:** During earlier development phases, the MongoDB pod experienced an Out-Of-Memory (OOMKilled, exit code 137) event under high concurrency stress.
* **Current State:** The database recovered cleanly because all persistent collections were safely anchored to `mongodb-pvc`. MongoDB has been running continuously and stably for over 8 hours with zero subsequent restarts.
* **Constraint:** The memory limit is configured at `400Mi` in `k8s/04-mongodb.yaml`. This value was maintained to prevent node memory starvation on the host laptop. In a production enterprise cluster, this limit would be increased to 2Gi+ with dedicated swap.

### 2. Worker Single-Replica Concurrency Boundary
* **Observation:** The background worker relies on in-memory process locking (`let isRunning = false;`).
* **Constraint:** The worker deployment **must strictly run with `replicas: 1`** and `strategy: Recreate`. If scaled to multiple pods, workers could execute overlapping scan cycles against overdue orders.
* **Production Path:** Implementing a distributed lock manager (such as Redis Redlock or MongoDB collection-level atomic leases) will allow horizontal worker scaling.

### 3. Ingress Hostname Resolution Scope (`queueless.local`)
* **Observation:** Traefik Ingress is fully configured for host `queueless.local` on port 80.
* **Verification Detail:** Ingress routing was verified through Minikube internal cluster networking and node proxies. Because modifying `/etc/hosts` on macOS requires root `sudo` privileges, host-level browser resolution was not altered on the local Mac. Evaluators should be aware that the domain resolves within the cluster environment.

### 4. Rollback Testing Scope
* **Observation:** The automated rollback engine in `scripts/deploy-k8s.sh` was validated using dry-run flags, mock image failures, and syntax tests.
* **Constraint:** A live, destructive failure injection drill (e.g., intentionally deploying an invalid image to force an in-flight crash) was intentionally not executed on the live cluster during the final verification pass to avoid risking persistent database records.

---

## 3. Categorization: Verified vs Mocked vs Future Roadmap

To ensure total transparency during project defense, the engineering deliverables are classified into three distinct categories:

```
  +-------------------------------+   +---------------------------------+   +----------------------------------+
  | 1. IMPLEMENTED & VERIFIED     |   | 2. IMPLEMENTED & STATIC-TESTED  |   | 3. FUTURE IMPROVEMENTS ROADMAP   |
  +-------------------------------+   +---------------------------------+   +----------------------------------+
  | - Next.js / Express / Socket  |   | - deploy-k8s.sh Rollback Engine |   | - Redis Redlock Distributed Lock |
  | - 4-Service Docker Compose    |   | - Signal trapping (SIGINT/TERM) |   | - Multi-Node Cloud Cluster (GKE) |
  | - K8s Manifests in Minikube   |   | - Mock failure reversions       |   | - Dedicated MongoDB ReplicaSet   |
  | - 4 CI Gates (45 Total Tests) |   |                                 |   | - Automated SSL/TLS Certificates |
  | - Multi-Arch Docker Hub Build |   | (Live cluster spared from       |   | - Production Ingress Controller  |
  | - Live SHA Deployment Script  |   |  destructive fault injection)   |   | - Horizontal Pod Autoscaling     |
  +-------------------------------+   +---------------------------------+   +----------------------------------+
```

---

## 4. Teaching Formula: Results & Limitations Concepts

### Concept 1: Explaining Known Limitations with Technical Maturity
> **UNDERSTAND:** Inexperienced engineers try to hide bugs and claim their project is 100% flawless. Professional engineers clearly explain their system's exact boundaries, memory limits, and design trade-offs. Teachers respect students who understand their project's limits far more than those who make exaggerated claims.
>
> **QUEUELESS IMPLEMENTATION:** We openly document that MongoDB has a 400Mi memory limit, the worker is constrained to 1 replica due to in-memory locking, and `queueless.local` was verified via cluster routing rather than host-level `/etc/hosts` modification.
>
> **PRESENTATION ANSWER:** "We approach our infrastructure with production rigor: we transparently document that our background worker requires a single replica because its current locking mechanism is in-process rather than distributed, and our MongoDB memory limit is tuned to 400Mi for Minikube stability. This demonstrates an understanding of real-world distributed systems trade-offs."


---

# PART J — TROUBLESHOOTING AND VIVA PREPARATION

## 1. Comprehensive Troubleshooting Matrix (13 Scenarios)

The following guides provide safe, step-by-step diagnostic and remediation procedures for the 13 most common failure modes encountered in containerized and cloud-native systems:

---

### Scenario 1: Docker Container Exits Immediately Upon Startup
* **Symptom:** Running `docker compose up` shows the container state as `Exited (1)` or `Exited (0)`.
* **Likely Cause:** Missing required environment variable (e.g., `JWT_SECRET`), unhandled syntax error in compiled JavaScript, or background command terminating immediately.
* **Safe Diagnostic Commands:**
  ```bash
  docker compose logs <service-name>
  docker inspect <container-id> --format '{{.State.ExitCode}}'
  ```
* **What to Inspect:** Look for fatal logs such as `FATAL: JWT_SECRET must be set` or unhandled promise rejections.
* **Safe Remediation:** Ensure `.env` file exists and contains valid keys. Verify that `CMD` in Dockerfile references a long-running process (`node server.js` or `node dist/index.js`), not a short-lived build command.
* **Destructive Warning:** Do NOT run `docker system prune -a`—this deletes all cached image layers and local persistent volumes.

---

### Scenario 2: Backend API Cannot Connect to MongoDB
* **Symptom:** Express logs display `MongoServerSelectionError: connect ECONNREFUSED` or timeout errors.
* **Likely Cause:** MongoDB container/pod has not finished booting, DNS hostname is misconfigured, or port is blocked.
* **Safe Diagnostic Commands:**
  ```bash
  # Docker Compose:
  docker compose ps mongo
  docker compose exec backend nc -zv mongo 27017

  # Kubernetes:
  kubectl get pods -l app.kubernetes.io/name=mongodb -n queueless
  kubectl describe pod -l app.kubernetes.io/name=mongodb -n queueless
  ```
* **What to Inspect:** Check if MongoDB health check has passed. In Kubernetes, verify that `MONGODB_URI` in `01-configmap.yaml` correctly references `mongodb.queueless.svc.cluster.local:27017`.
* **Safe Remediation:** Ensure `depends_on: { mongo: { condition: service_healthy } }` is set in Compose. In K8s, verify the headless service `mongodb` is active.
* **Destructive Warning:** Never delete the MongoDB PVC to fix a connection error. Data loss will occur.

---

### Scenario 3: Frontend Cannot Reach Backend API
* **Symptom:** Browser console reports `CORS error` or `net::ERR_CONNECTION_REFUSED` when submitting orders or logging in.
* **Likely Cause:** `NEXT_PUBLIC_API_URL` was baked with the wrong hostname at build time, or backend CORS whitelist does not include the client origin.
* **Safe Diagnostic Commands:**
  ```bash
  curl -I http://queueless.local/api/v1/health
  kubectl logs -l app.kubernetes.io/name=backend -n queueless | grep -i cors
  ```
* **What to Inspect:** In Next.js client components, `NEXT_PUBLIC_*` variables are inlined at compile time. Verify `ARG NEXT_PUBLIC_API_URL` in Dockerfile. Inspect `CLIENT_URL` in `k8s/01-configmap.yaml`.
* **Safe Remediation:** Ensure `CLIENT_URL` contains `http://queueless.local,http://localhost:3000`. Rebuild the frontend image if the public URL changed.

---

### Scenario 4: Kubernetes Pod Remains in `Pending` State
* **Symptom:** `kubectl get pods -n queueless` reports pod status `Pending` for minutes.
* **Likely Cause:** Cluster node lacks sufficient CPU/memory resources, or PersistentVolumeClaim cannot be bound.
* **Safe Diagnostic Commands:**
  ```bash
  kubectl describe pod <pod-name> -n queueless
  kubectl get nodes -o wide
  kubectl get pvc -n queueless
  ```
* **What to Inspect:** Check the `Events:` section at the bottom of `kubectl describe`. Look for `FailedScheduling: 0/1 nodes are available: insufficient memory`.
* **Safe Remediation:** Check Minikube memory allocation. If running out of RAM, restart Minikube with more resources: `minikube start --memory=4096 --cpus=2`.

---

### Scenario 5: Kubernetes Pod in `CrashLoopBackOff`
* **Symptom:** Pod restarts repeatedly; status shows `CrashLoopBackOff` with restart count incrementing.
* **Likely Cause:** The application process throws an unhandled exception immediately after launch (missing secret, database connection crash, or fatal port bind error).
* **Safe Diagnostic Commands:**
  ```bash
  kubectl logs <pod-name> -n queueless --previous
  kubectl describe pod <pod-name> -n queueless
  ```
* **What to Inspect:** The `--previous` flag prints logs from the *crashed instance* before it restarted. Look for stack traces or missing environment variables.
* **Safe Remediation:** Fix the underlying exception or missing Secret. In K8s, verify that `queueless-secret` exists and contains `JWT_SECRET`.

---

### Scenario 6: `ImagePullBackOff` or `ErrImagePull`
* **Symptom:** Pod fails to start; status shows `ImagePullBackOff`.
* **Likely Cause:** Image tag does not exist on Docker Hub, repository is private and credentials are missing, or node has no Internet access.
* **Safe Diagnostic Commands:**
  ```bash
  kubectl describe pod <pod-name> -n queueless | grep -A 5 -i "Failed to pull image"
  docker buildx imagetools inspect <image-name>:<tag>
  ```
* **What to Inspect:** Verify exact spelling of the image reference and commit SHA tag. Check if Docker Hub repository `srujans22/queueless-*` is public.
* **Safe Remediation:** Ensure CI has successfully finished pushing the target SHA tag before deploying. Verify that your deployment script only uses verified SHA tags.

---

### Scenario 7: MongoDB PVC is Not `Bound`
* **Symptom:** `kubectl get pvc -n queueless` reports status `Pending` instead of `Bound`.
* **Likely Cause:** The requested `storageClassName` is unavailable, or storage provisioner daemon in Minikube is halted.
* **Safe Diagnostic Commands:**
  ```bash
  kubectl get storageclass
  kubectl describe pvc mongodb-pvc -n queueless
  ```
* **What to Inspect:** Verify `storageClassName: standard` matches `kubectl get sc`.
* **Safe Remediation:** In Minikube, ensure standard default storage provisioner is enabled: `minikube addons enable default-storageclass`.

---

### Scenario 8: Ingress Does Not Route Requests (`queueless.local`)
* **Symptom:** Browsing to `http://queueless.local` yields a connection timeout or DNS resolution error.
* **Likely Cause:** Ingress addon is not enabled in Minikube, or local machine has no DNS route for `queueless.local`.
* **Safe Diagnostic Commands:**
  ```bash
  minikube addons list | grep ingress
  minikube ip
  curl -H "Host: queueless.local" http://$(minikube ip)/
  ```
* **What to Inspect:** Check if Traefik or NGINX Ingress controller pods are running in `kube-system` or `ingress-nginx`.
* **Safe Remediation:** Enable Ingress addon: `minikube addons enable ingress`. On macOS, query the Ingress IP directly using Host headers or port forwarding.

---

### Scenario 9: Worker Heartbeat Stops Advancing
* **Symptom:** The file `/tmp/worker-heartbeat` has a timestamp older than 60 seconds, or `db` status is not `connected`.
* **Likely Cause:** Worker has lost its connection to MongoDB, or the scanning loop encountered an unhandled promise rejection that froze the event loop.
* **Safe Diagnostic Commands:**
  ```bash
  kubectl exec deploy/worker -n queueless -- cat /tmp/worker-heartbeat
  kubectl logs -l app.kubernetes.io/name=worker -n queueless --tail=50
  ```
* **What to Inspect:** Check worker logs for `MongoDB is not in connected state` or timeout warnings. Verify MongoDB StatefulSet is healthy.
* **Safe Remediation:** Verify MongoDB pod is running. Restart the worker pod if deadlocked: `kubectl rollout restart deployment/worker -n queueless`.

---

### Scenario 10: GitHub Actions CI Job Fails
* **Symptom:** Pull Request checks turn red with an `X` on one or more quality gates.
* **Likely Cause:** ESLint errors, TypeScript type errors, unseeded database in backend tests, or missing dependency in `package.json`.
* **Safe Diagnostic Commands:**
  ```bash
  # Replicate Gate 1 locally:
  npm run lint && npx tsc --noEmit && npm run build

  # Replicate Gate 2 locally:
  cd backend && npm run build && npm test
  ```
* **What to Inspect:** Open GitHub Actions web console, click on the red job, expand the failed step. Look for specific compiler line numbers.
* **Safe Remediation:** Fix the lint or test error locally, re-run tests locally, and push a remediation commit to the feature branch.

---

### Scenario 11: Docker Hub Image Not Published
* **Symptom:** Pull Request merges to `main`, but Docker Hub still only shows older image tags.
* **Likely Cause:** CI quality gates failed on `main`, `DOCKERHUB_TOKEN` secret expired, or freshness guard halted execution due to commit mismatch.
* **Safe Diagnostic Commands:**
  ```bash
  gh run list --workflow=ci.yml
  gh run view <run-id> --log-failed
  ```
* **What to Inspect:** Inspect the `publish-images` job logs in GitHub Actions. Check whether the workflow was triggered by a branch push or PR.
* **Safe Remediation:** Ensure GitHub secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are configured under Repository Settings $ightarrow$ Secrets and Variables $ightarrow$ Actions.

---

### Scenario 12: Deployment Script (`deploy-k8s.sh`) Aborts Execution
* **Symptom:** Script prints red `[ERROR]` message and exits immediately without updating pods.
* **Likely Cause:** Input SHA was invalid, kubectl context was not `minikube`, target image was missing on Docker Hub, or MongoDB PVC was not Bound.
* **Safe Diagnostic Commands:**
  ```bash
  kubectl config current-context
  git status --short
  ./scripts/deploy-k8s.sh --help
  ```
* **What to Inspect:** Read the exact error output. The script is fail-closed and will refuse to execute if any safety precondition is violated.
* **Safe Remediation:** Pass a valid 40-character commit SHA that has been published by CI. Switch context to Minikube: `kubectl config use-context minikube`.

---

### Scenario 13: Health Check Fails Post-Rollout
* **Symptom:** Deployment script executes `execute_rollback` after updating a service.
* **Likely Cause:** The new container failed its HTTP health check (`/api/v1/health` or `/api/health`) or worker heartbeat failed to advance within timeout.
* **Safe Diagnostic Commands:**
  ```bash
  kubectl logs deployment/backend -n queueless
  kubectl describe deployment/backend -n queueless
  ```
* **What to Inspect:** Look for application initialization errors, database auth failures, or slow startup exceeding probe timeouts.
* **Safe Remediation:** The script automatically restores baseline images. Debug the health failure in an isolated staging environment before re-deploying.

---

## 2. 25+ Comprehensive Viva Questions & Model Answers

### Q1: Why did we choose Docker containerization for QueueLess?
* **Answer:** "We chose Docker to solve the 'works on my machine' problem and eliminate environment discrepancies between development and production. Docker packages our Node.js runtime, OS libraries, and dependencies into lightweight, immutable images based on Alpine Linux. This guarantees that our frontend, backend, worker, and MongoDB run with 100% identical behavior regardless of whether they execute on a developer's Mac, a CI runner, or a Kubernetes cluster."

### Q2: Why was Kubernetes introduced after Docker Compose?
* **Answer:** "Docker Compose is designed for local multi-container development on a single machine, but lacks production orchestration capabilities. Kubernetes provides declarative infrastructure with automated self-healing, zero-downtime rolling updates, fine-grained liveness/readiness probes, decoupled Ingress routing, and robust PersistentVolume management. Kubernetes reflects modern enterprise cloud architecture."

### Q3: Why did we use Minikube instead of a public cloud cluster?
* **Answer:** "Minikube provides a real, single-node Kubernetes cluster running locally on macOS via Docker Desktop. It implements the exact same Kubernetes APIs, controllers, and manifest schemas as production cloud platforms like Google Kubernetes Engine (GKE) or AWS EKS, but without incurring cloud hosting costs or requiring public network dependencies during academic demonstration."

### Q4: What is the architectural difference between Docker Compose and Kubernetes?
* **Answer:** "Docker Compose is an imperative-like tool for starting multi-container stacks on a single Docker host using simple port mappings and shared networks. Kubernetes is a distributed cluster operating system that continually reconciles actual cluster state against declarative desired state, providing native controllers for stateless pods (Deployments), stateful databases (StatefulSets), cluster-wide DNS, and edge ingress routing."

### Q5: Why is MongoDB deployed as a StatefulSet instead of a Deployment?
* **Answer:** "StatefulSets are specifically engineered for stateful databases that require stable, persistent network identifiers and dedicated storage. Unlike a Deployment where pods are completely interchangeable and assigned random hashes, our MongoDB pod is guaranteed to be named `mongodb-0`. More importantly, if `mongodb-0` is terminated, Kubernetes reattaches the exact same 2Gi `mongodb-pvc` volume to the replacement pod, preventing database corruption."

### Q6: What is a PersistentVolumeClaim (PVC)?
* **Answer:** "A PersistentVolumeClaim (PVC) is a declarative request for storage by an application workload. It defines the desired storage size (in our case, 2Gi) and access mode (`ReadWriteOnce`). Kubernetes binds this claim to a physical PersistentVolume on the host machine. The PVC ensures that MongoDB's physical files in `/data/db` exist independently of the pod lifecycle."

### Q7: What is the role of Kubernetes Ingress?
* **Answer:** "Ingress acts as an intelligent edge reverse proxy and traffic router for the cluster. Instead of exposing internal high-number ports for every microservice, Traefik Ingress listens on standard HTTP port 80 for hostname `queueless.local`. It uses path-based rules to route `/api/v1` and `/socket.io` to the Express backend and all other traffic (`/`) to the Next.js frontend."

### Q8: What does the Background Worker do in QueueLess?
* **Answer:** "The Background Worker is an autonomous daemon that continuously automates order compliance. Every 15 seconds, it queries MongoDB for orders that have reached the `READY_FOR_PICKUP` status and whose pickup deadline has passed without food collection. It atomically applies a ₹20 penalty fee, increments the order total, writes an audit log, and updates its operational heartbeat."

### Q9: Why is the Background Worker a separate service from the Backend API?
* **Answer:** "Decoupling the worker preserves the responsiveness of our customer-facing API. Scanning large database collections and running recurring batch jobs can consume significant CPU and memory. Running the worker as a separate service ensures that heavy analytical scans never starve Express of event-loop cycles, and if the worker encounters an error, student API requests are completely unaffected."

### Q10: Why must the Worker deployment run with strictly ONE replica?
* **Answer:** "The worker uses in-process locking (`let isRunning = false;`) to prevent overlapping scans. Because this in-memory variable is local to a single process, running multiple worker pods would allow both pods to query overdue orders simultaneously, creating race conditions where an overdue order could be double-charged. Until a distributed locking manager like Redis Redlock is implemented, the worker strictly requires `replicas: 1` with `strategy: Recreate`."

### Q11: What is CI/CD, and why is it important?
* **Answer:** "CI/CD stands for Continuous Integration and Continuous Delivery. CI automatically validates every code change through automated linters, compilers, and test suites. CD packages passing code into immutable release artifacts and automates their deployment. It eliminates manual errors, guarantees that broken code never reaches production, and dramatically shortens release cycles."

### Q12: What are GitHub Actions runners?
* **Answer:** "GitHub Actions runners are ephemeral virtual machines (in our case, `ubuntu-latest`) provided by GitHub to execute workflow jobs. When a PR or commit is pushed, GitHub provisions a clean runner, clones the repository, sets up runtimes like Node.js 22 and Docker, runs the defined test steps, and terminates the VM upon completion."

### Q13: Why do we push container images to Docker Hub?
* **Answer:** "Docker Hub serves as our centralized, secure container image registry. By storing pre-compiled, immutable container images in a cloud registry, any authorized environment—whether a developer's machine, a staging server, or our Minikube cluster—can pull and run identical binaries without compiling source code locally."

### Q14: Why do we build multi-architecture Docker images?
* **Answer:** "Modern development environments are heterogeneous: our developer laptops run Apple Silicon (ARM64 architecture), while many CI runners and cloud nodes run Intel/AMD (AMD64 architecture). Using Docker Buildx and QEMU to produce multi-architecture images ensures our containers execute natively on both CPU architectures without slow emulation or binary incompatibility."

### Q15: Why do we tag images with full Git commit SHAs instead of only `latest`?
* **Answer:** "`latest` is a mutable pointer that changes on every build, creating caching ambiguities and eliminating traceability. By tagging images with the immutable 40-character Git SHA (e.g., `sha-474e216...`), we guarantee 100% cryptographic auditability: we know the exact line of code running in every pod, and rollbacks are deterministic."

### Q16: How does the automated rollback mechanism work in `scripts/deploy-k8s.sh`?
* **Answer:** "Before modifying any workload, `deploy-k8s.sh` captures the baseline image references of all running services into memory. It tracks every modified deployment in an array. If a rollout times out, an HTTP health check fails, or the operator terminates the script via `Ctrl+C`, the script traps the event and invokes `execute_rollback`, restoring all modified services to their baseline images in reverse dependency order."

### Q17: How does database data persist if the MongoDB pod crashes or restarts?
* **Answer:** "Database files are not stored inside the ephemeral container filesystem. MongoDB writes directly to `/data/db`, which is mounted to `mongodb-pvc`. The underlying storage is physically maintained by Minikube on the host system disk. When `mongodb-0` restarts, Kubernetes remounts the exact same volume, ensuring zero data loss."

### Q18: Where does each service actually run in our setup?
* **Answer:** "The frontend, backend, worker, and MongoDB execute as containerized pods inside the `queueless` namespace in a local Minikube Kubernetes cluster running via Docker Desktop on macOS. CI/CD testing runs on GitHub-hosted cloud runners, and images are distributed via Docker Hub."

### Q19: What happens when a developer pushes code to GitHub?
* **Answer:** "Pushing code triggers GitHub Actions workflow `ci.yml`. Four parallel quality gates run: Frontend (lint/types/build), Backend (types, DB seed, 43 Jest tests), Worker (types, 2 tests), and Manifest validation. If the commit is pushed or merged to `main` and all 4 gates pass, a fifth job (`publish-images`) compiles multi-arch images and pushes them to Docker Hub with SHA and latest tags."

### Q20: How would you explain the entire QueueLess architecture in two minutes?
* **Answer:** "QueueLess is a microservices platform for institutional canteen pre-ordering. Students interact with a Next.js 16 frontend that communicates with an Express backend via REST APIs for transactions and Socket.IO for real-time queue tracking. A decoupled background worker polls MongoDB every 15 seconds to enforce a 10-minute pickup grace period with a ₹20 penalty. The entire application is containerized with Docker, validated across 4 CI quality gates in GitHub Actions, published as multi-arch images to Docker Hub, and deployed locally to Minikube using an automated, rollback-protected deployment script."

### Q21: What is the difference between a Liveness Probe and a Readiness Probe?
* **Answer:** "A liveness probe checks if a container is alive and healthy; if it fails repeatedly, Kubernetes kills and restarts the container. A readiness probe checks if the container is ready to accept incoming network traffic; if it fails, Kubernetes stops routing requests to that pod through the Service until it passes, preventing 500 errors during startup."

### Q22: What is the difference between a ConfigMap and a Secret in Kubernetes?
* **Answer:** "A ConfigMap stores non-sensitive, plain-text configuration data such as port numbers, hostnames, and environment flags (`NODE_ENV`). A Secret stores confidential data like cryptographic JWT signing keys and database passwords in base64-encoded format, protected by stricter RBAC permissions within the cluster."

### Q23: Why does the Worker deployment use `strategy: Recreate` instead of `RollingUpdate`?
* **Answer:** "The standard `RollingUpdate` strategy starts the new pod before terminating the old one to avoid downtime. For the worker, having two pods running simultaneously could lead to race conditions where both pods scan the database at the same time and double-charge late fees. `Recreate` terminates the existing worker before starting the new one, enforcing strict single-instance execution."

### Q24: What is the purpose of a Headless Service for MongoDB?
* **Answer:** "A standard Kubernetes Service assigns a virtual ClusterIP that load-balances traffic across pods. A Headless Service (`clusterIP: None`) bypasses proxying and directly returns the specific DNS A-record of individual pods (e.g., `mongodb-0.mongodb.queueless.svc.cluster.local`). This is essential for stateful databases that manage their own connections."

### Q25: How does the worker verify its operational health?
* **Answer:** "The worker does not expose an HTTP port. Instead, on every successful 15-second scan cycle where MongoDB is actively connected, it touches a heartbeat file at `/tmp/worker-heartbeat` containing a JSON payload with a UNIX timestamp, status `healthy`, and database connectivity state. Our deployment script inspects this timestamp to verify that the worker is actively scanning."

### Q26: What was the root cause of the backend CI failure in PR #1, and how was it fixed?
* **Answer:** "During PR #1, the backend CI gate failed due to two issues: `socket.io-client` was missing from `devDependencies` in `backend/package.json` (required by `remediation.test.ts`), and the GitHub Actions MongoDB service started empty without initial seed data. We remediated this in commit `505b18d` by adding the dependency and inserting a `Seed Test Database` step (`npm run seed`) prior to `npm test`, allowing all 43 tests to pass."

### Q27: How is zero-downtime deployment achieved for the Frontend and Backend?
* **Answer:** "Both frontend and backend Deployments utilize Kubernetes `RollingUpdate` strategy. During a deployment, Kubernetes launches a new pod running the target SHA image, waits for its readiness probe (`/api/v1/health` or `/api/health`) to return HTTP 200, adds it to the Service endpoints, and only then gracefully terminates the older pod."


---

# PART K — FOUR-PERSON PRESENTATION DIVISION AND SCRIPTS

## 1. Presentation Strategy & Master Schedule

To ensure a seamless, professional presentation before evaluators and academic examiners, the QueueLess technical defense is divided into four balanced, logical sections. Each speaker is assigned a discrete architectural domain, complete with speaking scripts, key commands, likely examiner questions, and verbal handoffs:

```
========================================================================================================================
                                     20-MINUTE TEAM PRESENTATION TIMELINE
========================================================================================================================

  [ SPEAKER 1: 00:00 - 05:00 ]  [ SPEAKER 2: 05:00 - 10:00 ]  [ SPEAKER 3: 10:00 - 15:00 ]  [ SPEAKER 4: 15:00 - 20:00 ]
  +--------------------------+  +--------------------------+  +--------------------------+  +--------------------------+
  | Project Fundamentals,    |  | Backend APIs, Database,  |  | Kubernetes Architecture, |  | CI/CD Pipeline,          |
  | Problem Domain, Features,|  | Worker Late-Fee Engine,  |  | Minikube Deployment,     |  | Docker Hub Publishing,   |
  | Architecture & Sockets   |  | Docker & Compose         |  | Ingress & Storage        |  | Automation & Results     |
  +--------------------------+  +--------------------------+  +--------------------------+  +--------------------------+
               |                             |                             |                             |
         Verbal Handoff                Verbal Handoff                Verbal Handoff                Conclusion &
          to Speaker 2                  to Speaker 3                  to Speaker 4                  Open Viva Q&A
```

---

## 2. SPEAKER 1: Project Introduction & Application Architecture

* **Assigned Domain:** Problem domain, value proposition, user personas, end-to-end workflows, Next.js/React frontend, Express REST APIs, and Socket.IO real-time synchronization.
* **Target Duration:** 4 to 5 minutes.

### 1. Topics Speaker 1 Must Study
* The canteen queue bottleneck problem in college campuses.
* The 3 user roles: Student, Canteen Staff / Kitchen, Admin.
* The 5-stage order lifecycle: `PLACED` $ightarrow$ `ACCEPTED` $ightarrow$ `PREPARING` $ightarrow$ `READY_FOR_PICKUP` $ightarrow$ `PICKED_UP`.
* The technical differences between REST APIs (pull) and WebSockets (push).
* Next.js 16 App Router and React 19 component hierarchy.

### 2. Core Concepts for Speaker 1
> **Concept: Real-Time Bidirectional Event Streaming (Socket.IO)**
> * **UNDERSTAND:** Instead of the student constantly refreshing their phone screen to see if their meal is ready, the server instantly sends a message to their screen the moment the kitchen clicks a button.
> * **QUEUELESS IMPLEMENTATION:** Express uses Socket.IO. When an order transitions to `READY_FOR_PICKUP`, an event is emitted to the specific student's room (`order:<id>`), updating the progress bar in milliseconds.
> * **PRESENTATION ANSWER:** "We utilize Socket.IO to maintain persistent WebSocket connections with active student clients. State transitions on the kitchen dashboard immediately trigger targeted room events, delivering sub-second updates without wasteful HTTP polling."

### 3. Key Commands Speaker 1 Must Know
* `npm run dev`: Starts local Next.js development server on port 3000.
* `npm run lint`: Executes ESLint across frontend components.
* `npx tsc --noEmit`: Validates TypeScript type safety without compiling files.

### 4. Prepared Speaking Script (Word-for-Word)
> "Good morning, respected evaluators and professors. Today, our team is proud to present **QueueLess**, an enterprise-grade digital pre-ordering, scheduled slot allocation, and queue automation platform engineered specifically for institutional canteens.
>
> In high-density campus environments, meal intervals create massive friction. Hundreds of students arrive at physical canteen counters simultaneously during 20-minute lecture breaks. This causes extended standing queues, delayed meal preparation, food waste, and crowded counters where prepared food gets cold.
>
> QueueLess replaces this chaotic physical congestion with a fully digitized, real-time workflow. Our system serves three distinct roles:
> 1. **Students:** Who browse dynamic menus, reserve 15-minute pickup slots, pay via campus wallet, and track their order status live from their phones.
> 2. **Kitchen Staff:** Who manage incoming orders on a real-time Kanban board, advancing meals from Placed, to Accepted, to Preparing, and Ready for Pickup.
> 3. **Administrators:** Who configure slot capacities, manage menu pricing, and audit operational turnover.
>
> Architecturally, our client interface is built with **Next.js 16 and React 19**, styled with **Tailwind CSS v4**. When a student places an order, the request hits our Express.js backend via secure REST endpoints. But what makes QueueLess truly responsive is our real-time layer: using **Socket.IO**, we partition connections into discrete rooms. When the kitchen staff marks an order 'Ready for Pickup', that event is pushed to the student's phone in under 100 milliseconds, completely eliminating the need for students to crowd around physical counters.
>
> Now, to explain how our backend handles transactional persistence, how our background engine automates pickup deadlines, and how we package these services into Docker containers, I will hand over to my teammate, **Speaker 2**."

### 5. Likely Examiner Questions & Answers for Speaker 1
* **Q: Why Next.js 16 instead of a plain React SPA?**
  * **Answer:** "Next.js provides server-side rendering for fast initial page loads, built-in API route capabilities, and an optimized standalone production compiler that bundles only required dependencies, keeping container image sizes minimal."
* **Q: What happens if a student's phone loses network connectivity during an order update?**
  * **Answer:** "Socket.IO has built-in auto-reconnection logic. If a connection drops, it buffers state changes and falls back to HTTP long-polling until the WebSocket reconnects, automatically resynchronizing the order state."

### 6. Verbal Transition to Speaker 2
> *"I will now hand over to Speaker 2, who will walk you through our backend APIs, database models, our autonomous late-fee worker, and our Docker containerization strategy."*

### 7. Speaker 1 Preparation Checklist
- [ ] Memorized the 5 order lifecycle stages in exact order.
- [ ] Can explain why WebSockets are superior to HTTP polling.
- [ ] Understands the 3 user roles and their permissions.
- [ ] Rehearsed speaking script within 4 to 5 minutes.

---

## 3. SPEAKER 2: Backend APIs, Database, Worker Engine & Docker Containerization

* **Assigned Domain:** Express REST API architecture, Mongoose schemas, Background Worker late-fee mechanics, Docker fundamentals, multi-stage Dockerfiles, and Docker Compose orchestration.
* **Target Duration:** 4 to 5 minutes.

### 1. Topics Speaker 2 Must Study
* Express routing, middleware (CORS, JWT authentication, error handling).
* MongoDB collections: `users`, `orders`, `menus`, `canteenSettings`, `auditLogs`.
* Worker pickup grace period logic: 10 minutes grace, ₹20 late fee, 15-second polling interval.
* The danger of running multiple worker replicas without distributed locking.
* Multi-stage Docker builds (`node:22-alpine`, builder vs runner stage).
* Named volume persistence (`queueless_mongo_data`).

### 2. Core Concepts for Speaker 2
> **Concept: Autonomous Background Processing & In-Process Locking**
> * **UNDERSTAND:** The web server shouldn't do heavy background scanning because it will slow down user clicks. A separate worker process checks the database every 15 seconds to see who is late collecting their food. It has a lock so it doesn't run two scans at once.
> * **QUEUELESS IMPLEMENTATION:** The worker executes `runLateFeeScan()` every 15,000ms. It uses an in-memory boolean `isRunning` to prevent overlapping ticks, queries orders with `status == 'READY_FOR_PICKUP'` and `pickupDeadline < now`, and atomically applies ₹20 late fee.
> * **PRESENTATION ANSWER:** "We decoupled deadline enforcement into an autonomous background worker daemon. It executes an atomic scan cycle every 15 seconds, querying overdue orders and applying a ₹20 penalty. The worker utilizes an in-process lock to prevent overlapping executions."

### 3. Key Commands Speaker 2 Must Know
* `docker compose up -d --build`: Builds and starts all 4 containers in the background.
* `docker compose ps`: Shows container status and health checks.
* `docker compose logs -f backend`: Streams backend logs.
* `docker volume ls`: Lists persistent volumes, confirming `queueless_mongo_data`.

### 4. Prepared Speaking Script (Word-for-Word)
> "Thank you, Speaker 1. Respected evaluators, I will now explain our backend service architecture, our database design, our autonomous background worker, and our containerization strategy.
>
> Our backend is built on **Node.js 22 using Express**. It exposes structured REST endpoints under `/api/v1` for authentication, menu catalogs, and atomic slot reservations. We use **MongoDB 7 with Mongoose** as our document database. MongoDB's flexible schema allows us to store complex order documents, user profiles, and append-only audit histories efficiently.
>
> One of our most innovative features is the **Automated Collection Grace Period & Late-Fee Engine**. When kitchen staff mark an order 'Ready for Pickup', the backend records the timestamp and sets a pickup deadline exactly 10 minutes in the future. To enforce this, we created an independent **Background Worker** process that polls MongoDB every 15 seconds. If a student fails to collect their meal within the 10-minute window, the worker automatically applies a ₹20 penalty fee, increments the order total, logs an audit entry, and touches a heartbeat file at `/tmp/worker-heartbeat`. Because this worker relies on an in-process lock, it is strictly designed to run as a single replica, guaranteeing that fees are applied exactly once.
>
> To ensure our system runs identically across all developer laptops and production servers, we containerized all four services: Frontend, Backend, Worker, and MongoDB.
>
> In our Dockerfiles, we implemented **Multi-Stage Builds**. In Stage 1—the builder stage—we compile our TypeScript source code. In Stage 2—the production runner—we copy only the compiled JavaScript and production dependencies onto an ultra-lightweight **Alpine Linux** base. This shrank our container images from over 1.2 gigabytes to under 160 megabytes, running securely as unprivileged user `node`.
>
> Using **Docker Compose**, we link these containers across a custom bridge network (`queueless-network`). And to guarantee that our database never loses records when a container restarts, we attach a persistent named volume—`queueless_mongo_data`—directly to `/data/db`.
>
> However, while Docker Compose works well locally, production systems require self-healing, rolling updates, and declarative cluster orchestration. To explain how we transitioned our containers into Kubernetes and Minikube, I will pass the floor to **Speaker 3**."

### 5. Likely Examiner Questions & Answers for Speaker 2
* **Q: Why is the worker a separate process instead of a `setInterval` inside Express?**
  * **Answer:** "Separating the worker isolates failure domains and preserves CPU resources for student HTTP requests. If a database query locks or crashes the worker, the Express API continues serving student orders without interruption."
* **Q: How does MongoDB retain data when the container is stopped?**
  * **Answer:** "We use a named Docker volume (`queueless_mongo_data`) mapped to `/data/db`. The database engine writes directly to persistent storage on the host operating system, which is decoupled from the container's ephemeral lifecycle."

### 6. Verbal Transition to Speaker 3
> *"I will now hand over to Speaker 3, who will explain how our containerized workloads are orchestrated in Kubernetes and Minikube."*

### 7. Speaker 2 Preparation Checklist
- [ ] Understands why multi-stage Docker builds save disk space.
- [ ] Can explain the 10-minute grace period and ₹20 late fee calculation.
- [ ] Knows why named volumes prevent database loss.
- [ ] Rehearsed speaking script within 4 to 5 minutes.

---

## 4. SPEAKER 3: Kubernetes Orchestration & Minikube Deployment

* **Assigned Domain:** Kubernetes vs Docker Compose, Minikube architecture, Pods, Deployments, StatefulSets, ClusterIP vs Headless Services, Traefik Ingress, PersistentVolumeClaims, and manifest inspection.
* **Target Duration:** 4 to 5 minutes.

### 1. Topics Speaker 3 Must Study
* Why Kubernetes is needed (self-healing, rolling updates, declarative state).
* Minikube single-node cluster architecture on macOS.
* The difference between a Deployment (stateless) and a StatefulSet (stateful).
* The 9 manifests in `k8s/` (`00-namespace` through `08-ingress`).
* Ingress routing for `queueless.local` on port 80.
* Worker Recreate strategy vs RollingUpdate.
* The 400Mi memory limit on MongoDB.

### 2. Core Concepts for Speaker 3
> **Concept: StatefulSet and PersistentVolumeClaim for Database Persistence**
> * **UNDERSTAND:** In Kubernetes, normal pods can be deleted and recreated with random names. But a database needs a permanent name and needs to keep using its exact same hard drive. A StatefulSet gives MongoDB a permanent name (`mongodb-0`), and a PVC reserves 2GB of real disk space that never gets deleted.
> * **QUEUELESS IMPLEMENTATION:** `k8s/04-mongodb.yaml` defines a StatefulSet with a Headless Service (`clusterIP: None`) and mounts `mongodb-pvc` (2Gi, ReadWriteOnce) at `/data/db`.
> * **PRESENTATION ANSWER:** "We use a Kubernetes StatefulSet for MongoDB rather than a Deployment because databases require stable network identities and dedicated volume bindings. Our StatefulSet guarantees the pod is always named `mongodb-0` and reattaches to our 2Gi PersistentVolumeClaim across any restart."

### 3. Key Commands Speaker 3 Must Know
* `kubectl get pods -n queueless`: Shows the 4 pods running in the namespace.
* `kubectl get pvc -n queueless`: Verifies `mongodb-pvc` is `Bound` with 2Gi capacity.
* `kubectl get ingress -n queueless`: Displays `queueless-ingress` routing `queueless.local`.
* `kubectl describe pod <name> -n queueless`: Shows pod events, images, and probe status.

### 4. Prepared Speaking Script (Word-for-Word)
> "Thank you, Speaker 2. Respected evaluators, I will now explain our production orchestration architecture using **Kubernetes and Minikube**.
>
> While Docker Compose is useful for development, enterprise production platforms require automated self-healing, declarative scaling, zero-downtime rolling updates, and unified ingress routing. To achieve this, we transitioned QueueLess into **Kubernetes**, deployed locally on **Minikube** running via Docker Desktop on macOS.
>
> All our resources are organized inside a dedicated virtual cluster sandbox defined by our namespace manifest: **`k8s/00-namespace.yaml`**.
>
> We distinguish strictly between **stateless** and **stateful** workloads:
> * Our **Frontend and Backend** are stateless microservices managed by **Kubernetes Deployments**. If a backend pod crashes, Kubernetes detects the probe failure and instantly schedules a healthy replacement pod.
> * For **MongoDB**, we use a **StatefulSet** (`04-mongodb.yaml`). Unlike Deployments where pods have random names, our database pod is guaranteed a stable identity: `mongodb-0`. It mounts a 2-Gigabyte **PersistentVolumeClaim** (`03-mongodb-pvc.yaml`) at `/data/db`. Even if the database pod is terminated, the persistent disk volume remains bound, guaranteeing zero data loss.
> * For our **Background Worker** (`06-worker.yaml`), we enforce `replicas: 1` with `strategy: Recreate`. This ensures the old worker pod completely shuts down before the new one boots up, preventing concurrency collisions during deployments.
>
> For networking, internal pod communication is decoupled using **ClusterIP Services**. The backend connects to MongoDB via cluster DNS: `mongodb.queueless.svc.cluster.local:27017`.
>
> External student and staff traffic enters through our **Traefik Ingress Controller** (`08-ingress.yaml`) listening on port 80. The Ingress performs host-based routing for `queueless.local`, directing `/api/v1` and `/socket.io` requests to the Express backend, and all page requests (`/`) to Next.js.
>
> Furthermore, every deployment includes **Liveness and Readiness Probes**. Kubernetes continuously pings our HTTP health endpoints, ensuring that user traffic is never routed to a container until its database connection is fully established.
>
> Now, how do we automate testing every pull request, publish multi-architecture images to Docker Hub, and safely deploy them to Minikube with automated rollback protection? To answer this, I hand over to **Speaker 4**."

### 5. Likely Examiner Questions & Answers for Speaker 3
* **Q: What is the difference between a ClusterIP service and Ingress?**
  * **Answer:** "A ClusterIP service provides an internal virtual IP and DNS name accessible only within the cluster network. An Ingress acts as an external reverse proxy on port 80/443, routing traffic from external hostnames like `queueless.local` to the appropriate internal ClusterIP services."
* **Q: Why does the worker deployment use `strategy: Recreate` instead of `RollingUpdate`?**
  * **Answer:** "A RollingUpdate starts the new pod before terminating the old pod. For our worker, having two pods running concurrently could cause race conditions where both scan the database at the same time and double-charge late fees. `Recreate` guarantees that the existing pod terminates before the new pod launches."

### 6. Verbal Transition to Speaker 4
> *"I will now hand over to Speaker 4, who will present our GitHub Actions CI/CD pipeline, Docker Hub publishing, deployment automation, and final verified results."*

### 7. Speaker 3 Preparation Checklist
- [ ] Understands the difference between Deployments and StatefulSets.
- [ ] Can name the 9 Kubernetes manifests in `k8s/`.
- [ ] Can explain how Ingress routes `queueless.local`.
- [ ] Rehearsed speaking script within 4 to 5 minutes.

---

## 5. SPEAKER 4: CI/CD Pipeline, Docker Hub, Automation & Final Results

* **Assigned Domain:** GitHub Actions CI/CD workflows, 4 quality gates, Docker Hub multi-architecture publishing, full Git SHA tagging, `scripts/deploy-k8s.sh` automation, rollback mechanics, verified results, and known limitations.
* **Target Duration:** 4 to 5 minutes.

### 1. Topics Speaker 4 Must Study
* CI/CD concepts (Continuous Integration vs Continuous Delivery).
* The 4 CI quality gates in `.github/workflows/ci.yml`.
* The backend CI remediation in PR #1 (`socket.io-client` + `npm run seed`).
* Multi-architecture builds (AMD64 & ARM64) via QEMU and Buildx.
* The 40-character Git SHA tagging strategy vs mutable `latest`.
* `scripts/deploy-k8s.sh`: preflights, ordered rollout, worker heartbeat verification, automated rollback.
* Verified results: PR #1 merged, commit `474e216...`, all 4 pods 1/1 Running, HTTP 200 checks.

### 2. Core Concepts for Speaker 4
> **Concept: Multi-Gate CI/CD and Safe SHA Deployment**
> * **UNDERSTAND:** We don't deploy code manually. When code is pushed to GitHub, automated robots test everything. If tests pass and PR #1 merges to main, images are built for both Intel and Apple Silicon chips and pushed to Docker Hub with an unchangeable commit barcode (SHA). Our deploy script pulls that exact SHA into Minikube and rolls it back automatically if anything fails.
> * **QUEUELESS IMPLEMENTATION:** Defined in `.github/workflows/ci.yml` and `scripts/deploy-k8s.sh`. Validated via merged commit `474e21646fabc877955b9c4d4690e6cffd4f4330`.
> * **PRESENTATION ANSWER:** "Our delivery pipeline enforces four automated CI quality gates on pull requests. On merge to main, GitHub Actions compiles multi-architecture images (AMD64/ARM64) and pushes them to Docker Hub tagged with the full Git SHA. Our deployment script rolls out these images with automated rollback protection."

### 3. Key Commands Speaker 4 Must Know
* `./scripts/deploy-k8s.sh <SHA>`: Safely deploys target SHA to Minikube.
* `gh pr view 1`: Displays details of merged Pull Request #1.
* `docker buildx imagetools inspect <image>:<tag>`: Inspects multi-arch manifest on Docker Hub.
* `kubectl rollout status deployment/backend -n queueless`: Tracks rollout progress.

### 4. Prepared Speaking Script (Word-for-Word)
> "Thank you, Speaker 3. Respected evaluators, I will conclude our presentation by demonstrating our automated **CI/CD Pipeline**, our **Docker Hub distribution**, our **Safe Deployment Automation**, and our **Final Verified Results**.
>
> In professional software engineering, manual deployments are unacceptable. To guarantee quality, we engineered an automated CI/CD pipeline using **GitHub Actions**, configured in `.github/workflows/ci.yml`.
>
> Whenever a pull request is opened, our pipeline executes **Four Parallel Quality Gates**:
> 1. **Frontend Gate:** Runs ESLint, validates TypeScript types, and compiles a Next.js production build.
> 2. **Backend Gate:** Spawns an isolated MongoDB service container in GitHub Actions, seeds baseline data, and runs **43 integration tests** across 6 test suites.
> 3. **Worker Gate:** Executes unit tests verifying our late-fee calculations and confirming idempotency.
> 4. **Manifest Gate:** Lints Docker Compose and runs dry-run validations on all Kubernetes YAML manifests.
>
> During our Phase 6.5 testing, our CI pipeline proved its worth. When Pull Request #1 was opened, the backend gate caught a missing dependency—`socket.io-client`—and an unseeded database. We remediated this in commit `505b18d` by updating `package.json` and adding a database seed step. All four gates turned green!
>
> When PR #1 was merged into `main` at commit **`474e21646fabc877955b9c4d4690e6cffd4f4330`**, GitHub Actions triggered our **`publish-images`** job. Using **Docker Buildx and QEMU**, it compiled multi-architecture images for both **AMD64 and ARM64** architectures, publishing them to Docker Hub under immutable SHA tags and latest pointers across our three repositories: `queueless-frontend`, `queueless-backend`, and `queueless-worker`.
>
> To deploy these images to Minikube safely, we engineered **`scripts/deploy-k8s.sh`**. The script:
> * Rejects mutable `latest` tags and enforces a full 40-character Git SHA.
> * Verifies that the Minikube context is active and checks that target images exist on Docker Hub before touching the cluster.
> * Strictly protects MongoDB and its 2Gi PVC, ensuring zero database mutations or data loss.
> * Deploys services in phased order: Backend, Frontend, and Worker.
> * Verifies that the worker heartbeat strictly advances beyond its pre-deployment baseline.
> * And if any health probe fails or an operator presses `Ctrl+C`, the script traps the signal and automatically **rolls back** all modified services to their baseline images in reverse order.
>
> On November 14, 2026, we executed this script against our live Minikube cluster using commit `474e216...`. All pods rolled out with zero downtime, health checks returned HTTP 200, Socket.IO handshakes were verified, and our database remained 100% intact.
>
> In conclusion, QueueLess is not just a web application—it is a robust, production-ready, cloud-native DevOps ecosystem. Thank you, and our team is now pleased to open the floor to your questions."

### 5. Likely Examiner Questions & Answers for Speaker 4
* **Q: Why reject `latest` in the deployment script?**
  * **Answer:** "`latest` is a mutable tag that does not guarantee which commit is executing. By requiring the full 40-character Git SHA, our deployment script guarantees complete cryptographic reproducibility and deterministic rollbacks."
* **Q: How does the deployment script verify the worker is actually functioning?**
  * **Answer:** "It captures the worker's heartbeat timestamp before rollout, and verifies that the new pod generates a strictly newer timestamp with status `healthy` and `db: connected` before declaring the deployment successful."

### 6. Conclusion Script & Open Floor
> *"This concludes our prepared presentation. All four team members are available to answer your questions regarding our architecture, code, containerization, or Kubernetes infrastructure."*

### 7. Speaker 4 Preparation Checklist
- [ ] Memorized the verified commit SHA (`474e21646fabc877955b9c4d4690e6cffd4f4330`).
- [ ] Understands the 4 CI quality gates and the remediation in PR #1.
- [ ] Can explain how the deployment script rolls back on failure.
- [ ] Rehearsed speaking script within 4 to 5 minutes.


---

# PART L — CLOUD-NATIVE & DEVOPS TECHNICAL GLOSSARY

The following alphabetical glossary defines the core cloud-native, DevOps, and architectural terms used throughout the QueueLess ecosystem:

| Term | Technical Definition | QueueLess Context |
|---|---|---|
| **API (Application Programming Interface)** | A set of defined protocols and subroutines allowing software programs to communicate with each other. | Express REST endpoints under `/api/v1` serving JSON data. |
| **Buildx** | A Docker CLI plugin extending build capabilities using the Moby BuildKit engine, supporting multi-platform builds. | Used in GitHub Actions to compile AMD64 and ARM64 images simultaneously. |
| **CI/CD** | Continuous Integration and Continuous Delivery; automated practices for building, testing, and shipping code. | Orchestrated via `.github/workflows/ci.yml`. |
| **ClusterIP** | The default Kubernetes Service type; provides an internal virtual IP address accessible only within the cluster. | Used by `backend` (port 5001) and `frontend` (port 3000) services. |
| **ConfigMap** | A Kubernetes API object used to store non-confidential configuration key-value pairs. | `queueless-config` storing `NODE_ENV`, ports, and database URIs. |
| **Container** | A standard unit of software packaging code and dependencies so an application runs quickly and reliably across computing environments. | The running runtime instances of our 4 services. |
| **CORS (Cross-Origin Resource Sharing)** | A browser security mechanism that restricts HTTP requests made across different domain origins. | Configured on the Express backend via `CLIENT_URL` to allow requests from `queueless.local`. |
| **Daemon** | A computer program that runs as a background process rather than under the direct control of an interactive user. | The QueueLess Background Worker process checking overdue pickup orders. |
| **Deployment** | A Kubernetes controller that provides declarative updates for Pods and ReplicaSets. | Manages stateless `frontend`, `backend`, and `worker` pods. |
| **Docker Compose** | A tool for defining and running multi-container Docker applications using a YAML configuration file. | `docker-compose.yml` orchestrating local multi-service testing. |
| **Docker Hub** | A cloud-based repository service allowing developers to discover, share, and distribute container images. | Public registry hosting `srujans22/queueless-*` images. |
| **Dockerfile** | A text document containing all the commands a user could call on the command line to assemble a container image. | Defines multi-stage Alpine build recipes for each microservice. |
| **Grace Period** | A designated duration during which an action can be completed without incurring a penalty. | The 10-minute pickup window granted to students once food is marked `READY_FOR_PICKUP`. |
| **Headless Service** | A Kubernetes Service with `clusterIP: None` that does not allocate a virtual cluster IP, returning direct pod DNS A-records. | Used by `mongodb` (`04-mongodb.yaml`) for direct stateful routing. |
| **Idempotency** | An operation property where executing the action multiple times yields the exact same state as executing it once. | The worker scan checks `lateFeeApplied == 0` so running twice never charges ₹40. |
| **Ingress** | An API object managing external access to cluster services, typically HTTP/HTTPS, providing routing and SSL termination. | Traefik Ingress routing `queueless.local` on port 80 to backend and frontend. |
| **JWT (JSON Web Token)** | A compact, URL-safe means of representing claims to be transferred between two parties securely. | Used for stateless student and staff authentication. |
| **Liveness Probe** | A diagnostic check used by Kubernetes to determine if a container needs to be restarted. | Pings `/api/v1/health` and restarts pod if it crashes or deadlocks. |
| **Minikube** | A lightweight tool that implements a local, single-node Kubernetes cluster inside a virtual machine or container. | Runs QueueLess workloads on macOS via Docker Desktop. |
| **Multi-Stage Build** | A Dockerfile design pattern using multiple `FROM` instructions to separate build tools from lean runtime images. | Separates TypeScript compiler (builder) from Node runtime (runner), saving >85% disk space. |
| **Namespace** | A virtual cluster mechanism in Kubernetes for partitioning resources across teams or applications. | All QueueLess objects execute inside the private `queueless` namespace. |
| **Node** | A worker machine in Kubernetes, which can be either a physical machine or a virtual machine. | Minikube runs as a single-node cluster mapped to `minikube`. |
| **PersistentVolumeClaim (PVC)** | A user request for storage in Kubernetes, bound to a physical PersistentVolume. | `mongodb-pvc` reserving 2Gi of permanent host-backed storage for database files. |
| **Pod** | The smallest deployable computing unit in Kubernetes, wrapping one or more containers sharing network and storage. | E.g., `pod/backend-656b9b46cd-x8dkr`. |
| **QEMU** | An open-source emulator that enables building and executing binaries for foreign CPU architectures. | Used by GitHub Actions to compile ARM64 images on AMD64 runner hardware. |
| **RBAC (Role-Based Access Control)** | An access regulation mechanism based on user roles within an organization. | Controls permissions across `student`, `staff`, and `admin` personas. |
| **Readiness Probe** | A Kubernetes probe checking if a pod is ready to accept incoming user network traffic. | Withholds traffic until Express confirms active MongoDB connectivity. |
| **Recreate Strategy** | A deployment strategy where all existing pods are killed before new pods are created. | Used by `worker` to prevent dual-pod concurrency race conditions. |
| **RollingUpdate Strategy** | A deployment strategy that gradually replaces old pods with new ones to ensure zero downtime. | Used by `frontend` and `backend` deployments. |
| **Secret** | A Kubernetes object designed to hold sensitive data (passwords, tokens, keys) in base64 format. | `queueless-secret` containing `JWT_SECRET`. |
| **Socket.IO** | An event-driven JavaScript library for real-time bidirectional communication between web clients and servers. | Delivers live order status transitions to student smartphones in under 100ms. |
| **StatefulSet** | A Kubernetes controller managing the deployment and scaling of stateful applications requiring persistent identities. | Manages `mongodb-0` attached to `mongodb-pvc`. |
| **Traefik** | A modern, open-source HTTP reverse proxy and Ingress controller for microservices. | Built-in Minikube Ingress controller routing incoming traffic for `queueless.local`. |
