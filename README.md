# Delivery Order & Rider Assignment System
**A Multi-Disciplinary B.Tech Academic Project Integrating DBMS, DMGT, ADSA, OOPJ & Python**

---

## 1. Project Overview & Quick Start

This enterprise food delivery management system provides automated courier dispatch, multi-factor rider scoring, dynamic Dijkstra shortest-path route planning, real-time lifecycle tracking, and universal email login.

### Accessing the Live Interactive Application
The application is pre-compiled and served directly in the web environment:
- **Port:** `3000` (Web Dashboard) or `5000` (Python Flask Backend)
- **Universal Email Access:** Any email address can register, set a password, and login immediately!
- **Demo Admin Credentials:**
  - **Username / Email:** `admin` or `yakaanjali3@gmail.com`
  - **Password:** `admin123` (or `password123`)

---

## 2. Academic Subject Integration (B.Tech Syllabus)

| Curricular Subject | Real Project Contribution |
| :--- | :--- |
| **DBMS** | MySQL database (`delivery_management`), 3NF schema, Primary/Foreign keys, 4-way JOIN queries, parameterized SQL statements preventing SQL injection. |
| **DMGT** | Discrete Mathematics & Graph Theory: Delivery road network modeled as a weighted undirected graph $G = (V, E)$ with non-negative physical distances. |
| **ADSA** | Advanced Data Structures & Algorithms: Dijkstra’s Single-Source Shortest Path algorithm with $O((V+E)\log V)$ Priority Queue Min-Heap; multi-objective greedy rider scoring optimization. |
| **OOPJ** | Object-Oriented Programming: Encapsulated Entity classes (`Customer`, `Restaurant`, `Rider`, `Order`, `Delivery`), inheritance from `BaseEntity`, polymorphic routing, and managerial abstractions. |
| **Python & Flask** | RESTful API endpoints, cryptographically signed cookie sessions, role-based access control, universal user registration. |

---

## 3. How to Run Locally with Python & MySQL

### Prerequisites
- Python 3.9+ installed
- MySQL Server (optional; automatically falls back to portable SQLite if MySQL is not detected)

### Execution Steps
```bash
# 1. Create and activate a Python virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) Initialize MySQL Database
mysql -u root -p < schema.sql

# 4. Start the Flask Application
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```
Or use the pre-built React SPA interface at port `3000`.

---

## 4. Automatic Rider Assignment Algorithm

### Mathematical Scoring Formula
$$\text{Rider Score} = (W_{\text{workload}} \times \text{Active Orders}) + (W_{\text{distance}} \times \text{Distance}) + \left(W_{\text{eta}} \times \frac{\text{ETA}}{10}\right)$$

*Lower score indicates higher suitability.*

- **Default Coefficients:** $W_{\text{workload}} = 0.35$, $W_{\text{distance}} = 0.40$, $W_{\text{eta}} = 0.25$.
- Evaluates candidate proximity, current queue stacks, and kitchen preparation delay.
- Highlights the winning candidate along with deterministic explanations ("Why this rider was selected").

---

## 5. Sample Initial Data Pre-Populated

- **Customers:**
  - `C001` — Anjali (Kakinada, `9876543210`)
  - `C002` — Ravi (Rajahmundry, `9876543211`)
  - `C003` — Priya (Samalkota, `9876543212`)
- **Restaurants:**
  - `R001` — Spice Hub (Kakinada, Prep Time: 15m)
  - `R002` — Food Palace (Rajahmundry, Prep Time: 18m)
  - `R003` — Tasty Bites (Samalkota, Prep Time: 12m)
- **Riders:**
  - `D001` — Arun (Available, 2 active orders, 32 km/h)
  - `D002` — Ravi (Available, 1 active order, 35 km/h)
  - `D003` — Kiran (Available, 0 active orders, 30 km/h)
  - `D004` — Suresh (Busy, 4 active orders, 28 km/h)

---

## 6. Project Structure

```
├── app.py                     # Flask application & routing
├── models.py                  # OOP Python classes (Customer, Rider, Order, etc.)
├── dijkstra.py                # Dijkstra's shortest path algorithm
├── db_config.py               # MySQL connection & SQLite fallback
├── schema.sql                 # MySQL DDL & DML script
├── requirements.txt           # Python dependencies
├── DOCUMENTATION.md           # Full academic project report
├── VIVA_QUESTIONS.md          # Viva voce questions & answers
├── src/
│   ├── App.tsx                # Main React UI orchestrator
│   ├── components/            # Modular dashboard views & modals
│   ├── context/AppContext.tsx # Central state management & universal auth
│   ├── utils/dijkstra.ts      # Graph theory & Dijkstra engine
│   └── utils/assignment.ts    # Rider scoring & ranking algorithm
```
