import * as geohash from "ngeohash";

/**
 * Geospatial indexing service using geohashing for fast location-based lookups.
 * Implements Uber/Ola-like cell-based driver discovery.
 */

interface GeoCell {
  hash: string;
  lat: number;
  lng: number;
  precision: number;
}

/**
 * Converts lat/lng to a geohash cell
 * Higher precision = smaller cells = more accurate but more database queries
 * Precision 7-8 is optimal for ride-hailing (covers ~150m - 600m areas)
 */
export const encodeLocation = (lat: number, lng: number, precision = 8): string => {
  return geohash.encode(lat, lng, precision);
};

/**
 * Gets neighboring cells for a given geohash
 * This allows fast search without querying entire city
 */
export const getNeighboringCells = (cell: string): string[] => {
  const neighbors = geohash.neighbors(cell);
  return [cell, ...Object.values(neighbors as unknown as Record<string, string>)];
};

/**
 * Decodes a geohash back to lat/lng bounds
 */
export const decodeCell = (cell: string): { lat: number; lng: number } => {
  const bounds = geohash.decode_bbox(cell);
  return {
    lat: (bounds[0] + bounds[2]) / 2,
    lng: (bounds[1] + bounds[3]) / 2,
  };
};

/**
 * Haversine distance formula for accurate distance calculation
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Fast geospatial search using cell-based approach
 * More efficient than MongoDB $near for large datasets
 */
export const findNearbyInCells = (
  candidates: Array<{ lat: number; lng: number; [key: string]: any }>,
  searchLat: number,
  searchLng: number,
  radiusKm: number
): Array<{ lat: number; lng: number; distance: number; [key: string]: any }> => {
  return (
    candidates
      .map((candidate) => ({
        ...candidate,
        distance: calculateDistance(
          searchLat,
          searchLng,
          candidate.lat,
          candidate.lng
        ),
      }))
      // Filter by radius
      .filter((c) => c.distance <= radiusKm)
      // Sort by distance (closest first)
      .sort((a, b) => a.distance - b.distance)
  );
};

/**
 * Generates a geohashing query for MongoDB aggregation
 * Used for initial cell-based filtering before precise distance calc
 */
export const buildGeohashQuery = (
  centerCell: string,
  radiusKm: number
): Record<string, any> => {
  const neighbors = getNeighboringCells(centerCell);

  // Start with cell-based filtering
  return {
    cell: { $in: neighbors },
  };
};

/**
 * ETA estimation based on distance and average speed
 * In production, use Google Directions API for accurate routing
 */
export const estimateETA = (
  distanceKm: number,
  averageSpeedKmh: number = 30
): { minutes: number; formatted: string } => {
  const minutes = Math.ceil((distanceKm / averageSpeedKmh) * 60);

  let formatted: string;
  if (minutes < 1) {
    formatted = "< 1 min";
  } else if (minutes < 60) {
    formatted = `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    formatted = `${hours}h ${mins}m`;
  }

  return { minutes, formatted };
};
