import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Bike,
  Store,
  User,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  Play,
  RotateCcw,
  CheckCircle2,
  Table,
} from 'lucide-react';
import {
  DELIVERY_GRAPH_EDGES,
  DELIVERY_GRAPH_NODES,
  calculateFullDeliveryRoute,
  dijkstra,
  findNode,
} from '../../utils/dijkstra';

export const RoutePlanningPage: React.FC = () => {
  const { riders, restaurants, customers } = useApp();

  // Selected Entities
  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.rider_id || '');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.restaurant_id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.customer_id || '');
  const [isCalculated, setIsCalculated] = useState(true);

  const rider = riders.find((r) => r.rider_id === selectedRiderId) || riders[0];
  const restaurant = restaurants.find((r) => r.restaurant_id === selectedRestaurantId) || restaurants[0];
  const customer = customers.find((c) => c.customer_id === selectedCustomerId) || customers[0];

  const riderLoc = rider?.current_location || 'Kakinada';
  const restLoc = restaurant?.location || 'Kakinada';
  const custLoc = customer?.city || 'Samalkota';

  // Compute Dijkstra route
  const routeResult = calculateFullDeliveryRoute(
    riderLoc,
    restLoc,
    custLoc,
    rider?.average_speed || 32
  );

  const prepTime = restaurant?.prep_time || 15;
  const workloadDelay = (rider?.active_orders || 0) * 8;
  const totalEta = Math.round(prepTime + routeResult.totalTravelTimeMinutes + workloadDelay);

  // Set of nodes in the path for highlighting on the SVG canvas
  const pathNodeSet = new Set(routeResult.combinedPath);

  // Check if an edge is part of the path
  const isEdgeInPath = (u: string, v: string) => {
    for (let i = 0; i < routeResult.combinedPath.length - 1; i++) {
      const a = routeResult.combinedPath[i];
      const b = routeResult.combinedPath[i + 1];
      if ((a === u && b === v) || (a === v && b === u)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Dijkstra Route Planning</h2>
          <p className="text-xs text-slate-400">
            DMGT Graph Theory formulation: single-source shortest path using non-negative edge weights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
            Algorithm: Dijkstra Shortest Path O((V+E) log V)
          </span>
        </div>
      </div>

      {/* Selectors Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Configure Multi-Point Dispatch Route
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Rider */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-emerald-400" />
              <span>Starting Point (Rider Courier)</span>
            </label>
            <select
              value={selectedRiderId}
              onChange={(e) => setSelectedRiderId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {riders.map((r) => (
                <option key={r.rider_id} value={r.rider_id}>
                  {r.name} ({r.current_location}) · {r.average_speed} km/h [{r.status}]
                </option>
              ))}
            </select>
          </div>

          {/* 2. Restaurant */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Pickup Hub (Restaurant Kitchen)</span>
            </label>
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {restaurants.map((rest) => (
                <option key={rest.restaurant_id} value={rest.restaurant_id}>
                  {rest.name} ({rest.location}) · Prep: {rest.prep_time}m
                </option>
              ))}
            </select>
          </div>

          {/* 3. Customer */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Destination (Customer Address)</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name} ({c.city}) · {c.phone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary Results Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Distance</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {routeResult.totalDistance} <span className="text-xs text-slate-400">km</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Dijkstra shortest path</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Transit Travel Time</span>
          <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {routeResult.totalTravelTimeMinutes} <span className="text-xs text-slate-400">mins</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">At {rider?.average_speed} km/h speed</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Kitchen Prep Time</span>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {prepTime} <span className="text-xs text-slate-400">mins</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{restaurant?.name}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-[10px] uppercase font-semibold text-emerald-400">Estimated Total ETA</span>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {totalEta} <span className="text-xs text-emerald-400 font-semibold">minutes</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Prep + Travel + Queue delay</p>
        </div>
      </div>

      {/* Visual Interactive Route Diagram / Map */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Topological Delivery Network Graph</h3>
            <p className="text-xs text-slate-400">
              Interactive weighted graph visualization. Glowing path indicates Dijkstra's shortest route.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-300">Rider Start</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-300">Restaurant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-slate-300">Customer</span>
            </div>
          </div>
        </div>

        {/* SVG Route Diagram */}
        <div className="w-full bg-slate-950 rounded-xl border border-slate-800 p-2 sm:p-4 overflow-x-auto">
          <svg viewBox="80 90 640 380" className="w-full h-80 sm:h-96 min-w-[560px]">
            {/* Edges */}
            {DELIVERY_GRAPH_EDGES.map((edge, idx) => {
              const fromNode = DELIVERY_GRAPH_NODES.find((n) => n.id === edge.from);
              const toNode = DELIVERY_GRAPH_NODES.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isPath = isEdgeInPath(edge.from, edge.to);

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g key={idx}>
                  {/* Underline glow if path */}
                  {isPath && (
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#10b981"
                      strokeWidth="6"
                      strokeOpacity="0.4"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Actual Edge */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isPath ? '#34d399' : '#334155'}
                    strokeWidth={isPath ? '3' : '1.5'}
                    strokeDasharray={isPath ? 'none' : '4 4'}
                    strokeLinecap="round"
                  />
                  {/* Edge Weight Distance Badge */}
                  <rect
                    x={midX - 16}
                    y={midY - 9}
                    width="32"
                    height="18"
                    rx="4"
                    fill={isPath ? '#064e3b' : '#0f172a'}
                    stroke={isPath ? '#059669' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    textAnchor="middle"
                    fill={isPath ? '#6ee7b7' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {edge.weight}k
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {DELIVERY_GRAPH_NODES.map((node) => {
              const isRiderStart = node.id.toLowerCase() === riderLoc.toLowerCase();
              const isRestaurant = node.id.toLowerCase() === restLoc.toLowerCase();
              const isCustomer = node.id.toLowerCase() === custLoc.toLowerCase();
              const isInPath = pathNodeSet.has(node.id);

              let fill = '#1e293b';
              let stroke = '#475569';
              let radius = 10;

              if (isRiderStart) {
                fill = '#10b981';
                stroke = '#34d399';
                radius = 14;
              } else if (isRestaurant) {
                fill = '#f59e0b';
                stroke = '#fbbf24';
                radius = 14;
              } else if (isCustomer) {
                fill = '#3b82f6';
                stroke = '#60a5fa';
                radius = 14;
              } else if (isInPath) {
                fill = '#059669';
                stroke = '#34d399';
                radius = 12;
              }

              return (
                <g key={node.id} className="cursor-pointer">
                  {/* Pulse ring for active endpoints */}
                  {(isRiderStart || isRestaurant || isCustomer) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + 6}
                      fill="none"
                      stroke={fill}
                      strokeWidth="1.5"
                      opacity="0.5"
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="2"
                  />

                  {/* Node Name Label */}
                  <text
                    x={node.x}
                    y={node.y + radius + 13}
                    textAnchor="middle"
                    fill={isInPath ? '#ffffff' : '#94a3b8'}
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight={isInPath ? 'bold' : 'normal'}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Step-by-Step Waypoint Journey */}
        <div className="p-4 bg-slate-850 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Selected Route Waypoints (Ordered by Dijkstra Path):
          </span>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {routeResult.combinedPath.map((nodeId, idx) => {
              const node = findNode(nodeId);
              return (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white">{node?.name || nodeId}</span>
                  </div>
                  {idx < routeResult.combinedPath.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dijkstra Step-by-Step Algorithm Execution Trace */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Dijkstra Algorithm Execution Trace</h3>
            <p className="text-xs text-slate-400">
              Internal edge relaxations and tentative distance updates computed for Leg 1 ({riderLoc} → {restLoc})
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {routeResult.riderToRestaurant.steps.length} relaxation steps
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Current Node (u)</th>
                <th className="py-2.5 px-3">Neighbor (v)</th>
                <th className="py-2.5 px-3">Edge Weight</th>
                <th className="py-2.5 px-3">Tentative Dist</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Algorithmic Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {routeResult.riderToRestaurant.steps.slice(0, 8).map((step, idx) => (
                <tr key={idx} className="hover:bg-slate-850/40">
                  <td className="py-2.5 px-3 text-slate-200 font-bold">{step.current}</td>
                  <td className="py-2.5 px-3 text-slate-300">{step.neighbor}</td>
                  <td className="py-2.5 px-3 text-amber-400">{step.edgeWeight} km</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{step.tentativeDistance} km</td>
                  <td className="py-2.5 px-3">
                    {step.updated ? (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        RELAXED
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        KEPT
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[10px] font-sans truncate max-w-xs">
                    {step.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
