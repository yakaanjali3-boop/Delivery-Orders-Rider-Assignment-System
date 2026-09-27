"""
db_config.py
Database Connection & Fallback Handler
B.Tech Academic Curricular Implementation (DBMS)
"""

import os
import sqlite3

def get_db_connection():
    """
    Attempts to connect to MySQL database 'delivery_management'.
    If MySQL server is unavailable, falls back gracefully to local SQLite 'delivery.db'
    so the app remains 100% operational on any system.
    """
    mysql_host = os.environ.get("MYSQL_HOST", "localhost")
    mysql_user = os.environ.get("MYSQL_USER", "root")
    mysql_password = os.environ.get("MYSQL_PASSWORD", "")
    mysql_db = os.environ.get("MYSQL_DB", "delivery_management")

    # Try PyMySQL
    try:
        import pymysql
        conn = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_db,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        return conn, "mysql"
    except Exception:
        pass

    # Try mysql.connector
    try:
        import mysql.connector
        conn = mysql.connector.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_db
        )
        return conn, "mysql"
    except Exception:
        pass

    # SQLite Fallback for portable local execution
    sqlite_db_path = os.path.join(os.path.dirname(__file__), "delivery.db")
    conn = sqlite3.connect(sqlite_db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    init_sqlite_tables(conn)
    return conn, "sqlite"

def init_sqlite_tables(conn):
    """Initializes tables and seeds initial data in SQLite if not present."""
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'dispatcher',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        email TEXT NOT NULL,
        city TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS restaurants (
        restaurant_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        prep_time INTEGER DEFAULT 15,
        rating REAL DEFAULT 4.5,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS riders (
        rider_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        status TEXT DEFAULT 'Available',
        current_location TEXT NOT NULL,
        active_orders INTEGER DEFAULT 0,
        average_speed INTEGER DEFAULT 30,
        vehicle_type TEXT DEFAULT 'Motorbike',
        completed_orders INTEGER DEFAULT 0,
        rating REAL DEFAULT 4.8,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        restaurant_id TEXT NOT NULL,
        order_time TEXT DEFAULT CURRENT_TIMESTAMP,
        delivery_address TEXT NOT NULL,
        delivery_city TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        total_amount REAL NOT NULL,
        assigned_rider_id TEXT,
        notes TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS deliveries (
        delivery_id TEXT PRIMARY KEY,
        order_id TEXT UNIQUE NOT NULL,
        rider_id TEXT NOT NULL,
        assigned_time TEXT DEFAULT CURRENT_TIMESTAMP,
        pickup_time TEXT,
        delivery_time TEXT,
        status TEXT DEFAULT 'Assigned',
        distance REAL NOT NULL,
        eta INTEGER NOT NULL,
        route_nodes TEXT
    );
    """)

    # Seed Admin User if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO users VALUES ('u-admin', 'Chief Admin', 'admin', 'admin123', 'admin', datetime('now'))")
        cursor.execute("INSERT INTO users VALUES ('u-anjali', 'Anjali Yaka', 'yakaanjali3@gmail.com', 'password123', 'admin', datetime('now'))")
        cursor.execute("INSERT INTO users VALUES ('u-disp', 'Dispatcher', 'dispatcher@delivery.com', 'dispatcher123', 'dispatcher', datetime('now'))")

        # Seed Customers
        cursor.execute("INSERT INTO customers VALUES ('C001', 'Anjali', '9876543210', 'Door 4-12, Main Road, Ramanayyapeta', 'anjali@example.com', 'Kakinada', datetime('now'))")
        cursor.execute("INSERT INTO customers VALUES ('C002', 'Ravi', '9876543211', 'Flat 302, Godavari Enclave, Danavaipeta', 'ravi.k@example.com', 'Rajahmundry', datetime('now'))")
        cursor.execute("INSERT INTO customers VALUES ('C003', 'Priya', '9876543212', 'House 12, Station Road', 'priya.s@example.com', 'Samalkota', datetime('now'))")

        # Seed Restaurants
        cursor.execute("INSERT INTO restaurants VALUES ('R001', 'Spice Hub', 'Kakinada', '0884-2345678', 'Bhanugudi Junction, Kakinada', 15, 4.8, datetime('now'))")
        cursor.execute("INSERT INTO restaurants VALUES ('R002', 'Food Palace', 'Rajahmundry', '0883-2456789', 'Kotipalli Bus Stand Road, Rajahmundry', 18, 4.6, datetime('now'))")
        cursor.execute("INSERT INTO restaurants VALUES ('R003', 'Tasty Bites', 'Samalkota', '0884-2567890', 'Railway Feeder Road, Samalkota', 12, 4.7, datetime('now'))")

        # Seed Riders
        cursor.execute("INSERT INTO riders VALUES ('D001', 'Arun', '9123456780', 'Available', 'Kakinada', 2, 32, 'Motorbike (Hero Splendor)', 142, 4.90, datetime('now'))")
        cursor.execute("INSERT INTO riders VALUES ('D002', 'Ravi', '9123456781', 'Available', 'Rajahmundry', 1, 35, 'Scooter (Honda Activa)', 98, 4.70, datetime('now'))")
        cursor.execute("INSERT INTO riders VALUES ('D003', 'Kiran', '9123456782', 'Available', 'Samalkota', 0, 30, 'Motorbike (Bajaj Pulsar)', 215, 4.95, datetime('now'))")
        cursor.execute("INSERT INTO riders VALUES ('D004', 'Suresh', '9123456783', 'Busy', 'Peddapuram', 4, 28, 'Electric Scooter (Ather 450X)', 76, 4.40, datetime('now'))")

        # Seed Orders & Deliveries
        cursor.execute("INSERT INTO orders VALUES ('ORD-1001', 'C001', 'R001', datetime('now'), 'Door 4-12, Ramanayyapeta, Kakinada', 'Kakinada', 'Delivered', 540.0, 'D001', '')")
        cursor.execute("INSERT INTO orders VALUES ('ORD-1002', 'C002', 'R002', datetime('now'), 'Flat 302, Godavari Enclave, Danavaipeta', 'Rajahmundry', 'Out for Delivery', 420.0, 'D002', '')")
        cursor.execute("INSERT INTO orders VALUES ('ORD-1003', 'C003', 'R003', datetime('now'), 'House 12, Station Road, Samalkota', 'Samalkota', 'Preparing', 280.0, 'D003', '')")
        cursor.execute("INSERT INTO orders VALUES ('ORD-1004', 'C001', 'R003', datetime('now'), 'Door 4-12, Ramanayyapeta, Kakinada', 'Kakinada', 'Pending', 650.0, NULL, '')")

        cursor.execute("INSERT INTO deliveries VALUES ('DEL-501', 'ORD-1001', 'D001', datetime('now'), datetime('now'), datetime('now'), 'Delivered', 4.8, 25, 'Kakinada,Jagannaickpur,Kakinada_Beach')")
        cursor.execute("INSERT INTO deliveries VALUES ('DEL-502', 'ORD-1002', 'D002', datetime('now'), datetime('now'), NULL, 'Out for Delivery', 3.8, 18, 'Rajahmundry,Danavaipeta')")
        cursor.execute("INSERT INTO deliveries VALUES ('DEL-503', 'ORD-1003', 'D003', datetime('now'), NULL, NULL, 'Preparing', 6.2, 22, 'Samalkota,Peddapuram')")
        conn.commit()
