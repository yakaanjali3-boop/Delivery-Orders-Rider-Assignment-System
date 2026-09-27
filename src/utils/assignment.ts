import { Customer, Order, Restaurant, Rider, RiderCandidate, RiderScoringWeights } from '../types';
import { calculateFullDeliveryRoute, findNode } from './dijkstra';

export const DEFAULT_WEIGHTS: RiderScoringWeights = {
  workloadWeight: 0.35,
  distanceWeight: 0.40,
  etaWeight: 0.25,
};

/**
 * Calculates candidate evaluations for all riders based on the order,
 * restaurant location, customer destination, and active workloads.
 */
export function evaluateRiderCandidates(
  order: Order,
  restaurant: Restaurant,
  customer: Customer,
  riders: Rider[],
  weights: RiderScoringWeights = DEFAULT_WEIGHTS
): RiderCandidate[] {
  const candidates: RiderCandidate[] = riders.map((rider) => {
    // 1. Distance calculation from rider's location to restaurant, and restaurant to customer
    const route = calculateFullDeliveryRoute(
      rider.current_location,
      restaurant.location || restaurant.address,
      customer.city || customer.address,
      rider.average_speed || 30
    );

    const distanceToRestaurant = route.riderToRestaurant.totalDistance;
    const distanceToCustomer = route.restaurantToCustomer.totalDistance;
    const totalDistance = route.totalDistance;
    const travelTime = route.totalTravelTimeMinutes;

    // ETA calculation: Prep Time + Travel Time + Workload delay
    // Workload delay: 8 minutes per active order
    const workloadDelay = rider.active_orders * 8;
    const prepTime = restaurant.prep_time || 15;
    const eta = Math.round(prepTime + travelTime + workloadDelay);

    // Scoring Formula:
    // Rider Score = (Workload Weight * Active Orders) + (Distance Weight * Distance) + (ETA Weight * Estimated Time)
    const rawScore =
      weights.workloadWeight * rider.active_orders +
      weights.distanceWeight * distanceToRestaurant +
      weights.etaWeight * (eta / 10); // normalized ETA factor

    const score = parseFloat(rawScore.toFixed(2));
    const isAvailable = rider.status === 'Available';

    // Generate explanations
    const reasons: string[] = [];
    if (rider.status === 'Available') {
      reasons.push('Currently active & ready for dispatch');
    } else {
      reasons.push(`Status is currently ${rider.status}`);
    }

    if (rider.active_orders === 0) {
      reasons.push('Lowest workload (0 active orders in queue)');
    } else if (rider.active_orders <= 2) {
      reasons.push(`Moderate workload (${rider.active_orders} orders)`);
    } else {
      reasons.push(`High current workload (${rider.active_orders} orders)`);
    }

    if (distanceToRestaurant <= 5) {
      reasons.push(`Nearest to restaurant (${distanceToRestaurant.toFixed(1)} km)`);
    } else {
      reasons.push(`Distance to pickup: ${distanceToRestaurant.toFixed(1)} km`);
    }

    reasons.push(`Estimated total turnaround: ${eta} mins`);

    return {
      rider,
      distanceToRestaurant,
      distanceToCustomer,
      totalDistance,
      travelTime,
      eta,
      score,
      isAvailable,
      reasons,
      rank: 0,
    };
  });

  // Sort candidates:
  // Available riders come first, then sorted by lowest score (best candidate)
  candidates.sort((a, b) => {
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    return a.score - b.score;
  });

  // Assign ranks
  candidates.forEach((cand, idx) => {
    cand.rank = idx + 1;
  });

  return candidates;
}

/**
 * Explains clearly why the winning rider was chosen over peers.
 */
export function generateSelectionRationale(
  winner: RiderCandidate,
  allCandidates: RiderCandidate[]
): string[] {
  const points: string[] = [];

  points.push(`Ranked #1 with the optimal composite score of ${winner.score}`);

  if (winner.rider.active_orders === 0) {
    points.push('Zero active delivery queue for immediate order acceptance');
  } else {
    const minOrders = Math.min(...allCandidates.map((c) => c.rider.active_orders));
    if (winner.rider.active_orders <= minOrders) {
      points.push(`Minimal current active queue (${winner.rider.active_orders} order)`);
    }
  }

  const minDistance = Math.min(...allCandidates.filter(c => c.isAvailable).map((c) => c.distanceToRestaurant));
  if (winner.distanceToRestaurant <= minDistance + 1.0) {
    points.push(`Closest proximity to restaurant pickup (${winner.distanceToRestaurant.toFixed(1)} km)`);
  }

  const minEta = Math.min(...allCandidates.filter(c => c.isAvailable).map((c) => c.eta));
  if (winner.eta <= minEta + 3) {
    points.push(`Fastest delivery promise (${winner.eta} mins combined ETA)`);
  }

  points.push(`Operating at ${winner.rider.average_speed} km/h transit average`);

  return points;
}
