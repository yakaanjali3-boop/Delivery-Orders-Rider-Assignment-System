"""
models.py
Object-Oriented Programming (OOPJ) Architecture for Delivery System
B.Tech Academic Curricular Implementation
"""

from datetime import datetime
from typing import List, Optional, Dict, Any

class BaseEntity:
    """Base class demonstrating inheritance and encapsulation."""
    def __init__(self, entity_id: str, created_at: Optional[str] = None):
        self._id = entity_id
        self._created_at = created_at or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    @property
    def id(self) -> str:
        return self._id

    @property
    def created_at(self) -> str:
        return self._created_at

    def to_dict(self) -> Dict[str, Any]:
        return {"id": self._id, "created_at": self._created_at}


class Customer(BaseEntity):
    """Customer entity with encapsulation and validation."""
    def __init__(self, customer_id: str, name: str, phone: str, address: str, email: str, city: str, created_at: Optional[str] = None):
        super().__init__(customer_id, created_at)
        self.name = name
        self.phone = phone
        self.address = address
        self.email = email
        self.city = city

    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "customer_id": self.id,
            "name": self.name,
            "phone": self.phone,
            "address": self.address,
            "email": self.email,
            "city": self.city
        })
        return data


class Restaurant(BaseEntity):
    """Restaurant partner entity."""
    def __init__(self, restaurant_id: str, name: str, location: str, phone: str, address: str, prep_time: int = 15, rating: float = 4.5, created_at: Optional[str] = None):
        super().__init__(restaurant_id, created_at)
        self.name = name
        self.location = location
        self.phone = phone
        self.address = address
        self.prep_time = prep_time
        self.rating = rating

    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "restaurant_id": self.id,
            "name": self.name,
            "location": self.location,
            "phone": self.phone,
            "address": self.address,
            "prep_time": self.prep_time,
            "rating": self.rating
        })
        return data


class Rider(BaseEntity):
    """Rider/Courier entity with state management."""
    def __init__(self, rider_id: str, name: str, phone: str, status: str = "Available", current_location: str = "Kakinada", active_orders: int = 0, average_speed: int = 30, vehicle_type: str = "Motorbike", completed_orders: int = 0, rating: float = 4.8, created_at: Optional[str] = None):
        super().__init__(rider_id, created_at)
        self.name = name
        self.phone = phone
        self._status = status
        self.current_location = current_location
        self.active_orders = active_orders
        self.average_speed = average_speed
        self.vehicle_type = vehicle_type
        self.completed_orders = completed_orders
        self.rating = rating

    @property
    def status(self) -> str:
        return self._status

    @status.setter
    def status(self, new_status: str):
        if new_status in ["Available", "Busy", "Offline"]:
            self._status = new_status
        else:
            raise ValueError("Invalid rider status.")

    def assign_order(self):
        """Encapsulated business logic for dispatch."""
        self.active_orders += 1
        if self.active_orders >= 3:
            self._status = "Busy"

    def complete_order(self):
        """Encapsulated completion logic."""
        if self.active_orders > 0:
            self.active_orders -= 1
        self.completed_orders += 1
        if self.active_orders == 0:
            self._status = "Available"

    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "rider_id": self.id,
            "name": self.name,
            "phone": self.phone,
            "status": self.status,
            "current_location": self.current_location,
            "active_orders": self.active_orders,
            "average_speed": self.average_speed,
            "vehicle_type": self.vehicle_type,
            "completed_orders": self.completed_orders,
            "rating": self.rating
        })
        return data


class Order(BaseEntity):
    """Order entity."""
    VALID_STATUSES = ["Pending", "Confirmed", "Preparing", "Ready", "Assigned", "Out for Delivery", "Delivered", "Cancelled"]

    def __init__(self, order_id: str, customer_id: str, restaurant_id: str, delivery_address: str, delivery_city: str, total_amount: float, status: str = "Pending", assigned_rider_id: Optional[str] = None, order_time: Optional[str] = None):
        super().__init__(order_id, order_time)
        self.customer_id = customer_id
        self.restaurant_id = restaurant_id
        self.delivery_address = delivery_address
        self.delivery_city = delivery_city
        self.total_amount = total_amount
        self._status = status
        self.assigned_rider_id = assigned_rider_id

    @property
    def status(self) -> str:
        return self._status

    @status.setter
    def status(self, new_status: str):
        if new_status in self.VALID_STATUSES:
            self._status = new_status
        else:
            raise ValueError(f"Invalid order status: {new_status}")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "order_id": self.id,
            "customer_id": self.customer_id,
            "restaurant_id": self.restaurant_id,
            "delivery_address": self.delivery_address,
            "delivery_city": self.delivery_city,
            "total_amount": self.total_amount,
            "status": self.status,
            "assigned_rider_id": self.assigned_rider_id,
            "order_time": self.created_at
        }


class Delivery(BaseEntity):
    """Delivery record linking Order and Rider."""
    def __init__(self, delivery_id: str, order_id: str, rider_id: str, distance: float, eta: int, route_nodes: List[str], status: str = "Assigned", assigned_time: Optional[str] = None, pickup_time: Optional[str] = None, delivery_time: Optional[str] = None):
        super().__init__(delivery_id, assigned_time)
        self.order_id = order_id
        self.rider_id = rider_id
        self.distance = distance
        self.eta = eta
        self.route_nodes = route_nodes
        self.status = status
        self.pickup_time = pickup_time
        self.delivery_time = delivery_time

    def to_dict(self) -> Dict[str, Any]:
        return {
            "delivery_id": self.id,
            "order_id": self.order_id,
            "rider_id": self.rider_id,
            "distance": self.distance,
            "eta": self.eta,
            "route_nodes": self.route_nodes,
            "status": self.status,
            "assigned_time": self.created_at,
            "pickup_time": self.pickup_time,
            "delivery_time": self.delivery_time
        }
