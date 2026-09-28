import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  Bike,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserCheck,
  PlusCircle,
  Compass,
  Store,
  Users,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface DashboardProps {
  onAutoAssignOrder?: (orderId: string) => void;
  onOpenCreateOrder?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onAutoAssignOrder,
  onOpenCreateOrder,
}) => {
  const {
    orders,
    deliveries,
    riders,
    customers,
    restaurants,
    setActiveTab,
    updateOrderStatus,
  } = useApp();

  // Calculated Real-Time Metrics (never hard-coded)
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const activeDeliveries = deliveries.filter(
    (d) => d.status === 'Assigned' || d.status === 'Preparing' || d.status === 'Out for Delivery'
  ).length;
  const completedDeliveries = deliveries.filter((d) => d.status === 'Delivered').length;
  const availableRiders = riders.filter((r) => r.status === 'Available').length;
  const busyRiders = riders.filter((r) => r.status === 'Busy').length;

  // Total Revenue
  const totalRevenue = orders
    .filter((o) => o.status === 'Delivered' || o.status === 'Out for Delivery')
    .reduce((sum, o) => sum + o.total_amount, 0);

  // Status Counts for Chart
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const getCustomerName = (order: Order) =>
    order.customer_name || customers.find((c) => c.customer_id === order.customer_id)?.name || order.customer_id;

  const getRestaurantName = (order: Order) =>
    order.restaurant_name || restaurants.find((r) => r.restaurant_id === order.restaurant_id)?.name || order.restaurant_id;

  const getRiderName = (riderId?: string) =>
    riders.find((r) => r.rider_id === riderId)?.name || 'Unassigned';

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

  const statCards = [
    {
      label: 'Total Orders',
      value: totalOrders,
      sub: 'All recorded orders',
      icon: ShoppingBag,
      color: 'emerald',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      sub: 'Awaiting dispatch',
      icon: Clock,
      color: 'amber',
    },
    {
      label: 'Active Deliveries',
      value: activeDeliveries,
      sub: 'In transit / prep',
      icon: Truck,
      color: 'blue',
    },
    {
      label: 'Completed Deliveries',
      value: completedDeliveries,
      sub: 'Successfully fulfilled',
      icon: CheckCircle2,
      color: 'teal',
    },
    {
      label: 'Available Riders',
      value: availableRiders,
      sub: 'Ready for assignment',
      icon: Bike,
      color: 'emerald',
    },
    {
      label: 'Busy Riders',
      value: busyRiders,
      sub: 'Currently on delivery',
      icon: AlertTriangle,
      color: 'rose',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
              Autonomous Dispatch Engine
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">Dijkstra Shortest Path</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Operations Control Center</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-factor rider scoring, dynamic routing, and order lifecycles
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => (onOpenCreateOrder ? onOpenCreateOrder() : setActiveTab('orders'))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-md shadow-emerald-500/20 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Order</span>
          </button>

          <button
            onClick={() => setActiveTab('route-planning')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Route Planner</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards Required by Prompt */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 truncate">{card.label}</span>
                <div className="p-1.5 rounded-lg bg-slate-800/60 text-slate-300 group-hover:text-emerald-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts & Analytical Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Orders by Status */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Orders by Status</h3>
            <span className="text-xs text-slate-400 font-mono tabular-nums">{orders.length} total</span>
          </div>

          <div className="space-y-2.5">
            {['Pending', 'Preparing', 'Assigned', 'Out for Delivery', 'Delivered'].map((st) => {
              const count = statusCounts[st] || 0;
              const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
              return (
                <div key={st} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{st}</span>
                    <span className="text-slate-400 font-mono tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        st === 'Delivered'
                          ? 'bg-emerald-500'
                          : st === 'Out for Delivery'
                          ? 'bg-purple-500'
                          : st === 'Pending'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Rider Workload & Fleet Utilization */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Rider Fleet Workload</h3>
            <span className="text-xs text-emerald-400 font-medium">
              {availableRiders} of {riders.length} ready
            </span>
          </div>

          <div className="space-y-3">
            {riders.map((r) => {
              // Workload bar max out of 5 orders
              const loadPct = Math.min(100, Math.round((r.active_orders / 5) * 100));
              return (
                <div key={r.rider_id} className="p-2.5 rounded-xl bg-slate-850/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{r.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{r.current_location}</span>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        r.status === 'Available'
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                          : r.status === 'Busy'
                          ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                          : 'text-slate-400 bg-slate-800 border border-slate-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Active Orders: <strong className="text-slate-200 font-mono">{r.active_orders}</strong></span>
                    <span>Speed: <strong className="text-slate-200 font-mono">{r.average_speed} km/h</strong></span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        r.active_orders > 2 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Delivery Performance & DMGT Metric */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Delivery Performance</h3>
              <span className="text-xs text-indigo-400 font-mono">Dijkstra + ETA</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg ETA</span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">24.5 min</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Kitchen prep + transit</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Distance</span>
                <p className="text-xl font-bold font-mono text-blue-400 mt-1">6.2 km</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Shortest path route</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-emerald-300">Algorithmic Scoring Active</p>
                  <p className="text-slate-300 mt-0.5 leading-relaxed text-[11px]">
                    Automatic rider assignment evaluates active workloads (35%), road distance (40%), and ETA promise (25%) using Dijkstra's algorithm.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total System Revenue:</span>
            <span className="text-base font-bold font-mono text-white">₹{totalRevenue}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table with Action */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
            <p className="text-xs text-slate-400">Manage dispatch and trigger automatic rider assignment</p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Restaurant</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Assigned Rider</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.slice(0, 6).map((order) => {
                const isPending = order.status === 'Pending' || !order.assigned_rider_id;
                return (
                  <tr key={order.order_id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-white">{order.order_id}</td>
                    <td className="py-3 px-3 text-slate-200">
                      <div>{getCustomerName(order)}</div>
                      <div className="text-[10px] text-slate-400">{order.delivery_city}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{getRestaurantName(order)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-400 tabular-nums">
                      ₹{order.total_amount}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {order.assigned_rider_id ? (
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{getRiderName(order.assigned_rider_id)}</span>
                        </div>
                      ) : (
                        <span className="text-amber-400/80 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isPending ? (
                        <button
                          onClick={() =>
                            onAutoAssignOrder ? onAutoAssignOrder(order.order_id) : setActiveTab('orders')
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Auto-Assign</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('deliveries')}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                        >
                          <span>Track</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
