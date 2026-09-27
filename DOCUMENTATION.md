# Comprehensive Academic Project Documentation
## Delivery Order & Rider Assignment System

**Academic Degree:** Bachelor of Technology (B.Tech) in Computer Science & Engineering  
**Integrated Core Subjects:** DBMS · DMGT · ADSA · OOPJ · Python

---

### 1. Project Title
**Delivery Order & Rider Assignment System**

---

### 2. Problem Statement
Traditional food delivery architectures rely either on manual dispatching or naive nearest-rider heuristics. These approaches suffer from severe operational inefficiencies:
1. Overburdening closer riders who already have excessive active delivery backlogs.
2. Inaccurate delivery promises caused by ignoring restaurant kitchen preparation latencies.
3. Suboptimal routing through arbitrary distance estimations rather than real topological road graphs.
4. Rigid login barriers preventing ad-hoc administrator or student evaluation access.

---

### 3. Objective
The primary objective of this project is to develop an intelligent, automated food delivery dispatch platform that:
- Seamlessly evaluates candidate couriers using a weighted multi-factor scoring formula.
- Models physical urban roadways as a weighted graph and computes minimum transit paths using Dijkstra’s Algorithm.
- Accurately projects customer ETAs by compounding kitchen prep delay, transit physics, and queueing delays.
- Enforces strict relational database constraints (3NF) in MySQL.
- Demonstrates core curricular concepts of DBMS, DMGT, ADSA, OOPJ, and Python in a unified, demonstrable application.

---

### 4. Existing System
In existing legacy systems:
- Dispatch is performed manually by human managers or simple FIFO queues.
- Distance calculations are straight-line Euclidean approximations ($d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$) which fail to account for actual road networks.
- No algorithmic balance exists between rider workload, distance, and kitchen timing.
- Limited access control requiring pre-provisioned database credentials.

---

### 5. Proposed System
The proposed system introduces:
1. **Universal Email Access & Session Management:** Enables any user or examiner to sign in, register any email address, set/reset passwords, and immediately access system operations.
2. **Deterministic Multi-Objective Scoring:** Evaluates every active rider against incoming orders using customizable operational weights.
3. **Graph-Theoretic Shortest Paths (DMGT):** Implements Dijkstra's algorithm to compute precise physical road routes between Rider Staging $\rightarrow$ Restaurant $\rightarrow$ Customer.
4. **Relational Data Integrity (DBMS):** Enforces 3NF normalization, foreign key constraints, indexes, and parameterized queries.
5. **Object-Oriented Design (OOPJ):** Encapsulated entities, inheritance hierarchies, and polymorphic dispatchers.

---

### 6. Technologies Used
- **Backend:** Python 3.9+, Flask
- **Database:** MySQL 8.0 / SQLite3 fallback
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Algorithms:** Dijkstra's Algorithm ($O((V+E)\log V)$), Priority Queue (Min-Heap)
- **Deployment:** Port 3000 / Port 5000

---

### 7. System Architecture
```
+-------------------------------------------------------------------+
|                        PRESENTATION LAYER                         |
|  React 19 + TypeScript + Tailwind CSS / Flask Jinja2 Templates    |
|  (Universal Login, Live Dashboard, Dijkstra Map, Orders & Fleet)  |
+---------------------------------+---------------------------------+
                                  | HTTP / JSON REST
+---------------------------------v---------------------------------+
|                         LOGIC & ALGORITHM LAYER                   |
|  - Dijkstra Shortest Path Engine (DMGT / ADSA)                    |
|  - Multi-Factor Rider Scoring Engine (W_w, W_d, W_t)              |
|  - Session Authentication & Universal Email Access                |
|  - Entity Models & Validation (OOPJ)                              |
+---------------------------------+---------------------------------+
                                  | Parameterized SQL
+---------------------------------v---------------------------------+
|                          DATA STORAGE LAYER                       |
|  MySQL Engine: delivery_management                                |
|  Tables: users, customers, restaurants, riders, orders, deliveries|
+-------------------------------------------------------------------+
```

---

### 8. Database Design
Database Name: `delivery_management`

1. **`users`**:
   - `id` (VARCHAR 36, PK)
   - `name` (VARCHAR 100)
   - `email` (VARCHAR 150, UNIQUE)
   - `password_hash` (VARCHAR 255)
   - `role` (ENUM: admin, dispatcher, manager)
   - `created_at` (TIMESTAMP)

2. **`customers`**:
   - `customer_id` (VARCHAR 20, PK)
   - `name` (VARCHAR 100)
   - `phone` (VARCHAR 20)
   - `address` (TEXT)
   - `email` (VARCHAR 150)
   - `city` (VARCHAR 80)
   - `created_at` (TIMESTAMP)

3. **`restaurants`**:
   - `restaurant_id` (VARCHAR 20, PK)
   - `name` (VARCHAR 100)
   - `location` (VARCHAR 80)
   - `phone` (VARCHAR 20)
   - `address` (TEXT)
   - `prep_time` (INT, minutes)
   - `rating` (DECIMAL 2,1)
   - `created_at` (TIMESTAMP)

4. **`riders`**:
   - `rider_id` (VARCHAR 20, PK)
   - `name` (VARCHAR 100)
   - `phone` (VARCHAR 20)
   - `status` (ENUM: Available, Busy, Offline)
   - `current_location` (VARCHAR 80)
   - `active_orders` (INT)
   - `average_speed` (INT, km/h)
   - `vehicle_type` (VARCHAR 100)
   - `completed_orders` (INT)
   - `rating` (DECIMAL 3,2)
   - `created_at` (TIMESTAMP)

5. **`orders`**:
   - `order_id` (VARCHAR 30, PK)
   - `customer_id` (VARCHAR 20, FK $\rightarrow$ `customers.customer_id`)
   - `restaurant_id` (VARCHAR 20, FK $\rightarrow$ `restaurants.restaurant_id`)
   - `order_time` (DATETIME)
   - `delivery_address` (TEXT)
   - `delivery_city` (VARCHAR 80)
   - `status` (ENUM: Pending, Confirmed, Preparing, Ready, Assigned, Out for Delivery, Delivered, Cancelled)
   - `total_amount` (DECIMAL 10,2)
   - `assigned_rider_id` (VARCHAR 20, FK $\rightarrow$ `riders.rider_id`)

6. **`deliveries`**:
   - `delivery_id` (VARCHAR 30, PK)
   - `order_id` (VARCHAR 30, UNIQUE, FK $\rightarrow$ `orders.order_id`)
   - `rider_id` (VARCHAR 20, FK $\rightarrow$ `riders.rider_id`)
   - `assigned_time` (DATETIME)
   - `pickup_time` (DATETIME)
   - `delivery_time` (DATETIME)
   - `status` (ENUM: Pending, Assigned, Preparing, Out for Delivery, Delivered)
   - `distance` (DECIMAL 5,2)
   - `eta` (INT, minutes)
   - `route_nodes` (TEXT)

---

### 9. ER Diagram Description
- **Customer $\rightarrow$ Orders:** One-to-Many ($1:N$). A registered customer can place multiple delivery orders.
- **Restaurant $\rightarrow$ Orders:** One-to-Many ($1:N$). A restaurant partner fulfills multiple orders.
- **Order $\rightarrow$ Delivery:** One-to-One ($1:1$). Each order maps to exactly one active delivery record.
- **Rider $\rightarrow$ Deliveries:** One-to-Many ($1:N$). A rider can accept multiple sequential or concurrent deliveries up to maximum capacity.

---

### 10. Modules
1. **Auth & Universal Access Module:** Login, registration with any email, password modification, session cookies.
2. **Dashboard Module:** Live metrics from database, workload distribution, order status breakdown.
3. **Customer Directory Module:** Full CRUD operations and order history.
4. **Restaurant Partners Module:** Full CRUD operations and prep time tracking.
5. **Riders & Fleet Module:** Full CRUD, live status toggle, speed telemetry, queue monitoring.
6. **Order Management Module:** Order placement, address routing, and 1-click automatic assignment trigger.
7. **Automatic Rider Assignment Engine:** Evaluates candidate matrix, scores riders, highlights selection rationale.
8. **Dijkstra Route Planning Module:** Visual topological graph, shortest path calculation, algorithm execution trace.
9. **Delivery Lifecycle Tracking Module:** 5-step status progression with real-time timestamps.
10. **Reports & Analytics Module:** Financial turnover, average delivery time, partner volumes, CSV export.
11. **Academic Viva Voce Hub:** Curricular reference covering DBMS, DMGT, ADSA, OOPJ.

---

### 11. DBMS Implementation Details
- **Normalization:** Enforces Third Normal Form (3NF). Non-key attributes depend strictly on candidate keys.
- **Referential Integrity:** `ON DELETE CASCADE` on child orders; `ON DELETE SET NULL` on rider reassignment.
- **Parameterized SQL:** All queries utilize placeholder substitution (`%s` in PyMySQL, `?` in SQLite) eliminating SQL injection risks.
- **Query Optimization:** Secondary B-Tree indexes created on high-frequency filtering columns (`orders.status`, `riders.status`, `deliveries.status`).

---

### 12. DMGT Implementation Details
- **Graph Representation:** Weighted undirected graph $G = (V, E)$, where $V$ represents geographic junctions (Kakinada, Rajahmundry, Samalkota, Peddapuram, Pithapuram, Mandapeta, etc.) and $E$ represents bidirectional road corridors.
- **Weight Function:** $w: E \rightarrow \mathbb{R}^+$ where $w(e)$ is physical road distance in kilometers.
- **Triangle Inequality:** Validated across all connecting vertices: $dist(u, v) \le dist(u, k) + dist(k, v)$.

---

### 13. ADSA Implementation Details
- **Dijkstra's Algorithm:** Implemented using a Priority Queue / Min-Heap data structure (`heapq` in Python).
- **Time Complexity:** $O((V + E) \log V)$ with adjacency list and binary heap.
- **Space Complexity:** $O(V + E)$ for adjacency list, distance array, and visited hash set.
- **Greedy Choice Property:** At each step, the algorithm extracts vertex $u$ with minimum tentative distance from priority queue.

---

### 14. OOPJ Implementation Details
- **Encapsulation:** State variables in `Customer`, `Rider`, and `Order` are private/protected and manipulated via getters and validation setters.
- **Inheritance:** `BaseEntity` encapsulates common properties (`id`, `created_at`) inherited by all domain entities.
- **Polymorphism:** Standard `to_dict()` and routing interfaces can be extended by alternative dispatchers.
- **Abstraction:** The complex coordination of distance computation, database mutation, and courier reassignment is cleanly abstracted behind unified service methods.

---

### 15. Python Implementation Details
- **Flask Framework:** Lightweight WSGI application utilizing decorators (`@app.route`, `@login_required`).
- **Session Security:** Cryptographically signed client-side cookies utilizing HMAC secret keys.
- **Dual Database Fallback:** Automatic detection of live MySQL server with seamless SQLite3 fallback.

---

### 16. Rider Assignment Algorithm
$$\text{Rider Score} = (W_{\text{workload}} \times \text{Active Orders}) + (W_{\text{distance}} \times \text{Distance}) + \left(W_{\text{eta}} \times \frac{\text{ETA}}{10}\right)$$
1. Filter couriers where `status == 'Available'`.
2. Compute shortest path distance from courier staging node to pickup restaurant using Dijkstra.
3. Compute total ETA including kitchen preparation time and queue delays.
4. Calculate composite score for each candidate.
5. Sort candidates in ascending order; candidate with minimal score is ranked #1.
6. Commit assignment to database, update rider active orders, and initialize delivery record.

---

### 17. Dijkstra Algorithm
1. Initialize distance array: $dist[v] = \infty$ for all $v \neq start$, and $dist[start] = 0$.
2. Insert $(0, start)$ into Min-Heap $Q$.
3. While $Q \neq \emptyset$:
   a. Extract $(d, u) = \text{Extract-Min}(Q)$.
   b. If $u$ already visited, continue. Mark $u$ as visited.
   c. For each neighbor $v$ of $u$ with weight $w(u, v)$:
      If $dist[u] + w(u, v) < dist[v]$:
         $dist[v] \leftarrow dist[u] + w(u, v)$
         $prev[v] \leftarrow u$
         Insert $(dist[v], v)$ into $Q$.
4. Reconstruct path by traversing backwards from destination via $prev$ pointers.

---

### 18. ETA Calculation
$$\text{Travel Time (mins)} = \left(\frac{\text{Dijkstra Road Distance}}{\text{Average Rider Speed}}\right) \times 60$$
$$\text{ETA} = \text{Restaurant Prep Time} + \text{Travel Time} + (\text{Active Orders} \times 8)$$
*Example:* 6.2 km route at 32 km/h with 15 mins prep time and 0 active orders:
$\text{Travel Time} = (6.2 / 32) \times 60 \approx 11.6 \text{ mins}$
$\text{Total ETA} = 15 + 12 + 0 = 27 \text{ minutes}$.

---

### 19. Screens & Interfaces
1. `/login`: Professional delivery background, universal email login, instant registration, password reset.
2. `/dashboard`: Key KPI counters, order breakdown charts, fleet status overview, quick actions.
3. `/customers`: Complete CRUD directory and customer accounts.
4. `/restaurants`: Restaurant partner management and prep times.
5. `/riders`: Courier fleet status, speed metrics, active queues.
6. `/orders`: Order records, status pipelines, 1-click automatic assignment.
7. `/route-planning`: Dijkstra interactive graph visualizer and algorithm trace table.
8. `/deliveries`: Live delivery lifecycle stepper and courier tracking.
9. `/reports`: Turnover analytics, performance charts, CSV export.
10. `/academic`: College Viva Voce study guide and subject notes.

---

### 20. Installation Steps
```bash
git clone <repository_url>
cd delivery-system
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

---

### 21. How to Run
```bash
python app.py
```
Open `http://127.0.0.1:5000` or port `3000`.

---

### 22. Sample Credentials
- **Admin Account:** `admin` / `admin123`
- **Anjali Account:** `yakaanjali3@gmail.com` / `password123`
- **Any Other Email:** Allowed to register and set any custom password.

---

### 23. Test Cases
| Test ID | Module | Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Auth | Enter unregistered email with password | Creates new account and logs in | Passed |
| **TC-02** | Auth | Enter invalid password for `admin` | Shows authentication error | Passed |
| **TC-03** | DMGT | Route from Kakinada to Rajahmundry | Dijkstra returns 62.8 km shortest path | Passed |
| **TC-04** | Dispatch | Auto-assign order with R001 & C001 | Lowest score rider (D003/D001) chosen | Passed |
| **TC-05** | Deliveries | Advance status from Assigned to Delivered | Lifecycle updates and rider queue decrements | Passed |

---

### 24. Future Enhancements
- GPS live tracking with WebSockets.
- Dynamic traffic congestion multipliers on graph edge weights.
- Multi-restaurant batch order delivery routing.

---

### 25. Conclusion
The **Delivery Order & Rider Assignment System** demonstrates a full-stack, enterprise-grade application combining core theoretical disciplines of Computer Science. By unifying DBMS data modeling, DMGT graph algorithms, ADSA priority queue heuristics, and OOPJ clean architecture, it solves real-world logistics challenges effectively.
