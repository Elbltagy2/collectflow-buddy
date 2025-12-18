import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
}

interface RouteResult {
  orderedLocations: Location[];
  totalDistance: number;
  totalDuration: number;
  legs: {
    from: Location;
    to: Location;
    distance: number;
    duration: number;
  }[];
}

// OSRM public server (free, rate-limited)
const OSRM_BASE_URL = 'https://router.project-osrm.org';

interface OSRMTableResponse {
  code: string;
  message?: string;
  distances: number[][];
  durations: number[][];
}

interface OSRMRouteResponse {
  code: string;
  message?: string;
  routes: {
    distance: number;
    duration: number;
    geometry: string;
  }[];
}

/**
 * Calculate distance between two points using Haversine formula (fallback)
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Get distance matrix from OSRM Table API
 */
async function getOSRMDistanceMatrix(locations: Location[]): Promise<{ distances: number[][], durations: number[][] }> {
  const coordinates = locations.map(loc => `${loc.longitude},${loc.latitude}`).join(';');
  const url = `${OSRM_BASE_URL}/table/v1/driving/${coordinates}?annotations=distance,duration`;

  try {
    const response = await fetch(url);
    const data = await response.json() as OSRMTableResponse;

    if (data.code !== 'Ok') {
      throw new Error(`OSRM API error: ${data.message || data.code}`);
    }

    return {
      distances: data.distances, // meters
      durations: data.durations, // seconds
    };
  } catch (error) {
    console.error('OSRM API error, falling back to Haversine:', error);
    // Fallback to Haversine distance
    const n = locations.length;
    const distances: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    const durations: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const dist = haversineDistance(
            locations[i].latitude, locations[i].longitude,
            locations[j].latitude, locations[j].longitude
          );
          distances[i][j] = dist * 1000; // Convert to meters
          durations[i][j] = (dist / 30) * 3600; // Assume 30 km/h average speed, convert to seconds
        }
      }
    }

    return { distances, durations };
  }
}

/**
 * Nearest Neighbor Algorithm for TSP
 * Starts from the first location (collector's home)
 * Must end at the last location (office)
 */
function nearestNeighborTSP(
  distances: number[][],
  startIndex: number,
  endIndex: number
): { order: number[], totalDistance: number } {
  const n = distances.length;
  const visited = new Set<number>();
  const order: number[] = [startIndex];
  visited.add(startIndex);

  // Don't visit the end point until all others are visited
  let current = startIndex;

  while (order.length < n - 1) {
    let nearestDist = Infinity;
    let nearestIndex = -1;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && i !== endIndex && distances[current][i] < nearestDist) {
        nearestDist = distances[current][i];
        nearestIndex = i;
      }
    }

    if (nearestIndex === -1) break;

    visited.add(nearestIndex);
    order.push(nearestIndex);
    current = nearestIndex;
  }

  // Add the end point (office)
  order.push(endIndex);

  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < order.length - 1; i++) {
    totalDistance += distances[order[i]][order[i + 1]];
  }

  return { order, totalDistance };
}

/**
 * Get route directions from OSRM Route API
 */
async function getOSRMRoute(locations: Location[]): Promise<{ distance: number, duration: number, geometry?: string }> {
  const coordinates = locations.map(loc => `${loc.longitude},${loc.latitude}`).join(';');
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=full&geometries=polyline`;

  try {
    const response = await fetch(url);
    const data = await response.json() as OSRMRouteResponse;

    if (data.code !== 'Ok') {
      throw new Error(`OSRM API error: ${data.message || data.code}`);
    }

    return {
      distance: data.routes[0].distance, // meters
      duration: data.routes[0].duration, // seconds
      geometry: data.routes[0].geometry, // encoded polyline
    };
  } catch (error) {
    console.error('OSRM Route API error:', error);
    // Fallback
    let totalDistance = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      totalDistance += haversineDistance(
        locations[i].latitude, locations[i].longitude,
        locations[i + 1].latitude, locations[i + 1].longitude
      );
    }
    return {
      distance: totalDistance * 1000,
      duration: (totalDistance / 30) * 3600,
    };
  }
}

export class RouteOptimizationService {
  /**
   * Optimize route for a collector visiting customers
   */
  async optimizeCollectorRoute(
    collectorId: string,
    customerIds: string[],
    date: Date = new Date()
  ): Promise<RouteResult> {
    // Get collector's home location
    const collector = await prisma.user.findUnique({
      where: { id: collectorId },
      select: { id: true, name: true, homeLatitude: true, homeLongitude: true },
    });

    if (!collector) {
      throw new AppError('Collector not found', 404);
    }

    // Get office location from settings
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    });

    // Get customers with locations
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: { id: true, name: true, latitude: true, longitude: true },
    });

    if (customers.length === 0) {
      throw new AppError('No customers with valid locations found', 400);
    }

    // Build locations array
    const locations: Location[] = [];

    // Start: Collector's home (or default to first customer if no home set)
    if (collector.homeLatitude && collector.homeLongitude) {
      locations.push({
        id: 'start',
        latitude: collector.homeLatitude,
        longitude: collector.homeLongitude,
        name: 'Start (Home)',
      });
    }

    // Customers
    for (const customer of customers) {
      locations.push({
        id: customer.id,
        latitude: customer.latitude!,
        longitude: customer.longitude!,
        name: customer.name,
      });
    }

    // End: Office location (or skip if not set)
    if (settings?.officeLatitude && settings?.officeLongitude) {
      locations.push({
        id: 'end',
        latitude: settings.officeLatitude,
        longitude: settings.officeLongitude,
        name: 'End (Office)',
      });
    }

    // If only customers (no start/end), just optimize the customer order
    const hasStart = collector.homeLatitude && collector.homeLongitude;
    const hasEnd = settings?.officeLatitude && settings?.officeLongitude;

    if (locations.length < 2) {
      throw new AppError('Need at least 2 locations to optimize route', 400);
    }

    // Get distance matrix
    const { distances, durations } = await getOSRMDistanceMatrix(locations);

    // Optimize using Nearest Neighbor
    const startIndex = 0;
    const endIndex = hasEnd ? locations.length - 1 : -1;

    let orderedIndices: number[];
    let totalDistance: number;

    if (hasEnd) {
      const result = nearestNeighborTSP(distances, startIndex, endIndex);
      orderedIndices = result.order;
      totalDistance = result.totalDistance;
    } else {
      // No fixed end, just optimize from start
      const visited = new Set<number>();
      orderedIndices = [startIndex];
      visited.add(startIndex);
      let current = startIndex;

      while (orderedIndices.length < locations.length) {
        let nearestDist = Infinity;
        let nearestIndex = -1;

        for (let i = 0; i < locations.length; i++) {
          if (!visited.has(i) && distances[current][i] < nearestDist) {
            nearestDist = distances[current][i];
            nearestIndex = i;
          }
        }

        if (nearestIndex === -1) break;
        visited.add(nearestIndex);
        orderedIndices.push(nearestIndex);
        current = nearestIndex;
      }

      totalDistance = 0;
      for (let i = 0; i < orderedIndices.length - 1; i++) {
        totalDistance += distances[orderedIndices[i]][orderedIndices[i + 1]];
      }
    }

    // Build ordered locations
    const orderedLocations = orderedIndices.map(i => locations[i]);

    // Calculate total duration
    let totalDuration = 0;
    for (let i = 0; i < orderedIndices.length - 1; i++) {
      totalDuration += durations[orderedIndices[i]][orderedIndices[i + 1]];
    }

    // Build legs
    const legs = [];
    for (let i = 0; i < orderedLocations.length - 1; i++) {
      legs.push({
        from: orderedLocations[i],
        to: orderedLocations[i + 1],
        distance: distances[orderedIndices[i]][orderedIndices[i + 1]],
        duration: durations[orderedIndices[i]][orderedIndices[i + 1]],
      });
    }

    return {
      orderedLocations,
      totalDistance,
      totalDuration,
      legs,
    };
  }

  /**
   * Get optimized route for today's visits
   */
  async getOptimizedTodayRoute(collectorId: string): Promise<RouteResult & { visits: any[] }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's visits
    const visits = await prisma.collectorVisit.findMany({
      where: {
        collectorId,
        visitDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { visitOrder: 'asc' },
    });

    if (visits.length === 0) {
      throw new AppError('No visits scheduled for today', 404);
    }

    const customerIds = visits.map(v => v.customerId);

    // Get optimized route
    const route = await this.optimizeCollectorRoute(collectorId, customerIds, today);

    // Get customers with full details
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
    });

    const customerMap = new Map(customers.map(c => [c.id, c]));

    // Map visits with customer data and new order
    const orderedVisits = route.orderedLocations
      .filter(loc => loc.id !== 'start' && loc.id !== 'end')
      .map((loc, index) => {
        const customer = customerMap.get(loc.id);
        const visit = visits.find(v => v.customerId === loc.id);
        return {
          ...visit,
          customer,
          optimizedOrder: index + 1,
        };
      });

    return {
      ...route,
      visits: orderedVisits,
    };
  }
}

export const routeOptimizationService = new RouteOptimizationService();
