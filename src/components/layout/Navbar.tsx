import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Search,
  LogOut,
  User,
  ShieldCheck,
  Bike,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { currentUser, logout, activeTab, setActiveTab, orders, deliveries, riders } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Derive title from active tab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'System Overview & Live Operations';
      case 'orders':
        return 'Order Management & Dispatch';
      case 'customers':
        return 'Customer Directory & Accounts';
      case 'restaurants':
        return 'Restaurant Partners & Kitchens';
      case 'riders':
        return 'Delivery Fleet & Rider Workload';
      case 'deliveries':
        return 'Real-Time Delivery Tracking';
      case 'route-planning':
        return 'Dijkstra Route Planning & Graph Theory';
      case 'reports':
        return 'Operational Analytics & Reports';
      case 'academic':
        return 'Academic Subject Hub & Viva Preparation';
      case 'settings':
        return 'System Configuration & Algorithmic Weights';
      default:
        return 'Delivery Management Platform';
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const activeDeliveriesCount = deliveries.filter(
    (d) => d.status === 'Assigned' || d.status === 'Preparing' || d.status === 'Out for Delivery'
  ).length;
  const availableRidersCount = riders.filter((r) => r.status === 'Available').length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Zone 1: Contextual Page Title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-300">Delivery Ops</span>
          <span aria-hidden="true">/</span>
          <span className="capitalize text-emerald-400 font-medium">{activeTab.replace('-', ' ')}</span>
        </div>
        <h1 className="hidden md:block text-sm font-semibold text-slate-100 truncate border-l border-slate-700/60 pl-3">
          {getTabTitle()}
        </h1>
      </div>

      {/* Zone 2: Search & Quick Status Indicators */}
      <div className="hidden lg:flex items-center gap-4">
        <button
          onClick={() => setActiveTab('route-planning')}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Dijkstra Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Viva Questions</span>
        </button>
      </div>

      {/* Zone 3: Actions & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 rounded-lg transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingOrdersCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-850 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-750">
                <span className="text-xs font-semibold text-slate-200">System Activity</span>
                <span className="text-xs text-slate-400">{pendingOrdersCount} alerts</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Pending Orders requiring dispatch:</span>
                  <span className="font-mono font-bold text-amber-400 tabular-nums">{pendingOrdersCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Active deliveries in transit:</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">{activeDeliveriesCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300">Riders ready for assignment:</span>
                  <span className="font-mono font-bold text-blue-400 tabular-nums">{availableRidersCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Account / Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-slate-200 leading-tight">
                {currentUser?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight capitalize">
                {currentUser?.role || 'Admin'}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-850 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 mb-2 border-b border-slate-750">
                <p className="text-xs font-semibold text-slate-100">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser?.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="uppercase font-semibold tracking-wider">Role: {currentUser?.role}</span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('academic');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>College Project & Viva Notes</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Algorithm Weights & Settings</span>
                </button>

                <div className="border-t border-slate-750 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
