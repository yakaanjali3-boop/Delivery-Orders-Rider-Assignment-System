import { DijkstraResult, DijkstraStep, GraphEdge, GraphNode } from '../types';

export const DELIVERY_GRAPH_NODES: GraphNode[] = [
  { id: 'Kakinada', name: 'Kakinada Central', x: 580, y: 310, type: 'city' },
  { id: 'Kakinada_Beach', name: 'Kakinada Beach Rd', x: 670, y: 260, type: 'hub' },
  { id: 'Jagannaickpur', name: 'Jagannaickpur', x: 620, y: 390, type: 'customer' },
  { id: 'Samalkota', name: 'Samalkota Jn', x: 450, y: 220, type: 'city' },
  { id: 'Peddapuram', name: 'Peddapuram Market', x: 380, y: 150, type: 'city' },
  { id: 'Pithapuram', name: 'Pithapuram Town', x: 520, y: 130, type: 'hub' },
  { id: 'Rajahmundry', name: 'Rajahmundry Central', x: 180, y: 340, type: 'city' },
  { id: 'Danavaipeta', name: 'Danavaipeta Hub', x: 120, y: 280, type: 'restaurant' },
  { id: 'Mandapeta', name: 'Mandapeta Town', x: 320, y: 410, type: 'city' },
  { id: 'Ramachandrapuram', name: 'Ramachandrapuram', x: 440, y: 440, type: 'hub' },
];

export const DELIVERY_GRAPH_EDGES: GraphEdge[] = [
  { from: 'Kakinada', to: 'Kakinada_Beach', weight: 4.5 },
  { from: 'Kakinada', to: 'Jagannaickpur', weight: 3.2 },
  { from: 'Kakinada', to: 'Samalkota', weight: 14.8 },
  { from: 'Kakinada', to: 'Ramachandrapuram', weight: 26.0 },
  { from: 'Samalkota', to: 'Peddapuram', weight: 6.5 },
  { from: 'Samalkota', to: 'Pithapuram', weight: 11.2 },
  { from: 'Pithapuram', to: 'Kakinada_Beach', weight: 16.4 },
  { from: 'Samalkota', to: 'Rajahmundry', weight: 48.0 },
  { from: 'Peddapuram', to: 'Rajahmundry', weight: 42.5 },
  { from: 'Rajahmundry', to: 'Danavaipeta', weight: 3.8 },
  { from: 'Rajahmundry', to: 'Mandapeta', weight: 24.5 },
  { from: 'Mandapeta', to: 'Ramachandrapuram', weight: 18.2 },
  { from: 'Ramachandrapuram', to: 'Jagannaickpur', weight: 23.0 },
];

// Helper to normalize node lookup
export function findNode(idOrName: string): GraphNode | undefined {
  const query = idOrName.toLowerCase().trim();
  return (
    DELIVERY_GRAPH_NODES.find(
      (n) => n.id.toLowerCase() === query || n.name.toLowerCase() === query
    ) ||
    DELIVERY_GRAPH_NODES.find((n) => n.id.toLowerCase().includes(query)) ||
    DELIVERY_GRAPH_NODES[0]
  );
}

// Build adjacency map
export function buildAdjacencyList(): Map<string, { to: string; weight: number }[]> {
  const adj = new Map<string, { to: string; weight: number }[]>();
  for (const node of DELIVERY_GRAPH_NODES) {
    adj.set(node.id, []);
  }

  for (const edge of DELIVERY_GRAPH_EDGES) {
    if (!adj.has(edge.from)) adj.set(edge.from, []);
    if (!adj.has(edge.to)) adj.set(edge.to, []);

    adj.get(edge.from)!.push({ to: edge.to, weight: edge.weight });
    adj.get(edge.to)!.push({ to: edge.from, weight: edge.weight }); // Undirected graph
  }

  return adj;
}

/**
 * Dijkstra's Shortest Path Algorithm
 * Time Complexity: O((V + E) log V) with Priority Queue
 * Space Complexity: O(V + E)
 */
export function dijkstra(
  startId: string,
  endId: string,
  averageSpeedKmH: number = 32
): DijkstraResult {
  const adj = buildAdjacencyList();
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const steps: DijkstraStep[] = [];

  // Initialize
  for (const node of DELIVERY_GRAPH_NODES) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  }
  distances[startId] = 0;

  // Priority queue simulation
  const pq: { node: string; dist: number }[] = [{ node: startId, dist: 0 }];

  while (pq.length > 0) {
    // Extract min
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u, dist: currentDist } = pq.shift()!;

    if (visited.has(u)) continue;
    visited.add(u);

    if (u === endId) break;

    const neighbors = adj.get(u) || [];
    for (const edge of neighbors) {
      const v = edge.to;
      if (visited.has(v)) continue;

      const alt = currentDist + edge.weight;
      const willUpdate = alt < distances[v];

      steps.push({
        current: u,
        neighbor: v,
        edgeWeight: edge.weight,
        tentativeDistance: parseFloat(alt.toFixed(2)),
        updated: willUpdate,
        notes: willUpdate
          ? `Relaxing edge (${u} → ${v}): new tentative distance ${alt.toFixed(1)} km < previous ${distances[v] === Infinity ? '∞' : distances[v].toFixed(1)} km`
          : `Kept current shortest distance to ${v} (${distances[v].toFixed(1)} km <= candidate ${alt.toFixed(1)} km)`,
      });

      if (willUpdate) {
        distances[v] = parseFloat(alt.toFixed(2));
        previous[v] = u;
        pq.push({ node: v, dist: distances[v] });
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  // If unreachable
  if (path.length === 1 && path[0] !== startId) {
    return {
      path: [startId, endId],
      totalDistance: 12.0,
      estimatedTravelTime: Math.round((12.0 / averageSpeedKmH) * 60),
      steps,
      distances,
    };
  }

  const totalDistance = parseFloat((distances[endId] === Infinity ? 0 : distances[endId]).toFixed(2));
  // Travel time in minutes = (distance / speed) * 60
  const estimatedTravelTime = Math.max(5, Math.round((totalDistance / Math.max(15, averageSpeedKmH)) * 60));

  return {
    path,
    totalDistance,
    estimatedTravelTime,
    steps,
    distances,
  };
}

/**
 * Multi-segment route calculation:
 * Rider location -> Restaurant location -> Customer delivery address
 */
export function calculateFullDeliveryRoute(
  riderLocation: string,
  restaurantLocation: string,
  deliveryLocation: string,
  riderSpeed: number = 32
): {
  riderToRestaurant: DijkstraResult;
  restaurantToCustomer: DijkstraResult;
  combinedPath: string[];
  totalDistance: number;
  totalTravelTimeMinutes: number;
} {
  const rNode = findNode(riderLocation)?.id || 'Kakinada';
  const restNode = findNode(restaurantLocation)?.id || 'Kakinada';
  const custNode = findNode(deliveryLocation)?.id || 'Samalkota';

  const seg1 = dijkstra(rNode, restNode, riderSpeed);
  const seg2 = dijkstra(restNode, custNode, riderSpeed);

  // Combine unique sequential path
  const combinedPath = [...seg1.path];
  for (let i = 1; i < seg2.path.length; i++) {
    combinedPath.push(seg2.path[i]);
  }

  const totalDistance = parseFloat((seg1.totalDistance + seg2.totalDistance).toFixed(2));
  const totalTravelTimeMinutes = seg1.estimatedTravelTime + seg2.estimatedTravelTime;

  return {
    riderToRestaurant: seg1,
    restaurantToCustomer: seg2,
    combinedPath,
    totalDistance,
    totalTravelTimeMinutes,
  };
}
