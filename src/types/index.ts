export type UserRole = 'admin' | 'dispatcher' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Customer {
  customer_id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  city: string;
  created_at: string;
}

export interface Restaurant {
  restaurant_id: string;
  name: string;
  location: string;
  phone: string;
  address: string;
  prep_time: number; // in minutes
  rating: number;
  created_at: string;
}

export type RiderStatus = 'Available' | 'Busy' | 'Offline';

export interface Rider {
  rider_id: string;
  name: string;
  phone: string;
  status: RiderStatus;
  current_location: string;
  active_orders: number;
  average_speed: number; // in km/h
  vehicle_type: string;
  completed_orders: number;
  rating: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Assigned'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  order_id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  restaurant_id: string;
  restaurant_name?: string;
  order_time: string;
  delivery_address: string;
  delivery_city: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  assigned_rider_id?: string;
  notes?: string;
}

export type DeliveryStatus =
  | 'Pending'
  | 'Assigned'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered';

export interface Delivery {
  delivery_id: string;
  order_id: string;
  rider_id: string;
  assigned_time: string;
  pickup_time?: string;
  delivery_time?: string;
  status: DeliveryStatus;
  distance: number; // in km
  eta: number; // in minutes
  route_nodes: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  x: number; // for SVG rendering coordinate
  y: number;
  type: 'hub' | 'city' | 'restaurant' | 'customer';
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number; // distance in km
}

export interface DijkstraStep {
  current: string;
  neighbor: string;
  edgeWeight: number;
  tentativeDistance: number;
  updated: boolean;
  notes: string;
}

export interface DijkstraResult {
  path: string[];
  totalDistance: number;
  estimatedTravelTime: number; // in minutes
  steps: DijkstraStep[];
  distances: Record<string, number>;
}

export interface RiderScoringWeights {
  workloadWeight: number; // default: 0.35
  distanceWeight: number; // default: 0.40
  etaWeight: number; // default: 0.25
}

export interface RiderCandidate {
  rider: Rider;
  distanceToRestaurant: number; // km
  distanceToCustomer: number; // km
  totalDistance: number; // km
  travelTime: number; // minutes
  eta: number; // total minutes including prep + workload delay
  score: number;
  isAvailable: boolean;
  reasons: string[];
  rank: number;
}

export interface AssignmentResult {
  orderId: string;
  selectedRider: Rider;
  candidates: RiderCandidate[];
  weightsUsed: RiderScoringWeights;
  calculatedAt: string;
}

export interface VivaQA {
  id: string;
  category: 'DBMS' | 'DMGT' | 'ADSA' | 'OOPJ' | 'Python & Flask' | 'System Architecture';
  question: string;
  answer: string;
  keyConcepts: string[];
}
