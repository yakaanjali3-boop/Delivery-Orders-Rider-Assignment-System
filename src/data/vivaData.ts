import { VivaQA } from '../types';

export const VIVA_QUESTIONS: VivaQA[] = [
  {
    id: 'viva-1',
    category: 'ADSA',
    question: 'What is Dijkstra’s Algorithm and what is its time complexity in this project?',
    answer:
      'Dijkstra’s algorithm is a greedy single-source shortest path algorithm that finds the minimum distance path from a starting node to all other nodes in a weighted graph with non-negative edge weights. Using an adjacency list and a Priority Queue (Min-Heap), its time complexity is O((V + E) log V), where V is the number of delivery locations/junctions and E is the number of road segments. With an adjacency matrix, it runs in O(V^2).',
    keyConcepts: ['Greedy Technique', 'Priority Queue', 'O((V+E) log V)', 'Shortest Path'],
  },
  {
    id: 'viva-2',
    category: 'DMGT',
    question: 'How are delivery locations represented using Discrete Mathematics & Graph Theory (DMGT)?',
    answer:
      'Delivery locations are modeled as a connected, weighted, undirected graph G = (V, E). The vertex set V represents spatial hubs (Customer residences, Restaurant kitchens, Rider staging points, and traffic junctions). The edge set E represents navigable roadways, where each edge e = (u, v) is assigned a non-negative real weight w(e) indicating physical distance in kilometers or baseline travel time in minutes.',
    keyConcepts: ['Weighted Graph G=(V,E)', 'Vertex Set', 'Edge Weights', 'Triangular Inequality'],
  },
  {
    id: 'viva-3',
    category: 'ADSA',
    question: 'Explain the Automatic Rider Assignment scoring formula and its design rationale.',
    answer:
      'Rider Score = (W_workload × Active_Orders) + (W_distance × Distance) + (W_eta × Estimated_Time). Lower score denotes higher suitability. It balances three critical operational objectives: load balancing (avoiding overburdening any single rider), geographical proximity (minimizing transit fuel and time), and customer satisfaction (minimizing ETA promise). A priority queue or linear scan over candidate riders selects the minimum-scoring available candidate in O(N log N) or O(N).',
    keyConcepts: ['Multi-objective Optimization', 'Score Minimization', 'Load Balancing', 'Dispatch Latency'],
  },
  {
    id: 'viva-4',
    category: 'DBMS',
    question: 'Describe the Database Schema, Primary Keys, and Foreign Key Relationships in MySQL.',
    answer:
      'The relational database delivery_management consists of 5 core tables: customers (PK: customer_id), restaurants (PK: restaurant_id), riders (PK: rider_id), orders (PK: order_id; FKs: customer_id -> customers, restaurant_id -> restaurants), and deliveries (PK: delivery_id; FKs: order_id -> orders, rider_id -> riders). Referential integrity constraints (ON DELETE RESTRICT / CASCADE) prevent orphan delivery records.',
    keyConcepts: ['Primary Key', 'Foreign Key', 'Referential Integrity', '1-to-Many Relationships'],
  },
  {
    id: 'viva-5',
    category: 'DBMS',
    question: 'Why do we use Parameterized SQL Queries in Flask/MySQL?',
    answer:
      'Parameterized queries (e.g. cursor.execute("SELECT * FROM users WHERE email = %s", (email,))) treat user input strictly as literal data rather than executable SQL code. This completely neutralizes SQL Injection (SQLi) attacks, where malicious actors attempt to manipulate query logic (such as " OR 1=1 --). It also enables the MySQL query optimizer to cache compiled execution plans.',
    keyConcepts: ['SQL Injection Prevention', 'Prepared Statements', 'Query Optimization', 'Input Sanitization'],
  },
  {
    id: 'viva-6',
    category: 'OOPJ',
    question: 'How are OOP (Object-Oriented Programming) concepts applied in this system?',
    answer:
      '1. Encapsulation: Classes like Rider, Order, Customer, and Restaurant encapsulate internal states with accessor methods and status-validation logic.\n2. Inheritance: Base entities can inherit from a common Entity model containing id and timestamp.\n3. Polymorphism: Different routing engines (DijkstraRouter, DirectDistanceRouter) implement a common calculate_path() interface.\n4. Abstraction: DeliveryManager abstracts complex multi-step assignment, database writes, and ETA updates behind clean public methods.',
    keyConcepts: ['Encapsulation', 'Abstraction', 'Polymorphism', 'Single Responsibility Principle'],
  },
  {
    id: 'viva-7',
    category: 'Python & Flask',
    question: 'How is session-based authentication managed, and how is universal email access handled?',
    answer:
      'Flask manages user sessions using cryptographically signed cookies (session["user_id"]). When any user registers or logs in with their email, their identity is verified against hashed credentials in the database/storage. Protected endpoints verify session existence via a @login_required decorator or React Auth context, redirecting unauthenticated users to /login.',
    keyConcepts: ['Signed Cookies', 'Session State', 'Auth Middleware', 'Email Registration'],
  },
  {
    id: 'viva-8',
    category: 'ADSA',
    question: 'How is Estimated Time of Arrival (ETA) calculated mathematically?',
    answer:
      'ETA = Restaurant_Prep_Time + Travel_Time + Workload_Delay.\n- Travel_Time (mins) = (Dijkstra_Distance / Rider_Average_Speed) × 60\n- Workload_Delay = Active_Orders × 8 minutes per queued stop.\nFor example: A 6 km distance at 30 km/h is 12 mins travel time. With 15 mins kitchen prep and 0 active orders, total ETA = 15 + 12 + 0 = 27 minutes.',
    keyConcepts: ['ETA Breakdown', 'Speed-Distance-Time', 'Queueing Delay', 'Deterministic Transit'],
  },
];
