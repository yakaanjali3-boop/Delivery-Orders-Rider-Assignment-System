import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Bike,
  Store,
  User,
  Clock,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Filter,
  Search,
  MapPin,
  Play,
} from 'lucide-react';
import { Delivery, DeliveryStatus } from '../../types';

export const DeliveriesPage: React.FC = () => {
  const {
    deliveries,
    orders,
    riders,
    restaurants,
    customers,
    updateDeliveryStatus,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(deliveries[0] || null);

  const filteredDeliveries = deliveries.filter((d) => {
    const order = orders.find((o) => o.order_id === d.order_id);
    const rider = riders.find((r) => r.rider_id === d.rider_id);
    const cust = customers.find((c) => c.customer_id === order?.customer_id);

    const matchesSearch =
      d.delivery_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'Pending':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Assigned':
      case 'Preparing':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Out for Delivery':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Delivered':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const advanceStatus = (delivery: Delivery) => {
    let nextStatus: DeliveryStatus = delivery.status;
    if (delivery.status === 'Pending') nextStatus = 'Assigned';
    else if (delivery.status === 'Assigned') nextStatus = 'Preparing';
    else if (delivery.status === 'Preparing') nextStatus = 'Out for Delivery';
    else if (delivery.status === 'Out for Delivery') nextStatus = 'Delivered';

    if (nextStatus !== delivery.status) {
      updateDeliveryStatus(delivery.delivery_id, nextStatus);
      if (selectedDelivery?.delivery_id === delivery.delivery_id) {
        setSelectedDelivery({ ...delivery, status: nextStatus });
      }
    }
  };

  // Status Stepper Steps
  const STEPS: DeliveryStatus[] = ['Assigned', 'Preparing', 'Out for Delivery', 'Delivered'];

  const getStepIndex = (status: DeliveryStatus) => {
    return STEPS.indexOf(status);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Delivery Tracking & Dispatch</h2>
          <p className="text-xs text-slate-400">
            Real-time fulfillment tracking, waypoint progression, distance telemetry, and ETAs
          </p>
        </div>

        <button
          onClick={() => setActiveTab('route-planning')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
        >
          <Navigation className="w-4 h-4 text-indigo-400" />
          <span>View on Dijkstra Route Map</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by delivery ID, order ID, rider, or customer..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Statuses ({deliveries.length})</option>
          <option value="Assigned">Assigned</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Main Delivery Table & Live Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deliveries Table (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Live Delivery Logs</span>
            <span className="text-[11px] font-mono text-slate-400">{filteredDeliveries.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-850/50 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                  <th className="py-2.5 px-3">Delivery ID</th>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Courier</th>
                  <th className="py-2.5 px-3">Distance & ETA</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Step Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No deliveries match your query.
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((deliv) => {
                    const rider = riders.find((r) => r.rider_id === deliv.rider_id);
                    const isSelected = selectedDelivery?.delivery_id === deliv.delivery_id;

                    return (
                      <tr
                        key={deliv.delivery_id}
                        onClick={() => setSelectedDelivery(deliv)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-950/20 border-l-2 border-l-emerald-500'
                            : 'hover:bg-slate-850/50'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-white">{deliv.delivery_id}</td>
                        <td className="py-3 px-3 font-mono text-slate-300">{deliv.order_id}</td>
                        <td className="py-3 px-3 text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Bike className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{rider?.name || deliv.rider_id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-emerald-400 font-semibold">{deliv.eta} mins</div>
                          <div className="font-mono text-[10px] text-slate-400">{deliv.distance} km</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadge(
                              deliv.status
                            )}`}
                          >
                            {deliv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {deliv.status !== 'Delivered' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                advanceStatus(deliv);
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 text-[10px] font-semibold transition-colors"
                              title="Advance to next status"
                            >
                              Next Step
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Tracking Inspector Card (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Live Tracking Inspector</h3>
            {selectedDelivery && (
              <span className="font-mono text-xs text-emerald-400 font-semibold">
                {selectedDelivery.delivery_id}
              </span>
            )}
          </div>

          {selectedDelivery ? (
            <div className="space-y-4 text-xs">
              {/* Stepper Bar */}
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-2">
                  Delivery Lifecycle Stepper
                </span>

                <div className="space-y-2">
                  {STEPS.map((stepName, idx) => {
                    const currentIdx = getStepIndex(selectedDelivery.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={stepName} className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                            isPassed
                              ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`font-medium ${
                            isCurrent
                              ? 'text-emerald-400 font-semibold'
                              : isPassed
                              ? 'text-slate-200'
                              : 'text-slate-500'
                          }`}
                        >
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {selectedDelivery.status !== 'Delivered' && (
                  <button
                    onClick={() => advanceStatus(selectedDelivery)}
                    className="w-full mt-3 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Advance to Next Delivery Stage</span>
                  </button>
                )}
              </div>

              {/* Delivery Metadata */}
              <div className="space-y-2 p-3 bg-slate-850 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono text-white font-semibold">{selectedDelivery.order_id}</span>
                </div>
                {(() => {
                  const ord = orders.find((o) => o.order_id === selectedDelivery.order_id);
                  const custName = ord?.customer_name || customers.find((c) => c.customer_id === ord?.customer_id)?.name;
                  const restName = ord?.restaurant_name || restaurants.find((r) => r.restaurant_id === ord?.restaurant_id)?.name;
                  return (
                    <>
                      {custName && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Customer:</span>
                          <span className="text-slate-200 font-medium">{custName}</span>
                        </div>
                      )}
                      {restName && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Restaurant:</span>
                          <span className="text-slate-200 font-medium">{restName}</span>
                        </div>
                      )}
                      {ord?.delivery_address && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Address:</span>
                          <span className="text-slate-300 font-medium text-right max-w-[180px] truncate" title={ord.delivery_address}>
                            {ord.delivery_address}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Rider:</span>
                  <span className="text-slate-200 font-medium">
                    {riders.find((r) => r.rider_id === selectedDelivery.rider_id)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatched At:</span>
                  <span className="font-mono text-slate-300">{selectedDelivery.assigned_time}</span>
                </div>
                {selectedDelivery.pickup_time && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kitchen Pickup:</span>
                    <span className="font-mono text-slate-300">{selectedDelivery.pickup_time}</span>
                  </div>
                )}
                {selectedDelivery.delivery_time && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivered Time:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {selectedDelivery.delivery_time}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Distance Computed:</span>
                  <span className="font-mono text-white font-semibold">{selectedDelivery.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining / Target ETA:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedDelivery.eta} mins</span>
                </div>
              </div>

              {/* Route Waypoint Nodes */}
              {selectedDelivery.route_nodes && selectedDelivery.route_nodes.length > 0 && (
                <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Dijkstra Path Waypoints
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px] text-slate-300 mt-1">
                    {selectedDelivery.route_nodes.map((node, i) => (
                      <React.Fragment key={i}>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                          {node}
                        </span>
                        {i < selectedDelivery.route_nodes.length - 1 && (
                          <span className="text-slate-600">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Select a delivery to view tracking status.</p>
          )}
        </div>
      </div>
    </div>
  );
};
