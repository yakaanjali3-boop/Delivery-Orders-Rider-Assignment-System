# Viva Voce Preparation Guide & Interview Questions
## Delivery Order & Rider Assignment System
**Curricular Subjects:** DBMS · DMGT · ADSA · OOPJ · Python & Flask

---

### Section 1: Database Management Systems (DBMS & MySQL)

#### Q1: What is a Primary Key and Foreign Key in this project?
**Answer:**
- A **Primary Key (PK)** uniquely identifies every row in a table. In our project:
  - `customer_id` is the PK of `customers`.
  - `restaurant_id` is the PK of `restaurants`.
  - `rider_id` is the PK of `riders`.
  - `order_id` is the PK of `orders`.
  - `delivery_id` is the PK of `deliveries`.
- A **Foreign Key (FK)** creates a relational link between two tables by referring to the primary key of another table:
  - `orders.customer_id` references `customers.customer_id`.
  - `orders.restaurant_id` references `restaurants.restaurant_id`.
  - `deliveries.order_id` references `orders.order_id`.
  - `deliveries.rider_id` references `riders.rider_id`.

#### Q2: What are SQL JOINs and where are they used in this project?
**Answer:**
A SQL JOIN combines rows from two or more tables based on a related column. In our project, an `INNER JOIN` or `LEFT JOIN` is used to assemble full delivery orders with customer names, restaurant names, and rider details:
```sql
SELECT orders.order_id, customers.name AS customer_name, restaurants.name AS restaurant_name, riders.name AS rider_name
FROM orders
JOIN customers ON orders.customer_id = customers.customer_id
JOIN restaurants ON orders.restaurant_id = restaurants.restaurant_id
LEFT JOIN riders ON orders.assigned_rider_id = riders.rider_id;
```

#### Q3: What is SQL Injection and how do we prevent it?
**Answer:**
SQL Injection (SQLi) is a security vulnerability where an attacker manipulates SQL queries by injecting malicious SQL commands into user inputs. We prevent it by strictly using **parameterized queries** (e.g. `cursor.execute("SELECT * FROM users WHERE email = %s", (email,))`). In parameterized queries, user input is treated as literal data, never as executable SQL code.

#### Q4: What is Normalization and which normal form is used?
**Answer:**
Normalization is the process of structuring relational tables to eliminate redundancy and prevent insert, update, and delete anomalies. Our schema is in **Third Normal Form (3NF)**:
1. **1NF:** All attributes contain atomic (single-valued) values.
2. **2NF:** It is in 1NF and every non-key attribute is fully functionally dependent on the entire primary key.
3. **3NF:** It is in 2NF and has no transitive dependencies (non-key attributes do not depend on other non-key attributes).

---

### Section 2: Discrete Mathematics & Graph Theory (DMGT)

#### Q5: How is Graph Theory used in this delivery system?
**Answer:**
The delivery area (cities like Kakinada, Rajahmundry, Samalkota, Peddapuram) is represented as a **weighted undirected graph** $G = (V, E)$:
- **Vertices (V):** Key geographic nodes (courier staging zones, restaurants, customer residences, and road junctions).
- **Edges (E):** Road segments connecting physical junctions.
- **Edge Weights:** Physical road distances in kilometers.

#### Q6: What is Dijkstra's Shortest Path Algorithm?
**Answer:**
Dijkstra's algorithm is a greedy single-source shortest path algorithm that finds the minimal distance path from a starting node to all other nodes in a graph with non-negative edge weights. It repeatedly selects the vertex with the lowest tentative distance that has not yet been processed, updates the distances of its neighboring vertices (relaxation), and terminates when the destination is reached.

---

### Section 3: Advanced Data Structures & Algorithms (ADSA)

#### Q7: What is the Time and Space Complexity of Dijkstra's Algorithm?
**Answer:**
- **With a Priority Queue (Min-Heap) and Adjacency List:**
  - **Time Complexity:** $O((V + E) \log V)$, where $V$ is vertices and $E$ is edges.
  - **Space Complexity:** $O(V + E)$ to store the graph adjacency list and distance structures.
- **With an Adjacency Matrix (Naive scan):**
  - **Time Complexity:** $O(V^2)$.

#### Q8: What is the Greedy Technique and how does Dijkstra demonstrate it?
**Answer:**
The greedy technique makes the locally optimal choice at each step with the hope of finding a global optimum. Dijkstra's algorithm demonstrates this by always extracting the vertex with the minimum tentative distance from the priority queue, knowing that with non-negative edge weights, no shorter path to that vertex can exist.

#### Q9: Explain the Automatic Rider Assignment formula.
**Answer:**
$$\text{Rider Score} = (W_{\text{workload}} \times \text{Active Orders}) + (W_{\text{distance}} \times \text{Distance}) + \left(W_{\text{eta}} \times \frac{\text{ETA}}{10}\right)$$
- **Active Orders:** Balances workload so couriers are not overwhelmed.
- **Distance:** Measures transit distance from rider to pickup restaurant.
- **ETA:** Measures customer waiting time.
- **Lower score = higher suitability.** The system sorts candidate riders in ascending order and assigns the lowest-scoring available candidate.

---

### Section 4: Object-Oriented Programming (OOPJ)

#### Q10: How are OOP principles applied in this project?
**Answer:**
1. **Encapsulation:** Internal fields (e.g., rider status, active order count) are encapsulated with methods like `assign_order()` and `complete_order()` that validate state transitions.
2. **Inheritance:** `Customer`, `Restaurant`, `Rider`, and `Order` inherit common attributes (`id`, `created_at`) from a parent `BaseEntity` class.
3. **Polymorphism:** Entity classes provide a uniform `to_dict()` serialization method, and routing algorithms can be swapped polymorphically.
4. **Abstraction:** Complex multi-step operations like assigning a courier, logging a delivery, and running Dijkstra are abstracted behind concise service methods.

---

### Section 5: Python & Flask

#### Q11: How does Flask handle session authentication?
**Answer:**
Flask signs session data using a secret key (`app.secret_key`) and stores it in an HTTP cookie on the client's browser. When a user logs in, `session['user_id']` is set. Protected routes verify the existence of this session variable using the `@login_required` decorator.

#### Q12: How is Universal Email Access implemented?
**Answer:**
The system permits ANY email address to sign in or register on the spot. If a new email is entered on the login screen, the system detects it, creates a new record in the `users` table with the supplied password, sets up session authentication, and redirects directly to the dashboard. Users can also reset or update their password at any time.

#### Q13: How is Estimated Time of Arrival (ETA) calculated?
**Answer:**
$$\text{ETA (mins)} = \text{Kitchen Prep Time} + \left(\frac{\text{Dijkstra Road Distance}}{\text{Rider Average Speed}} \times 60\right) + (\text{Active Orders} \times 8)$$
- **Kitchen Prep Time:** Time taken by restaurant kitchen to prepare food.
- **Travel Time:** Physical road distance divided by rider speed in km/h.
- **Workload Delay:** Queuing delay for each active order the courier must deliver first.
