-- =======================================================
-- DELIVERY ORDER & RIDER ASSIGNMENT SYSTEM
-- DATABASE SCHEMA: delivery_management
-- B.Tech Academic Project: DBMS, DMGT, ADSA, OOPJ, Python
-- =======================================================

CREATE DATABASE IF NOT EXISTS delivery_management;
USE delivery_management;

-- 1. USERS TABLE (Session Authentication & Universal Email Access)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'dispatcher', 'manager') DEFAULT 'dispatcher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS TABLE
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
    customer_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(150) NOT NULL,
    city VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. RESTAURANTS TABLE
DROP TABLE IF EXISTS restaurants;
CREATE TABLE restaurants (
    restaurant_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(80) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    prep_time INT DEFAULT 15 COMMENT 'in minutes',
    rating DECIMAL(2,1) DEFAULT 4.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. RIDERS TABLE
DROP TABLE IF EXISTS riders;
CREATE TABLE riders (
    rider_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('Available', 'Busy', 'Offline') DEFAULT 'Available',
    current_location VARCHAR(80) NOT NULL,
    active_orders INT DEFAULT 0,
    average_speed INT DEFAULT 30 COMMENT 'in km/h',
    vehicle_type VARCHAR(100) DEFAULT 'Motorbike',
    completed_orders INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 4.80,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ORDERS TABLE
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    order_id VARCHAR(30) PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL,
    restaurant_id VARCHAR(20) NOT NULL,
    order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(80) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Preparing', 'Ready', 'Assigned', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    total_amount DECIMAL(10,2) NOT NULL,
    assigned_rider_id VARCHAR(20) NULL,
    notes TEXT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_rider_id) REFERENCES riders(rider_id) ON DELETE SET NULL
);

-- 6. DELIVERIES TABLE
DROP TABLE IF EXISTS deliveries;
CREATE TABLE deliveries (
    delivery_id VARCHAR(30) PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL UNIQUE,
    rider_id VARCHAR(20) NOT NULL,
    assigned_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    pickup_time DATETIME NULL,
    delivery_time DATETIME NULL,
    status ENUM('Pending', 'Assigned', 'Preparing', 'Out for Delivery', 'Delivered') DEFAULT 'Assigned',
    distance DECIMAL(5,2) NOT NULL COMMENT 'in km',
    eta INT NOT NULL COMMENT 'in minutes',
    route_nodes TEXT NULL COMMENT 'Comma-separated Dijkstra waypoint nodes',
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (rider_id) REFERENCES riders(rider_id) ON DELETE CASCADE
);

-- INDEXES FOR QUERY OPTIMIZATION
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_riders_status ON riders(status);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- =======================================================
-- INITIAL SEED DATA INSERTION
-- =======================================================

-- Users (Universal access enabled; password: password123 / admin123)
INSERT INTO users (id, name, email, password_hash, role) VALUES
('u-admin', 'Chief Admin', 'admin', 'admin123', 'admin'),
('u-anjali', 'Anjali Yaka', 'yakaanjali3@gmail.com', 'password123', 'admin'),
('u-disp', 'Dispatcher Fleet', 'dispatcher@delivery.com', 'dispatcher123', 'dispatcher'),
('u-mgr', 'Operations Manager', 'manager@delivery.com', 'manager123', 'manager');

-- Customers
INSERT INTO customers (customer_id, name, phone, address, email, city) VALUES
('C001', 'Anjali', '9876543210', 'Door 4-12, Main Road, Ramanayyapeta', 'anjali@example.com', 'Kakinada'),
('C002', 'Ravi', '9876543211', 'Flat 302, Godavari Enclave, Danavaipeta', 'ravi.k@example.com', 'Rajahmundry'),
('C003', 'Priya', '9876543212', 'House 12, Station Road', 'priya.s@example.com', 'Samalkota'),
('C004', 'Karthik Varma', '9876543213', 'Plot 45, Cinema Road', 'karthik.v@example.com', 'Peddapuram'),
('C005', 'Sneha Reddy', '9876543214', 'Near Old Bus Stand', 'sneha.r@example.com', 'Mandapeta');

-- Restaurants
INSERT INTO restaurants (restaurant_id, name, location, phone, address, prep_time, rating) VALUES
('R001', 'Spice Hub', 'Kakinada', '0884-2345678', 'Bhanugudi Junction, Kakinada', 15, 4.8),
('R002', 'Food Palace', 'Rajahmundry', '0883-2456789', 'Kotipalli Bus Stand Road, Rajahmundry', 18, 4.6),
('R003', 'Tasty Bites', 'Samalkota', '0884-2567890', 'Railway Feeder Road, Samalkota', 12, 4.7),
('R004', 'Royal Biryani Darbar', 'Peddapuram', '0885-2678901', 'Market Yard, Peddapuram', 20, 4.5);

-- Riders
INSERT INTO riders (rider_id, name, phone, status, current_location, active_orders, average_speed, vehicle_type, completed_orders, rating) VALUES
('D001', 'Arun', '9123456780', 'Available', 'Kakinada', 2, 32, 'Motorbike (Hero Splendor)', 142, 4.90),
('D002', 'Ravi', '9123456781', 'Available', 'Rajahmundry', 1, 35, 'Scooter (Honda Activa)', 98, 4.70),
('D003', 'Kiran', '9123456782', 'Available', 'Samalkota', 0, 30, 'Motorbike (Bajaj Pulsar)', 215, 4.95),
('D004', 'Suresh', '9123456783', 'Busy', 'Peddapuram', 4, 28, 'Electric Scooter (Ather 450X)', 76, 4.40),
('D005', 'Manoj Kumar', '9123456784', 'Offline', 'Mandapeta', 0, 34, 'Motorbike (TVS Apache)', 110, 4.65);

-- Orders
INSERT INTO orders (order_id, customer_id, restaurant_id, order_time, delivery_address, delivery_city, status, total_amount, assigned_rider_id) VALUES
('ORD-1001', 'C001', 'R001', '2026-09-27 09:15:00', 'Door 4-12, Ramanayyapeta, Kakinada', 'Kakinada', 'Delivered', 540.00, 'D001'),
('ORD-1002', 'C002', 'R002', '2026-09-27 10:20:00', 'Flat 302, Godavari Enclave, Danavaipeta', 'Rajahmundry', 'Out for Delivery', 420.00, 'D002'),
('ORD-1003', 'C003', 'R003', '2026-09-27 10:50:00', 'House 12, Station Road, Samalkota', 'Samalkota', 'Preparing', 280.00, 'D003'),
('ORD-1004', 'C001', 'R003', '2026-09-27 11:10:00', 'Door 4-12, Ramanayyapeta, Kakinada', 'Kakinada', 'Pending', 650.00, NULL),
('ORD-1005', 'C004', 'R004', '2026-09-27 11:30:00', 'Plot 45, Cinema Road, Peddapuram', 'Peddapuram', 'Confirmed', 390.00, NULL);

-- Deliveries
INSERT INTO deliveries (delivery_id, order_id, rider_id, assigned_time, pickup_time, delivery_time, status, distance, eta, route_nodes) VALUES
('DEL-501', 'ORD-1001', 'D001', '2026-09-27 09:20:00', '2026-09-27 09:35:00', '2026-09-27 09:55:00', 'Delivered', 4.80, 25, 'Kakinada,Jagannaickpur,Kakinada_Beach'),
('DEL-502', 'ORD-1002', 'D002', '2026-09-27 10:25:00', '2026-09-27 10:42:00', NULL, 'Out for Delivery', 3.80, 18, 'Rajahmundry,Danavaipeta'),
('DEL-503', 'ORD-1003', 'D003', '2026-09-27 10:55:00', NULL, NULL, 'Preparing', 6.20, 22, 'Samalkota,Peddapuram');
