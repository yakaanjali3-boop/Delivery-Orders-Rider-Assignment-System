import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Store,
  Bike,
  Truck,
  Compass,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { activeTab, setActiveTab, orders, deliveries, riders, logout } = useApp();

  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const activeDeliveries = deliveries.filter(
    (d) => d.status === 'Assigned' || d.status === 'Preparing' || d.status === 'Out for Delivery'
  ).length;
  const availableRiders = riders.filter((r) => r.status === 'Available').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrders > 0 ? { text: `${pendingOrders} new`, color: 'text-amber-400 bg-amber-950/60 border-amber-700/50' } : null,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: null,
    },
    {
      id: 'restaurants',
      label: 'Restaurants',
      icon: Store,
      badge: null,
    },
    {
      id: 'riders',
      label: 'Riders',
      icon: Bike,
      badge: availableRiders > 0 ? { text: `${availableRiders} active`, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50' } : null,
    },
    {
      id: 'deliveries',
      label: 'Deliveries',
      icon: Truck,
      badge: activeDeliveries > 0 ? { text: `${activeDeliveries} live`, color: 'text-blue-400 bg-blue-950/60 border-blue-700/50' } : null,
    },
    {
      id: 'route-planning',
      label: 'Route Planning',
      icon: Compass,
      badge: { text: 'Dijkstra', color: 'text-indigo-300 bg-indigo-950/60 border-indigo-700/50' },
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'academic',
      label: 'Academic Viva & Docs',
      icon: BookOpen,
      badge: { text: 'B.Tech', color: 'text-purple-300 bg-purple-950/60 border-purple-700/50' },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
          <Flame className="w-5 h-5 fill-current" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-white block">FastRoute Dispatch</span>
          <span className="text-[11px] text-slate-400 block font-normal">Order & Rider Engine</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${item.badge.color}`}
                >
                  {item.badge.text}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom User & Logout Area */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
