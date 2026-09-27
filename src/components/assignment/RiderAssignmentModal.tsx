import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Zap,
  CheckCircle2,
  Award,
  Sliders,
  Sparkles,
  MapPin,
  Clock,
  Bike,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { generateSelectionRationale } from '../../utils/assignment';

interface RiderAssignmentModalProps {
  orderId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RiderAssignmentModal: React.FC<RiderAssignmentModalProps> = ({
  orderId,
  onClose,
  onSuccess,
}) => {
  const {
    evaluateRidersForOrder,
    assignRiderToOrder,
    scoringWeights,
    setScoringWeights,
  } = useApp();

  const [customWeights, setCustomWeights] = useState(scoringWeights);
  const [showWeightSettings, setShowWeightSettings] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);

  const evaluation = evaluateRidersForOrder(orderId);

  if (!evaluation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Order Details Incomplete</h3>
          <p className="text-xs text-slate-400 mt-1">
            Unable to compute candidates because either customer or restaurant details are missing for {orderId}.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { order, restaurant, customer, candidates } = evaluation;

  // The algorithmic winner is the lowest-scoring available rider (Rank #1)
  const defaultWinner = candidates.find((c) => c.isAvailable) || candidates[0];
  const activeWinnerId = selectedRiderId || (defaultWinner ? defaultWinner.rider.rider_id : null);
  const currentWinner = candidates.find((c) => c.rider.rider_id === activeWinnerId) || defaultWinner;

  const rationalePoints = currentWinner ? generateSelectionRationale(currentWinner, candidates) : [];

  const handleConfirmAssignment = () => {
    if (!currentWinner) return;
    const ok = assignRiderToOrder(orderId, currentWinner.rider.rider_id);
    if (ok) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const handleUpdateWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setScoringWeights(customWeights);
    setShowWeightSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Automatic Rider Assignment</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold">
                  {order.order_id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-factor candidate ranking using real Dijkstra road network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWeightSettings(!showWeightSettings)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Weights</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order & Route Context Summary */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pickup Restaurant</span>
            <span className="font-semibold text-slate-200">{restaurant.name}</span>
            <span className="text-slate-400 block text-[11px]">{restaurant.location}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Delivery Customer</span>
            <span className="font-semibold text-slate-200">{customer.name}</span>
            <span className="text-slate-400 block text-[11px] truncate">{customer.address}, {customer.city}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Order Total & Prep Time</span>
            <span className="font-mono font-semibold text-emerald-400">₹{order.total_amount}</span>
            <span className="text-slate-400 block text-[11px]">Prep time: {restaurant.prep_time} mins</span>
          </div>
        </div>

        {/* Weights Tuning Drawer (if open) */}
        {showWeightSettings && (
          <form
            onSubmit={handleUpdateWeights}
            className="p-4 bg-slate-850 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end"
          >
            <div>
              <label className="block text-slate-300 mb-1">
                Workload Weight (W_w): {customWeights.workloadWeight}
              </label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={customWeights.workloadWeight}
                onChange={(e) =>
                  setCustomWeights({ ...customWeights, workloadWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">
                Distance Weight (W_d): {customWeights.distanceWeight}
              </label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={customWeights.distanceWeight}
                onChange={(e) =>
                  setCustomWeights({ ...customWeights, distanceWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">
                ETA Weight (W_t): {customWeights.etaWeight}
              </label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={customWeights.etaWeight}
                onChange={(e) =>
                  setCustomWeights({ ...customWeights, etaWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
            >
              Apply Weights
            </button>
          </form>
        )}

        {/* Candidate Riders Comparison Table */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Fleet Evaluation Matrix (Scoring Formula Applied)
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                Formula: Score = (W_w × Orders) + (W_d × Dist) + (W_t × ETA/10)
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-850/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Rider Name</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Active Orders</th>
                    <th className="py-2.5 px-3">Pickup Dist</th>
                    <th className="py-2.5 px-3">Total ETA</th>
                    <th className="py-2.5 px-3">Calculated Score</th>
                    <th className="py-2.5 px-3 text-right">Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {candidates.map((cand) => {
                    const isSelected = cand.rider.rider_id === activeWinnerId;
                    const isTopRank = cand.rank === 1 && cand.isAvailable;

                    return (
                      <tr
                        key={cand.rider.rider_id}
                        onClick={() => setSelectedRiderId(cand.rider.rider_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-950/30 border-l-4 border-l-emerald-500'
                            : 'hover:bg-slate-850/50'
                        }`}
                      >
                        <td className="py-3 px-3">
                          {isTopRank ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                              #1
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono pl-1">#{cand.rank}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <Bike className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cand.rider.name}</span>
                            {isTopRank && (
                              <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-500/10 px-1 rounded">
                                Best Pick
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {cand.rider.current_location} · {cand.rider.average_speed} km/h
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                              cand.rider.status === 'Available'
                                ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                                : 'text-amber-400 bg-amber-950/40 border-amber-800/40'
                            }`}
                          >
                            {cand.rider.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                          {cand.rider.active_orders} orders
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-200">
                          {cand.distanceToRestaurant.toFixed(1)} km
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">
                          {cand.eta} mins
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-mono font-bold text-xs ${
                              isSelected ? 'text-emerald-400' : 'text-slate-300'
                            }`}
                          >
                            {cand.score}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">pts</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <input
                            type="radio"
                            name="selectedRider"
                            checked={isSelected}
                            onChange={() => setSelectedRiderId(cand.rider.rider_id)}
                            className="accent-emerald-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highlighted Choice & "Why this rider was selected" Section */}
          {currentWinner && (
            <div className="p-4 rounded-xl bg-slate-850/80 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Why {currentWinner.rider.name} was selected:
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {rationalePoints.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-750 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Calculated Score:{' '}
                  <strong className="text-emerald-400 font-mono text-sm">{currentWinner.score}</strong> (Lower is more
                  optimal)
                </span>
                <span>Vehicle: {currentWinner.rider.vehicle_type}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmAssignment}
            disabled={!currentWinner}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Dispatch {currentWinner?.rider.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
