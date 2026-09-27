import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PlusCircle,
  Search,
  Filter,
  ShoppingBag,
  Bike,
  Store,
  User,
  Zap,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { RiderAssignmentModal } from '../assignment/RiderAssignmentModal';

export const OrdersPage: React.FC = () => {
  const {
    orders,
    customers,
    restaurants,
    riders,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  // Form State for New Order
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.customer_id || '');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.restaurant_id || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [totalAmount, setTotalAmount] = useState(450);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Pending');
  const [itemName, setItemName] = useState('Butter Chicken & Garlic Naan');

  // Sync address when customer changes
  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const cust = customers.find((c) => c.customer_id === custId);
    if (cust) {
      setDeliveryAddress(`${cust.address}, ${cust.city}`);
    }
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.customer_id === selectedCustomerId);
    const newOrder = addOrder({
      customer_id: selectedCustomerId,
      restaurant_id: selectedRestaurantId,
      delivery_address: deliveryAddress || (cust ? `${cust.address}, ${cust.city}` : 'Main Road'),
      delivery_city: cust ? cust.city : 'Kakinada',
      status: orderStatus,
      total_amount: Number(totalAmount),
      items: [{ name: itemName || 'Special Thali', quantity: 1, price: Number(totalAmount) }],
    });

    setIsCreateModalOpen(false);
    // If user created as Pending or Ready, ask to auto-assign
    if (orderStatus === 'Pending' || orderStatus === 'Confirmed' || orderStatus === 'Ready') {
      setAssigningOrderId(newOrder.order_id);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const custName = customers.find((c) => c.customer_id === o.customer_id)?.name.toLowerCase() || '';
    const restName = restaurants.find((r) => r.restaurant_id === o.restaurant_id)?.name.toLowerCase() || '';
    const matchesSearch =
      o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.includes(searchTerm.toLowerCase()) ||
      restName.includes(searchTerm.toLowerCase()) ||
      o.delivery_address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Confirmed':
      case 'Preparing':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Ready':
      case 'Assigned':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Out for Delivery':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Delivered':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Cancelled':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Order Management</h2>
          <p className="text-xs text-slate-400">
            Dispatch queue, order statuses, and automatic algorithmic rider allocation
          </p>
        </div>

        <button
          onClick={() => {
            const cust = customers[0];
            if (cust) setDeliveryAddress(`${cust.address}, ${cust.city}`);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID, customer name, restaurant, or address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Assigned">Assigned</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                <th className="py-3 px-4">Order ID & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Destination Address</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Assigned Rider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customer = customers.find((c) => c.customer_id === order.customer_id);
                  const restaurant = restaurants.find((r) => r.restaurant_id === order.restaurant_id);
                  const rider = riders.find((r) => r.rider_id === order.assigned_rider_id);
                  const isUnassigned = !order.assigned_rider_id;

                  return (
                    <tr key={order.order_id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{order.order_id}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{order.order_time}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{customer?.name || order.customer_id}</div>
                        <div className="text-[10px] text-slate-400">{customer?.phone || 'No phone'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-medium">{restaurant?.name || order.restaurant_id}</div>
                        <div className="text-[10px] text-slate-400">{restaurant?.location}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-300 truncate" title={order.delivery_address}>
                          {order.delivery_address}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{order.delivery_city}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400 tabular-nums">
                        ₹{order.total_amount}
                      </td>

                      <td className="py-3 px-4">
                        {rider ? (
                          <div className="flex items-center gap-1.5">
                            <Bike className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-white font-medium">{rider.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">({rider.rider_id})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningOrderId(order.order_id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Assign Rider</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.order_id, e.target.value as OrderStatus)}
                          className={`text-[11px] font-medium px-2 py-1 rounded border bg-slate-950 focus:outline-none ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isUnassigned && (
                            <button
                              onClick={() => setAssigningOrderId(order.order_id)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                              title="Trigger Automatic Rider Assignment"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteOrder(order.order_id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-1">Create New Food Delivery Order</h3>
            <p className="text-xs text-slate-400 mb-4">
              Select customer, restaurant, delivery location, and initial status
            </p>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {customers.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.name} ({c.customer_id}) — {c.city} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Restaurant</label>
                <select
                  value={selectedRestaurantId}
                  onChange={(e) => setSelectedRestaurantId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {restaurants.map((r) => (
                    <option key={r.restaurant_id} value={r.restaurant_id}>
                      {r.name} ({r.location}) — Prep: {r.prep_time} mins
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street, Landmark, City"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ordered Food Item</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Special Chicken Biryani"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Record Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automatic Rider Assignment Modal */}
      {assigningOrderId && (
        <RiderAssignmentModal
          orderId={assigningOrderId}
          onClose={() => setAssigningOrderId(null)}
          onSuccess={() => {
            setAssigningOrderId(null);
          }}
        />
      )}
    </div>
  );
};
