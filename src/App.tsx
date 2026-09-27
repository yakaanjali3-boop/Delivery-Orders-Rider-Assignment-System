/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { OrdersPage } from './components/orders/OrdersPage';
import { CustomersPage } from './components/customers/CustomersPage';
import { RestaurantsPage } from './components/restaurants/RestaurantsPage';
import { RidersPage } from './components/riders/RidersPage';
import { DeliveriesPage } from './components/deliveries/DeliveriesPage';
import { RoutePlanningPage } from './components/route/RoutePlanningPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { AcademicHubPage } from './components/academic/AcademicHubPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ToastContainer } from './components/common/ToastContainer';
import { RiderAssignmentModal } from './components/assignment/RiderAssignmentModal';

const AppContent: React.FC = () => {
  const { currentUser, activeTab, setActiveTab } = useApp();
  const [globalAssignOrderId, setGlobalAssignOrderId] = useState<string | null>(null);

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Render appropriate view based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onAutoAssignOrder={(orderId) => setGlobalAssignOrderId(orderId)}
            onOpenCreateOrder={() => setActiveTab('orders')}
          />
        );
      case 'orders':
        return <OrdersPage />;
      case 'customers':
        return <CustomersPage />;
      case 'restaurants':
        return <RestaurantsPage />;
      case 'riders':
        return <RidersPage />;
      case 'deliveries':
        return <DeliveriesPage />;
      case 'route-planning':
        return <RoutePlanningPage />;
      case 'reports':
        return <ReportsPage />;
      case 'academic':
        return <AcademicHubPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Global Assignment Modal */}
      {globalAssignOrderId && (
        <RiderAssignmentModal
          orderId={globalAssignOrderId}
          onClose={() => setGlobalAssignOrderId(null)}
          onSuccess={() => setGlobalAssignOrderId(null)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
