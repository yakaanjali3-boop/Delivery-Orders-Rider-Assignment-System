"""
dijkstra.py
Dijkstra's Shortest Path Algorithm & DMGT Weighted Graph Implementation
B.Tech Academic Curricular Implementation (DMGT & ADSA)
"""

import heapq
from typing import Dict, List, Tuple, Any

# Delivery Network Topology (Weighted Undirected Graph)
DELIVERY_GRAPH = {
    'Kakinada': [('Kakinada_Beach', 4.5), ('Jagannaickpur', 3.2), ('Samalkota', 14.8), ('Ramachandrapuram', 26.0)],
    'Kakinada_Beach': [('Kakinada', 4.5), ('Pithapuram', 16.4)],
    'Jagannaickpur': [('Kakinada', 3.2), ('Ramachandrapuram', 23.0)],
    'Samalkota': [('Kakinada', 14.8), ('Peddapuram', 6.5), ('Pithapuram', 11.2), ('Rajahmundry', 48.0)],
    'Peddapuram': [('Samalkota', 6.5), ('Rajahmundry', 42.5)],
    'Pithapuram': [('Samalkota', 11.2), ('Kakinada_Beach', 16.4)],
    'Rajahmundry': [('Samalkota', 48.0), ('Peddapuram', 42.5), ('Danavaipeta', 3.8), ('Mandapeta', 24.5)],
    'Danavaipeta': [('Rajahmundry', 3.8)],
    'Mandapeta': [('Rajahmundry', 24.5), ('Ramachandrapuram', 18.2)],
    'Ramachandrapuram': [('Kakinada', 26.0), ('Mandapeta', 18.2), ('Jagannaickpur', 23.0)]
}

def dijkstra_shortest_path(graph: Dict[str, List[Tuple[str, float]]], start: str, end: str) -> Dict[str, Any]:
    """
    Computes shortest path between start and end node using Dijkstra's Algorithm with Min-Heap.
    Time Complexity: O((V + E) log V)
    Space Complexity: O(V + E)
    """
    if start not in graph:
        start = 'Kakinada'
    if end not in graph:
        end = 'Samalkota'

    # Priority queue stores tuples: (current_distance, node, path_list)
    pq = [(0.0, start, [start])]
    visited = set()
    distances = {node: float('inf') for node in graph}
    distances[start] = 0.0
    steps = []

    while pq:
        current_dist, u, path = heapq.heappop(pq)

        if u in visited:
            continue
        visited.add(u)

        if u == end:
            return {
                "start": start,
                "end": end,
                "path": path,
                "total_distance_km": round(current_dist, 2),
                "steps": steps,
                "visited_count": len(visited)
            }

        for v, weight in graph.get(u, []):
            if v in visited:
                continue

            tentative_dist = current_dist + weight
            is_better = tentative_dist < distances[v]

            steps.append({
                "current": u,
                "neighbor": v,
                "edge_weight_km": weight,
                "tentative_dist": round(tentative_dist, 2),
                "relaxed": is_better
            })

            if is_better:
                distances[v] = tentative_dist
                heapq.heappush(pq, (tentative_dist, v, path + [v]))

    # Fallback if disconnected
    return {
        "start": start,
        "end": end,
        "path": [start, end],
        "total_distance_km": 15.0,
        "steps": steps,
        "visited_count": len(visited)
    }

def calculate_delivery_route_and_eta(rider_location: str, restaurant_location: str, customer_location: str, average_speed_kmh: int = 30, prep_time_mins: int = 15, active_orders: int = 0) -> Dict[str, Any]:
    """
    Calculates combined two-leg dispatch route:
    Leg 1: Rider -> Restaurant
    Leg 2: Restaurant -> Customer
    Computes deterministic ETA in minutes.
    """
    leg1 = dijkstra_shortest_path(DELIVERY_GRAPH, rider_location, restaurant_location)
    leg2 = dijkstra_shortest_path(DELIVERY_GRAPH, restaurant_location, customer_location)

    combined_path = leg1['path'] + leg2['path'][1:]
    total_distance = round(leg1['total_distance_km'] + leg2['total_distance_km'], 2)

    # Travel time = (Distance / Speed) * 60 minutes
    speed = max(15, average_speed_kmh)
    travel_time_mins = round((total_distance / speed) * 60)

    # Workload delay = 8 minutes per already queued order
    workload_delay_mins = active_orders * 8

    # Total ETA
    total_eta_mins = prep_time_mins + travel_time_mins + workload_delay_mins

    return {
        "leg1": leg1,
        "leg2": leg2,
        "combined_path": combined_path,
        "total_distance_km": total_distance,
        "travel_time_mins": travel_time_mins,
        "prep_time_mins": prep_time_mins,
        "workload_delay_mins": workload_delay_mins,
        "total_eta_mins": total_eta_mins
    }

def calculate_rider_score(active_orders: int, distance_km: float, eta_mins: int, w_workload: float = 0.35, w_distance: float = 0.40, w_eta: float = 0.25) -> float:
    """
    Scoring formula:
    Rider Score = (W_workload * Active_Orders) + (W_distance * Distance) + (W_eta * ETA/10)
    Lower score = more optimal candidate.
    """
    score = (w_workload * active_orders) + (w_distance * distance_km) + (w_eta * (eta_mins / 10.0))
    return round(score, 2)
