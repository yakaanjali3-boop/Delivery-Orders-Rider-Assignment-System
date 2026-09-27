import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bike,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Gauge,
  ShoppingBag,
  Award,
  Zap,
} from 'lucide-react';
import { Rider, RiderStatus } from '../../types';

export const RidersPage: React.FC = () => {
  const { riders, addRider, updateRider, updateRiderStatus, deleteRider } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<RiderStatus>('Available');
  const [currentLocation, setCurrentLocation] = useState('Kakinada');
  const [activeOrders, setActiveOrders] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(32);
  const [vehicleType, setVehicleType] = useState('Motorbike (Hero Splendor)');
  const [rating, setRating] = useState(4.8);

  const openCreateModal = () => {
    setEditingRider(null);
    setName('');
    setPhone('');
    setStatus('Available');
    setCurrentLocation('Kakinada');
    setActiveOrders(0);
    setAverageSpeed(32);
    setVehicleType('Motorbike (Hero Splendor)');
    setRating(4.8);
    setIsModalOpen(true);
  };

  const openEditModal = (rider: Rider) => {
    setEditingRider(rider);
    setName(rider.name);
    setPhone(rider.phone);
    setStatus(rider.status);
    setCurrentLocation(rider.current_location);
    setActiveOrders(rider.active_orders);
    setAverageSpeed(rider.average_speed);
    setVehicleType(rider.vehicle_type);
    setRating(rider.rating);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRider) {
      updateRider(editingRider.rider_id, {
        name,
        phone,
        status,
        current_location: currentLocation,
        active_orders: Number(activeOrders),
        average_speed: Number(averageSpeed),
        vehicle_type: vehicleType,
        rating: Number(rating),
      });
    } else {
      addRider({
        name,
        phone,
        status,
        current_location: currentLocation,
        active_orders: Number(activeOrders),
        average_speed: Number(averageSpeed),
        vehicle_type: vehicleType,
        rating: Number(rating),
      });
    }
    setIsModalOpen(false);
  };

  const filteredRiders = riders.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rider_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.current_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Delivery Fleet & Riders</h2>
          <p className="text-xs text-slate-400">
            Active couriers, live locations, active queue loads, and transit speed telemetry
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Rider</span>
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
            placeholder="Search by rider name, ID, phone, or location..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Statuses ({riders.length})</option>
          <option value="Available">Available Only</option>
          <option value="Busy">Busy</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      {/* Riders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                <th className="py-3 px-4">Rider ID</th>
                <th className="py-3 px-4">Name & Vehicle</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Current Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active Orders</th>
                <th className="py-3 px-4">Average Speed</th>
                <th className="py-3 px-4">Workload Bar</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRiders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No riders found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredRiders.map((rider) => {
                  const loadPct = Math.min(100, Math.round((rider.active_orders / 5) * 100));

                  return (
                    <tr key={rider.rider_id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">{rider.rider_id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{rider.name}</div>
                        <div className="text-[10px] text-slate-400">{rider.vehicle_type}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{rider.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                          {rider.current_location}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={rider.status}
                          onChange={(e) => updateRiderStatus(rider.rider_id, e.target.value as RiderStatus)}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded border bg-slate-950 focus:outline-none ${
                            rider.status === 'Available'
                              ? 'text-emerald-400 border-emerald-800/40'
                              : rider.status === 'Busy'
                              ? 'text-amber-400 border-amber-800/40'
                              : 'text-slate-400 border-slate-700'
                          }`}
                        >
                          <option value="Available">Available</option>
                          <option value="Busy">Busy</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {rider.active_orders} orders
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-400 font-semibold">
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-blue-400/80" />
                          <span>{rider.average_speed} km/h</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 w-32">
                        <div className="space-y-1">
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                rider.active_orders > 2 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${loadPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rider.completed_orders} delivered
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(rider)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit Rider"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRider(rider.rider_id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete Rider"
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

      {/* Rider Modal (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-1">
              {editingRider ? `Edit Rider (${editingRider.rider_id})` : 'Register New Fleet Rider'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter courier profile, current staging hub, speed capability, and phone
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rider Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kiran Kumar"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9123456780"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fleet Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RiderStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Staging Hub</label>
                  <select
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Kakinada">Kakinada</option>
                    <option value="Rajahmundry">Rajahmundry</option>
                    <option value="Samalkota">Samalkota</option>
                    <option value="Peddapuram">Peddapuram</option>
                    <option value="Pithapuram">Pithapuram</option>
                    <option value="Mandapeta">Mandapeta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Active Queue Orders</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={activeOrders}
                    onChange={(e) => setActiveOrders(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Avg Speed (km/h)</label>
                  <input
                    type="number"
                    min="15"
                    max="65"
                    value={averageSpeed}
                    onChange={(e) => setAverageSpeed(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Vehicle Description</label>
                <input
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  placeholder="Motorbike (Hero Splendor)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  {editingRider ? 'Save Changes' : 'Register Rider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
