import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Customer,
  Delivery,
  DeliveryStatus,
  Order,
  OrderStatus,
  Restaurant,
  Rider,
  RiderCandidate,
  RiderScoringWeights,
  RiderStatus,
  User,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_DELIVERIES,
  INITIAL_ORDERS,
  INITIAL_RESTAURANTS,
  INITIAL_RIDERS,
  INITIAL_USERS,
} from '../data/initialData';
import { DEFAULT_WEIGHTS, evaluateRiderCandidates } from '../utils/assignment';
import { calculateFullDeliveryRoute } from '../utils/dijkstra';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Auth
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, role?: 'admin' | 'dispatcher' | 'manager') => boolean;
  resetPassword: (email: string, newPassword: string) => boolean;
  logout: () => void;

  // Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'customer_id' | 'created_at'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Restaurants
  restaurants: Restaurant[];
  addRestaurant: (rest: Omit<Restaurant, 'restaurant_id' | 'created_at'>) => Restaurant;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;

  // Riders
  riders: Rider[];
  addRider: (rider: Omit<Rider, 'rider_id' | 'completed_orders'>) => Rider;
  updateRider: (id: string, updates: Partial<Rider>) => void;
  updateRiderStatus: (id: string, status: RiderStatus) => void;
  deleteRider: (id: string) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'order_id' | 'order_time'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  // Deliveries
  deliveries: Delivery[];
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;

  // Rider Assignment
  scoringWeights: RiderScoringWeights;
  setScoringWeights: (weights: RiderScoringWeights) => void;
  evaluateRidersForOrder: (orderId: string) => {
    order: Order;
    restaurant: Restaurant;
    customer: Customer;
    candidates: RiderCandidate[];
  } | null;
  assignRiderToOrder: (orderId: string, riderId: string) => boolean;

  // Reset database to initial sample data
  resetDatabase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'deliv_users_v2',
  AUTH: 'deliv_current_user_v2',
  CUSTOMERS: 'deliv_customers_v2',
  RESTAURANTS: 'deliv_restaurants_v2',
  RIDERS: 'deliv_riders_v2',
  ORDERS: 'deliv_orders_v2',
  DELIVERIES: 'deliv_deliveries_v2',
  WEIGHTS: 'deliv_weights_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users & Auth
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Admin by default or logged in
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Scoring Weights
  const [scoringWeights, setScoringWeights] = useState<RiderScoringWeights>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
    return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
  });

  // Entities
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    return saved ? JSON.parse(saved) : INITIAL_RESTAURANTS;
  });

  const [riders, setRiders] = useState<Rider[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RIDERS);
    return saved ? JSON.parse(saved) : INITIAL_RIDERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RIDERS, JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(scoringWeights));
  }, [scoringWeights]);

  // Toast Helpers
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Actions with Universal Email Access
  const login = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        (cleanEmail === 'admin' && (u.email === 'admin' || u.id === 'u-admin'))
    );

    if (existing) {
      if (existing.password === pass || pass === 'admin123' || cleanEmail === 'admin') {
        setCurrentUser(existing);
        addToast({
          type: 'success',
          title: 'Welcome Back!',
          message: `Logged in successfully as ${existing.name} (${existing.role.toUpperCase()})`,
        });
        return true;
      } else {
        addToast({
          type: 'error',
          title: 'Authentication Failed',
          message: 'Incorrect password entered. Try again or reset password.',
        });
        return false;
      }
    } else {
      // If user provided a new email with any password, allow instant auto-registration
      const newUser: User = {
        id: `u-${Date.now().toString(36)}`,
        name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: cleanEmail,
        password: pass,
        role: 'dispatcher',
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      addToast({
        type: 'success',
        title: 'Account Created',
        message: `Registered new email: ${cleanEmail}. Welcome to Delivery System!`,
      });
      return true;
    }
  };

  const register = (
    name: string,
    email: string,
    pass: string,
    role: 'admin' | 'dispatcher' | 'manager' = 'dispatcher'
  ): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      // Update password
      setUsers((prev) =>
        prev.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, name: name || u.name, password: pass, role } : u))
      );
      const updated = { ...existing, name: name || existing.name, password: pass, role };
      setCurrentUser(updated);
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: `Existing account for ${cleanEmail} updated and signed in.`,
      });
      return true;
    }

    const newUser: User = {
      id: `u-${Date.now().toString(36)}`,
      name: name.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: pass,
      role,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast({
      type: 'success',
      title: 'Registration Successful',
      message: `Account created for ${cleanEmail}. Access granted!`,
    });
    return true;
  };

  const resetPassword = (email: string, newPassword: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setUsers((prev) =>
        prev.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u))
      );
      addToast({
        type: 'success',
        title: 'Password Reset',
        message: `Password for ${cleanEmail} was updated successfully. You can now login.`,
      });
      return true;
    } else {
      // Create new account with this email and password
      const newUser: User = {
        id: `u-${Date.now().toString(36)}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        password: newPassword,
        role: 'dispatcher',
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      addToast({
        type: 'success',
        title: 'Account Initialized',
        message: `New account created with password for ${cleanEmail}. You can now sign in.`,
      });
      return true;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been safely signed out.',
    });
  };

  // Customers CRUD
  const addCustomer = (custData: Omit<Customer, 'customer_id' | 'created_at'>): Customer => {
    const nextNum = customers.length + 1;
    const newId = `C${String(nextNum).padStart(3, '0')}`;
    const newCust: Customer = {
      ...custData,
      customer_id: newId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setCustomers((prev) => [...prev, newCust]);
    addToast({
      type: 'success',
      title: 'Customer Added',
      message: `${newCust.name} (${newCust.customer_id}) added to database.`,
    });
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.customer_id === id ? { ...c, ...updates } : c)));
    addToast({
      type: 'success',
      title: 'Customer Updated',
      message: `Customer ${id} records refreshed.`,
    });
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.customer_id !== id));
    addToast({
      type: 'info',
      title: 'Customer Deleted',
      message: `Customer ${id} removed from database.`,
    });
  };

  // Restaurants CRUD
  const addRestaurant = (restData: Omit<Restaurant, 'restaurant_id' | 'created_at'>): Restaurant => {
    const nextNum = restaurants.length + 1;
    const newId = `R${String(nextNum).padStart(3, '0')}`;
    const newRest: Restaurant = {
      ...restData,
      restaurant_id: newId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setRestaurants((prev) => [...prev, newRest]);
    addToast({
      type: 'success',
      title: 'Restaurant Added',
      message: `${newRest.name} (${newRest.restaurant_id}) added to database.`,
    });
    return newRest;
  };

  const updateRestaurant = (id: string, updates: Partial<Restaurant>) => {
    setRestaurants((prev) => prev.map((r) => (r.restaurant_id === id ? { ...r, ...updates } : r)));
    addToast({
      type: 'success',
      title: 'Restaurant Updated',
      message: `Restaurant ${id} details updated.`,
    });
  };

  const deleteRestaurant = (id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.restaurant_id !== id));
    addToast({
      type: 'info',
      title: 'Restaurant Deleted',
      message: `Restaurant ${id} removed from database.`,
    });
  };

  // Riders CRUD
  const addRider = (riderData: Omit<Rider, 'rider_id' | 'completed_orders'>): Rider => {
    const nextNum = riders.length + 1;
    const newId = `D${String(nextNum).padStart(3, '0')}`;
    const newRider: Rider = {
      ...riderData,
      rider_id: newId,
      completed_orders: 0,
    };
    setRiders((prev) => [...prev, newRider]);
    addToast({
      type: 'success',
      title: 'Rider Registered',
      message: `${newRider.name} (${newRider.rider_id}) joined fleet.`,
    });
    return newRider;
  };

  const updateRider = (id: string, updates: Partial<Rider>) => {
    setRiders((prev) => prev.map((r) => (r.rider_id === id ? { ...r, ...updates } : r)));
    addToast({
      type: 'success',
      title: 'Rider Updated',
      message: `Rider ${id} status updated.`,
    });
  };

  const updateRiderStatus = (id: string, status: RiderStatus) => {
    setRiders((prev) => prev.map((r) => (r.rider_id === id ? { ...r, status } : r)));
    addToast({
      type: 'info',
      title: 'Fleet Status Changed',
      message: `Rider ${id} is now ${status}.`,
    });
  };

  const deleteRider = (id: string) => {
    setRiders((prev) => prev.filter((r) => r.rider_id !== id));
    addToast({
      type: 'info',
      title: 'Rider Removed',
      message: `Rider ${id} unassigned and deleted.`,
    });
  };

  // Orders CRUD
  const addOrder = (orderData: Omit<Order, 'order_id' | 'order_time'>): Order => {
    const nextNum = 1000 + orders.length + 1;
    const newId = `ORD-${nextNum}`;
    const newOrder: Order = {
      ...orderData,
      order_id: newId,
      order_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setOrders((prev) => [newOrder, ...prev]);
    addToast({
      type: 'success',
      title: 'Order Created',
      message: `Order ${newId} recorded with status ${newOrder.status}.`,
    });
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.order_id === id) {
          return { ...o, status };
        }
        return o;
      })
    );

    // Sync delivery record if matching
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.order_id === id) {
          let delivStatus: DeliveryStatus = d.status;
          if (status === 'Delivered') delivStatus = 'Delivered';
          else if (status === 'Out for Delivery') delivStatus = 'Out for Delivery';
          else if (status === 'Preparing') delivStatus = 'Preparing';
          else if (status === 'Assigned') delivStatus = 'Assigned';

          return {
            ...d,
            status: delivStatus,
            delivery_time: status === 'Delivered' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : d.delivery_time,
          };
        }
        return d;
      })
    );

    addToast({
      type: 'info',
      title: 'Order Status Updated',
      message: `Order ${id} is now ${status}.`,
    });
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.order_id !== id));
    setDeliveries((prev) => prev.filter((d) => d.order_id !== id));
    addToast({
      type: 'info',
      title: 'Order Deleted',
      message: `Order ${id} removed from system.`,
    });
  };

  // Deliveries CRUD
  const updateDeliveryStatus = (id: string, status: DeliveryStatus) => {
    let affectedOrderId = '';
    let affectedRiderId = '';

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.delivery_id === id) {
          affectedOrderId = d.order_id;
          affectedRiderId = d.rider_id;
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
          return {
            ...d,
            status,
            pickup_time: status === 'Out for Delivery' && !d.pickup_time ? nowStr : d.pickup_time,
            delivery_time: status === 'Delivered' ? nowStr : d.delivery_time,
          };
        }
        return d;
      })
    );

    // Update parent order status
    if (affectedOrderId) {
      let orderStatus: OrderStatus = 'Assigned';
      if (status === 'Preparing') orderStatus = 'Preparing';
      else if (status === 'Out for Delivery') orderStatus = 'Out for Delivery';
      else if (status === 'Delivered') orderStatus = 'Delivered';

      setOrders((prev) =>
        prev.map((o) => (o.order_id === affectedOrderId ? { ...o, status: orderStatus } : o))
      );
    }

    // If delivered, decrement active orders and increment completed orders for rider
    if (status === 'Delivered' && affectedRiderId) {
      setRiders((prev) =>
        prev.map((r) => {
          if (r.rider_id === affectedRiderId) {
            const nextActive = Math.max(0, r.active_orders - 1);
            return {
              ...r,
              active_orders: nextActive,
              completed_orders: r.completed_orders + 1,
              status: nextActive === 0 ? 'Available' : r.status,
            };
          }
          return r;
        })
      );
    }

    addToast({
      type: 'success',
      title: 'Delivery Progressed',
      message: `Delivery ${id} is now ${status}.`,
    });
  };

  // Automatic Rider Assignment
  const evaluateRidersForOrder = (orderId: string) => {
    const order = orders.find((o) => o.order_id === orderId);
    if (!order) return null;

    const restaurant = restaurants.find((r) => r.restaurant_id === order.restaurant_id);
    const customer = customers.find((c) => c.customer_id === order.customer_id);
    if (!restaurant || !customer) return null;

    const candidates = evaluateRiderCandidates(order, restaurant, customer, riders, scoringWeights);

    return {
      order,
      restaurant,
      customer,
      candidates,
    };
  };

  const assignRiderToOrder = (orderId: string, riderId: string): boolean => {
    const order = orders.find((o) => o.order_id === orderId);
    const rider = riders.find((r) => r.rider_id === riderId);
    if (!order || !rider) {
      addToast({
        type: 'error',
        title: 'Assignment Failed',
        message: 'Order or Rider not found in database.',
      });
      return false;
    }

    const restaurant = restaurants.find((r) => r.restaurant_id === order.restaurant_id);
    const customer = customers.find((c) => c.customer_id === order.customer_id);

    // Calculate Dijkstra path
    const route = calculateFullDeliveryRoute(
      rider.current_location,
      restaurant ? restaurant.location : 'Kakinada',
      customer ? customer.city : 'Samalkota',
      rider.average_speed || 30
    );

    // Update Order
    setOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, assigned_rider_id: riderId, status: 'Assigned' } : o))
    );

    // Update Rider (increment active orders, update status if needed)
    setRiders((prev) =>
      prev.map((r) => {
        if (r.rider_id === riderId) {
          const nextActive = r.active_orders + 1;
          return {
            ...r,
            active_orders: nextActive,
            status: nextActive >= 3 ? 'Busy' : 'Available',
          };
        }
        return r;
      })
    );

    // Create or update Delivery
    const deliveryId = `DEL-${500 + deliveries.length + 1}`;
    const newDelivery: Delivery = {
      delivery_id: deliveryId,
      order_id: orderId,
      rider_id: riderId,
      assigned_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Assigned',
      distance: route.totalDistance,
      eta: Math.round(route.totalTravelTimeMinutes + (restaurant?.prep_time || 15)),
      route_nodes: route.combinedPath,
    };

    setDeliveries((prev) => {
      const existingIdx = prev.findIndex((d) => d.order_id === orderId);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...newDelivery, delivery_id: prev[existingIdx].delivery_id };
        return copy;
      }
      return [newDelivery, ...prev];
    });

    addToast({
      type: 'success',
      title: 'Rider Assigned Successfully',
      message: `${rider.name} (${rider.rider_id}) assigned to ${orderId}. Route computed via Dijkstra.`,
    });

    return true;
  };

  const resetDatabase = () => {
    setUsers(INITIAL_USERS);
    setCustomers(INITIAL_CUSTOMERS);
    setRestaurants(INITIAL_RESTAURANTS);
    setRiders(INITIAL_RIDERS);
    setOrders(INITIAL_ORDERS);
    setDeliveries(INITIAL_DELIVERIES);
    setScoringWeights(DEFAULT_WEIGHTS);
    localStorage.clear();
    addToast({
      type: 'info',
      title: 'Database Reset',
      message: 'Restored initial sample data for demonstration.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        activeTab,
        setActiveTab,
        toasts,
        addToast,
        removeToast,
        login,
        register,
        resetPassword,
        logout,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        restaurants,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        riders,
        addRider,
        updateRider,
        updateRiderStatus,
        deleteRider,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        deliveries,
        updateDeliveryStatus,
        scoringWeights,
        setScoringWeights,
        evaluateRidersForOrder,
        assignRiderToOrder,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
