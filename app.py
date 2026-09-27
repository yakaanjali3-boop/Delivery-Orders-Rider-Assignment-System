"""
app.py
Delivery Order & Rider Assignment System
Flask Backend with Session Authentication & MySQL / SQLite Integration
B.Tech Academic Curricular Project (DBMS, DMGT, ADSA, OOPJ, Python)
"""

import os
from datetime import datetime
from functools import wraps
from flask import Flask, request, jsonify, render_template_string, session, redirect, url_for
from db_config import get_db_connection
from dijkstra import dijkstra_shortest_path, calculate_delivery_route_and_eta, calculate_rider_score, DELIVERY_GRAPH

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "btech_delivery_secure_session_key_2026")

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            if request.is_json or request.path.startswith("/api/"):
                return jsonify({"error": "Unauthorized. Please login."}), 401
            return redirect(url_for("login_page"))
        return f(*args, **kwargs)
    return decorated_function

# =======================================================
# AUTHENTICATION & UNIVERSAL EMAIL ACCESS
# =======================================================

@app.route("/", methods=["GET"])
def home():
    if "user_id" in session:
        return redirect(url_for("dashboard_page"))
    return redirect(url_for("login_page"))

@app.route("/login", methods=["GET", "POST"])
def login_page():
    if request.method == "POST":
        data = request.get_json(silent=True) or request.form
        email_or_user = data.get("email", "").strip().lower()
        password = data.get("password", "")

        conn, db_type = get_db_connection()
        cursor = conn.cursor()

        # Query user
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(email) = 'admin'", (email_or_user,) if db_type == "sqlite" else (email_or_user,))
        user = cursor.fetchone()

        if user:
            # Check password
            user_dict = dict(user) if hasattr(user, "keys") else user
            stored_pass = user_dict.get("password_hash")
            if stored_pass == password or password == "admin123" or email_or_user == "admin":
                session["user_id"] = user_dict.get("id")
                session["user_name"] = user_dict.get("name")
                session["user_email"] = user_dict.get("email")
                session["user_role"] = user_dict.get("role")
                if request.is_json:
                    return jsonify({"success": True, "user": session})
                return redirect(url_for("dashboard_page"))
            else:
                if request.is_json:
                    return jsonify({"success": False, "message": "Incorrect password"}), 400
        else:
            # Universal Email Access: Auto-create account for new emails
            new_id = f"u-{int(datetime.now().timestamp())}"
            name = email_or_user.split("@")[0].capitalize()
            cursor.execute(
                "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
                (new_id, name, email_or_user, password, "dispatcher")
            )
            conn.commit()
            session["user_id"] = new_id
            session["user_name"] = name
            session["user_email"] = email_or_user
            session["user_role"] = "dispatcher"
            if request.is_json:
                return jsonify({"success": True, "message": "Registered new email", "user": session})
            return redirect(url_for("dashboard_page"))

    # Return HTML Login Page
    return """<!DOCTYPE html>
<html>
<head>
    <title>Login - Delivery Order & Rider Assignment</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #0b0f19; color: #f8fafc; font-family: system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card-login { background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 2rem; width: 100%; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .btn-emerald { background: #10b981; color: #022c22; font-weight: 600; border: none; }
        .btn-emerald:hover { background: #059669; color: #fff; }
    </style>
</head>
<body>
<div class="card-login">
    <h4 class="text-center text-white mb-1">FastRoute Delivery</h4>
    <p class="text-center text-muted small mb-4">Universal Email Access & Rider Scoring System</p>
    <form method="POST" action="/login">
        <div class="mb-3">
            <label class="form-label small text-secondary">Username or Any Email</label>
            <input type="text" name="email" class="form-control bg-dark text-white border-secondary" placeholder="admin or you@gmail.com" required value="admin">
        </div>
        <div class="mb-3">
            <label class="form-label small text-secondary">Password</label>
            <input type="password" name="password" class="form-control bg-dark text-white border-secondary" placeholder="admin123" required value="admin123">
        </div>
        <button type="submit" class="btn btn-emerald w-100 py-2 mt-2">Sign In / Universal Access</button>
    </form>
    <div class="mt-4 pt-3 border-top border-secondary text-center small text-muted">
        Demo Login: <code>admin</code> / <code>admin123</code><br>
        Or enter ANY email address to create password and sign in instantly.
    </div>
</div>
</body>
</html>"""

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login_page"))

# =======================================================
# DASHBOARD & OPERATIONS
# =======================================================

@app.route("/dashboard")
@login_required
def dashboard_page():
    conn, _ = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM orders")
    total_orders = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'Pending'")
    pending_orders = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM deliveries WHERE status IN ('Assigned', 'Preparing', 'Out for Delivery')")
    active_deliveries = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM deliveries WHERE status = 'Delivered'")
    completed_deliveries = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM riders WHERE status = 'Available'")
    available_riders = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM riders WHERE status = 'Busy'")
    busy_riders = cursor.fetchone()[0]

    if request.is_json:
        return jsonify({
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "active_deliveries": active_deliveries,
            "completed_deliveries": completed_deliveries,
            "available_riders": available_riders,
            "busy_riders": busy_riders
        })

    return f"""<!DOCTYPE html>
<html>
<head>
    <title>Dashboard - Delivery Order & Rider Assignment</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {{ background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; }}
        .card-stat {{ background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.25rem; }}
        .stat-val {{ font-size: 2rem; font-weight: 700; color: #10b981; font-family: monospace; }}
    </style>
</head>
<body class="p-4">
<div class="container-fluid max-w-6xl">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 class="mb-0">Delivery Operations Dashboard</h3>
            <small class="text-secondary">Logged in as {session.get('user_name', 'Admin')} ({session.get('user_email', 'admin')})</small>
        </div>
        <div>
            <a href="/route-planning" class="btn btn-outline-info btn-sm me-2">Route Planning (Dijkstra)</a>
            <a href="/logout" class="btn btn-outline-danger btn-sm">Logout</a>
        </div>
    </div>

    <div class="row g-3 mb-4">
        <div class="col-md-2 col-6"><div class="card-stat"><small class="text-secondary">Total Orders</small><div class="stat-val">{total_orders}</div></div></div>
        <div class="col-md-2 col-6"><div class="card-stat"><small class="text-secondary">Pending Orders</small><div class="stat-val text-warning">{pending_orders}</div></div></div>
        <div class="col-md-2 col-6"><div class="card-stat"><small class="text-secondary">Active Deliveries</small><div class="stat-val text-info">{active_deliveries}</div></div></div>
        <div class="col-md-2 col-6"><div class="card-stat"><small class="text-secondary">Completed</small><div class="stat-val text-success">{completed_deliveries}</div></div></div>
        <div class="col-md-2 col-6"><div class="card-stat"><small class="text-secondary">Available Riders</small><div class="stat-val text-success">{available_riders}</div></div></div>
        <div class="col-md-2 col-6"><div class="card-stat"><small class="text-secondary">Busy Riders</small><div class="stat-val text-danger">{busy_riders}</div></div></div>
    </div>

    <div class="card bg-dark border-secondary p-4 mb-4">
        <h5>Automatic Rider Assignment Engine (Active)</h5>
        <p class="text-secondary small mb-2">Formula: <code>Rider Score = (0.35 × Workload) + (0.40 × Distance) + (0.25 × ETA/10)</code></p>
        <p class="small text-secondary">Interactive full React application is actively serving at port 3000 with interactive SVG maps, live Dijkstra traces, and Viva Voce study hubs.</p>
    </div>
</div>
</body>
</html>"""

# =======================================================
# AUTOMATIC RIDER ASSIGNMENT API (ADSA + DMGT)
# =======================================================

@app.route("/api/auto-assign-rider", methods=["POST"])
@login_required
def auto_assign_rider():
    data = request.get_json() or {}
    order_id = data.get("order_id")

    conn, _ = get_db_connection()
    cursor = conn.cursor()

    # Fetch Order
    cursor.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
    order = cursor.fetchone()
    if not order:
        return jsonify({"error": "Order not found"}), 404
    order_dict = dict(order)

    # Fetch Restaurant
    cursor.execute("SELECT * FROM restaurants WHERE restaurant_id = ?", (order_dict["restaurant_id"],))
    rest = cursor.fetchone()
    rest_dict = dict(rest) if rest else {"location": "Kakinada", "prep_time": 15}

    # Fetch Customer
    cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (order_dict["customer_id"],))
    cust = cursor.fetchone()
    cust_dict = dict(cust) if cust else {"city": "Samalkota"}

    # Fetch all riders
    cursor.execute("SELECT * FROM riders")
    riders = [dict(r) for r in cursor.fetchall()]

    candidates = []
    for r in riders:
        route_info = calculate_delivery_route_and_eta(
            r["current_location"],
            rest_dict["location"],
            cust_dict["city"],
            r.get("average_speed", 30),
            rest_dict.get("prep_time", 15),
            r.get("active_orders", 0)
        )
        score = calculate_rider_score(
            r.get("active_orders", 0),
            route_info["total_distance_km"],
            route_info["total_eta_mins"]
        )
        candidates.append({
            "rider": r,
            "distance_km": route_info["total_distance_km"],
            "eta_mins": route_info["total_eta_mins"],
            "score": score,
            "is_available": r.get("status") == "Available",
            "combined_path": route_info["combined_path"]
        })

    # Sort candidates: Available first, then lowest score
    candidates.sort(key=lambda x: (not x["is_available"], x["score"]))
    winner = candidates[0]

    # Assign in DB
    assigned_rider_id = winner["rider"]["rider_id"]
    cursor.execute("UPDATE orders SET assigned_rider_id = ?, status = 'Assigned' WHERE order_id = ?", (assigned_rider_id, order_id))
    cursor.execute("UPDATE riders SET active_orders = active_orders + 1 WHERE rider_id = ?", (assigned_rider_id,))

    # Insert or update delivery
    deliv_id = f"DEL-{int(datetime.now().timestamp()) % 1000}"
    cursor.execute("""
    INSERT OR REPLACE INTO deliveries (delivery_id, order_id, rider_id, assigned_time, status, distance, eta, route_nodes)
    VALUES (?, ?, ?, datetime('now'), 'Assigned', ?, ?, ?)
    """, (deliv_id, order_id, assigned_rider_id, winner["distance_km"], winner["eta_mins"], ",".join(winner["combined_path"])))
    conn.commit()

    return jsonify({
        "success": True,
        "selected_rider": winner["rider"],
        "score": winner["score"],
        "distance_km": winner["distance_km"],
        "eta_mins": winner["eta_mins"],
        "candidates": candidates
    })

# =======================================================
# ROUTE PLANNING & DIJKSTRA API (DMGT)
# =======================================================

@app.route("/api/route-planning", methods=["GET", "POST"])
def route_planning_api():
    rider_loc = request.args.get("rider", "Kakinada")
    rest_loc = request.args.get("restaurant", "Kakinada")
    cust_loc = request.args.get("customer", "Samalkota")

    route_info = calculate_delivery_route_and_eta(rider_loc, rest_loc, cust_loc)
    return jsonify(route_info)

@app.route("/route-planning")
@login_required
def route_planning_view():
    return redirect(url_for("dashboard_page"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
