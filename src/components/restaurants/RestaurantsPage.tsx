import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Clock,
  Star,
  ShoppingBag,
} from 'lucide-react';
import { Restaurant } from '../../types';

export const RestaurantsPage: React.FC = () => {
  const { restaurants, addRestaurant, updateRestaurant, deleteRestaurant, orders } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Kakinada');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const [rating, setRating] = useState(4.8);

  const openCreateModal = () => {
    setEditingRestaurant(null);
    setName('');
    setLocation('Kakinada');
    setPhone('');
    setAddress('');
    setPrepTime(15);
    setRating(4.8);
    setIsModalOpen(true);
  };

  const openEditModal = (rest: Restaurant) => {
    setEditingRestaurant(rest);
    setName(rest.name);
    setLocation(rest.location);
    setPhone(rest.phone);
    setAddress(rest.address);
    setPrepTime(rest.prep_time || 15);
    setRating(rest.rating || 4.5);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRestaurant) {
      updateRestaurant(editingRestaurant.restaurant_id, {
        name,
        location,
        phone,
        address,
        prep_time: Number(prepTime),
        rating: Number(rating),
      });
    } else {
      addRestaurant({
        name,
        location,
        phone,
        address,
        prep_time: Number(prepTime),
        rating: Number(rating),
      });
    }
    setIsModalOpen(false);
  };

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.restaurant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Restaurant Partners</h2>
          <p className="text-xs text-slate-400">
            Partner kitchens, prep times, physical locations, and menu fulfillment hubs
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Restaurant</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by restaurant name, ID, city location, or address..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Restaurants Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                <th className="py-3 px-4">Restaurant ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Location Zone</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Prep Time</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRestaurants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No restaurants match your search.
                  </td>
                </tr>
              ) : (
                filteredRestaurants.map((rest) => {
                  const restOrders = orders.filter((o) => o.restaurant_id === rest.restaurant_id);

                  return (
                    <tr key={rest.restaurant_id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">{rest.restaurant_id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{rest.name}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-[11px] font-medium border border-slate-700">
                          {rest.location}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{rest.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400 font-semibold">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500/80" />
                          <span>{rest.prep_time} mins</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{rest.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-300 truncate" title={rest.address}>
                        {rest.address}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {restOrders.length} orders
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(rest)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit Restaurant"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRestaurant(rest.restaurant_id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete Restaurant"
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

      {/* Restaurant Modal (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-1">
              {editingRestaurant ? `Edit Restaurant (${editingRestaurant.restaurant_id})` : 'Register Restaurant Partner'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter restaurant business name, dispatch hub, kitchen preparation delay, and phone
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Spice Hub"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Location Hub</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0884-2345678"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kitchen Prep Time (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={prepTime}
                    onChange={(e) => setPrepTime(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Street Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Bhanugudi Junction, Kakinada"
                  required
                  rows={2}
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
                  {editingRestaurant ? 'Save Changes' : 'Add Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
