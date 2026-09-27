import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Store,
  Bike,
  ShoppingBag,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { orders, deliveries, riders, restaurants, customers } = useApp();

  const [dateFilter, setDateFilter] = useState('all');

  // Key Calculations
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
  const inProgressOrders = orders.filter(
    (o) => o.status === 'Preparing' || o.status === 'Assigned' || o.status === 'Out for Delivery'
  ).length;

  const deliveredDeliveries = deliveries.filter((d) => d.status === 'Delivered');
  const avgDeliveryTime =
    deliveredDeliveries.length > 0
      ? Math.round(
          deliveredDeliveries.reduce((sum, d) => sum + d.eta, 0) / deliveredDeliveries.length
        )
      : 24;

  const totalRevenue = orders
    .filter((o) => o.status === 'Delivered' || o.status === 'Out for Delivery')
    .reduce((sum, o) => sum + o.total_amount, 0);

  // Orders by Restaurant
  const restaurantStats = restaurants.map((r) => {
    const restOrders = orders.filter((o) => o.restaurant_id === r.restaurant_id);
    const revenue = restOrders.reduce((sum, o) => sum + o.total_amount, 0);
    return {
      restaurant: r,
      count: restOrders.length,
      revenue,
    };
  });

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Restaurant', 'Address', 'Status', 'Amount (INR)', 'Order Time'];
    const rows = orders.map((o) => [
      o.order_id,
      customers.find((c) => c.customer_id === o.customer_id)?.name || o.customer_id,
      restaurants.find((r) => r.restaurant_id === o.restaurant_id)?.name || o.restaurant_id,
      `"${o.delivery_address}"`,
      o.status,
      o.total_amount,
      o.order_time,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `delivery_reports_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reports & Business Analytics</h2>
          <p className="text-xs text-slate-400">
            Fulfillment KPIs, restaurant partner volumes, courier productivity, and revenue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">{totalOrders}</div>
          <div className="text-[11px] text-emerald-400 mt-1">₹{totalRevenue} Gross Revenue</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{completedOrders}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}% success rate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cancelled Orders</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">{cancelledOrders}</div>
          <div className="text-[11px] text-slate-400 mt-1">0% system rejection</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Avg Delivery Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">{avgDeliveryTime}m</div>
          <div className="text-[11px] text-slate-400 mt-1">Dijkstra optimized routing</div>
        </div>
      </div>

      {/* Two Column Section: Restaurant Volumes & Rider Workloads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Restaurant */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Orders by Restaurant Partner</h3>
            <span className="text-xs text-slate-400 font-mono">{restaurants.length} active partners</span>
          </div>

          <div className="space-y-3">
            {restaurantStats.map((item) => {
              const maxCount = Math.max(...restaurantStats.map((s) => s.count), 1);
              const barWidth = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.restaurant.restaurant_id} className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{item.restaurant.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({item.restaurant.location})</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-emerald-400 font-bold">{item.count} orders</span>
                      <span className="text-slate-400 text-[10px] ml-2">₹{item.revenue}</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rider Workload & Productivity */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Rider Fleet Productivity</h3>
            <span className="text-xs text-slate-400 font-mono">{riders.length} couriers</span>
          </div>

          <div className="space-y-3">
            {riders.map((r) => {
              const assignedDelivs = deliveries.filter((d) => d.rider_id === r.rider_id);
              return (
                <div key={r.rider_id} className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bike className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-white">{r.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({r.rider_id})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {r.vehicle_type} · {r.current_location}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs text-slate-200">
                      <strong>{r.active_orders}</strong> active · <strong>{r.completed_orders}</strong> done
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono font-semibold">
                      Rating: {r.rating} ★
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
