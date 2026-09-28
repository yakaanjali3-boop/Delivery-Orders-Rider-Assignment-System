import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Phone,
  MapPin,
  Store,
  ShoppingBag,
  Search,
  Check,
  ChevronDown,
  Clock,
  Star,
  Lock,
  Sparkles,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { INDIAN_CITIES, REAL_RESTAURANTS, RealRestaurant, getRestaurantsByCity } from '../../data/realRestaurants';
import { OrderStatus } from '../../types';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (orderId: string) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { addOrder, addCustomer, addRestaurant, customers, restaurants, addToast } = useApp();

  // 1. Customer Name & Mobile
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // 2. City Selection
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [citySearch, setCitySearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // 3. Restaurant Selection (City Dependent & Searchable)
  const [selectedRestaurant, setSelectedRestaurant] = useState<RealRestaurant | null>(null);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [isRestaurantDropdownOpen, setIsRestaurantDropdownOpen] = useState(false);

  // 4. Delivery Address
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // 5. Order Details
  const [foodItem, setFoodItem] = useState('Special Biryani & Butter Naan');
  const [totalAmount, setTotalAmount] = useState(480);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Pending');
  const [notes, setNotes] = useState('');

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const restDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (restDropdownRef.current && !restDropdownRef.current.contains(event.target as Node)) {
        setIsRestaurantDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Cities
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return INDIAN_CITIES;
    return INDIAN_CITIES.filter((city) =>
      city.toLowerCase().includes(citySearch.trim().toLowerCase())
    );
  }, [citySearch]);

  // Real Restaurants for the selected city ONLY (never mixed)
  const cityRestaurants = useMemo(() => {
    if (!selectedCity) return [];
    return getRestaurantsByCity(selectedCity);
  }, [selectedCity]);

  // Filtered Restaurants within the selected city
  const filteredRestaurants = useMemo(() => {
    if (!restaurantSearch.trim()) return cityRestaurants;
    const query = restaurantSearch.trim().toLowerCase();
    return cityRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.area.toLowerCase().includes(query) ||
        r.cuisine.toLowerCase().includes(query)
    );
  }, [cityRestaurants, restaurantSearch]);

  // When city changes, reset restaurant selection
  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setSelectedRestaurant(null);
    setRestaurantSearch('');
    setIsCityDropdownOpen(false);
  };

  const handleSelectRestaurant = (rest: RealRestaurant) => {
    setSelectedRestaurant(rest);
    setIsRestaurantDropdownOpen(false);
  };

  // Quick suggestions for food item
  const popularPresets = [
    'Hyderabadi Chicken Dum Biryani',
    'Butter Chicken & Garlic Naan',
    'South Indian Vegetarian Thali',
    'Crispy Ghee Podi Dosa & Filter Kaapi',
    'Paneer Butter Masala & Roti',
    'Special Mutton Biryani & Mirchi Ka Salan',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      addToast({ type: 'warning', title: 'Customer Name Required', message: 'Please enter customer name.' });
      return;
    }

    if (!mobileNumber.trim()) {
      addToast({ type: 'warning', title: 'Mobile Number Required', message: 'Please enter a valid mobile number.' });
      return;
    }

    if (!selectedCity) {
      addToast({ type: 'warning', title: 'City Required', message: 'Please select a city.' });
      return;
    }

    if (!selectedRestaurant) {
      addToast({ type: 'warning', title: 'Restaurant Required', message: 'Please select an actual restaurant from the city list.' });
      return;
    }

    if (!deliveryAddress.trim()) {
      addToast({ type: 'warning', title: 'Delivery Address Required', message: 'Please enter complete delivery address.' });
      return;
    }

    // 1. Ensure Customer exists or register in Customer Directory
    let existingCust = customers.find(
      (c) => c.phone === mobileNumber.trim() || c.name.toLowerCase() === customerName.trim().toLowerCase()
    );
    let customerId = existingCust ? existingCust.customer_id : `C${String(customers.length + 1).padStart(3, '0')}`;

    if (!existingCust) {
      addCustomer({
        name: customerName.trim(),
        phone: mobileNumber.trim(),
        address: deliveryAddress.trim(),
        email: `${customerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        city: selectedCity,
      });
    }

    // 2. Ensure Restaurant exists in active Restaurant Partners fleet
    let existingRest = restaurants.find((r) => r.restaurant_id === selectedRestaurant.id || r.name.toLowerCase() === selectedRestaurant.name.toLowerCase());
    let restaurantId = existingRest ? existingRest.restaurant_id : selectedRestaurant.id;

    if (!existingRest) {
      addRestaurant({
        name: selectedRestaurant.name,
        location: selectedRestaurant.city,
        phone: '0884-2345678',
        address: selectedRestaurant.area,
        prep_time: selectedRestaurant.prepTime,
        rating: selectedRestaurant.rating,
      });
    }

    // 3. Create Order with complete customer and restaurant metadata
    const newOrder = addOrder({
      customer_id: customerId,
      customer_name: customerName.trim(),
      customer_phone: mobileNumber.trim(),
      restaurant_id: restaurantId,
      restaurant_name: selectedRestaurant.name,
      delivery_address: deliveryAddress.trim(),
      delivery_city: selectedCity,
      status: orderStatus,
      total_amount: Number(totalAmount),
      items: [{ name: foodItem.trim() || 'Signature Meal', quantity: 1, price: Number(totalAmount) }],
      notes: notes.trim() || undefined,
    });

    onOrderCreated(newOrder.order_id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Create New Food Delivery Order</h3>
              <p className="text-xs text-slate-400">
                Any customer name · City-filtered real restaurants · Custom delivery address
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Flow Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* STEP 1 & 2: Customer Name & Mobile Number */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Customer Identification
              </label>
              <span className="text-[10px] text-emerald-400 font-mono ml-auto">Any Name Allowed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name (e.g. Anjali, Ravi Teja)"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile (e.g. 9876543210)"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 & 4: City Selection & City-Dependent Restaurant */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                City & Real Restaurant Selection
              </label>
              <span className="text-[10px] text-amber-400 font-mono ml-auto">Actual Local Partners Only</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* City Dropdown */}
              <div className="relative" ref={cityDropdownRef}>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Select City <span className="text-rose-400">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-left flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className={selectedCity ? 'text-white font-medium' : 'text-slate-500'}>
                      {selectedCity || 'Choose Indian City...'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                </button>

                {isCityDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95">
                    {/* Search inside City Dropdown */}
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Search city (e.g. Kakinada, Hyderabad)..."
                        className="w-full pl-8 pr-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {filteredCities.length === 0 ? (
                        <div className="p-2 text-center text-xs text-slate-500">No matching city found</div>
                      ) : (
                        filteredCities.map((city) => {
                          const isSelected = selectedCity === city;
                          const restCount = getRestaurantsByCity(city).length;

                          return (
                            <button
                              key={city}
                              type="button"
                              onClick={() => handleSelectCity(city)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span>{city}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {restCount} {restCount === 1 ? 'place' : 'places'}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Restaurant Dropdown (Disabled until City is Selected) */}
              <div className="relative" ref={restDropdownRef}>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Select Restaurant <span className="text-rose-400">*</span>
                </label>

                {!selectedCity ? (
                  <div className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-500 flex items-center gap-2 cursor-not-allowed">
                    <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Select a city first to view real local restaurants</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRestaurantDropdownOpen(!isRestaurantDropdownOpen)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-left flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Store className="w-4 h-4 text-amber-400 shrink-0" />
                        {selectedRestaurant ? (
                          <div className="truncate">
                            <span className="text-white font-semibold">{selectedRestaurant.name}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5 truncate">
                              ({selectedRestaurant.area})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Choose restaurant in {selectedCity}...</span>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    </button>

                    {isRestaurantDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 w-full sm:w-[380px]">
                        {/* Search inside Restaurant Dropdown */}
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                          <input
                            type="text"
                            value={restaurantSearch}
                            onChange={(e) => setRestaurantSearch(e.target.value)}
                            placeholder={`Search actual restaurants in ${selectedCity}...`}
                            className="w-full pl-8 pr-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            autoFocus
                          />
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-1">
                          {filteredRestaurants.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-500">
                              No restaurants found in {selectedCity} matching "{restaurantSearch}"
                            </div>
                          ) : (
                            filteredRestaurants.map((rest) => {
                              const isSelected = selectedRestaurant?.id === rest.id;

                              return (
                                <button
                                  key={rest.id}
                                  type="button"
                                  onClick={() => handleSelectRestaurant(rest)}
                                  className={`w-full text-left p-2 rounded-lg text-xs transition-all ${
                                    isSelected
                                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                                      : 'hover:bg-slate-800 text-slate-200 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-white text-xs">{rest.name}</span>
                                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-semibold">
                                      <Star className="w-3 h-3 fill-current" />
                                      <span>{rest.rating}</span>
                                    </div>
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{rest.area}</div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                                    <span className="truncate max-w-[200px] italic">{rest.cuisine}</span>
                                    <span className="font-mono text-emerald-400 flex items-center gap-0.5">
                                      <Clock className="w-3 h-3" />
                                      {rest.prepTime}m prep
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Selected Restaurant Information Card */}
            {selectedRestaurant && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300">{selectedRestaurant.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                      {selectedRestaurant.city}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{selectedRestaurant.area}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-300 font-mono">
                    Prep Time: <strong className="text-emerald-400">{selectedRestaurant.prepTime} mins</strong>
                  </div>
                  <div className="text-[10px] text-amber-400">Rating: {selectedRestaurant.rating} ★</div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 5: Manual Complete Delivery Address */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Delivery Destination
              </label>
              <span className="text-[10px] text-slate-400 ml-auto">Any custom address allowed</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Complete Delivery Address <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter complete address (Flat/House No., Street name, Landmark, Colony, Pin code)..."
                required
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* STEP 6: Order Details & Price */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center">
                4
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Order Items & Billing
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Food Item Name / Description</label>
                <input
                  type="text"
                  value={foodItem}
                  onChange={(e) => setFoodItem(e.target.value)}
                  placeholder="e.g. Special Hyderabadi Dum Biryani, 2 Butter Naan"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Quick items:</span>
                  {popularPresets.slice(0, 4).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFoodItem(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      {preset.split('&')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Total Bill Amount (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <IndianRupee className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="number"
                      min="50"
                      step="10"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(Number(e.target.value))}
                      required
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Initial Dispatch Status</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Pending">Pending (Needs Rider)</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready for Pickup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Delivery Notes / Special Instructions <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ring doorbell, leave at door, call before arrival"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Create Order & Trigger Rider Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
